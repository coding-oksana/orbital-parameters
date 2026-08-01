import * as THREE from 'three';
import type { OrbitalValues } from '@typeProps/orbitParams';
import { EARTH_COLOR, VIEW_DISTANCE, ViewPreset } from '@components/OrbitScene';

export function labelStyle(color: string): React.CSSProperties {
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
export function makeArc(
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
export function ascNodeDir(raanDeg: number): THREE.Vector3 {
  const raan = THREE.MathUtils.degToRad(raanDeg);
  return new THREE.Vector3(Math.cos(raan), 0, -Math.sin(raan));
}

/** Orbital plane normal in world space. */
export function orbitNormal(values: OrbitalValues): THREE.Vector3 {
  const raan = THREE.MathUtils.degToRad(values.raan);
  const i = THREE.MathUtils.degToRad(values.i);
  return new THREE.Vector3(
    Math.sin(raan) * Math.sin(i),
    Math.cos(i),
    Math.cos(raan) * Math.sin(i)
  ).normalize();
}

/** Periapsis direction in world space. */
export function periapsisDir(values: OrbitalValues): THREE.Vector3 {
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

export function presetPosition(
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

// Star colour is fixed for a given EARTH_COLOR — compute once at module level.
export const STAR_COLOR = (() => {
  const c = new THREE.Color(EARTH_COLOR);
  const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  return lum < 0.5 ? '#f5f7ff' : '#c7d3e0';
})();
