import {
  OrbitalValues,
  ParamLimits,
  ParamStatus,
} from '@typeProps/orbitParams';
import { EARTH_R_KM, MU_KM3_S2, A_MIN_KM, A_MAX_KM } from '@constants/orbits';

// ─── semi-major axis ─────────────────────────────────────────────────────────

export function limitsA(): ParamLimits {
  // Fixed practical range — no cross-parameter coupling needed.
  // The slider def already enforces a_min; physics validity is on the user.
  return {
    min: A_MIN_KM,
    max: A_MAX_KM,
    status: { message: '', level: 'ok' },
  };
}

// ─── eccentricity ─────────────────────────────────────────────────────────────

export function limitsE(a: number): ParamLimits {
  // Hard physics: periapsis must stay above Earth's surface.
  // e_max = 1 − R_Earth / a
  const eMax = Math.max(0, 1 - EARTH_R_KM / a);

  // Clamp to 0.99 so the slider stays in the bound-orbit regime by default.
  // If you want to support hyperbolic orbits, raise this to e.g. 5.
  const max = Math.min(eMax, 0.99);

  const status: ParamStatus =
    eMax < 0.01
      ? {
          message: 'a is too low to allow any eccentricity — raise a first',
          level: 'warn',
        }
      : { message: '', level: 'ok' };

  return { min: 0, max, status };
}

// ─── inclination ─────────────────────────────────────────────────────────────

export function limitsI(): ParamLimits {
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
  // Hyperbolic: ν is bounded by the asymptote angle arccos(−1/e).
  const nuMaxDeg = (Math.acos(-1 / e) * 180) / Math.PI;
  return {
    min: -nuMaxDeg,
    max: nuMaxDeg,
    status: {
      message: `Hyperbolic orbit — ν bounded to ±${nuMaxDeg.toFixed(1)}°`,
      level: 'warn',
    },
  };
}

// ─── derived quantities ───────────────────────────────────────────────────────

export interface DerivedOrbital {
  rPeriapsis: number; // km — always defined
  rApoapsis: number | null; // km — null for hyperbolic
  periodMin: number | null; // minutes — null for hyperbolic
  vPeriapsis: number | null; // km/s
  vApoapsis: number | null; // km/s — null for hyperbolic
  orbitType: 'circular' | 'ellipse' | 'hyperbola';
}

export function deriveOrbital({
  a,
  e,
}: Pick<OrbitalValues, 'a' | 'e'>): DerivedOrbital {
  // e === 1 (parabola) is unreachable with floating-point sliders — folded into hyperbola.
  const orbitType = e < 0.001 ? 'circular' : e < 1 ? 'ellipse' : 'hyperbola';

  const rP = a * (1 - e);
  const rA = e < 1 ? a * (1 + e) : null;
  const T = e < 1 ? (2 * Math.PI * Math.sqrt(a ** 3 / MU_KM3_S2)) / 60 : null;
  const vP = rP > 0 ? Math.sqrt(MU_KM3_S2 * (2 / rP - 1 / a)) : null;
  const vA = rA != null ? Math.sqrt(MU_KM3_S2 * (2 / rA - 1 / a)) : null;

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
    a: limitsA(),
    e: limitsE(v.a),
    i: limitsI(),
    raan: limitsRaan(v.i),
    omega: limitsOmega(v.e),
    nu: limitsNu(v.e),
  };
}
