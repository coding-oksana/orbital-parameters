import type {
  KeplerianElements,
  OrbitalPreset,
  DerivedOrbitalStats,
} from './orbitParams';

export interface PresetsPanelProps {
  presets: OrbitalPreset[];
  activePresetId: string | null;
  onSelect: (preset: OrbitalPreset) => void;
}

export interface ParameterFieldDef {
  id: keyof KeplerianElements;
  label: string;
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  description: string;
}

export interface ParameterSliderProps {
  field: ParameterFieldDef;
  value: number;
  onChange: (id: keyof KeplerianElements, value: number) => void;
}

export interface OrbitalSidebarProps {
  elements: KeplerianElements;
  onChange: (elements: KeplerianElements) => void;
  stats?: DerivedOrbitalStats;
  isAnimating?: boolean;
  onAnimationToggle?: () => void;
}
