import { Line } from '@react-three/drei';
import { keplerianToCartesian } from '../orbitalMath';

interface OrbitPathProps {
  a: number;
  e: number;
  i: number;
  Ω: number;
  ω: number;
}

export default function OrbitPath({ a, e, i, Ω, ω }: OrbitPathProps) {
  const points: [number, number, number][] = [];

  for (let theta = 0; theta <= 2 * Math.PI; theta += 0.02) {
    points.push(keplerianToCartesian(a, e, i, Ω, ω, theta));
  }

  return <Line points={points} color="orange" lineWidth={1} dashed={false} />;
}
