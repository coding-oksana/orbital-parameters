import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

// Roughly the desktop scene's aspect — the framing `fov` was tuned for
const REFERENCE_ASPECT = 1.3;

/**
 * PerspectiveCamera.fov is vertical, so narrower canvases (phones) crop the
 * sides. Below the reference aspect, widen the vertical fov so the horizontal
 * field of view stays what it is on desktop.
 */
export function ResponsiveFov({ fov }: { fov: number }) {
  const camera = useThree((s) => s.camera);
  const { width, height } = useThree((s) => s.size);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera) || height === 0) return;
    const aspect = width / height;
    const half = THREE.MathUtils.degToRad(fov / 2);
    camera.fov =
      aspect >= REFERENCE_ASPECT
        ? fov
        : THREE.MathUtils.radToDeg(
            2 * Math.atan((Math.tan(half) * REFERENCE_ASPECT) / aspect)
          );
    camera.updateProjectionMatrix();
  }, [camera, fov, width, height]);

  return null;
}
