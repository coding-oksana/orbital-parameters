import { SliderGroup } from './SliderGroup';
import { deriveOrbital } from '@utils/orbitalLimits';
import { OrbitalValues } from '@typeProps/orbitParams';

export interface OrbitalControlsProps {
  values: OrbitalValues;
  onChange: (id: string, value: number) => void;
}

export function OrbitalControls({
  values,
  onChange: handleChange,
}: OrbitalControlsProps) {
  const derived = deriveOrbital(values);

  return (
    <div className="flex flex-col gap-6 p-4 max-w-sm">
      <SliderGroup
        title="Shape & size"
        orbitalValues={values}
        onChange={handleChange}
        sliders={[
          {
            id: 'a',
            label: 'Semi-major axis',
            unit: 'km',
            value: values.a,
            min: 6_500,
            max: 100_000,
            step: 50,
            decimals: 0,
          },
          {
            id: 'e',
            label: 'Eccentricity',
            value: values.e,
            min: 0,
            max: 0.99,
            step: 0.001,
            decimals: 3,
          },
        ]}
      />

      <SliderGroup
        title="Orientation"
        orbitalValues={values}
        onChange={handleChange}
        sliders={[
          {
            id: 'i',
            label: 'Inclination',
            unit: '°',
            value: values.i,
            min: 0,
            max: 180,
            step: 0.1,
            decimals: 1,
          },
          {
            id: 'raan',
            label: 'RAAN  Ω',
            unit: '°',
            value: values.raan,
            min: 0,
            max: 360,
            step: 0.1,
            decimals: 1,
          },
          {
            id: 'omega',
            label: 'Arg. of periapsis  ω',
            unit: '°',
            value: values.omega,
            min: 0,
            max: 360,
            step: 0.1,
            decimals: 1,
          },
        ]}
      />

      <SliderGroup
        title="Position"
        orbitalValues={values}
        onChange={handleChange}
        sliders={[
          {
            id: 'nu',
            label: 'True anomaly  ν',
            unit: '°',
            value: values.nu,
            min: 0,
            max: 359.99,
            step: 0.1,
            decimals: 1,
          },
        ]}
      />

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
        {[
          ['Periapsis', `${Math.round(derived.rPeriapsis)} km`],
          [
            'Apoapsis',
            derived.rApoapsis != null
              ? `${Math.round(derived.rApoapsis)} km`
              : '∞',
          ],
          [
            'Period',
            derived.periodMin != null
              ? `${derived.periodMin.toFixed(1)} min`
              : '—',
          ],
          [
            'v periapsis',
            derived.vPeriapsis != null
              ? `${derived.vPeriapsis.toFixed(2)} km/s`
              : '—',
          ],
          [
            'v apoapsis',
            derived.vApoapsis != null
              ? `${derived.vApoapsis.toFixed(2)} km/s`
              : '—',
          ],
          ['Orbit type', derived.orbitType],
        ].map(([lbl, val]) => (
          <div key={lbl} className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">
              {lbl}
            </span>
            <span className="text-[13px] font-mono font-medium text-slate-700">
              {val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
