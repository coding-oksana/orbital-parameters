import OrbitForm from '../../components/OrbitForm';
import Orbit3D from '../../components/Orbit3D';

function App() {
  return (
    <div>
      <h1 className="pt-5 text-xl font-bold text-center">
        Dynamic Orbit Visualizer
      </h1>
      <div className="w-1/3 p-4 overflow-y-auto">
        <OrbitForm />
      </div>
      <div className="flex-1">
        <Orbit3D />
      </div>
    </div>
  );
}

export default App;
