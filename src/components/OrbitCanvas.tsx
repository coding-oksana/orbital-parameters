import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Stats,
  Stars,
} from '@react-three/drei';
import OrbitPath from './OrbitPath';

interface OrbitCanvasProps {
  a: number;
  e: number;
  i: number;
  Ω: number;
  ω: number;
}

export default function OrbitCanvas(props: OrbitCanvasProps) {
  return (
    <Canvas style={{ width: '100%', height: '100vh' }}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 64, 64]} />
        <meshStandardMaterial
          color="yellow"
          emissive="orange"
          emissiveIntensity={1.5}
        />
      </mesh>

      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />
      <Stars radius={100} depth={50} count={2000} />
      <OrbitPath {...props} />
      <Stats />
    </Canvas>
  );
}
