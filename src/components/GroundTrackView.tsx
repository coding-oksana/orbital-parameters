import { useEffect, useRef, useMemo } from 'react';
import type { OrbitalValues } from '@typeProps/orbitParams';
import { computeGroundTrack, currentGroundPoint } from '@utils/groundTrack';
import { MU_KM3_S2 } from '@constants/orbits';

// ─── colours ─────────────────────────────────────────────────────────────────

const BG = '#04060f';
const GRID = '#1a2035';
const GRID_LABEL = '#3a4560';
const LAND = '#162035';
const LAND_STROKE = '#1e2e4a';
const TRACK_1 = '#38bdf8'; // current orbit
const TRACK_2 = '#1e6a99'; // orbit 2
const TRACK_3 = '#133a55'; // orbit 3
const SAT_FILL = '#f97316';
const SAT_RING = 'rgba(249,115,22,0.3)';
const INFO_BG = 'rgba(4,6,15,0.82)';
const INFO_TEXT = '#f97316';
const INFO_SUB = '#c7ccd6';

// ─── simplified continent outlines (lon,lat pairs, NaN = pen lift) ───────────

// A very reduced set of land polygons sufficient for a recognisable world map.
// Format: flat array [lon, lat, lon, lat, …, NaN, NaN, …]
// Generated from a heavily simplified Natural Earth dataset.
const LAND_COORDS: number[] = (() => {
  // North America
  const na = [
    -60, 47, -66, 44, -70, 43, -75, 43, -77, 42, -78, 43, -79, 44, -82, 42, -83,
    42, -84, 46, -87, 45, -88, 46, -90, 47, -93, 48, -96, 49, -110, 49, -120,
    49, -124, 49, -125, 48, -124, 46, -124, 40, -122, 37, -118, 34, -117, 33,
    -115, 30, -108, 24, -105, 20, -102, 19, -98, 19, -95, 19, -90, 16, -88, 16,
    -84, 11, -83, 10, -78, 9, -77, 8, -77, 25, -80, 25, -81, 24, -82, 24, -83,
    30, -85, 30, -88, 30, -90, 30, -93, 30, -97, 26, -97, 28, -100, 29, -104,
    30, -107, 32, -110, 32, -114, 33, -117, 33, -120, 35, -124, 40, -124, 47,
    -126, 49, -140, 60, -145, 62, -150, 62, -153, 60, -158, 58, -162, 60, -165,
    64, -168, 66, -166, 68, -162, 70, -156, 71, -148, 71, -140, 70, -136, 68,
    -130, 66, -128, 54, -126, 50, -124, 49, -141, 60, -141, 70, -130, 70, -120,
    74, -110, 74, -100, 73, -90, 72, -80, 73, -70, 72, -63, 64, -64, 60, -66,
    56, -60, 47,
  ];
  // South America
  const sa = [
    -35, -6, -38, -10, -40, -14, -40, -20, -43, -23, -44, -24, -48, -27, -50,
    -29, -53, -33, -55, -35, -58, -38, -62, -40, -65, -43, -66, -46, -68, -50,
    -70, -54, -68, -56, -66, -55, -64, -52, -63, -48, -60, -44, -58, -40, -58,
    -34, -60, -30, -60, -25, -58, -20, -57, -15, -58, -10, -60, -5, -62, 0, -60,
    2, -58, 4, -55, 6, -52, 4, -50, 2, -48, 0, -44, -3, -40, -5, -37, -6, -35,
    -6,
  ];
  // Europe
  const eu = [
    -10, 38, -9, 39, -9, 42, -8, 44, -2, 44, 0, 44, 3, 43, 5, 43, 7, 44, 10, 44,
    12, 45, 14, 46, 16, 47, 18, 48, 20, 49, 22, 50, 24, 50, 26, 49, 28, 49, 30,
    50, 32, 52, 28, 56, 26, 58, 24, 60, 22, 62, 26, 66, 28, 68, 28, 70, 26, 70,
    22, 70, 18, 70, 15, 70, 14, 68, 16, 66, 18, 64, 18, 60, 16, 58, 12, 56, 10,
    54, 8, 55, 6, 54, 4, 52, 2, 51, 2, 49, 0, 48, -2, 48, -4, 48, -5, 48, -5,
    44, -8, 44, -9, 42, -10, 38,
  ];
  // Africa
  const af = [
    -17, 15, -15, 12, -15, 10, -14, 8, -12, 6, -10, 5, -8, 5, -5, 5, -2, 5, 2,
    6, 5, 5, 8, 4, 10, 2, 12, 0, 14, -2, 16, -4, 18, -6, 20, -8, 22, -10, 24,
    -14, 26, -18, 28, -22, 30, -26, 32, -28, 34, -30, 33, -34, 28, -34, 24, -34,
    20, -32, 18, -28, 16, -24, 14, -20, 12, -16, 10, -10, 8, -6, 6, -2, 4, 2, 2,
    4, 0, 6, -2, 6, -4, 8, -6, 10, -8, 12, -10, 14, -12, 14, -14, 16, -16, 16,
    -17, 15,
  ];
  // Asia
  const as = [
    28, 42, 30, 42, 32, 40, 36, 38, 38, 36, 40, 38, 42, 40, 44, 42, 46, 44, 50,
    44, 52, 46, 54, 48, 58, 52, 60, 54, 62, 56, 64, 58, 66, 60, 68, 62, 70, 62,
    72, 64, 74, 68, 76, 70, 80, 72, 84, 74, 88, 74, 92, 72, 96, 70, 100, 68,
    104, 66, 108, 64, 112, 62, 116, 60, 120, 58, 122, 56, 124, 54, 126, 52, 128,
    50, 130, 44, 132, 44, 134, 46, 136, 48, 138, 46, 140, 44, 142, 46, 144, 44,
    140, 42, 138, 38, 136, 36, 134, 34, 132, 34, 130, 34, 128, 36, 126, 36, 124,
    38, 122, 36, 120, 32, 118, 30, 116, 28, 114, 24, 110, 22, 108, 20, 106, 18,
    104, 16, 102, 14, 100, 12, 98, 10, 96, 8, 94, 8, 92, 10, 90, 12, 88, 14, 86,
    18, 84, 22, 80, 24, 78, 28, 76, 30, 74, 32, 72, 36, 70, 38, 68, 38, 66, 38,
    64, 36, 62, 34, 60, 32, 58, 30, 56, 28, 54, 26, 52, 24, 50, 26, 48, 28, 46,
    30, 44, 32, 42, 32, 40, 36, 38, 38, 36, 38, 34, 38, 32, 40, 30, 42, 28, 42,
  ];
  // Australia
  const au = [
    114, -22, 116, -20, 118, -18, 120, -16, 122, -14, 124, -14, 126, -14, 128,
    -14, 130, -14, 132, -12, 134, -12, 136, -14, 138, -14, 140, -16, 142, -18,
    144, -18, 146, -20, 148, -22, 150, -24, 152, -26, 152, -28, 150, -30, 150,
    -32, 152, -34, 150, -36, 148, -38, 146, -38, 144, -38, 140, -38, 138, -36,
    136, -34, 134, -32, 132, -32, 130, -32, 128, -34, 126, -34, 124, -34, 122,
    -34, 120, -34, 118, -32, 116, -30, 114, -28, 114, -22,
  ];

  const sep = [NaN, NaN];
  return [
    ...na,
    ...sep,
    ...sa,
    ...sep,
    ...eu,
    ...sep,
    ...af,
    ...sep,
    ...as,
    ...sep,
    ...au,
  ];
})();

// ─── helpers ─────────────────────────────────────────────────────────────────

function lonLatToXY(
  lon: number,
  lat: number,
  W: number,
  H: number
): [number, number] {
  const x = ((lon + 180) / 360) * W;
  const y = ((90 - lat) / 180) * H;
  return [x, y];
}

function periodMinutes(a: number, e: number): number {
  // e unused here (period depends only on a) — kept in signature for clarity
  return (2 * Math.PI * Math.sqrt(a ** 3 / MU_KM3_S2)) / 60;
}

// ─── component ───────────────────────────────────────────────────────────────

interface GroundTrackViewProps {
  values: OrbitalValues;
}

const NUM_ORBITS = 3;
const TRACK_COLORS = [TRACK_1, TRACK_2, TRACK_3];

export function GroundTrackView({ values }: GroundTrackViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const segments = useMemo(
    () => computeGroundTrack(values, NUM_ORBITS, 240),
    [values]
  );

  const current = useMemo(() => currentGroundPoint(values), [values]);

  // Assign orbit index to each segment — each full period = one orbit
  const stepsPerOrbit = 240;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = GRID;
    ctx.lineWidth = 0.5;
    // Longitude lines every 30°
    for (let lon = -180; lon <= 180; lon += 30) {
      const [x] = lonLatToXY(lon, 0, W, H);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    // Latitude lines every 30°
    for (let lat = -90; lat <= 90; lat += 30) {
      const [, y] = lonLatToXY(0, lat, W, H);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Grid labels
    ctx.fillStyle = GRID_LABEL;
    ctx.font = `${10 * (W / 600)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    for (let lon = -150; lon <= 150; lon += 30) {
      const [x, y] = lonLatToXY(lon, 0, W, H);
      ctx.fillText(`${lon}°`, x, y + 12);
    }
    ctx.textAlign = 'right';
    for (let lat = -60; lat <= 60; lat += 30) {
      if (lat === 0) continue;
      const [x, y] = lonLatToXY(-180, lat, W, H);
      ctx.fillText(
        `${lat > 0 ? lat + '°N' : Math.abs(lat) + '°S'}`,
        x + 28,
        y + 4
      );
    }

    // Land outlines
    ctx.fillStyle = LAND;
    ctx.strokeStyle = LAND_STROKE;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    let penDown = false;
    for (let k = 0; k < LAND_COORDS.length; k += 2) {
      const lon = LAND_COORDS[k],
        lat = LAND_COORDS[k + 1];
      if (isNaN(lon) || isNaN(lat)) {
        penDown = false;
        continue;
      }
      const [x, y] = lonLatToXY(lon, lat, W, H);
      if (!penDown) {
        ctx.moveTo(x, y);
        penDown = true;
      } else ctx.lineTo(x, y);
    }
    ctx.fill();
    ctx.stroke();

    // Ground tracks — assign colour by orbit index
    let segIdx = 0;
    let accumulated = 0;
    segments.forEach((seg) => {
      // Estimate which orbit this segment belongs to by point count
      const orbitIdx = Math.min(
        Math.floor(accumulated / stepsPerOrbit),
        NUM_ORBITS - 1
      );
      accumulated += seg.points.length;

      ctx.strokeStyle =
        TRACK_COLORS[orbitIdx] ?? TRACK_COLORS[TRACK_COLORS.length - 1];
      ctx.lineWidth = orbitIdx === 0 ? 1.8 : 1.2;
      ctx.globalAlpha = orbitIdx === 0 ? 1 : 0.6 - orbitIdx * 0.15;
      ctx.beginPath();
      seg.points.forEach((pt, i) => {
        const [x, y] = lonLatToXY(pt.lon, pt.lat, W, H);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      segIdx++;
    });
    ctx.globalAlpha = 1;

    // Current position
    const [sx, sy] = lonLatToXY(current.lon, current.lat, W, H);
    ctx.fillStyle = SAT_RING;
    ctx.beginPath();
    ctx.arc(sx, sy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = SAT_FILL;
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Info box — top left
    const latStr = `${Math.abs(current.lat).toFixed(1)}° ${current.lat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(current.lon).toFixed(1)}° ${current.lon >= 0 ? 'E' : 'W'}`;
    const T = periodMinutes(values.a, values.e);
    const alt = Math.round(values.a * (1 - values.e) - 6371);

    ctx.fillStyle = INFO_BG;
    ctx.beginPath();
    ctx.roundRect(10, 10, 180, 90, 6);
    ctx.fill();

    ctx.font = `bold ${11 * (W / 600)}px system-ui, sans-serif`;
    ctx.fillStyle = INFO_TEXT;
    ctx.textAlign = 'left';
    ctx.fillText('CURRENT POSITION', 18, 28);

    ctx.font = `${11 * (W / 600)}px system-ui, sans-serif`;
    ctx.fillStyle = INFO_SUB;
    ctx.fillText(`Lat  ${latStr}`, 18, 46);
    ctx.fillText(`Lon  ${lonStr}`, 18, 62);
    ctx.fillText(`Alt  ${alt} km  ·  T = ${T.toFixed(1)} min`, 18, 78);
    ctx.fillText(`i = ${values.i.toFixed(1)}°`, 18, 94);
  }, [segments, current, values]);

  // Legend
  const orbitLabels = ['Orbit 1 (current)', 'Orbit 2', 'Orbit 3'];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: BG,
      }}
    >
      {/* Legend row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: '8px 14px',
          borderBottom: '1px solid #1a2035',
          flexShrink: 0,
        }}
      >
        {orbitLabels.map((lbl, i) => (
          <div
            key={lbl}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <div
              style={{
                width: 24,
                height: 3,
                background: TRACK_COLORS[i],
                borderRadius: 2,
                opacity: i === 0 ? 1 : 0.6,
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: '#8a9ab5',
                fontFamily: 'sans-serif',
              }}
            >
              {lbl}
            </span>
          </div>
        ))}
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: SAT_FILL,
            }}
          />
          <span
            style={{ fontSize: 11, color: '#8a9ab5', fontFamily: 'sans-serif' }}
          >
            Current position
          </span>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{ flex: 1, width: '100%', display: 'block' }}
      />
    </div>
  );
}
