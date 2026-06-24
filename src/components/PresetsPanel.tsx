import type { PresetsPanelProps } from '@typeProps/sidebar';
import { PresetCard } from './PresetCard';

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
