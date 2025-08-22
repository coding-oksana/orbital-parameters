import { useAtom } from 'jotai';
import {
  inclinationAtom,
  eccentricityAtom,
  semiMajorAxisAtom,
  raanAtom,
  argPerigeeAtom,
  trueAnomalyAtom,
} from '../atoms/orbitParameters';

export default function OrbitForm() {
  const [inclination, setInclination] = useAtom(inclinationAtom);
  const [eccentricity, setEccentricity] = useAtom(eccentricityAtom);
  const [sma, setSma] = useAtom(semiMajorAxisAtom);
  const [raan, setRaan] = useAtom(raanAtom);
  const [argPerigee, setArgPerigee] = useAtom(argPerigeeAtom);
  const [trueAnomaly, setTrueAnomaly] = useAtom(trueAnomalyAtom);

  return (
    <div className="p-4 bg-gray-100 rounded-xl space-y-2">
      <label>
        Inclination:
        <input
          type="number"
          value={inclination}
          onChange={(e) => setInclination(+e.target.value)}
        />
      </label>
      <label>
        Eccentricity:
        <input
          type="number"
          step="0.01"
          value={eccentricity}
          onChange={(e) => setEccentricity(+e.target.value)}
        />
      </label>
      <label>
        Semi-major Axis (km):
        <input
          type="number"
          value={sma}
          onChange={(e) => setSma(+e.target.value)}
        />
      </label>
      <label>
        RAAN:
        <input
          type="number"
          value={raan}
          onChange={(e) => setRaan(+e.target.value)}
        />
      </label>
      <label>
        Argument of Perigee:
        <input
          type="number"
          value={argPerigee}
          onChange={(e) => setArgPerigee(+e.target.value)}
        />
      </label>
      <label>
        True Anomaly:
        <input
          type="number"
          value={trueAnomaly}
          onChange={(e) => setTrueAnomaly(+e.target.value)}
        />
      </label>
    </div>
  );
}
