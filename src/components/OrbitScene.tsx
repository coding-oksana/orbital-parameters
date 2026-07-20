import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Stars } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { OrbitalValues } from '@typeProps/orbitParams';
import { keplerianToCartesian, generateOrbitPath } from '@utils/orbitMath';

const EARTH_RADIUS_KM = 6371;
const SCALE = 1 / 1000;
const EARTH_COLOR = '#2255aa';
const SPACE_BG_COLOR = '#04060f'; // deep space navy, not pure black

/**
 * Picks a star color that stays visible against the given base color,
 * using relative luminance (WCAG-style) to decide light vs dark contrast.
 */
function getContrastingStarColor(baseColor: string): string {
  const c = new THREE.Color(baseColor);
  const luminance = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  // Dark planet -> bright pale stars. Bright planet -> cooler, dimmer stars.
  return luminance < 0.5 ? '#f5f7ff' : '#c7d3e0';
}

function Earth() {
  return (
    <Sphere args={[EARTH_RADIUS_KM * SCALE, 64, 64]}>
      <meshPhongMaterial color={EARTH_COLOR} shininess={5} />
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

  const starColor = useMemo(() => getContrastingStarColor(EARTH_COLOR), []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
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
        <OrbitPath values={values} />
        <Satellite position={satPosition} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}