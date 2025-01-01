/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';

export default function Orbit2D() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [semiMajorAxis, setSemiMajorAxis] = useState<number>(0); // x-radius
  const [semiMinorAxis, setSemiMinorAxis] = useState<number>(0); // y-radius

  const width = 500;
  const height = 500;

  useEffect(() => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Select the SVG element
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Clear previous content
    svg.selectAll('*').remove();

    // Draw the central body (e.g., Earth)
    svg
      .append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', 10)
      .attr('fill', 'blue');

    // Draw the elliptical orbit
    svg
      .append('ellipse')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('rx', semiMajorAxis)
      .attr('ry', semiMinorAxis)
      .attr('stroke', 'gray')
      .attr('fill', 'none');

    // Add the satellite (initial position)
    const satellite = svg.append('circle').attr('r', 5).attr('fill', 'red');

    // Animate the satellite along the orbit
    const animateSatellite = () => {
      const totalDuration = 4000; // Duration for one orbit (ms)
      const pathLength = 2 * Math.PI; // Full circle radians

      // Transition satellite position along the ellipse
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      satellite
        .transition()
        .duration(totalDuration)
        .ease(d3.easeLinear)
        .attrTween('transform', () => {
          return (t: number) => {
            const angle = pathLength * t;
            const x = centerX + semiMajorAxis * Math.cos(angle);
            const y = centerY + semiMinorAxis * Math.sin(angle);
            return `translate(${x}, ${y})`;
          };
        })
        .on('end', animateSatellite); // Loop animation
    };

    animateSatellite();
  }, [semiMajorAxis, semiMinorAxis]); // Re-render if orbit parameters change

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
