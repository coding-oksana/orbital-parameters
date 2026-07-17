import * as THREE from 'three';
import type { OrbitalValues } from '@typeProps/orbitParams';

const deg2rad = (d: number) => (d * Math.PI) / 180;

/** Perifocal -> ECI, then remapped to Three.js Y-up (ECI z -> three y) */
export function keplerianToCartesian(
  el: OrbitalValues,
  scale = 1
): THREE.Vector3 {
  const { a, e, nu } = el;
  const i = deg2rad(el.i);
  const raan = deg2rad(el.raan);
  const w = deg2rad(el.omega);
  const nuRad = deg2rad(nu);

  const r = (a * (1 - e * e)) / (1 + e * Math.cos(nuRad));
  const xPf = r * Math.cos(nuRad);
  const yPf = r * Math.sin(nuRad);

  const cosO = Math.cos(raan),
    sinO = Math.sin(raan);
  const cosI = Math.cos(i),
    sinI = Math.sin(i);
  const cosW = Math.cos(w),
    sinW = Math.sin(w);

  const x =
    xPf * (cosO * cosW - sinO * sinW * cosI) -
    yPf * (cosO * sinW + sinO * cosW * cosI);
  const y =
    xPf * (sinO * cosW + cosO * sinW * cosI) -
    yPf * (sinO * sinW - cosO * cosW * cosI);
  const z = xPf * (sinW * sinI) + yPf * (cosW * sinI);

  // ECI (x,y,z) with z as the "up" rotation axis -> Three.js Y-up
  return new THREE.Vector3(x, z, -y).multiplyScalar(scale);
}

export function generateOrbitPath(
  el: OrbitalValues,
  scale = 1,
  segments = 128
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let s = 0; s <= segments; s++) {
    const nu = (360 / segments) * s;
    points.push(keplerianToCartesian({ ...el, nu }, scale));
  }
  return points;
}
