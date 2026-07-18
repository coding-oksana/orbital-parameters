import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Sphere } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { OrbitalValues } from '@typeProps/orbitParams';
import { keplerianToCartesian, generateOrbitPath } from '@utils/orbitMath';

const EARTH_RADIUS_KM = 6371;
const SCALE = 1 / 1000;

function Earth() {
  return (
    <Sphere args={[EARTH_RADIUS_KM * SCALE, 64, 64]}>
      <meshPhongMaterial color="#2255aa" shininess={5} />
    </Sphere>
  );
}

function Satellite({ position }: { position: THREE.Vector3 }) {
  return (
    <Sphere args={[0.15, 16, 16]} position={position}>
      <meshBasicMaterial color="orange" />
    </Sphere>
  );
}

function OrbitPath({ values }: { values: OrbitalValues }) {
  const points = useMemo(() => generateOrbitPath(values, SCALE), [values]);
  return <Line points={points} color="cyan" lineWidth={1} />;
}

export function OrbitScene({ values }: { values: OrbitalValues }) {
  const satPosition = useMemo(
    () => keplerianToCartesian(values, SCALE),
    [values]
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [15, 10, 15], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[50, 20, 30]} intensity={1.2} />
        <Earth />
        <OrbitPath values={values} />
        <Satellite position={satPosition} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
