import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Stars, Html } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import type { OrbitalValues } from '@typeProps/orbitParams';
import { keplerianToCartesian, generateOrbitPath } from '@utils/orbitMath';

const EARTH_RADIUS_KM = 6371;
const SCALE = 1 / 1000;
const EARTH_COLOR = '#2255aa';
const SPACE_BG_COLOR = '#04060f';

const EARTH_R = EARTH_RADIUS_KM * SCALE;
const HELPER_R = EARTH_R * 2.2;
const VIEW_DISTANCE = 25;

const NORTH_COLOR = '#c7ccd6';
const EQUATOR_COLOR = '#3ddc72';
const VERNAL_COLOR = '#c7ccd6';
const ASC_NODE_COLOR = '#e040fb';
const DESC_NODE_COLOR = '#e040fb';

type ViewPreset = 'free' | 'vernal' | 'north' | 'orbitalPlane';

function getContrastingStarColor(baseColor: string): string {
  const c = new THREE.Color(baseColor);
  const luminance = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  return luminance < 0.5 ? '#f5f7ff' : '#c7d3e0';
}

function labelStyle(color: string): React.CSSProperties {
  return {
    color,
    fontSize: '13px',
    fontFamily: 'sans-serif',
    whiteSpace: 'nowrap',
    textShadow: '0 0 4px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)',
    pointerEvents: 'none',
    userSelect: 'none',
  };
}

/**
 * Orbit-plane normal, derived from the third column of the classical
 * Rz(raan)*Rx(i)*Rz(w) rotation matrix, remapped into three's (x, z, -y) axes
 * to match keplerianToCartesian's convention.
 */
function getOrbitNormal(values: OrbitalValues): THREE.Vector3 {
  const raan = THREE.MathUtils.degToRad(values.raan);
  const i = THREE.MathUtils.degToRad(values.i);
  return new THREE.Vector3(
    Math.sin(raan) * Math.sin(i),
    Math.cos(i),
    Math.cos(raan) * Math.sin(i)
  ).normalize();
}

function getPresetPosition(view: ViewPreset, values: OrbitalValues): THREE.Vector3 {
  switch (view) {
    case 'vernal':
      // Looking down the vernal equinox (+X) axis toward the origin
      return new THREE.Vector3(VIEW_DISTANCE, 0, 0);
    case 'north':
      // Looking down the North (+Y) axis; tiny Z offset avoids lookAt/up degeneracy
      return new THREE.Vector3(0, VIEW_DISTANCE, 0.001);
    case 'orbitalPlane': {
      const n = getOrbitNormal(values);
      return n.multiplyScalar(VIEW_DISTANCE);
    }
    case 'free':
    default:
      return new THREE.Vector3(15, 10, 15);
  }
}

/** Animates the camera to the selected preset, then lets OrbitControls take over. */
function CameraRig({
  view,
  values,
  controlsRef,
}: {
  view: ViewPreset;
  values: OrbitalValues;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const targetPos = useRef(getPresetPosition('free', values));
  const targetUp = useRef(new THREE.Vector3(0, 1, 0));
  const animating = useRef(false);

  useEffect(() => {
    targetPos.current = getPresetPosition(view, values);
    targetUp.current = view === 'north' ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, 1, 0);
    animating.current = true; // (re)start the transition whenever the preset changes
  }, [view, values]);

  useFrame(() => {
    if (!animating.current) return; // let OrbitControls own the camera otherwise

    camera.position.lerp(targetPos.current, 0.08);
    camera.up.lerp(targetUp.current, 0.08);
    camera.lookAt(0, 0, 0);
    controlsRef.current?.update();

    if (camera.position.distanceTo(targetPos.current) < 0.05) {
      animating.current = false; // arrived — stop overriding the camera
    }
  });

  return null;
}

function Earth() {
  return (
    <Sphere args={[EARTH_R, 64, 64]}>
      <meshPhongMaterial color={EARTH_COLOR} shininess={5} />
    </Sphere>
  );
}

function NorthAxis() {
  const points = useMemo(
    () => [new THREE.Vector3(0, -HELPER_R * 0.3, 0), new THREE.Vector3(0, HELPER_R, 0)],
    []
  );
  return (
    <group>
      <Line points={points} color={NORTH_COLOR} lineWidth={1.5} />
      <Html position={[0, HELPER_R, 0]} center style={{ transform: 'translateY(-12px)' }}>
        <div style={labelStyle(NORTH_COLOR)}>North</div>
      </Html>
    </group>
  );
}

function EquatorCircle() {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 128;
    const r = HELPER_R * 0.95;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * r, 0, Math.sin(t) * r));
    }
    return pts;
  }, []);

  return (
    <group>
      <Line points={points} color={EQUATOR_COLOR} lineWidth={1} dashed dashSize={0.3} gapSize={0.2} />
      <Html position={[-HELPER_R * 0.95, 0, 0]} center style={{ transform: 'translate(10px, 0px)' }}>
        <div style={labelStyle(EQUATOR_COLOR)}>Equator</div>
      </Html>
    </group>
  );
}

function VernalEquinoxAxis() {
  const points = useMemo(
    () => [new THREE.Vector3(0, 0, 0), new THREE.Vector3(HELPER_R, 0, 0)],
    []
  );
  return (
    <group>
      <Line points={points} color={VERNAL_COLOR} lineWidth={1.5} />
      <Html position={[HELPER_R, 0, 0]} center style={{ transform: 'translate(10px, 0px)' }}>
        <div style={labelStyle(VERNAL_COLOR)}>Vernal Equinox</div>
      </Html>
    </group>
  );
}

/** Node direction verified against keplerianToCartesian at raan=90°,i=0,w=0,nu=0 -> three (0,0,-r). */
function AscendingNodeLine({ raanDeg }: { raanDeg: number }) {
  const raan = THREE.MathUtils.degToRad(raanDeg);
  const dir = useMemo(
    () => new THREE.Vector3(Math.cos(raan), 0, -Math.sin(raan)),
    [raan]
  );

  const ascPoint = useMemo(() => dir.clone().multiplyScalar(HELPER_R * 0.85), [dir]);
  const descPoint = useMemo(() => dir.clone().multiplyScalar(-HELPER_R * 0.7), [dir]);

  return (
    <group>
      <Line points={[new THREE.Vector3(0, 0, 0), ascPoint]} color={ASC_NODE_COLOR} lineWidth={2} />
      <Line
        points={[new THREE.Vector3(0, 0, 0), descPoint]}
        color={DESC_NODE_COLOR}
        lineWidth={1}
        dashed
        dashSize={0.2}
        gapSize={0.15}
      />
      <Html position={ascPoint} center style={{ transform: 'translate(8px, -8px)' }}>
        <div style={labelStyle(ASC_NODE_COLOR)}>Asc. Node</div>
      </Html>
      <Html position={descPoint} center style={{ transform: 'translate(8px, 8px)' }}>
        <div style={labelStyle(DESC_NODE_COLOR)}>Desc. Node</div>
      </Html>
    </group>
  );
}

function Satellite({ position }: { position: THREE.Vector3 }) {
  return (
    <group>
      <Line
        points={[new THREE.Vector3(0, 0, 0), position]}
        color="orange"
        lineWidth={1}
        dashed
        dashSize={0.15}
        gapSize={0.1}
        opacity={0.5}
        transparent
      />
      <Sphere args={[0.32, 16, 16]} position={position}>
        <meshBasicMaterial color="orange" transparent opacity={0.25} />
      </Sphere>
      <Sphere args={[0.18, 16, 16]} position={position}>
        <meshBasicMaterial color="orange" />
      </Sphere>
      <Html position={position} center style={{ transform: 'translate(12px, -8px)' }}>
        <div style={labelStyle('#ffb74d')}>Satellite</div>
      </Html>
    </group>
  );
}

function OrbitPath({ values }: { values: OrbitalValues }) {
  const points = useMemo(() => generateOrbitPath(values, SCALE), [values]);
  return <Line points={points} color="cyan" lineWidth={1.5} />;
}

const VIEW_BUTTONS: { label: string; value: ViewPreset }[] = [
  { label: 'Free', value: 'free' },
  { label: 'From Vernal Equinox', value: 'vernal' },
  { label: 'From North', value: 'north' },
  { label: 'Orbital Plane', value: 'orbitalPlane' },
];

export function OrbitScene({ values }: { values: OrbitalValues }) {
  const [view, setView] = useState<ViewPreset>('free');
  const controlsRef = useRef<any>(null);

  const satPosition = useMemo(() => keplerianToCartesian(values, SCALE), [values]);
  const starColor = useMemo(() => getContrastingStarColor(EARTH_COLOR), []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
        }}
      >
        {VIEW_BUTTONS.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setView(btn.value)}
            style={{
              padding: '6px 10px',
              fontSize: 12,
              fontFamily: 'sans-serif',
              borderRadius: 4,
              border: '1px solid #444',
              background: view === btn.value ? '#3ddc72' : 'rgba(20,20,30,0.85)',
              color: view === btn.value ? '#04060f' : '#e0e0e0',
              cursor: 'pointer',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <Canvas camera={{ position: [15, 10, 15], fov: 50 }}>
        <color attach="background" args={[SPACE_BG_COLOR]} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[50, 20, 30]} intensity={1.2} />

        <Stars
          radius={100}
          depth={50}
          count={6000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
          color={starColor}
        />

        <Earth />
        <NorthAxis />
        <EquatorCircle />
        <VernalEquinoxAxis />
        <AscendingNodeLine raanDeg={values.raan} />
        <OrbitPath values={values} />
        <Satellite position={satPosition} />

        <CameraRig view={view} values={values} controlsRef={controlsRef} />
        <OrbitControls ref={controlsRef} enableDamping={false} />
      </Canvas>
    </div>
  );
}
