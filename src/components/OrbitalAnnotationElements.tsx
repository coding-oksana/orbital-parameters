import { Line, Sphere, Html } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { OrbitalValues } from '@typeProps/orbitParams';
import { generateOrbitPath } from '@utils/orbitMath';
import {
  SCALE,
  HELPER_R,
  INC_COLOR,
  NU_COLOR,
  NODE_COLOR,
  RAAN_COLOR,
  OMEGA_COLOR,
  PERIAPSIS_COLOR,
  APOAPSIS_COLOR,
} from '@constants/scene';
import {
  ascNodeDir,
  labelStyle,
  makeArc,
  orbitNormal,
  periapsisDir,
} from '@utils/sceneHelpers';

export function AscendingNodeLine({ raanDeg }: { raanDeg: number }) {
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

// Equatorial plane basis: +X = vernal equinox, -Z = eastward
const EQUINOX_DIR = new THREE.Vector3(1, 0, 0);
const EAST_DIR = new THREE.Vector3(0, 0, -1);
const NORTH_DIR = new THREE.Vector3(0, 1, 0);

export function RaanArc({ values }: { values: OrbitalValues }) {
  const raanRad = THREE.MathUtils.degToRad(values.raan);
  const u = EQUINOX_DIR;
  const v = EAST_DIR;
  const r = HELPER_R * 0.55;

  const pts = useMemo(
    () => makeArc(new THREE.Vector3(), u, v, r, 0, raanRad),
    [raanRad, u, v, r]
  );
  const midPos = useMemo(() => {
    const mid = raanRad / 2;
    return new THREE.Vector3()
      .addScaledVector(u, Math.cos(mid) * (r + 0.4))
      .addScaledVector(v, Math.sin(mid) * (r + 0.4));
  }, [raanRad, u, v, r]);

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

export function InclinationArc({ values }: { values: OrbitalValues }) {
  const incRad = THREE.MathUtils.degToRad(values.i);
  // Arc from equatorial plane up to orbital plane, centred on the ascending node.
  // u = node direction, v = north (+Y)
  const u = useMemo(() => ascNodeDir(values.raan), [values.raan]);
  const v = NORTH_DIR;
  const r = HELPER_R * 0.45;

  const pts = useMemo(
    () => makeArc(new THREE.Vector3(), u, v, r, 0, incRad),
    [incRad, u, v, r]
  );
  const midPos = useMemo(() => {
    const mid = incRad / 2;
    return new THREE.Vector3()
      .addScaledVector(u, Math.cos(mid) * (r + 0.35))
      .addScaledVector(v, Math.sin(mid) * (r + 0.35));
  }, [incRad, u, v, r]);

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

export function OmegaArc({ values }: { values: OrbitalValues }) {
  const omegaRad = THREE.MathUtils.degToRad(values.omega);
  // Arc from ascending node to periapsis, within the orbital plane.
  // u = node direction, v = normal × node (perpendicular, in orbital plane)
  const u = useMemo(() => ascNodeDir(values.raan), [values.raan]);
  const normal = useMemo(() => orbitNormal(values), [values]);
  const v = useMemo(() => normal.clone().cross(u).normalize(), [normal, u]);
  const r = HELPER_R * 0.65;

  const pts = useMemo(
    () => makeArc(new THREE.Vector3(), u, v, r, 0, omegaRad),
    [omegaRad, u, v, r]
  );
  const midPos = useMemo(() => {
    const mid = omegaRad / 2;
    return new THREE.Vector3()
      .addScaledVector(u, Math.cos(mid) * (r + 0.4))
      .addScaledVector(v, Math.sin(mid) * (r + 0.4));
  }, [omegaRad, u, v, r]);

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

export function NuArc({ values }: { values: OrbitalValues }) {
  const nuRad = THREE.MathUtils.degToRad(values.nu);
  // Arc from periapsis to satellite, within the orbital plane.
  // u = periapsis direction, v = normal × periapsis (perpendicular, in orbital plane)
  const u = useMemo(() => periapsisDir(values), [values]);
  const normal = useMemo(() => orbitNormal(values), [values]);
  const v = useMemo(() => normal.clone().cross(u).normalize(), [normal, u]);
  const r = HELPER_R * 0.78;

  const pts = useMemo(
    () => makeArc(new THREE.Vector3(), u, v, r, 0, nuRad),
    [nuRad, u, v, r]
  );
  const midPos = useMemo(() => {
    const mid = nuRad / 2;
    return new THREE.Vector3()
      .addScaledVector(u, Math.cos(mid) * (r + 0.45))
      .addScaledVector(v, Math.sin(mid) * (r + 0.45));
  }, [nuRad, u, v, r]);

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

export function PeriapsisLine({ values }: { values: OrbitalValues }) {
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

export function PeriapsisMarker({ values }: { values: OrbitalValues }) {
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

export function ApoapsisMarker({ values }: { values: OrbitalValues }) {
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

export function OrbitPath({ values }: { values: OrbitalValues }) {
  const points = useMemo(() => generateOrbitPath(values, SCALE), [values]);
  return <Line points={points} color="cyan" lineWidth={1.5} />;
}

export function Satellite({ position }: { position: THREE.Vector3 }) {
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
