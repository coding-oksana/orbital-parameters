import { useCallback, useRef, useState } from 'react';

export interface KeplerianSliderProps {
  /** Display label */
  label: string;
  /** Unit shown to the right of the numeric input (e.g. "km", "°", "0-1") */
  unit?: string;
  /** Current value (controlled) */
  value: number;
  /** Inclusive minimum */
  min: number;
  /** Inclusive maximum */
  max: number;
  /** Granularity of the slider and validation snap */
  step?: number;
  /** Decimal places shown in the readout */
  decimals?: number;
  onChange: (value: number) => void;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function round(v: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(v * factor) / factor;
}

export function KeplerianSlider({
  label,
  unit,
  value,
  min,
  max,
  step = 1,
  decimals = 0,
  onChange,
}: KeplerianSliderProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = draft ?? String(round(value, decimals));

  const commit = useCallback(
    (raw: string) => {
      setDraft(null);
      const parsed = parseFloat(raw);
      if (!Number.isNaN(parsed)) {
        onChange(clamp(round(parsed, decimals), min, max));
      }
    },
    [decimals, min, max, onChange]
  );

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setDraft(null);
    onChange(parseFloat(e.target.value));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setDraft(e.target.value);
  }

  function handleInputBlur(e: React.FocusEvent<HTMLInputElement>): void {
    commit(e.target.value);
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      commit((e.target as HTMLInputElement).value);
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setDraft(null);
      inputRef.current?.blur();
    }
  }

  const fraction = (value - min) / (max - min);

  return (
    <div className="group flex flex-col gap-1.5">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-wide text-slate-500 uppercase select-none">
          {label}
        </span>
      </div>

      {/* Slider + numeric input */}
      <div className="flex items-center gap-3">
        {/* Slider track wrapper */}
        <div className="relative flex-1 h-4 flex items-center">
          {/* Background track */}
          <div className="absolute inset-x-0 h-[3px] rounded-full bg-slate-200" />
          {/* Filled portion */}
          <div
            className="absolute left-0 h-[3px] rounded-full bg-blue-400/70 transition-[width] duration-75"
            style={{ width: `${fraction * 100}%` }}
          />
          {/* Native range input */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            className="
              relative w-full h-4 appearance-none bg-transparent cursor-pointer
              focus:outline-none
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3.5
              [&::-webkit-slider-thumb]:h-3.5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:border
              [&::-webkit-slider-thumb]:border-slate-300
              [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgb(96_165_250/0.35),0_1px_3px_rgba(0,0,0,0.15)]
              [&::-webkit-slider-thumb]:transition-shadow
              [&::-webkit-slider-thumb]:duration-150
              hover:[&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgb(96_165_250/0.5),0_1px_3px_rgba(0,0,0,0.15)]
              focus:[&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgb(96_165_250/0.65),0_1px_3px_rgba(0,0,0,0.15)]
              [&::-moz-range-thumb]:w-3.5
              [&::-moz-range-thumb]:h-3.5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:shadow-[0_0_0_2px_rgb(96_165_250/0.35),0_1px_3px_rgba(0,0,0,0.15)]
            "
            aria-label={label}
          />
        </div>

        {/* Numeric input + unit badge */}
        <div className="flex items-center gap-1 shrink-0">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            aria-label={`${label} value`}
            className="
              w-16 h-7 px-1.5
              text-right text-[13px] font-mono font-medium
              text-slate-700
              bg-white border border-slate-200/60
              rounded-md
              focus:ring-0
              focus:outline-none focus:border-blue-200 focus:bg-blue-50/60
              transition-colors duration-150
              placeholder:text-slate-400
            "
          />
          {unit && (
            <span className="text-[11px] text-slate-400 font-mono w-6 shrink-0">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
