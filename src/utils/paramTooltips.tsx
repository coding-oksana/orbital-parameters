import type { ReactNode } from 'react';
import { TooltipBody } from '@components/TooltipBody';

export const PARAM_TOOLTIPS: Record<string, ReactNode> = {
  a: (
    <TooltipBody
      // limitsA() returns fixed A_MIN_KM / A_MAX_KM — no cross-param math.
      // Period formula shown as the main reason a matters physically.
      formula="T = 2π √(a³ / μ)"
      text="Half the longest diameter of the ellipse. Sets the orbital period — bigger a means slower orbit. Range is a fixed practical rail (A_MIN_KM – A_MAX_KM)."
    />
  ),

  e: (
    <TooltipBody
      // limitsE: eMax = max(0, 1 − EARTH_R_KM / a), then min(eMax, 0.99).
      // Warning fires when eMax < 0.01.
      formula="e_max = 1 − EARTH_R_KM / a"
      text="Shape of the orbit: 0 = circle, 0–1 = ellipse. Max is capped so periapsis (r_p = a·(1−e)) stays above Earth's surface. Warn shown when a is too low for any eccentricity (e_max < 0.01)."
    />
  ),

  i: (
    <TooltipBody
      // limitsI() is unconditional — always 0–180, no deps.
      text="Tilt of the orbital plane relative to the equator. 0° = equatorial prograde, 90° = polar, 180° = retrograde. Always 0–180° — no cross-parameter coupling."
    />
  ),

  raan: (
    <TooltipBody
      // limitsRaan: disabled when i < 0.5 || i > 179.5
      formula="disabled when i < 0.5° or i > 179.5°"
      text="Rotates the orbital plane around Earth's north pole. Undefined for equatorial orbits because there is no ascending node to measure from."
    />
  ),

  omega: (
    <TooltipBody
      // limitsOmega: disabled when e < 0.001
      formula="disabled when e < 0.001"
      text="Orients the ellipse within its plane — angle from the ascending node to periapsis. Undefined for circular orbits (e < 0.001) because a circle has no periapsis point."
    />
  ),

  nu: (
    <TooltipBody
      // limitsNu: full 360° when e < 1; bounded by arccos(−1/e) when e ≥ 1
      formula="hyperbola: |ν| < arccos(−1/e)"
      text="Current position along the orbit measured from periapsis. Full 0–360° for ellipses. For hyperbolic trajectories (e ≥ 1) the satellite escapes before completing a revolution."
    />
  ),
};
