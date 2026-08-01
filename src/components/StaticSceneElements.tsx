import {
  EARTH_COLOR,
  EARTH_R,
  EQUATOR_COLOR,
  HELPER_R,
  NORTH_COLOR,
  VERNAL_COLOR,
} from '@constants/styles';
import { Line, Sphere, Html } from '@react-three/drei';
import { labelStyle } from '@utils/labelStyle';
import { useMemo } from 'react';
import * as THREE from 'three';

export function Earth() {
  return (
    <Sphere args={[EARTH_R, 64, 64]}>
      <meshPhongMaterial color={EARTH_COLOR} shininess={5} />
    </Sphere>
  );
}

export function NorthAxis() {
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

export function EquatorCircle() {
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

export function VernalEquinoxAxis() {
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

export const STAR_COLOR = (() => {
  const c = new THREE.Color(EARTH_COLOR);
  const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  return lum < 0.5 ? '#f5f7ff' : '#c7d3e0';
})();
