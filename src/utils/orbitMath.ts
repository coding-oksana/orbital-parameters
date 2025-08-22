// src/utils/orbitMath.ts
export interface OrbitParams {
  inclination: number; // deg
  eccentricity: number; // 0–1
  semiMajorAxis: number; // km
  raan: number; // deg
  argPerigee: number; // deg
  trueAnomaly: number; // deg, starting position
}

export interface LatLonHeight {
  lat: number;
  lon: number;
  height: number; // meters
}

/**
 * Generate orbit positions (lat/lon/height) across one full revolution.
 * Uses Keplerian formulas instead of satellite.propagate for full orbit.
 */
export function computeOrbitPositions(params: OrbitParams): LatLonHeight[] {
  const { inclination, eccentricity, semiMajorAxis, raan, argPerigee } = params;
  const deg2rad = (deg: number) => (deg * Math.PI) / 180;
  const rad2deg = (rad: number) => (rad * 180) / Math.PI;

  const incRad = deg2rad(inclination);
  const raanRad = deg2rad(raan);
  const argPerRad = deg2rad(argPerigee);

  const points: LatLonHeight[] = [];
  const steps = 360;

  for (let i = 0; i <= steps; i++) {
    const trueAnomaly = (i / steps) * 2 * Math.PI;

    // Orbital radius at this true anomaly
    const r =
      (semiMajorAxis * (1 - eccentricity ** 2)) /
      (1 + eccentricity * Math.cos(trueAnomaly));

    // Position in orbital plane (x along periapsis)
    const xOrb = r * Math.cos(trueAnomaly);
    const yOrb = r * Math.sin(trueAnomaly);
    const zOrb = 0;

    // Rotate from orbital plane to ECI using 3-1-3 Euler angles (RAAN, incl, argPerigee)
    const cosRAAN = Math.cos(raanRad);
    const sinRAAN = Math.sin(raanRad);
    const cosInc = Math.cos(incRad);
    const sinInc = Math.sin(incRad);
    const cosArg = Math.cos(argPerRad);
    const sinArg = Math.sin(argPerRad);

    // Rotation matrix multiplication
    const xECI =
      (cosRAAN * cosArg - sinRAAN * sinArg * cosInc) * xOrb +
      (-cosRAAN * sinArg - sinRAAN * cosArg * cosInc) * yOrb;
    const yECI =
      (sinRAAN * cosArg + cosRAAN * sinArg * cosInc) * xOrb +
      (-sinRAAN * sinArg + cosRAAN * cosArg * cosInc) * yOrb;
    const zECI = sinInc * sinArg * xOrb + sinInc * cosArg * yOrb;

    // Convert ECI to geodetic lat/lon/height (simplified spherical Earth)
    const earthRadius = 6371; // km
    const lon = rad2deg(Math.atan2(yECI, xECI));
    const lat = rad2deg(Math.asin(zECI / r));
    const height = (r - earthRadius) * 1000; // meters

    if (isFinite(lat) && isFinite(lon) && isFinite(height)) {
      points.push({ lat, lon, height });
    }
  }

  return points;
}
