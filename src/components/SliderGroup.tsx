import { KeplerianSlider, KeplerianSliderProps } from './Slider';
import {
  computeAllLimits,
  OrbitalValues,
  ParamLimits,
} from '../utils/orbitalLimits';

export type SliderDef = Omit<
  KeplerianSliderProps,
  'onChange' | 'computedMin' | 'computedMax' | 'status'
> & {
  id: string;
};

export interface SliderGroupProps {
  title: string;
  sliders: readonly SliderDef[];
  onChange: (id: SliderDef['id'], value: number) => void;
  orbitalValues?: OrbitalValues;
}

export function SliderGroup({
  title,
  sliders,
  onChange,
  orbitalValues,
}: SliderGroupProps) {
  // Compute all cross-parameter limits in one pass.
  const limits: Partial<Record<string, ParamLimits>> = orbitalValues
    ? computeAllLimits(orbitalValues)
    : {};

  return (
    <div className="flex flex-col gap-3">
      {/* Group heading */}
      <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-400/70 uppercase select-none">
        {title}
      </p>

      {/* Sliders */}
      <div className="flex flex-col gap-4">
        {sliders.map(({ id, ...sliderProps }) => {
          const computed = limits[id];
          return (
            <KeplerianSlider
              key={id}
              {...sliderProps}
              computedMin={computed?.min}
              computedMax={computed?.max}
              status={computed?.status}
              onChange={(value: number) => onChange(id, value)}
            />
          );
        })}
      </div>
    </div>
  );
}
