import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Stars, Text } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { OrbitalValues } from '@typeProps/orbitParams';
import { keplerianToCartesian, generateOrbitPath } from '@utils/orbitMath';

const EARTH_RADIUS_KM = 6371;
const SCALE = 1 / 1000;
const EARTH_COLOR = '#2255aa';
const SPACE_BG_COLOR = '#04060f'; // deep space navy, not pure black

// Helper colors — chosen to stay distinct from cyan orbit path & earth blue
const EQUATOR_COLOR = '#7d8fa8';
const POLE_COLOR = '#e0e0e0';
const EQUINOX_COLOR = '#ffd166';
const NODE_COLOR = '#8be08b';
const RADIUS_VECTOR_COLOR = '#ffaa33';
const SAT_COLOR = '#ffb347';

/**
 * Picks a star color that stays visible against the given base color,
 * using relative luminance (WCAG-style) to decide light vs dark contrast.
 */
function getContrastingStarColor(baseColor: string): string {
  const c = new THREE.Color(baseColor);
  const luminance = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  return luminance < 0.5 ? '#f5f7ff' : '#c7d3e0';
}

function Earth() {
  return (
    <Sphere args={[EARTH_RADIUS_KM * SCALE, 64, 64]}>
      <meshPhongMaterial color={EARTH_COLOR} shininess={5} />
    </Sphere>
  );
}

/** Equatorial plane circle, drawn in the X-Z plane (Y = 0). */
function Equator() {
  const R = EARTH_RADIUS_KM * SCALE;
  const points = useMemo(() => {
    const segments = 128;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(R * Math.cos(theta), 0, R * Math.sin(theta)));
    }
    return pts;
  }, [R]);

  return (
    <>
      <Line
        points={points}
        color={EQUATOR_COLOR}
        lineWidth={1}
        dashed
        dashSize={0.3}
        gapSize={0.15}
      />
      <Text position={[R * 1.15, 0, 0]} fontSize={0.4} color={EQUATOR_COLOR} anchorX="left">
        Equator
      </Text>
    </>
  );
}

/** North/South rotation axis, along Y. */
function PolarAxis() {
  const R = EARTH_RADIUS_KM * SCALE;
  const len = R * 1.6;
  return (
    <>
      <Line points={[[0, -len, 0], [0, len, 0]]} color={POLE_COLOR} lineWidth={1.5} />
      <Text position={[0, len + 0.3, 0]} fontSize={0.45} color={POLE_COLOR}>
        N
      </Text>
      <Text position={[0, -len - 0.3, 0]} fontSize={0.45} color={POLE_COLOR}>
        S
      </Text>
    </>
  );
}

/** Vernal equinox reference direction, along +X. */
function VernalEquinoxAxis() {
  const R = EARTH_RADIUS_KM * SCALE;
  const len = R * 1.6;
  return (
    <>
      <Line points={[[0, 0, 0], [len, 0, 0]]} color={EQUINOX_COLOR} lineWidth={1.5} />
      <Text position={[len + 0.35, 0, 0]} fontSize={0.42} color={EQUINOX_COLOR} anchorX="left">
        ♈ Vernal Equinox
      </Text>
    </>
  );
}

/**
 * Ascending node marker — the point where the orbit crosses the equatorial
 * plane heading north, at angle `raan` (Ω) measured from the vernal equinox.
 * Adjust `values.raan` below if your OrbitalValues type names this field differently.
 */
function AscendingNode({ values }: { values: OrbitalValues }) {
  const R = EARTH_RADIUS_KM * SCALE;
  const raan = (values as any).raan ?? 0;

  const nodePoint = useMemo(
    () => new THREE.Vector3(R * 1.3 * Math.cos(raan), 0, R * 1.3 * Math.sin(raan)),
    [R, raan]
  );

  return (
    <>
      <Line points={[[0, 0, 0], nodePoint.toArray()]} color={NODE_COLOR} lineWidth={1.5} />
      <Sphere args={[0.12, 16, 16]} position={nodePoint}>
        <meshBasicMaterial color={NODE_COLOR} />
      </Sphere>
      <Text position={[nodePoint.x, 0.35, nodePoint.z]} fontSize={0.4} color={NODE_COLOR}>
        ☊ Ascending Node
      </Text>
    </>
  );
}

function Satellite({ position }: { position: THREE.Vector3 }) {
  return (
    <group>
      {/* radius vector from Earth's center to the satellite */}
      <Line
        points={[[0, 0, 0], position.toArray()]}
        color={RADIUS_VECTOR_COLOR}
        lineWidth={1}
        dashed
        dashSize={0.2}
        gapSize={0.12}
      />

      {/* soft glow halo so it reads clearly against the orbit line */}
      <Sphere args={[0.32, 16, 16]} position={position}>
        <meshBasicMaterial color={SAT_COLOR} transparent opacity={0.25} depthWrite={false} />
      </Sphere>

      {/* solid marker, bumped up from 0.15 -> 0.22 */}
      <Sphere args={[0.22, 20, 20]} position={position}>
        <meshBasicMaterial color={SAT_COLOR} />
      </Sphere>

      <Text position={[position.x, position.y + 0.5, position.z]} fontSize={0.35} color="#ffcf8a">
        Satellite
      </Text>
    </group>
  );
}

function OrbitPath({ values }: { values: OrbitalValues }) {
  const points = useMemo(() => generateOrbitPath(values, SCALE), [values]);
  return <Line points={points} color="cyan" lineWidth={1} />;
}

export function OrbitScene({
  values,
  showHelpers = true,
}: {
  values: OrbitalValues;
  showHelpers?: boolean;
}) {
  const satPosition = useMemo(() => keplerianToCartesian(values, SCALE), [values]);

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

        {showHelpers && (
          <>
            <Equator />
            <PolarAxis />
            <VernalEquinoxAxis />
            <AscendingNode values={values} />
          </>
        )}

        <OrbitPath values={values} />
        <Satellite position={satPosition} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
