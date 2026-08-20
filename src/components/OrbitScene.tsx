import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Stars, Html } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import type { OrbitalValues } from '@typeProps/orbitParams';
import { keplerianToCartesian, generateOrbitPath } from '@utils/orbitMath';

// ─── constants ────────────────────────────────────────────────────────────────

const EARTH_RADIUS_KM = 6371;
const SCALE = 1 / 1000;
const EARTH_R = EARTH_RADIUS_KM * SCALE;
const HELPER_R = EARTH_R * 2.2;
const VIEW_DISTANCE = 25;
const EARTH_COLOR = '#2255aa';
const SPACE_BG_COLOR = '#04060f';

// Star colour is fixed for a given EARTH_COLOR — compute once at module level.
const STAR_COLOR = (() => {
  const c = new THREE.Color(EARTH_COLOR);
  const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  return lum < 0.5 ? '#f5f7ff' : '#c7d3e0';
})();

// Colours matching reference diagram
const NORTH_COLOR = '#c7ccd6';
const EQUATOR_COLOR = '#3ddc72';
const VERNAL_COLOR = '#c7ccd6';
const NODE_COLOR = '#e040fb';
const RAAN_COLOR = '#4caf50';
const INC_COLOR = '#4caf50';
const OMEGA_COLOR = '#7c4dff';
const NU_COLOR = '#f44336';
const PERIAPSIS_COLOR = '#ff9800';
const APOAPSIS_COLOR = '#42a5f5';

type ViewPreset = 'free' | 'vernal' | 'north' | 'orbitalPlane';

// ─── shared helpers ───────────────────────────────────────────────────────────

function labelStyle(color: string): React.CSSProperties {
  return {
    color,
    fontSize: '12px',
    fontFamily: 'sans-serif',
    whiteSpace: 'nowrap',
    textShadow: '0 0 4px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.95)',
    pointerEvents: 'none',
    userSelect: 'none',
  };
}

/** Arc of `segments+1` points in 3-D lying in the plane spanned by unit vectors u, v. */
function makeArc(
  centre: THREE.Vector3,
  u: THREE.Vector3,
  v: THREE.Vector3,
  radius: number,
  startRad: number,
  endRad: number,
  segments = 48
): THREE.Vector3[] {
  return Array.from({ length: segments + 1 }, (_, k) => {
    const t = startRad + (endRad - startRad) * (k / segments);
    return centre
      .clone()
      .addScaledVector(u, Math.cos(t) * radius)
      .addScaledVector(v, Math.sin(t) * radius);
  });
}

/** Ascending node direction in world space. */
function ascNodeDir(raanDeg: number): THREE.Vector3 {
  const raan = THREE.MathUtils.degToRad(raanDeg);
  return new THREE.Vector3(Math.cos(raan), 0, -Math.sin(raan));
}

/** Orbital plane normal in world space. */
function orbitNormal(values: OrbitalValues): THREE.Vector3 {
  const raan = THREE.MathUtils.degToRad(values.raan);
  const i = THREE.MathUtils.degToRad(values.i);
  return new THREE.Vector3(
    Math.sin(raan) * Math.sin(i),
    Math.cos(i),
    Math.cos(raan) * Math.sin(i)
  ).normalize();
}

/** Periapsis direction in world space. */
function periapsisDir(values: OrbitalValues): THREE.Vector3 {
  const raan = THREE.MathUtils.degToRad(values.raan);
  const inc = THREE.MathUtils.degToRad(values.i);
  const omega = THREE.MathUtils.degToRad(values.omega);
  const cosO = Math.cos(omega),
    sinO = Math.sin(omega);
  const cosI = Math.cos(inc),
    sinI = Math.sin(inc);
  const cosR = Math.cos(raan),
    sinR = Math.sin(raan);
  return new THREE.Vector3(
    cosR * cosO - sinR * sinO * cosI,
    sinI * sinO,
    -sinR * cosO - cosR * sinO * cosI
  ).normalize();
}

function presetPosition(
  view: ViewPreset,
  values: OrbitalValues
): THREE.Vector3 {
  switch (view) {
    case 'vernal':
      return new THREE.Vector3(VIEW_DISTANCE, 0, 0);
    case 'north':
      return new THREE.Vector3(0, VIEW_DISTANCE, 0.001);
    case 'orbitalPlane':
      return orbitNormal(values).multiplyScalar(VIEW_DISTANCE);
    default:
      return new THREE.Vector3(15, 10, 15);
  }
}

// ─── camera rig ───────────────────────────────────────────────────────────────

function CameraRig({
  view,
  values,
  animationKey,
  controlsRef,
}: {
  view: ViewPreset;
  values: OrbitalValues;
  animationKey: number;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const targetPos = useRef(presetPosition('free', values));
  const targetUp = useRef(new THREE.Vector3(0, 1, 0));
  const animating = useRef(false);

  // Only re-trigger when the user picks a preset (animationKey or view changes).
  // values is intentionally excluded — orbital param edits must not move the camera.
  useEffect(() => {
    targetPos.current = presetPosition(view, values);
    targetUp.current =
      view === 'north'
        ? new THREE.Vector3(0, 0, -1)
        : new THREE.Vector3(0, 1, 0);
    animating.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, animationKey]); // <-- values removed here

  useFrame(() => {
    if (!animating.current) return;
    camera.position.lerp(targetPos.current, 0.08);
    camera.up.lerp(targetUp.current, 0.08);
    camera.lookAt(0, 0, 0);
    controlsRef.current?.update();
    if (camera.position.distanceTo(targetPos.current) < 0.05) {
      animating.current = false;
    }
  });

  return null;
}

// ─── static scene elements ────────────────────────────────────────────────────

function Earth() {
  return (
    <Sphere args={[EARTH_R, 64, 64]}>
      <meshPhongMaterial color={EARTH_COLOR} shininess={5} />
    </Sphere>
  );
}

function NorthAxis() {
  const points = useMemo(
    () => [
      new THREE.Vector3(0, -HELPER_R * 0.3, 0),
      new THREE.Vector3(0, HELPER_R, 0),
    ],
    []
  );
  return (
    <group>
      <Line points={points} color={NORTH_COLOR} lineWidth={1.5} />
      <Html
        position={[0, HELPER_R, 0]}
        center
        style={{ transform: 'translateY(-12px)' }}
      >
        <div style={labelStyle(NORTH_COLOR)}>North</div>
      </Html>
    </group>
  );
}

function EquatorCircle() {
  const points = useMemo(
    () =>
      Array.from({ length: 129 }, (_, i) => {
        const t = (i / 128) * Math.PI * 2;
        const r = HELPER_R * 0.95;
        return new THREE.Vector3(Math.cos(t) * r, 0, Math.sin(t) * r);
      }),
    []
  );
  return (
    <group>
      <Line
        points={points}
        color={EQUATOR_COLOR}
        lineWidth={1}
        dashed
        dashSize={0.3}
        gapSize={0.2}
      />
      <Html
        position={[-HELPER_R * 0.95, 0, 0]}
        center
        style={{ transform: 'translate(10px, 0px)' }}
      >
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
      <Html
        position={[HELPER_R, 0, 0]}
        center
        style={{ transform: 'translate(10px, 0px)' }}
      >
        <div style={labelStyle(VERNAL_COLOR)}>♈ Vernal Equinox</div>
      </Html>
    </group>
  );
}

// ─── orbital annotation elements ─────────────────────────────────────────────

function AscendingNodeLine({ raanDeg }: { raanDeg: number }) {
  const dir = useMemo(() => ascNodeDir(raanDeg), [raanDeg]);
  const ascPoint = useMemo(
    () => dir.clone().multiplyScalar(HELPER_R * 0.85),
    [dir]
  );
  const descPoint = useMemo(
    () => dir.clone().multiplyScalar(-HELPER_R * 0.7),
    [dir]
  );
  return (
    <group>
      <Line
        points={[new THREE.Vector3(), ascPoint]}
        color={NODE_COLOR}
        lineWidth={2}
      />
      <Line
        points={[new THREE.Vector3(), descPoint]}
        color={NODE_COLOR}
        lineWidth={1}
        dashed
        dashSize={0.2}
        gapSize={0.15}
      />
      <Html
        position={ascPoint}
        center
        style={{ transform: 'translate(8px, -8px)' }}
      >
        <div style={labelStyle(NODE_COLOR)}>Asc. Node ☊</div>
      </Html>
      <Html
        position={descPoint}
        center
        style={{ transform: 'translate(8px, 8px)' }}
      >
        <div style={labelStyle(NODE_COLOR)}>Desc. Node ☋</div>
      </Html>
    </group>
  );
}

function RaanArc({ values }: { values: OrbitalValues }) {
  const raanRad = THREE.MathUtils.degToRad(values.raan);
  // Equatorial plane basis: +X = vernal equinox, -Z = eastward
  const u = new THREE.Vector3(1, 0, 0);
  const v = new THREE.Vector3(0, 0, -1);
  const r = HELPER_R * 0.55;

  const pts = useMemo(
    () => makeArc(new THREE.Vector3(), u, v, r, 0, raanRad),
    [raanRad]
  );
  const midPos = useMemo(() => {
    const mid = raanRad / 2;
    return new THREE.Vector3()
      .addScaledVector(u, Math.cos(mid) * (r + 0.4))
      .addScaledVector(v, Math.sin(mid) * (r + 0.4));
  }, [raanRad]);

  if (values.raan < 2) return null;
  return (
    <group>
      <Line points={pts} color={RAAN_COLOR} lineWidth={2} />
      <Html position={midPos} center>
        <div style={labelStyle(RAAN_COLOR)}>Ω = {values.raan.toFixed(1)}°</div>
      </Html>
    </group>
  );
}

function InclinationArc({ values }: { values: OrbitalValues }) {
  const incRad = THREE.MathUtils.degToRad(values.i);
  // Arc from equatorial plane up to orbital plane, centred on the ascending node.
  // u = node direction, v = north (+Y)
  const u = useMemo(() => ascNodeDir(values.raan), [values.raan]);
  const v = new THREE.Vector3(0, 1, 0);
  const r = HELPER_R * 0.45;

  const pts = useMemo(
    () => makeArc(new THREE.Vector3(), u, v, r, 0, incRad),
    [incRad, u]
  );
  const midPos = useMemo(() => {
    const mid = incRad / 2;
    return new THREE.Vector3()
      .addScaledVector(u, Math.cos(mid) * (r + 0.35))
      .addScaledVector(v, Math.sin(mid) * (r + 0.35));
  }, [incRad, u]);

  if (values.i < 1) return null;
  return (
    <group>
      <Line points={pts} color={INC_COLOR} lineWidth={2} />
      <Html position={midPos} center>
        <div style={labelStyle(INC_COLOR)}>i = {values.i.toFixed(1)}°</div>
      </Html>
    </group>
  );
}

function OmegaArc({ values }: { values: OrbitalValues }) {
  const omegaRad = THREE.MathUtils.degToRad(values.omega);
  // Arc from ascending node to periapsis, within the orbital plane.
  // u = node direction, v = normal × node (perpendicular, in orbital plane)
  const u = useMemo(() => ascNodeDir(values.raan), [values.raan]);
  const normal = useMemo(() => orbitNormal(values), [values]);
  const v = useMemo(() => normal.clone().cross(u).normalize(), [normal, u]);
  const r = HELPER_R * 0.65;

  const pts = useMemo(
    () => makeArc(new THREE.Vector3(), u, v, r, 0, omegaRad),
    [omegaRad, u, v]
  );
  const midPos = useMemo(() => {
    const mid = omegaRad / 2;
    return new THREE.Vector3()
      .addScaledVector(u, Math.cos(mid) * (r + 0.4))
      .addScaledVector(v, Math.sin(mid) * (r + 0.4));
  }, [omegaRad, u, v]);

  if (values.omega < 2) return null;
  return (
    <group>
      <Line points={pts} color={OMEGA_COLOR} lineWidth={2} />
      <Html position={midPos} center>
        <div style={labelStyle(OMEGA_COLOR)}>
          ω = {values.omega.toFixed(1)}°
        </div>
      </Html>
    </group>
  );
}

function NuArc({ values }: { values: OrbitalValues }) {
  const nuRad = THREE.MathUtils.degToRad(values.nu);
  // Arc from periapsis to satellite, within the orbital plane.
  // u = periapsis direction, v = normal × periapsis (perpendicular, in orbital plane)
  const u = useMemo(() => periapsisDir(values), [values]);
  const normal = useMemo(() => orbitNormal(values), [values]);
  const v = useMemo(() => normal.clone().cross(u).normalize(), [normal, u]);
  const r = HELPER_R * 0.78;

  const pts = useMemo(
    () => makeArc(new THREE.Vector3(), u, v, r, 0, nuRad),
    [nuRad, u, v]
  );
  const midPos = useMemo(() => {
    const mid = nuRad / 2;
    return new THREE.Vector3()
      .addScaledVector(u, Math.cos(mid) * (r + 0.45))
      .addScaledVector(v, Math.sin(mid) * (r + 0.45));
  }, [nuRad, u, v]);

  if (values.nu < 2) return null;
  return (
    <group>
      <Line points={pts} color={NU_COLOR} lineWidth={2} />
      <Html position={midPos} center>
        <div style={labelStyle(NU_COLOR)}>ν = {values.nu.toFixed(1)}°</div>
      </Html>
    </group>
  );
}

function PeriapsisLine({ values }: { values: OrbitalValues }) {
  const dir = useMemo(() => periapsisDir(values), [values]);
  const { a, e } = values;
  const periPt = useMemo(
    () => dir.clone().multiplyScalar(a * (1 - e) * SCALE),
    [dir, a, e]
  );
  const apoPt = useMemo(
    () => dir.clone().multiplyScalar(-a * (e < 1 ? 1 + e : 1) * SCALE),
    [dir, a, e]
  );
  return (
    <Line
      points={[apoPt, periPt]}
      color={OMEGA_COLOR}
      lineWidth={0.8}
      dashed
      dashSize={0.15}
      gapSize={0.1}
      opacity={0.4}
      transparent
    />
  );
}

function PeriapsisMarker({ values }: { values: OrbitalValues }) {
  const dir = useMemo(() => periapsisDir(values), [values]);
  const pos = useMemo(
    () => dir.clone().multiplyScalar(values.a * (1 - values.e) * SCALE),
    [dir, values]
  );
  return (
    <group>
      <Sphere args={[0.12, 12, 12]} position={pos}>
        <meshBasicMaterial color={PERIAPSIS_COLOR} />
      </Sphere>
      <Html
        position={pos}
        center
        style={{ transform: 'translate(14px, -8px)' }}
      >
        <div style={labelStyle(PERIAPSIS_COLOR)}>Periapsis r_p</div>
      </Html>
    </group>
  );
}

function ApoapsisMarker({ values }: { values: OrbitalValues }) {
  const dir = useMemo(() => periapsisDir(values), [values]);
  const pos = useMemo(
    () => dir.clone().multiplyScalar(-values.a * (1 + values.e) * SCALE),
    [dir, values]
  );

  // Keep hooks above the early return to satisfy Rules of Hooks
  if (values.e >= 1) return null;
  return (
    <group>
      <Sphere args={[0.12, 12, 12]} position={pos}>
        <meshBasicMaterial color={APOAPSIS_COLOR} />
      </Sphere>
      <Html
        position={pos}
        center
        style={{ transform: 'translate(14px, -8px)' }}
      >
        <div style={labelStyle(APOAPSIS_COLOR)}>Apoapsis r_a</div>
      </Html>
    </group>
  );
}

function OrbitPath({ values }: { values: OrbitalValues }) {
  const points = useMemo(() => generateOrbitPath(values, SCALE), [values]);
  return <Line points={points} color="cyan" lineWidth={1.5} />;
}

function Satellite({ position }: { position: THREE.Vector3 }) {
  return (
    <group>
      <Line
        points={[new THREE.Vector3(), position]}
        color={NU_COLOR}
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
      <Html
        position={position}
        center
        style={{ transform: 'translate(12px, -8px)' }}
      >
        <div style={labelStyle('#ffb74d')}>Satellite</div>
      </Html>
    </group>
  );
}

// ─── view controls ────────────────────────────────────────────────────────────

const VIEW_BUTTONS: { label: string; value: ViewPreset }[] = [
  { label: 'Free', value: 'free' },
  { label: 'From Vernal Eq.', value: 'vernal' },
  { label: 'From North', value: 'north' },
  { label: 'Orbital Plane', value: 'orbitalPlane' },
];

const LEGEND_ITEMS: [string, string][] = [
  [RAAN_COLOR, 'Ω  RAAN'],
  [INC_COLOR, 'i  Inclination'],
  [OMEGA_COLOR, 'ω  Arg. of periapsis'],
  [NU_COLOR, 'ν  True anomaly'],
  [PERIAPSIS_COLOR, 'Periapsis (r_p)'],
  [APOAPSIS_COLOR, 'Apoapsis (r_a)'],
  [NODE_COLOR, 'Node line'],
];

// ─── root ─────────────────────────────────────────────────────────────────────

export function OrbitScene({ values }: { values: OrbitalValues }) {
  const [view, setView] = useState<ViewPreset>('free');
  const [animationKey, setAnimationKey] = useState(0); // increments on each preset pick
  const controlsRef = useRef<any>(null);
  const satPosition = useMemo(
    () => keplerianToCartesian(values, SCALE),
    [values]
  );

  // When the user picks a preset button, bump animationKey to re-trigger the
  // fly-to animation. Changing the same preset twice still animates.
  function handleViewChange(next: ViewPreset) {
    setView(next);
    setAnimationKey((k) => k + 1);
  }

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
            onClick={() => handleViewChange(btn.value)}
            style={{
              padding: '6px 10px',
              fontSize: 12,
              fontFamily: 'sans-serif',
              borderRadius: 4,
              border: '1px solid #444',
              background:
                view === btn.value ? '#3ddc72' : 'rgba(20,20,30,0.85)',
              color: view === btn.value ? '#04060f' : '#e0e0e0',
              cursor: 'pointer',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          background: 'rgba(4,6,15,0.75)',
          padding: '8px 12px',
          borderRadius: 8,
        }}
      >
        {LEGEND_ITEMS.map(([color, label]) => (
          <div
            key={label}
            style={{ display: 'flex', alignItems: 'center', gap: 7 }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: '#c7ccd6',
                fontSize: 11,
                fontFamily: 'sans-serif',
              }}
            >
              {label}
            </span>
          </div>
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
          color={STAR_COLOR}
        />

        <Earth />
        <NorthAxis />
        <EquatorCircle />
        <VernalEquinoxAxis />

        <AscendingNodeLine raanDeg={values.raan} />
        <RaanArc values={values} />
        <InclinationArc values={values} />
        <OmegaArc values={values} />
        <NuArc values={values} />

        <PeriapsisLine values={values} />
        <PeriapsisMarker values={values} />
        <ApoapsisMarker values={values} />
        <OrbitPath values={values} />
        <Satellite position={satPosition} />

        {/* animationKey passed separately so values changes don't trigger animation */}
        <CameraRig
          view={view}
          values={values}
          animationKey={animationKey}
          controlsRef={controlsRef}
        />
        <OrbitControls ref={controlsRef} enableDamping={false} />
      </Canvas>
    </div>
  );
}
