import { KeplerianSlider, KeplerianSliderProps } from './Slider';
import { computeAllLimits, ParamLimits } from '../utils/orbitalLimits';
import { OrbitalValues } from '@typeProps/orbitParams';

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
  const limits: Partial<Record<string, ParamLimits>> = orbitalValues
    ? computeAllLimits(orbitalValues)
    : {};

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] font-semibold tracking-[0.15em] text-slate-700 uppercase select-none">
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
              onChange={(value: number) => onChange(id, value)}
            />
          );
        })}
      </div>
    </div>
  );
}
