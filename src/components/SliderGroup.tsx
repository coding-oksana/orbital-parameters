import { KeplerianSlider, KeplerianSliderProps } from './Slider';
import { computeAllLimits } from '@utils/orbitalLimits';
import type { OrbitalValues, ParamLimits } from '@typeProps/orbitParams';
import { PARAM_TOOLTIPS } from '@utils/paramTooltips';

export type SliderDef = Omit<
  KeplerianSliderProps,
  'onChange' | 'computedMin' | 'computedMax' | 'status' | 'tooltip'
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
  const limits: Partial<Record<string, ParamLimits>> = orbitalValues
    ? computeAllLimits(orbitalValues)
    : {};

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-400/70 uppercase select-none">
        {title}
      </p>

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
              tooltip={PARAM_TOOLTIPS[id]}
              onChange={(value: number) => onChange(id, value)}
            />
          );
        })}
      </div>
    </div>
  );
}
