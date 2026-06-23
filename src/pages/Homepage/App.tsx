import { PresetsPanel, PRESETS } from '@components/PresetsPanel';

function App() {

  return (
    <div>
      <h1 className="pt-5 text-xl font-bold text-center">
        Dynamic Orbit Visualizer
        <PresetsPanel
          presets={PRESETS}
          activePresetId="iss"
          onSelect={() => {}}
        />
      </h1>
    </div>
  );
}

export default App;
