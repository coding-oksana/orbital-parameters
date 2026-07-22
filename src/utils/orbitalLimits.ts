import {
  DerivedOrbital,
  OrbitalValues,
  ParamLimits,
} from '@typeProps/orbitParams';
import { EARTH_R_KM, MU_KM3_S2, A_MIN_KM, A_MAX_KM } from '@constants/orbits';

// ─── semi-major axis ─────────────────────────────────────────────────────────

export function limitsA(): ParamLimits {
  // Fixed rail — no status needed, slider enforces bounds.
  return { min: A_MIN_KM, max: A_MAX_KM, status: { message: '', level: 'ok' } };
}

// ─── eccentricity ─────────────────────────────────────────────────────────────

export function limitsE(a: number): ParamLimits {
  // e_max = 1 − R_Earth / a  (periapsis must clear Earth's surface)
  // Capped at 0.99 — hyperbolic orbits not supported yet.
  const max = Math.min(Math.max(0, 1 - EARTH_R_KM / a), 0.99);
  // No status: slider clamps the value, so an invalid state is unreachable
  // with the current a_min = 6500 km (gives eMax ≈ 0.02, always above 0).
  return { min: 0, max, status: { message: '', level: 'ok' } };
}

// ─── inclination ─────────────────────────────────────────────────────────────

export function limitsI(): ParamLimits {
  // Always 0–180°, unconditionally, no cross-param coupling.
  return { min: 0, max: 180, status: { message: '', level: 'ok' } };
}

// ─── RAAN ────────────────────────────────────────────────────────────────────

export function limitsRaan(i: number): ParamLimits {
  // Genuinely undefined for equatorial orbits — slider should be greyed out.
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
  // Genuinely undefined for circular orbits — slider should be greyed out.
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

export function limitsNu(): ParamLimits {
  // Full 360° — hyperbolic bounding (arccos(−1/e)) removed because e is
  // capped at 0.99 and e >= 1 is currently unreachable.
  // Restore hyperbolic case here if you ever lift the e < 1 cap.
  return { min: 0, max: 359.99, status: { message: '', level: 'ok' } };
}

// ─── derived quantities ───────────────────────────────────────────────────────

export function deriveOrbital({
  a,
  e,
}: Pick<OrbitalValues, 'a' | 'e'>): DerivedOrbital {
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
    nu: limitsNu(),
  };
}
