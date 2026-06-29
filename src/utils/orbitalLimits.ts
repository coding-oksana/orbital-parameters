export const EARTH_R_KM = 6_371; // mean radius
export const ATMO_KM = 100; // Kármán line
export const MIN_ORBIT_R = EARTH_R_KM + ATMO_KM; // 6 471 km
export const HILL_KM = 924_600; // Earth Hill sphere (~60 % stability limit)
export const MU_KM3_S2 = 398_600.4418; // GM Earth (km³/s²)

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export type StatusLevel = 'ok' | 'warn' | 'error' | 'disabled';

export interface ParamStatus {
  /** Chip message shown beneath the slider. Empty string = no chip. */
  message: string;
  level: StatusLevel;
}

export interface ParamLimits {
  min: number;
  max: number;
  status: ParamStatus;
}

export interface OrbitalValues {
  a: number; // km
  e: number; // 0–∞ (< 1 bound, ≥ 1 open)
  i: number; // deg, 0–180
  raan: number; // deg, 0–360
  omega: number; // deg, 0–360
  nu: number; // deg, 0–360
}

// ─── semi-major axis ─────────────────────────────────────────────────────────

export function limitsA(e: number): ParamLimits {
  // periapsis must clear atmosphere: a(1−e) > R+atmo  →  a > (R+atmo)/(1−e)
  const eBound = clamp(e, 0, 0.9999);
  const min = e < 1 ? Math.ceil(MIN_ORBIT_R / (1 - eBound)) : MIN_ORBIT_R;
  // apoapsis must stay inside Hill sphere: a(1+e) < Hill  →  a < Hill/(1+e)
  const max = e < 1 ? Math.floor(HILL_KM / (1 + e)) : HILL_KM * 10; // open orbit

  const status: ParamStatus =
    e >= 1
      ? { message: 'Open orbit — a is a scale parameter only', level: 'warn' }
      : { message: '', level: 'ok' };

  return { min, max, status };
}

// ─── eccentricity ─────────────────────────────────────────────────────────────

export function limitsE(a: number, allowOpen = false): ParamLimits {
  // periapsis must not enter atmosphere: e < 1 − (R+atmo)/a
  const eMaxAtmo = Math.max(0, 1 - MIN_ORBIT_R / a);
  const max = allowOpen ? 5 : Math.min(eMaxAtmo, 0.9999);

  let status: ParamStatus;
  if (eMaxAtmo < 0.001) {
    status = {
      message: 'Orbit too low — raise a before increasing e',
      level: 'warn',
    };
  } else {
    status = { message: '', level: 'ok' };
  }

  return { min: 0, max, status };
}

// ─── inclination ─────────────────────────────────────────────────────────────

export function limitsI(): ParamLimits {
  // Always 0–180°, unconditionally.
  return { min: 0, max: 180, status: { message: '', level: 'ok' } };
}

// ─── RAAN ────────────────────────────────────────────────────────────────────

export function limitsRaan(i: number): ParamLimits {
  const isEquatorial = i < 0.5 || i > 179.5;
  return {
    min: 0,
    max: 359.99,
    status: isEquatorial
      ? {
          message:
            'Ω is undefined for equatorial orbits (i ≈ 0° or 180°). Use ϖ = Ω + ω instead.',
          level: 'disabled',
        }
      : { message: '', level: 'ok' },
  };
}

// ─── argument of periapsis ───────────────────────────────────────────────────

export function limitsOmega(e: number): ParamLimits {
  const isCircular = e < 0.001;
  return {
    min: 0,
    max: 359.99,
    status: isCircular
      ? {
          message:
            'ω is undefined for circular orbits (e ≈ 0). Use argument of latitude u = ω + ν instead.',
          level: 'disabled',
        }
      : { message: '', level: 'ok' },
  };
}

// ─── true anomaly ────────────────────────────────────────────────────────────

export function limitsNu(e: number): ParamLimits {
  if (e < 1) {
    return { min: 0, max: 359.99, status: { message: '', level: 'ok' } };
  }
  // Hyperbola: object escapes before completing a revolution.
  // Maximum |ν| = arccos(−1/e)
  const nuMaxDeg = (Math.acos(-1 / e) * 180) / Math.PI;
  return {
    min: -nuMaxDeg,
    max: nuMaxDeg,
    status: {
      message: `Hyperbolic orbit — ν is bounded to ±${nuMaxDeg.toFixed(1)}° (asymptote angle)`,
      level: 'warn',
    },
  };
}

// ─── derived quantities (read-only, useful for display) ──────────────────────

export interface DerivedOrbital {
  rPeriapsis: number | null; // km
  rApoapsis: number | null; // km (null for open orbits)
  periodMin: number | null; // minutes (null for open orbits)
  vPeriapsis: number | null; // km/s
  vApoapsis: number | null; // km/s (null for open orbits)
  orbitType: 'circular' | 'ellipse' | 'parabola' | 'hyperbola';
}

export function deriveOrbital({
  a,
  e,
}: Pick<OrbitalValues, 'a' | 'e'>): DerivedOrbital {
  const orbitType =
    e < 0.001
      ? 'circular'
      : e < 1
        ? 'ellipse'
        : e === 1
          ? 'parabola'
          : 'hyperbola';

  const rP = a * (1 - e);
  const rA = e < 1 ? a * (1 + e) : null;
  const T = e < 1 ? (2 * Math.PI * Math.sqrt(a ** 3 / MU_KM3_S2)) / 60 : null;

  // vis-viva: v = sqrt(mu*(2/r - 1/a))
  const vP = rP > 0 ? Math.sqrt(MU_KM3_S2 * (2 / rP - 1 / a)) : null;
  const vA =
    rA != null && rA > 0 ? Math.sqrt(MU_KM3_S2 * (2 / rA - 1 / a)) : null;

  return {
    rPeriapsis: rP,
    rApoapsis: rA,
    periodMin: T,
    vPeriapsis: vP,
    vApoapsis: vA,
    orbitType,
  };
}

// ─── all limits at once ───────────────────────────────────────────────────────

export function computeAllLimits(
  v: OrbitalValues
): Record<keyof OrbitalValues, ParamLimits> {
  return {
    a: limitsA(v.e),
    e: limitsE(v.a),
    i: limitsI(),
    raan: limitsRaan(v.i),
    omega: limitsOmega(v.e),
    nu: limitsNu(v.e),
  };
}
