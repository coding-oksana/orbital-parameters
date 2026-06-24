import { useCallback, useState } from 'react';

import { PresetsPanel } from '@components/PresetsPanel';
import type { OrbitalPreset } from '@typeProps/orbitParams';
import { PRESETS } from '../../constants';

function App() {
  const [activePresetId, setActivePresetId] = useState<string | null>('iss');

  const handlePresetSelect = useCallback(
    (preset: OrbitalPreset) => {
      setActivePresetId(preset.id);
    },
    [setActivePresetId]
  );

  return (
    <div>
      <h1 className="pt-5 text-xl font-bold text-center">
        Dynamic Orbit Visualizer
      </h1>

      <PresetsPanel
        presets={PRESETS}
        activePresetId={activePresetId}
        onSelect={handlePresetSelect}
      />
    </div>
  );
}

export default App;
