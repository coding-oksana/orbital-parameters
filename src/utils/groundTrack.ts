import { MU_EARTH, keplerianToCartesian } from 'orbital-convert';

const EARTH_ROT_DEG_PER_SEC = 360 / 86_164.1; // sidereal rotation rate

export interface GroundPoint {
  lat: number; // degrees, −90 to +90
  lon: number; // degrees, −180 to +180
}

export interface GroundSegment {
  points: GroundPoint[];
}

interface OrbitalInput {
  a: number; // km
  e: number;
  i: number; // deg
  raan: number; // deg
  omega: number; // deg (argument of periapsis)
  nu: number; // deg (initial true anomaly)
}

/** Solve Kepler's equation M = E − e·sin(E) by Newton-Raphson. */
function solveKepler(M: number, e: number): number {
  let E = M;
  for (let k = 0; k < 20; k++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

/** True anomaly from eccentric anomaly. */
function trueFromEccentric(E: number, e: number): number {
  return (
    2 *
    Math.atan2(
      Math.sqrt(1 + e) * Math.sin(E / 2),
      Math.sqrt(1 - e) * Math.cos(E / 2)
    )
  );
}

/**
 * Generate ground track points for `numOrbits` revolutions.
 * `stepsPerOrbit` controls smoothness (128 is fine for display).
 */
export function computeGroundTrack(
  orbit: OrbitalInput,
  numOrbits = 3,
  stepsPerOrbit = 180
): GroundSegment[] {
  const { a, e, nu } = orbit;

  // Orbital period (seconds)
  const T = 2 * Math.PI * Math.sqrt(a ** 3 / MU_EARTH);

  // Initial true anomaly → mean anomaly (for stepping)
  const nu0Rad = (nu * Math.PI) / 180;
  const E0 =
    2 *
    Math.atan2(
      Math.sqrt(1 - e) * Math.sin(nu0Rad / 2),
      Math.sqrt(1 + e) * Math.cos(nu0Rad / 2)
    );
  const M0 = E0 - e * Math.sin(E0);

  const totalSteps = numOrbits * stepsPerOrbit;
  const dt = T / stepsPerOrbit; // seconds per step

  const segments: GroundSegment[] = [];
  let current: GroundPoint[] = [];
  let prevLon: number | null = null;

  for (let step = 0; step <= totalSteps; step++) {
    const t = step * dt;

    // Mean anomaly at time t
    const M = M0 + ((2 * Math.PI) / T) * t;
    const E = solveKepler(M, e);
    const nuRad = trueFromEccentric(E, e);

    // Position in ECI (Earth-Centred Inertial)
    const eci = keplerianToCartesian({ ...orbit, nu: (nuRad * 180) / Math.PI });

    // Latitude (inertial = geographic for this simplified model)
    const lat = (Math.asin(eci.z / eci.r) * 180) / Math.PI;

    // Longitude: ECI longitude − Earth's rotation since t=0
    const lonECI = (Math.atan2(eci.y, eci.x) * 180) / Math.PI;
    let lon = lonECI - EARTH_ROT_DEG_PER_SEC * t;

    // Normalise to −180…+180
    lon = ((((lon + 180) % 360) + 360) % 360) - 180;

    if (prevLon !== null && Math.abs(lon - prevLon) > 180) {
      segments.push({ points: current });
      current = [];
    }

    current.push({ lat, lon });
    prevLon = lon;
  }

  if (current.length > 0) segments.push({ points: current });
  return segments;
}

/** Lat/lon of the satellite at its current true anomaly (t=0). */
export function currentGroundPoint(orbit: OrbitalInput): GroundPoint {
  const segs = computeGroundTrack(orbit, 0, 1);
  return segs[0]?.points[0] ?? { lat: 0, lon: 0 };
}
