import { useCallback, useState } from 'react';

import { PresetsPanel } from '@components/PresetsPanel';
import type {
  OrbitalPreset,
  KeplerianElements,
  OrbitalValues,
} from '@typeProps/orbitParams';
import { PRESETS } from '@constants/orbits';
import { OrbitalControls } from './OrbitalControls';
import { OrbitScene } from './OrbitScene';

function elementsToOrbitalValues(elements: KeplerianElements): OrbitalValues {
  return {
    a: elements.a,
    e: elements.e,
    i: elements.i,
    raan: elements.raan,
    omega: elements.w,
    nu: elements.nu,
  };
}

const INITIAL_VALUES: OrbitalValues = elementsToOrbitalValues(
  PRESETS.find((p) => p.id === 'iss')?.elements ?? {
    a: 12_000,
    e: 0.2,
    i: 28.5,
    raan: 120,
    w: 45,
    nu: 0,
  }
);

export function Sidebar() {
  const [activePresetId, setActivePresetId] = useState<string | null>('iss');
  const [values, setValues] = useState<OrbitalValues>(INITIAL_VALUES);

  const handlePresetSelect = useCallback((preset: OrbitalPreset) => {
    setValues(elementsToOrbitalValues(preset.elements));
    setActivePresetId(preset.id);
  }, []);

  const handleValueChange = useCallback((id: string, value: number) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    setActivePresetId(null);
  }, []);

  return (
    <div>
      <div className="w-sm">
        <PresetsPanel
          presets={PRESETS}
          activePresetId={activePresetId}
          onSelect={handlePresetSelect}
        />
        <OrbitalControls values={values} onChange={handleValueChange} />
      </div>
      <OrbitScene values={values} />
    </div>
  );
}
