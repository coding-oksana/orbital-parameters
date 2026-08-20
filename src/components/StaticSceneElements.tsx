import { Line, Sphere, Html } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { EARTH_R, HELPER_R, EARTH_COLOR } from '@constants/scene';
import { labelStyle } from '@utils/sceneHelpers';

const NORTH_COLOR = '#c7ccd6';
const EQUATOR_COLOR = '#3ddc72';
const VERNAL_COLOR = '#c7ccd6';

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
