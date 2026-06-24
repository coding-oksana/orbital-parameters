import type {
  KeplerianElements,
  OrbitalPreset,
  DerivedOrbitalStats,
} from './orbitParams';

// ── PresetsPanel ──────────────────────────────────────────────

export interface PresetsPanelProps {
  presets: OrbitalPreset[];
  activePresetId: string | null;
  onSelect: (preset: OrbitalPreset) => void;
}

// ── ParameterSlider ───────────────────────────────────────────

/** Static metadata describing one Keplerian parameter field. */
export interface ParameterFieldDef {
  /** Maps to a key of KeplerianElements */
  id: keyof KeplerianElements;
  label: string;
  /** Symbol rendered in italic next to the label (e.g. "a", "Ω") */
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  /** How the raw number is displayed in the value badge */
  format: (v: number) => string;
  /** Tooltip / aria description */
  description: string;
}

export interface ParameterSliderProps {
  field: ParameterFieldDef;
  value: number;
  /** Called with the field id and the new value */
  onChange: (id: keyof KeplerianElements, value: number) => void;
}

// ── OrbitalSidebar ────────────────────────────────────────────

export interface OrbitalSidebarProps {
  elements: KeplerianElements;
  onChange: (elements: KeplerianElements) => void;
  stats?: DerivedOrbitalStats;
  isAnimating?: boolean;
  onAnimationToggle?: () => void;
}
