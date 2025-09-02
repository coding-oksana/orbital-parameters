import { useAtom } from 'jotai';
import {
  inclinationAtom,
  eccentricityAtom,
  semiMajorAxisAtom,
  raanAtom,
  argPerigeeAtom,
  trueAnomalyAtom,
} from '../atoms/orbitParameters';

type NumberInputProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  step?: string;
};

function NumberInput({ label, value, onChange, step }: NumberInputProps) {
  return (
    <label className="flex flex-col space-y-1">
      {label}
      <input
        type="number"
        step={step}
        value={value !== null ? value : ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === '' ? null : Number(val));
        }}
        className="border rounded px-2 py-1"
      />
    </label>
  );
}

export default function OrbitForm() {
  const [inclination, setInclination] = useAtom(inclinationAtom);
  const [eccentricity, setEccentricity] = useAtom(eccentricityAtom);
  const [sma, setSma] = useAtom(semiMajorAxisAtom);
  const [raan, setRaan] = useAtom(raanAtom);
  const [argPerigee, setArgPerigee] = useAtom(argPerigeeAtom);
  const [trueAnomaly, setTrueAnomaly] = useAtom(trueAnomalyAtom);

  return (
    <div className="p-4 bg-gray-100 rounded-xl space-y-2">
      <NumberInput
        label="Inclination"
        value={inclination}
        onChange={(val) => setInclination(val ?? 0)}
      />
      <NumberInput
        label="Eccentricity"
        value={eccentricity}
        onChange={(val) => setEccentricity(val ?? 0)}
        step="0.01"
      />
      <NumberInput
        label="Semi-major Axis (km)"
        value={sma}
        onChange={(val) => setSma(val ?? 0)}
      />
      <NumberInput
        label="RAAN"
        value={raan}
        onChange={(val) => setRaan(val ?? 0)}
      />
      <NumberInput
        label="Argument of Perigee"
        value={argPerigee}
        onChange={(val) => setArgPerigee(val ?? 0)}
      />
      <NumberInput
        label="True Anomaly"
        value={trueAnomaly}
        onChange={(val) => setTrueAnomaly(val ?? 0)}
      />
    </div>
  );
}
