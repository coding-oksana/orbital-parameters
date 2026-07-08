import { useCallback, useRef, useState } from 'react';
import type { ParamStatus } from '@utils/orbitalLimits';
import { clamp, round } from '@utils/params';
import { StatusChip } from './StatusChip';
import { LimitBadge } from './LimitBadge';

export interface KeplerianSliderProps {
  label: string;
  unit?: string;
  value: number;
  min: number;
  max: number;
  computedMin?: number;
  computedMax?: number;
  step?: number;
  decimals?: number;
  status?: ParamStatus;
  onChange: (value: number) => void;
}

export function KeplerianSlider({
  label,
  unit,
  value,
  min,
  max,
  computedMin,
  computedMax,
  step = 1,
  decimals = 0,
  status,
  onChange,
}: KeplerianSliderProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveMin = computedMin ?? min;
  const effectiveMax = computedMax ?? max;

  const isDisabled = status?.level === 'disabled';
  const belowMin = value < effectiveMin;
  const aboveMax = value > effectiveMax;
  const outOfRange = belowMin || aboveMax;

  const displayValue = draft ?? String(round(value, decimals));

  const commit = useCallback(
    (raw: string) => {
      setDraft(null);
      const parsed = parseFloat(raw);
      if (!Number.isNaN(parsed)) {
        onChange(
          clamp(
            round(parsed, decimals),
            clamp(effectiveMin, min, max),
            clamp(effectiveMax, min, max)
          )
        );
      }
    },
    [decimals, min, max, effectiveMin, effectiveMax, onChange]
  );

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setDraft(null);
    const v = parseFloat(e.target.value);
    onChange(clamp(v, effectiveMin, effectiveMax));
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

  const railRange = max - min;
  const fillStart =
    railRange > 0 ? (clamp(effectiveMin, min, max) - min) / railRange : 0;
  const fillEnd =
    railRange > 0
      ? (clamp(Math.min(value, effectiveMax), min, max) - min) / railRange
      : 0;

  const trackColor = isDisabled
    ? 'bg-slate-200/60 dark:bg-slate-700/40'
    : outOfRange
      ? 'bg-red-300/70 dark:bg-red-700/50'
      : 'bg-blue-400/70 dark:bg-blue-500/60';

  const inputBorderClass =
    outOfRange && !isDisabled
      ? 'border-red-300 dark:border-red-700 focus:border-red-400 bg-red-50/60 dark:bg-red-950/20'
      : 'border-slate-200/60 dark:border-slate-700/50 focus:border-blue-200 dark:focus:border-blue-700 focus:bg-blue-50/60 dark:focus:bg-blue-950/20';

  return (
    <div
      className={`group flex flex-col gap-1.5 ${isDisabled ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-wide text-slate-500 dark:text-slate-400 uppercase select-none">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {computedMin !== undefined && computedMin !== min && (
            <LimitBadge
              label="min"
              value={computedMin}
              decimals={decimals}
              unit={unit}
              violated={belowMin}
            />
          )}
          {computedMax !== undefined && computedMax !== max && (
            <LimitBadge
              label="max"
              value={computedMax}
              decimals={decimals}
              unit={unit}
              violated={aboveMax}
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 h-4 flex items-center">
          <div className="absolute inset-x-0 h-[3px] rounded-full bg-slate-200 dark:bg-slate-700" />

          {computedMax !== undefined && computedMax < max && (
            <div
              className="absolute h-[7px] w-[1.5px] rounded-full bg-slate-400/60 dark:bg-slate-500/60 -translate-x-[0.75px]"
              style={{
                left: `${((clamp(computedMax, min, max) - min) / railRange) * 100}%`,
              }}
              title={`Dynamic max: ${round(computedMax, decimals)}${unit ?? ''}`}
            />
          )}
          {computedMin !== undefined && computedMin > min && (
            <div
              className="absolute h-[7px] w-[1.5px] rounded-full bg-slate-400/60 dark:bg-slate-500/60 -translate-x-[0.75px]"
              style={{
                left: `${((clamp(computedMin, min, max) - min) / railRange) * 100}%`,
              }}
              title={`Dynamic min: ${round(computedMin, decimals)}${unit ?? ''}`}
            />
          )}

          <div
            className={`absolute h-[3px] rounded-full transition-[width,left] duration-75 ${trackColor}`}
            style={{
              left: `${fillStart * 100}%`,
              width: `${Math.max(0, fillEnd - fillStart) * 100}%`,
            }}
          />

          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={isDisabled}
            onChange={handleSliderChange}
            className="
              relative w-full h-4 appearance-none bg-transparent cursor-pointer
              disabled:cursor-not-allowed
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
            aria-valuenow={value}
            aria-valuemin={effectiveMin}
            aria-valuemax={effectiveMax}
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={displayValue}
            disabled={isDisabled}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            aria-label={`${label} value`}
            aria-invalid={outOfRange}
            className={`
              w-16 h-7 px-1.5
              text-right text-[13px] font-mono font-medium
              text-slate-700 dark:text-slate-200
              bg-white dark:bg-slate-800
              border rounded-md
              focus:ring-0 focus:outline-none
              transition-colors duration-150
              placeholder:text-slate-400
              disabled:opacity-50 disabled:cursor-not-allowed
              ${inputBorderClass}
            `}
          />
          {unit && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono w-6 shrink-0">
              {unit}
            </span>
          )}
        </div>
      </div>

      {status && <StatusChip status={status} />}
    </div>
  );
}
