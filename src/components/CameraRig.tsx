import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { OrbitalValues, ViewPreset } from '@typeProps/orbitParams';
import { presetPosition } from '@utils/sceneHelpers';
import { OrbitControls as OrbitalControlsImpl } from 'three-stdlib';

export function CameraRig({
  view,
  values,
  animationKey,
  controlsRef,
}: {
  view: ViewPreset;
  values: OrbitalValues;
  animationKey: number;
  controlsRef: React.RefObject<OrbitalControlsImpl | null>;
}) {
  const { camera } = useThree();
  const targetPos = useRef(presetPosition('free', values));
  const targetUp = useRef(new THREE.Vector3(0, 1, 0));
  const animating = useRef(false);
  // Latest orbit, read only when the view changes — editing params must not re-zoom
  const valuesRef = useRef(values);
  valuesRef.current = values;

  useEffect(() => {
    targetPos.current = presetPosition(view, valuesRef.current);
    targetUp.current =
      view === 'north'
        ? new THREE.Vector3(0, 0, -1)
        : new THREE.Vector3(0, 1, 0);
    animating.current = true;
  }, [view, animationKey]);

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
