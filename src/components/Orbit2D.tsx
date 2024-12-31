import { useRef, useState } from 'react';

export default function Orbit2D() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [semiMajorAxis, setSemiMajorAxis] = useState<number>(0); // x-radius
  const [semiMinorAxis, setSemiMinorAxis] = useState<number>(0); // y-radius

  return (
    <div>
      <div>
        <div className="flex flex-col justify-start">
          <label>
            Semi-Major Axis:
            <input
              type="number"
              value={semiMajorAxis}
              onChange={(e) => setSemiMajorAxis(Number(e.target.value))}
            />
          </label>
          <label>
            Semi-Minor Axis:
            <input
              type="number"
              value={semiMinorAxis}
              onChange={(e) => setSemiMinorAxis(Number(e.target.value))}
            />
          </label>
        </div>
      </div>
      <svg ref={svgRef}></svg>
    </div>
  );
}
