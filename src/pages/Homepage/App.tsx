import { useControls } from 'leva';
import OrbitCanvas from '../../components/OrbitCanvas';

function App() {
  const { a, e, i, Ω, ω } = useControls({
    a: { value: 5, min: 1, max: 10, step: 0.1 },
    e: { value: 0.4, min: 0, max: 0.99, step: 0.01 },
    i: { value: 0.5, min: 0, max: Math.PI, step: 0.01 },
    Ω: { value: 0.3, min: 0, max: 2 * Math.PI, step: 0.01 },
    ω: { value: 1.1, min: 0, max: 2 * Math.PI, step: 0.01 },
  });
  return (
    <div>
      {/* <h1 className="pt-5 text-xl font-bold text-center">
        Satellite Orbit Visualizer
      </h1>
      <Orbit2D /> */}
      <OrbitCanvas a={a} e={e} i={i} Ω={Ω} ω={ω} />;
    </div>
  );
}

export default App;
