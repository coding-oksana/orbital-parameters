import { JSX, useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import { useAtomValue } from 'jotai';
import {
  inclinationAtom,
  eccentricityAtom,
  semiMajorAxisAtom,
  raanAtom,
  argPerigeeAtom,
  trueAnomalyAtom,
} from '../atoms/orbitParameters';

import {
  computeOrbitPositions,
  LatLonHeight,
  OrbitParams,
} from '../utils/orbitMath';

export default function Orbit3D(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  const inclination = useAtomValue(inclinationAtom);
  const eccentricity = useAtomValue(eccentricityAtom);
  const semiMajorAxis = useAtomValue(semiMajorAxisAtom);
  const raan = useAtomValue(raanAtom);
  const argPerigee = useAtomValue(argPerigeeAtom);
  const trueAnomaly = useAtomValue(trueAnomalyAtom);

  useEffect(() => {
    async function updateViewer() {
      if (!containerRef.current) return;

      if (!viewerRef.current) {
        viewerRef.current = new Cesium.Viewer(containerRef.current, {
          animation: false,
          timeline: false,
          shouldAnimate: true,
        });
      }

      const viewer = viewerRef.current;
      viewer.entities.removeAll();

      const orbitParams: OrbitParams = {
        inclination,
        eccentricity,
        semiMajorAxis,
        raan,
        argPerigee,
        trueAnomaly,
      };

      const positions: LatLonHeight[] = computeOrbitPositions(orbitParams);

      if (positions.length > 0) {
        const satPosition = Cesium.Cartesian3.fromDegrees(
          positions[0].lon,
          positions[0].lat,
          positions[0].height
        );

        viewer.entities.add({
          name: 'Satellite',
          position: satPosition,
          point: { pixelSize: 10, color: Cesium.Color.RED },
        });

        const polylinePositions = positions.map((p) =>
          Cesium.Cartesian3.fromDegrees(p.lon, p.lat, p.height)
        );

        viewer.entities.add({
          name: 'Orbit Path',
          polyline: {
            positions: polylinePositions,
            width: 2,
            material: Cesium.Color.YELLOW,
          },
        });

        await viewer.zoomTo(viewer.entities);
      }
    }

    void updateViewer();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [inclination, eccentricity, semiMajorAxis, raan, argPerigee, trueAnomaly]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
