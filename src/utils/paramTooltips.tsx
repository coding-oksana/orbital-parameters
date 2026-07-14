import type { ReactNode } from 'react';

interface TooltipLine {
  formula?: string; // rendered in mono
  text: string; // plain-English explanation
}

function TooltipBody({ formula, text }: TooltipLine) {
  return (
    <span className="flex flex-col gap-1">
      {formula && (
        <span className="font-mono text-sky-300 dark:text-sky-400 text-[11px]">
          {formula}
        </span>
      )}
      <span>{text}</span>
    </span>
  );
}

export const PARAM_TOOLTIPS: Record<string, ReactNode> = {
  a: (
    <TooltipBody
      formula="T = 2π √(a³ / μ)"
      text="Half the longest diameter of the ellipse. Sets the orbital period — bigger a means slower orbit. Min is set so periapsis stays above Earth's surface."
    />
  ),

  e: (
    <TooltipBody
      formula="e_max = 1 − R♁ / a"
      text="Shape of the orbit: 0 = circle, 0–1 = ellipse. Max is capped so the closest approach (r_p = a·(1−e)) stays above Earth's surface."
    />
  ),

  i: (
    <TooltipBody text="Tilt of the orbital plane relative to the equator. 0° = equatorial prograde, 90° = polar, 180° = retrograde. Always 0–180° — no cross-parameter coupling." />
  ),

  raan: (
    <TooltipBody
      formula="defined only when 0° < i < 180°"
      text="Rotates the orbital plane around Earth's north pole. Undefined for equatorial orbits (i ≈ 0° or 180°) because there is no node crossing to measure from."
    />
  ),

  omega: (
    <TooltipBody
      formula="defined only when e > 0"
      text="Orients the ellipse within its plane — angle from the ascending node to periapsis. Undefined for circular orbits (e ≈ 0) because a circle has no periapsis point."
    />
  ),

  nu: (
    <TooltipBody
      formula="hyperbola: |ν| < arccos(−1/e)"
      text="Current position along the orbit measured from periapsis. Full 360° for ellipses. On hyperbolic trajectories the satellite escapes at the asymptote angle before completing a revolution."
    />
  ),
};
