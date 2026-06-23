import type { OrbitalPreset, OrbitRegime } from '@typeProps/orbitParams';
import type { PresetsPanelProps } from '@typeProps/sidebar';

export const PRESETS: OrbitalPreset[] = [
  {
    id: 'iss',
    name: 'ISS',
    subtitle: '408 km · 92.7 min',
    regime: 'LEO',
    elements: { a: 6786, e: 0.0006, i: 51.6, raan: 247, w: 130, nu: 0 },
  },
  {
    id: 'hubble',
    name: 'Hubble',
    subtitle: '547 km · 95.4 min',
    regime: 'LEO',
    elements: { a: 6918, e: 0.0003, i: 28.5, raan: 80, w: 60, nu: 0 },
  },
  {
    id: 'gps',
    name: 'GPS III',
    subtitle: '20 200 km · 717 min',
    regime: 'MEO',
    elements: { a: 26560, e: 0.01, i: 55, raan: 0, w: 0, nu: 0 },
  },
  {
    id: 'molniya',
    name: 'Molniya',
    subtitle: '500–39 700 km · 720 min',
    regime: 'HEO',
    elements: { a: 26560, e: 0.74, i: 63.4, raan: 45, w: 270, nu: 0 },
  },
  {
    id: 'geo',
    name: 'GEO',
    subtitle: '35 786 km · 1436 min',
    regime: 'GEO',
    elements: { a: 42164, e: 0.0001, i: 0, raan: 0, w: 0, nu: 0 },
  },
  {
    id: 'sso',
    name: 'Sun-sync',
    subtitle: '700 km · 98.8 min',
    regime: 'SSO',
    elements: { a: 7078, e: 0.001, i: 98.2, raan: 90, w: 0, nu: 0 },
  },
];

// ── Regime badge styles ───────────────────────────────────────

const REGIME_STYLES: Record<OrbitRegime, { badge: string; dot: string }> = {
  LEO: {
    badge: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
    dot: 'bg-emerald-400',
  },
  MEO: {
    badge: 'text-amber-400  bg-amber-400/10  border-amber-400/25',
    dot: 'bg-amber-400',
  },
  GEO: {
    badge: 'text-violet-400 bg-violet-400/10 border-violet-400/25',
    dot: 'bg-violet-400',
  },
  HEO: {
    badge: 'text-rose-400   bg-rose-400/10   border-rose-400/25',
    dot: 'bg-rose-400',
  },
  SSO: {
    badge: 'text-sky-400    bg-sky-400/10    border-sky-400/25',
    dot: 'bg-sky-400',
  },
};

// ── Sub-component: single preset card ────────────────────────

interface PresetCardProps {
  preset: OrbitalPreset;
  isActive: boolean;
  onClick: (preset: OrbitalPreset) => void;
}

function PresetCard({ preset, isActive, onClick }: PresetCardProps) {
  const { badge, dot } = REGIME_STYLES[preset.regime];

  return (
    <button
      type="button"
      onClick={() => onClick(preset)}
      aria-pressed={isActive}
      className={[
        'relative w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
        'focus-visible:ring-offset-1 focus-visible:ring-offset-[#0d1726]',
        isActive
          ? 'border-sky-500/60 bg-sky-500/10 shadow-[inset_0_1px_0_rgb(56_189_248/0.12)]'
          : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/70',
      ].join(' ')}
    >
      {/* Active indicator dot */}
      {isActive && (
        <span
          className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-sky-400"
          aria-hidden="true"
        />
      )}

      <span
        className={[
          'block text-[12px] font-semibold leading-none mb-1',
          isActive ? 'text-sky-300' : 'text-slate-200',
        ].join(' ')}
      >
        {preset.name}
      </span>

      <span className="block text-[10px] text-slate-500 leading-tight mb-2">
        {preset.subtitle}
      </span>

      {/* Regime badge */}
      <span
        className={[
          'inline-flex items-center gap-1 text-[9px] font-semibold',
          'tracking-widest px-1.5 py-0.5 rounded border',
          badge,
        ].join(' ')}
      >
        <span className={`w-1 h-1 rounded-full ${dot}`} aria-hidden="true" />
        {preset.regime}
      </span>
    </button>
  );
}

// ── PresetsPanel (exported) ───────────────────────────────────

export function PresetsPanel({
  presets,
  activePresetId,
  onSelect,
}: PresetsPanelProps) {
  return (
    <section
      aria-label="Orbit presets"
      className="px-4 py-4 border-b border-slate-700/50"
    >
      <p className="text-[9px] font-semibold tracking-[0.12em] text-slate-600 uppercase mb-3">
        Presets
      </p>

      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isActive={activePresetId === preset.id}
            onClick={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
