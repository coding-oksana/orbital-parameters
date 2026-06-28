import { KeplerianSlider, KeplerianSliderProps } from './Slider';

export type SliderDef = Omit<KeplerianSliderProps, 'onChange'> & {
  id: string;
};

export interface KeplerianSliderGroupProps {
  title: string;
  sliders: readonly SliderDef[];
  onChange: (id: SliderDef['id'], value: number) => void;
}

export function KeplerianSliderGroup({
  title,
  sliders,
  onChange,
}: KeplerianSliderGroupProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Group heading */}
      <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-400/70 uppercase select-none">
        {title}
      </p>

      {/* Sliders */}
      <div className="flex flex-col gap-4">
        {sliders.map(({ id, ...sliderProps }) => (
          <KeplerianSlider
            key={id}
            {...sliderProps}
            onChange={(value: number) => onChange(id, value)}
          />
        ))}
      </div>
    </div>
  );
}
