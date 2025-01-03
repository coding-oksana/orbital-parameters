import { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';

export default function Orbit2D() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [semiMajorAxis, setSemiMajorAxis] = useState<number>(7000); // km
  const [semiMinorAxis, setSemiMinorAxis] = useState<number>(5000); // km

  useEffect(() => {
    const width = 500;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate dynamic scaling factor
    const maxAxis = Math.max(semiMajorAxis, semiMinorAxis);
    const margin = 50; // Margin to ensure the orbit doesn't touch canvas edges
    const scale = (width / 2 - margin) / maxAxis; // Scale to fit canvas

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Clear the SVG before rendering
    svg.selectAll('*').remove();

    // Draw the central body (Earth)
    svg
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 20) // Fixed size for Earth
      .attr('fill', 'blue');

    // Draw the orbit as an ellipse
    svg
      .append('ellipse')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('rx', semiMajorAxis * scale) // Scaled semi-major axis
      .attr('ry', semiMinorAxis * scale) // Scaled semi-minor axis
      .attr('stroke', 'gray')
      .attr('fill', 'none');

    // Place the satellite at a fixed position on the orbit
    const angle = Math.PI / 4; // 45 degrees for demonstration
    const satelliteX = centerX + semiMajorAxis * scale * Math.cos(angle);
    const satelliteY = centerY + semiMinorAxis * scale * Math.sin(angle);

    svg
      .append('circle')
      .attr('cx', satelliteX)
      .attr('cy', satelliteY)
      .attr('r', 5)
      .attr('fill', 'red');
  }, [semiMajorAxis, semiMinorAxis]);

  return (
    <div>
      <div>
        <div className="flex flex-col justify-start">
          <label>
            Semi-Major Axis (km):
            <input
              type="number"
              value={semiMajorAxis}
              onChange={(e) => setSemiMajorAxis(Number(e.target.value))}
            />
          </label>
          <label>
            Semi-Minor Axis (km):
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
