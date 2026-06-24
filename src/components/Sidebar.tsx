import { useCallback, useState } from 'react';

import { PresetsPanel } from '@components/PresetsPanel';
import type { OrbitalPreset } from '@typeProps/orbitParams';
import { PRESETS } from '../constants';
import { KeplerianSlider } from './Slider';

export function Sidebar() {
  const [activePresetId, setActivePresetId] = useState<string | null>('iss');
  const [argOfPerigee, setArgOfPerigee] = useState(130);

  const handlePresetSelect = useCallback(
    (preset: OrbitalPreset) => {
      setActivePresetId(preset.id);
    },
    [setActivePresetId]
  );

  return (
    <div className="w-sm">
      <PresetsPanel
        presets={PRESETS}
        activePresetId={activePresetId}
        onSelect={handlePresetSelect}
      />
      <KeplerianSlider
        label="Arg. of perigee"
        unit="°"
        value={argOfPerigee}
        min={0}
        max={360}
        step={1}
        decimals={0}
        onChange={setArgOfPerigee}
      />
    </div>
  );
}
