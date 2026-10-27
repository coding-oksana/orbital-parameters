import * as THREE from 'three';
import { keplerianToCartesian as toEci } from 'orbital-convert';
import type { OrbitalValues } from '@typeProps/orbitParams';

/** Keplerian elements -> ECI position, remapped to Three.js Y-up (ECI z -> three y) */
export function keplerianToCartesian(
  el: OrbitalValues,
  scale = 1
): THREE.Vector3 {
  const { x, y, z } = toEci(el);

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
