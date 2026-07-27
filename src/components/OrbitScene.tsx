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

// ─── colours matching reference diagram ──────────────────────────────────────
const NORTH_COLOR = '#c7ccd6';
const EQUATOR_COLOR = '#3ddc72';
const VERNAL_COLOR = '#c7ccd6';
const NODE_COLOR = '#e040fb'; // ascending / descending node line
const RAAN_COLOR = '#4caf50'; // Ω arc — green like reference
const INC_COLOR = '#4caf50'; // i arc — green
const OMEGA_COLOR = '#7c4dff'; // ω arc — purple/blue like reference
const NU_COLOR = '#f44336'; // ν arc — red like reference
const PERIAPSIS_COLOR = '#ff9800';
const APOAPSIS_COLOR = '#42a5f5';

type ViewPreset = 'free' | 'vernal' | 'north' | 'orbitalPlane';

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

function getContrastingStarColor(baseColor: string): string {
  const c = new THREE.Color(baseColor);
  const luminance = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  return luminance < 0.5 ? '#f5f7ff' : '#c7d3e0';
}

function getOrbitNormal(values: OrbitalValues): THREE.Vector3 {
  const raan = THREE.MathUtils.degToRad(values.raan);
  const i = THREE.MathUtils.degToRad(values.i);
  return new THREE.Vector3(
    Math.sin(raan) * Math.sin(i),
    Math.cos(i),
    Math.cos(raan) * Math.sin(i)
  ).normalize();
}

function getPresetPosition(
  view: ViewPreset,
  values: OrbitalValues
): THREE.Vector3 {
  switch (view) {
    case 'vernal':
      return new THREE.Vector3(VIEW_DISTANCE, 0, 0);
    case 'north':
      return new THREE.Vector3(0, VIEW_DISTANCE, 0.001);
    case 'orbitalPlane':
      return getOrbitNormal(values).multiplyScalar(VIEW_DISTANCE);
    default:
      return new THREE.Vector3(15, 10, 15);
  }
}

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Generates an arc of N points in 3-D given a centre, two orthogonal axis
 *  vectors (u, v) spanning the arc plane, a radius, and start/end angles. */
function makeArc(
  centre: THREE.Vector3,
  u: THREE.Vector3,
  v: THREE.Vector3,
  radius: number,
  startRad: number,
  endRad: number,
  segments = 48
): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= segments; k++) {
    const t = startRad + (endRad - startRad) * (k / segments);
    pts.push(
      centre
        .clone()
        .addScaledVector(u, Math.cos(t) * radius)
        .addScaledVector(v, Math.sin(t) * radius)
    );
  }
  return pts;
}

/** Direction of the ascending node in world space (verified against keplerianToCartesian). */
function ascNodeDir(raanDeg: number): THREE.Vector3 {
  const raan = THREE.MathUtils.degToRad(raanDeg);
  return new THREE.Vector3(Math.cos(raan), 0, -Math.sin(raan)).normalize();
}

/** Periapsis direction in world space. */
function periapsisDir(values: OrbitalValues): THREE.Vector3 {
  const raan = THREE.MathUtils.degToRad(values.raan);
  const inc = THREE.MathUtils.degToRad(values.i);
  const omega = THREE.MathUtils.degToRad(values.omega);

  // perifocal x-axis (periapsis direction) in world frame
  // = Rz(-raan) * Rx(-inc) * Rz(-omega) applied to (1,0,0)
  // but in three's axes (x-east, y-north, z = -south-in-equatorial = toward viewer at raan=0)
  // matches the keplerianToCartesian convention used in orbitMath.
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

// ─── camera rig ──────────────────────────────────────────────────────────────

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
    targetUp.current =
      view === 'north'
        ? new THREE.Vector3(0, 0, -1)
        : new THREE.Vector3(0, 1, 0);
    animating.current = true;
  }, [view, values]);

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

// ─── scene components ────────────────────────────────────────────────────────

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
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const r = HELPER_R * 0.95;
    for (let i = 0; i <= 128; i++) {
      const t = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * r, 0, Math.sin(t) * r));
    }
    return pts;
  }, []);
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
        points={[new THREE.Vector3(0, 0, 0), ascPoint]}
        color={NODE_COLOR}
        lineWidth={2}
      />
      <Line
        points={[new THREE.Vector3(0, 0, 0), descPoint]}
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
        style={{ transform: 'translate(8px,  8px)' }}
      >
        <div style={labelStyle(NODE_COLOR)}>Desc. Node ☋</div>
      </Html>
    </group>
  );
}

// ─── RAAN arc (Ω) — in equatorial plane from vernal equinox to ascending node ─

function RaanArc({ values }: { values: OrbitalValues }) {
  const raan = THREE.MathUtils.degToRad(values.raan);
  // equatorial plane: u = +X (vernal equinox), v = -Z (east in three's convention)
  const u = new THREE.Vector3(1, 0, 0);
  const v = new THREE.Vector3(0, 0, -1);
  const r = HELPER_R * 0.55;
  const pts = useMemo(
    () => makeArc(new THREE.Vector3(), u, v, r, 0, raan),
    [raan]
  );

  // midpoint label position
  const midAngle = raan / 2;
  const midPos = new THREE.Vector3()
    .addScaledVector(u, Math.cos(midAngle) * (r + 0.4))
    .addScaledVector(v, Math.sin(midAngle) * (r + 0.4));

  if (Math.abs(values.raan) < 2) return null;
  return (
    <group>
      <Line points={pts} color={RAAN_COLOR} lineWidth={2} />
      <Html position={midPos} center>
        <div style={labelStyle(RAAN_COLOR)}>Ω = {values.raan.toFixed(1)}°</div>
      </Html>
    </group>
  );
}

// ─── Inclination arc (i) — at the ascending node, between equatorial and orbital plane ─

function InclinationArc({ values }: { values: OrbitalValues }) {
  const inc = THREE.MathUtils.degToRad(values.i);
  const node = useMemo(() => ascNodeDir(values.raan), [values.raan]);

  // u = ascending node direction (in equatorial plane)
  // v = north pole direction (Y)
  // The arc sweeps from equatorial plane (angle 0) to orbital plane (angle inc)
  const u = node.clone();
  const v = new THREE.Vector3(0, 1, 0);
  const r = HELPER_R * 0.45;
  const pts = useMemo(
    () => makeArc(new THREE.Vector3(), u, v, r, 0, inc),
    [inc, u, v]
  );

  const midAngle = inc / 2;
  const midPos = new THREE.Vector3()
    .addScaledVector(u, Math.cos(midAngle) * (r + 0.35))
    .addScaledVector(v, Math.sin(midAngle) * (r + 0.35));

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

// ─── Argument of periapsis arc (ω) — in orbital plane from node to periapsis ─

function OmegaArc({ values }: { values: OrbitalValues }) {
  const omega = THREE.MathUtils.degToRad(values.omega);
  const inc = THREE.MathUtils.degToRad(values.i);
  const raan = THREE.MathUtils.degToRad(values.raan);

  // u = ascending node direction
  // v = perpendicular to node, in the orbital plane (= node rotated 90° toward orbital north)
  const nodeDir = useMemo(() => ascNodeDir(values.raan), [values.raan]);

  // orbital plane normal
  const normal = useMemo(() => getOrbitNormal(values), [values]);

  // v = normal × nodeDir (perpendicular to node, within orbital plane)
  const v = useMemo(
    () => normal.clone().cross(nodeDir).normalize(),
    [normal, nodeDir]
  );

  const r = HELPER_R * 0.65;
  const pts = useMemo(
    () => makeArc(new THREE.Vector3(), nodeDir, v, r, 0, omega),
    [omega, nodeDir, v]
  );

  const midAngle = omega / 2;
  const midPos = new THREE.Vector3()
    .addScaledVector(nodeDir, Math.cos(midAngle) * (r + 0.4))
    .addScaledVector(v, Math.sin(midAngle) * (r + 0.4));

  if (Math.abs(values.omega) < 2) return null;
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

// ─── True anomaly arc (ν) — in orbital plane from periapsis to satellite ─────

function NuArc({ values }: { values: OrbitalValues }) {
  const nu = THREE.MathUtils.degToRad(values.nu);
  const periDir = useMemo(() => periapsisDir(values), [values]);
  const normal = useMemo(() => getOrbitNormal(values), [values]);

  // v perpendicular to periapsis within orbital plane
  const v = useMemo(
    () => normal.clone().cross(periDir).normalize(),
    [normal, periDir]
  );

  const r = HELPER_R * 0.78;
  const pts = useMemo(
    () => makeArc(new THREE.Vector3(), periDir, v, r, 0, nu),
    [nu, periDir, v]
  );

  const midAngle = nu / 2;
  const midPos = new THREE.Vector3()
    .addScaledVector(periDir, Math.cos(midAngle) * (r + 0.45))
    .addScaledVector(v, Math.sin(midAngle) * (r + 0.45));

  if (Math.abs(values.nu) < 2) return null;
  return (
    <group>
      <Line points={pts} color={NU_COLOR} lineWidth={2} />
      <Html position={midPos} center>
        <div style={labelStyle(NU_COLOR)}>ν = {values.nu.toFixed(1)}°</div>
      </Html>
    </group>
  );
}

// ─── Periapsis & apoapsis markers ────────────────────────────────────────────

function PeriapsisMarker({ values }: { values: OrbitalValues }) {
  const dir = useMemo(() => periapsisDir(values), [values]);
  const { a, e } = values;
  const rP = a * (1 - e) * SCALE;
  const pos = dir.clone().multiplyScalar(rP);

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

function ApoapsisMark({ values }: { values: OrbitalValues }) {
  if (values.e >= 1) return null; // open orbit
  const dir = useMemo(() => periapsisDir(values), [values]);
  const { a, e } = values;
  const rA = a * (1 + e) * SCALE;
  const pos = dir.clone().multiplyScalar(-rA);

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

// ─── Line from Earth to periapsis (major axis reference line) ────────────────

function PeriapsisLine({ values }: { values: OrbitalValues }) {
  const dir = useMemo(() => periapsisDir(values), [values]);
  const { a, e } = values;
  const rP = a * (1 - e) * SCALE;
  const rA = e < 1 ? a * (1 + e) * SCALE : HELPER_R;
  const periPt = dir.clone().multiplyScalar(rP);
  const apoPt = dir.clone().multiplyScalar(-rA);

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

function OrbitPath({ values }: { values: OrbitalValues }) {
  const points = useMemo(() => generateOrbitPath(values, SCALE), [values]);
  return <Line points={points} color="cyan" lineWidth={1.5} />;
}

function Satellite({ position }: { position: THREE.Vector3 }) {
  return (
    <group>
      <Line
        points={[new THREE.Vector3(0, 0, 0), position]}
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

// ─── view buttons ─────────────────────────────────────────────────────────────

const VIEW_BUTTONS: { label: string; value: ViewPreset }[] = [
  { label: 'Free', value: 'free' },
  { label: 'From Vernal Eq.', value: 'vernal' },
  { label: 'From North', value: 'north' },
  { label: 'Orbital Plane', value: 'orbitalPlane' },
];

// ─── scene root ───────────────────────────────────────────────────────────────

export function OrbitScene({ values }: { values: OrbitalValues }) {
  const [view, setView] = useState<ViewPreset>('free');
  const controlsRef = useRef<any>(null);
  const satPosition = useMemo(
    () => keplerianToCartesian(values, SCALE),
    [values]
  );
  const starColor = useMemo(() => getContrastingStarColor(EARTH_COLOR), []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* view preset buttons */}
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

      {/* colour legend */}
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
        {[
          [RAAN_COLOR, 'Ω  RAAN'],
          [INC_COLOR, 'i  Inclination'],
          [OMEGA_COLOR, 'ω  Arg. of periapsis'],
          [NU_COLOR, 'ν  True anomaly'],
          [PERIAPSIS_COLOR, 'Periapsis (r_p)'],
          [APOAPSIS_COLOR, 'Apoapsis (r_a)'],
          [NODE_COLOR, 'Node line'],
        ].map(([color, label]) => (
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
          color={starColor}
        />

        <Earth />
        <NorthAxis />
        <EquatorCircle />
        <VernalEquinoxAxis />

        {/* node line + angles */}
        <AscendingNodeLine raanDeg={values.raan} />
        <RaanArc values={values} />
        <InclinationArc values={values} />
        <OmegaArc values={values} />
        <NuArc values={values} />

        {/* orbit geometry */}
        <PeriapsisLine values={values} />
        <PeriapsisMarker values={values} />
        <ApoapsisMark values={values} />
        <OrbitPath values={values} />
        <Satellite position={satPosition} />

        <CameraRig view={view} values={values} controlsRef={controlsRef} />
        <OrbitControls ref={controlsRef} enableDamping={false} />
      </Canvas>
    </div>
  );
}
