import { useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import {
  inclinationAtom,
  eccentricityAtom,
  semiMajorAxisAtom,
  raanAtom,
  argPerigeeAtom,
  trueAnomalyAtom,
} from '../atoms/orbitParameters';

type ViewMode = 'north' | 'vernal' | 'orbital';

export default function Orbit2D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('north');

  const inclination = useAtomValue(inclinationAtom);
  const eccentricity = useAtomValue(eccentricityAtom);
  const semiMajorAxis = useAtomValue(semiMajorAxisAtom);
  const raan = useAtomValue(raanAtom);
  const argPerigee = useAtomValue(argPerigeeAtom);
  const trueAnomaly = useAtomValue(trueAnomalyAtom);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const scale = (Math.min(width, height) / 2) * 0.85;
    const a = semiMajorAxis || 7000;
    const e = eccentricity || 0;

    const ω = (argPerigee * Math.PI) / 180;
    const Ω = (raan * Math.PI) / 180;
    const iRad = (inclination * Math.PI) / 180;

    function rotateZ(
      p: [number, number, number],
      angle: number
    ): [number, number, number] {
      const [x, y, z] = p;
      return [
        x * Math.cos(angle) - y * Math.sin(angle),
        x * Math.sin(angle) + y * Math.cos(angle),
        z,
      ];
    }

    function rotateX(
      p: [number, number, number],
      angle: number
    ): [number, number, number] {
      const [x, y, z] = p;
      return [
        x,
        y * Math.cos(angle) - z * Math.sin(angle),
        y * Math.sin(angle) + z * Math.cos(angle),
      ];
    }

    const steps = 360;
    const points3D: [number, number, number][] = [];
    const pointsPQW: [number, number, number][] = [];

    for (let step = 0; step <= steps; step++) {
      const ν = (step / steps) * 2 * Math.PI;
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(ν));

      const pqw: [number, number, number] = [
        r * Math.cos(ν),
        r * Math.sin(ν),
        0,
      ];
      pointsPQW.push(pqw);

      let pECI = rotateZ(pqw, ω);
      pECI = rotateX(pECI, iRad);
      pECI = rotateZ(pECI, Ω);

      points3D.push(pECI);
    }

    const maxR =
      viewMode === 'orbital'
        ? Math.max(...pointsPQW.map(([x, y]) => Math.sqrt(x * x + y * y)))
        : Math.max(
            ...points3D.map(([x, y, z]) => Math.sqrt(x * x + y * y + z * z))
          );

    function project(p: [number, number, number]) {
      if (viewMode === 'north') return [p[0], p[1]]; // XY
      if (viewMode === 'vernal') return [p[1], p[2]]; // YZ
      return [p[0], p[1]]; // PQW plane
    }

    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    ctx.beginPath();

    (viewMode === 'orbital' ? pointsPQW : points3D).forEach((p, idx) => {
      const [px, py] = project(p);
      const sx = (px / maxR) * scale + width / 2;
      const sy = (py / maxR) * scale + height / 2;
      if (idx === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });

    ctx.closePath();
    ctx.stroke();

    // Draw satellite
    const ν = (trueAnomaly * Math.PI) / 180;
    const satPQW: [number, number, number] = [
      ((a * (1 - e * e)) / (1 + e * Math.cos(ν))) * Math.cos(ν),
      ((a * (1 - e * e)) / (1 + e * Math.cos(ν))) * Math.sin(ν),
      0,
    ];

    let satECI = rotateZ(satPQW, ω);
    satECI = rotateX(satECI, iRad);
    satECI = rotateZ(satECI, Ω);

    const satPoint = viewMode === 'orbital' ? satPQW : satECI;
    const [sx, sy] = project(satPoint);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(
      (sx / maxR) * scale + width / 2,
      (sy / maxR) * scale + height / 2,
      5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw Earth center
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }, [
    eccentricity,
    semiMajorAxis,
    inclination,
    raan,
    argPerigee,
    trueAnomaly,
    viewMode,
  ]);

  return (
    <div className="flex flex-col items-center space-y-2">
      <label className="text-white">View:</label>
      <select
        value={viewMode}
        onChange={(e) => setViewMode(e.target.value as ViewMode)}
        className="border rounded p-1 bg-gray-800 text-white"
      >
        <option value="north">From North (+Z)</option>
        <option value="vernal">From Vernal Equinox (+X)</option>
        <option value="orbital">Orbit Plane</option>
      </select>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="border rounded bg-black"
      />
    </div>
  );
}
