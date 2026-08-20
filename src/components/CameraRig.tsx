import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { OrbitalValues, ViewPreset } from '@typeProps/orbitParams';
import { presetPosition } from '@utils/sceneHelpers';

export function CameraRig({
  view,
  values,
  animationKey,
  controlsRef,
}: {
  view: ViewPreset;
  values: OrbitalValues;
  animationKey: number;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const targetPos = useRef(presetPosition('free', values));
  const targetUp = useRef(new THREE.Vector3(0, 1, 0));
  const animating = useRef(false);

  // Only re-trigger when the user picks a preset (animationKey or view changes).
  // values is intentionally excluded — orbital param edits must not move the camera.
  useEffect(() => {
    targetPos.current = presetPosition(view, values);
    targetUp.current =
      view === 'north'
        ? new THREE.Vector3(0, 0, -1)
        : new THREE.Vector3(0, 1, 0);
    animating.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, animationKey]); // <-- values removed here

  useFrame(() => {
    if (!animating.current) return;
    camera.position.lerp(targetPos.current, 0.08);
    camera.up.lerp(targetUp.current, 0.08);
    camera.lookAt(0, 0, 0);
    controlsRef.current?.update();
    if (camera.position.distanceTo(targetPos.current) < 0.05) {
      animating.current = false;
    }
  });

  return null;
}
