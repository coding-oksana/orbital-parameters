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
  // Local draft for the text input so the user can freely edit before committing
  const [draft, setDraft] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = draft ?? String(round(value, decimals));

  // Commit whatever is in the draft back to the controlled value
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

  // Fraction 0–1 for the custom thumb-track fill
  const fraction = (value - min) / (max - min);

  return (
    <div className="group flex flex-col gap-1.5">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-wide text-slate-400 uppercase select-none">
          {label}
        </span>
      </div>

      {/* Slider + numeric input */}
      <div className="flex items-center gap-3">
        {/* Slider track wrapper */}
        <div className="relative flex-1 h-4 flex items-center">
          {/* Background track */}
          <div className="absolute inset-x-0 h-[3px] rounded-full bg-slate-700/80" />
          {/* Filled portion */}
          <div
            className="absolute left-0 h-[3px] rounded-full bg-sky-500/70 transition-[width] duration-75"
            style={{ width: `${fraction * 100}%` }}
          />
          {/* Native range input — transparent, sits on top */}
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
              [&::-webkit-slider-thumb]:border-slate-300/30
              [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgb(14_165_233/0.35),0_1px_3px_rgba(0,0,0,0.5)]
              [&::-webkit-slider-thumb]:transition-shadow
              [&::-webkit-slider-thumb]:duration-150
              hover:[&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgb(14_165_233/0.5),0_1px_3px_rgba(0,0,0,0.5)]
              focus:[&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgb(14_165_233/0.65),0_1px_3px_rgba(0,0,0,0.5)]
              [&::-moz-range-thumb]:w-3.5
              [&::-moz-range-thumb]:h-3.5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:shadow-[0_0_0_2px_rgb(14_165_233/0.35),0_1px_3px_rgba(0,0,0,0.5)]
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
              text-slate-100
              bg-slate-800/70 border border-slate-700/60
              rounded-md
              focus:outline-none focus:border-sky-500/60 focus:bg-slate-800
              focus:ring-1 focus:ring-sky-500/30
              transition-colors duration-150
              placeholder:text-slate-500
            "
          />
          {unit && (
            <span className="text-[11px] text-slate-500 font-mono w-6 shrink-0">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Demo / usage example (can be removed in production) ─────────────────────

export default function KeplerianSliderDemo() {
  const [semiMajorAxis, setSemiMajorAxis] = useState(6786);
  const [eccentricity, setEccentricity] = useState(0.002);
  const [inclination, setInclination] = useState(51.6);
  const [raan, setRaan] = useState(247);
  const [argOfPerigee, setArgOfPerigee] = useState(130);
  const [trueAnomaly, setTrueAnomaly] = useState(180);

  return (
    <div className="min-h-screen bg-[#0d1726] flex items-center justify-center p-8">
      <div className="w-72 bg-[#111d2e] border border-slate-700/50 rounded-xl p-5 shadow-2xl space-y-6">
        {/* SHAPE */}
        <section>
          <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-500 uppercase mb-3">
            Shape
          </p>
          <div className="space-y-4">
            <KeplerianSlider
              label="Semi-major axis"
              unit="km"
              value={semiMajorAxis}
              min={6371}
              max={42164}
              step={1}
              decimals={0}
              onChange={setSemiMajorAxis}
            />
            <KeplerianSlider
              label="Eccentricity"
              unit="0-1"
              value={eccentricity}
              min={0}
              max={0.999}
              step={0.001}
              decimals={3}
              onChange={setEccentricity}
            />
          </div>
        </section>

        <div className="h-px bg-slate-700/40" />

        {/* ORIENTATION */}
        <section>
          <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-500 uppercase mb-3">
            Orientation
          </p>
          <div className="space-y-4">
            <KeplerianSlider
              label="Inclination"
              unit="°"
              value={inclination}
              min={0}
              max={180}
              step={0.1}
              decimals={1}
              onChange={setInclination}
            />
            <KeplerianSlider
              label="RAAN"
              unit="°"
              value={raan}
              min={0}
              max={360}
              step={1}
              decimals={0}
              onChange={setRaan}
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
        </section>

        <div className="h-px bg-slate-700/40" />

        {/* POSITION */}
        <section>
          <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-500 uppercase mb-3">
            Position
          </p>
          <div className="space-y-4">
            <KeplerianSlider
              label="True anomaly"
              unit="°"
              value={trueAnomaly}
              min={0}
              max={360}
              step={1}
              decimals={0}
              onChange={setTrueAnomaly}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
