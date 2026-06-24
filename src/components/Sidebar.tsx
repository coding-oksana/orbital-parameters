import { useCallback, useState } from 'react';

import { PresetsPanel } from '@components/PresetsPanel';
import type { OrbitalPreset } from '@typeProps/orbitParams';
import { PRESETS } from '../constants';

export function Sidebar() {
  const [activePresetId, setActivePresetId] = useState<string | null>('iss');

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
    </div>
  );
}
