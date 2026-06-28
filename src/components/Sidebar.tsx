import { useCallback, useState } from 'react';

import { PresetsPanel } from '@components/PresetsPanel';
import type { OrbitalPreset } from '@typeProps/orbitParams';
import { PRESETS } from '../constants';
import { KeplerianSliderGroup, type SliderDef } from './KeplerianSliderGroup';

interface KeplerianElements {
  sma: number;
  ecc: number;
  inc: number;
  raan: number;
  aop: number;
  ta: number;
}

type ElementId = keyof KeplerianElements;

const SHAPE_SLIDERS: readonly SliderDef[] = [
  {
    id: 'sma',
    label: 'Semi-major axis',
    unit: 'km',
    value: 0,
    min: 6371,
    max: 42164,
    step: 1,
    decimals: 0,
  },
  {
    id: 'ecc',
    label: 'Eccentricity',
    unit: '0-1',
    value: 0,
    min: 0,
    max: 0.999,
    step: 0.001,
    decimals: 3,
  },
] satisfies readonly SliderDef[];

const ORIENTATION_SLIDERS: readonly SliderDef[] = [
  {
    id: 'inc',
    label: 'Inclination',
    unit: '°',
    value: 0,
    min: 0,
    max: 180,
    step: 0.1,
    decimals: 1,
  },
  {
    id: 'raan',
    label: 'RAAN',
    unit: '°',
    value: 0,
    min: 0,
    max: 360,
    step: 1,
    decimals: 0,
  },
  {
    id: 'aop',
    label: 'Arg. of perigee',
    unit: '°',
    value: 0,
    min: 0,
    max: 360,
    step: 1,
    decimals: 0,
  },
] satisfies readonly SliderDef[];

const POSITION_SLIDERS: readonly SliderDef[] = [
  {
    id: 'ta',
    label: 'True anomaly',
    unit: '°',
    value: 0,
    min: 0,
    max: 360,
    step: 1,
    decimals: 0,
  },
] satisfies readonly SliderDef[];

function withValue(
  defs: readonly SliderDef[],
  elements: KeplerianElements
): SliderDef[] {
  return defs.map((def) => ({ ...def, value: elements[def.id as ElementId] }));
}

export function Sidebar() {
  const [activePresetId, setActivePresetId] = useState<string | null>('iss');
  const [elements, setElements] = useState<KeplerianElements>({
    sma: 6786,
    ecc: 0.002,
    inc: 51.6,
    raan: 247,
    aop: 130,
    ta: 180,
  });

  const handlePresetSelect = useCallback((preset: OrbitalPreset) => {
    setActivePresetId(preset.id);
  }, []);

  const handleElementChange = useCallback((id: string, value: number) => {
    setElements((prev) => ({ ...prev, [id as ElementId]: value }));
  }, []);

  return (
    <div className="w-sm">
      <PresetsPanel
        presets={PRESETS}
        activePresetId={activePresetId}
        onSelect={handlePresetSelect}
      />

      <div className="space-y-6 divide-y divide-slate-200/60 p-4">
        <KeplerianSliderGroup
          title="Shape"
          sliders={withValue(SHAPE_SLIDERS, elements)}
          onChange={handleElementChange}
        />
        <KeplerianSliderGroup
          title="Orientation"
          sliders={withValue(ORIENTATION_SLIDERS, elements)}
          onChange={handleElementChange}
        />

        <KeplerianSliderGroup
          title="Position"
          sliders={withValue(POSITION_SLIDERS, elements)}
          onChange={handleElementChange}
        />
      </div>
    </div>
  );
}
