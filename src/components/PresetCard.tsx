import { REGIME_STYLES } from '@constants/styles';
import { OrbitalPreset, OrbitRegime } from '@typeProps/orbitParams';

interface PresetCardProps {
  preset: OrbitalPreset;
  isActive: boolean;
  onClick: (preset: OrbitalPreset) => void;
}

function getRegimeStyle(regime: OrbitRegime): { badge: string; dot: string } {
  return REGIME_STYLES[regime];
}

export function PresetCard({ preset, isActive, onClick }: PresetCardProps) {
  const { badge, dot } = getRegimeStyle(preset.regime);

  function handleClick(): void {
    onClick(preset);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isActive}
      className={[
        'relative cursor-pointer w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
        'focus-visible:ring-offset-1 focus-visible:ring-offset-[#0d1726]',
        isActive
          ? 'border-sky-500/60 bg-sky-500/10 shadow-[inset_0_1px_0_rgb(56_189_248/0.12)]'
          : 'border-slate-200/60 bg-white hover:border-blue-200 hover:bg-blue-50/60',
      ].join(' ')}
    >
      {isActive && (
        <span
          className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-sky-400"
          aria-hidden="true"
        />
      )}

      <span
        className={[
          'block text-[14px] font-semibold leading-none mb-1',
          isActive ? 'text-sky-600' : 'text-slate-700',
        ].join(' ')}
      >
        {preset.name}
      </span>

      <span className="block text-[12px] text-slate-400 leading-tight mb-2">
        {preset.subtitle}
      </span>

      <span
        className={[
          'inline-flex items-center gap-1 text-[10px] font-semibold',
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
