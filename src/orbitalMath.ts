export function keplerianToCartesian(
  a: number,
  e: number,
  i: number,
  Ω: number,
  ω: number,
  ν: number
): [number, number, number] {
  const r = (a * (1 - e ** 2)) / (1 + e * Math.cos(ν));
  const xOrb = r * Math.cos(ν);
  const yOrb = r * Math.sin(ν);

  const xOrbShifted = xOrb - a * e;

  const cosΩ = Math.cos(Ω),
    sinΩ = Math.sin(Ω);
  const cosω = Math.cos(ω),
    sinω = Math.sin(ω);
  const cosi = Math.cos(i),
    sini = Math.sin(i);

  const x =
    (cosΩ * cosω - sinΩ * sinω * cosi) * xOrbShifted +
    (-cosΩ * sinω - sinΩ * cosω * cosi) * yOrb;
  const y =
    (sinΩ * cosω + cosΩ * sinω * cosi) * xOrbShifted +
    (-sinΩ * sinω + cosΩ * cosω * cosi) * yOrb;
  const z = sinω * sini * xOrbShifted + cosω * sini * yOrb;

  return [x, y, z];
}
