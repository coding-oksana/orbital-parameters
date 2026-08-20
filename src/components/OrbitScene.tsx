import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { OrbitControls as OrbitalControlsImpl } from 'three-stdlib';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { OrbitalValues, ViewPreset } from '@typeProps/orbitParams';
import { keplerianToCartesian } from '@utils/orbitMath';
import {
  SCALE,
  EARTH_COLOR,
  SPACE_BG_COLOR,
  INC_COLOR,
  NU_COLOR,
  NODE_COLOR,
  RAAN_COLOR,
  OMEGA_COLOR,
  PERIAPSIS_COLOR,
  APOAPSIS_COLOR,
} from '@constants/scene';
import {
  Earth,
  EquatorCircle,
  NorthAxis,
  VernalEquinoxAxis,
} from './StaticSceneElements';
import { CameraRig } from './CameraRig';
import {
  ApoapsisMarker,
  AscendingNodeLine,
  InclinationArc,
  NuArc,
  OmegaArc,
  OrbitPath,
  PeriapsisLine,
  PeriapsisMarker,
  RaanArc,
  Satellite,
} from './OrbitalAnnotationElements';

const STAR_COLOR = (() => {
  const c = new THREE.Color(EARTH_COLOR);
  const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  return lum < 0.5 ? '#f5f7ff' : '#c7d3e0';
})();

const VIEW_BUTTONS: { label: string; value: ViewPreset }[] = [
  { label: 'Free', value: 'free' },
  { label: 'From Vernal Eq.', value: 'vernal' },
  { label: 'From North', value: 'north' },
  { label: 'Orbital Plane', value: 'orbitalPlane' },
];

const LEGEND_ITEMS: [string, string][] = [
  [RAAN_COLOR, 'Ω  RAAN'],
  [INC_COLOR, 'i  Inclination'],
  [OMEGA_COLOR, 'ω  Arg. of periapsis'],
  [NU_COLOR, 'ν  True anomaly'],
  [PERIAPSIS_COLOR, 'Periapsis (r_p)'],
  [APOAPSIS_COLOR, 'Apoapsis (r_a)'],
  [NODE_COLOR, 'Node line'],
];

export function OrbitScene({ values }: { values: OrbitalValues }) {
  const [view, setView] = useState<ViewPreset>('free');
  const [animationKey, setAnimationKey] = useState(0);
  const controlsRef = useRef<OrbitalControlsImpl>(null);
  const satPosition = useMemo(
    () => keplerianToCartesian(values, SCALE),
    [values]
  );

  function handleViewChange(next: ViewPreset) {
    setView(next);
    setAnimationKey((k) => k + 1);
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
        }}
      >
        {VIEW_BUTTONS.map((btn) => (
          <button
            key={btn.value}
            onClick={() => handleViewChange(btn.value)}
            style={{
              padding: '6px 10px',
              fontSize: 12,
              fontFamily: 'sans-serif',
              borderRadius: 4,
              border: '1px solid #444',
              background:
                view === btn.value ? '#3ddc72' : 'rgba(20,20,30,0.85)',
              color: view === btn.value ? '#04060f' : '#e0e0e0',
              cursor: 'pointer',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          background: 'rgba(4,6,15,0.75)',
          padding: '8px 12px',
          borderRadius: 8,
        }}
      >
        {LEGEND_ITEMS.map(([color, label]) => (
          <div
            key={label}
            style={{ display: 'flex', alignItems: 'center', gap: 7 }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: '#c7ccd6',
                fontSize: 11,
                fontFamily: 'sans-serif',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <Canvas camera={{ position: [15, 10, 15], fov: 50 }}>
        <color attach="background" args={[SPACE_BG_COLOR]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[50, 20, 30]} intensity={1.2} />
        <Stars
          radius={100}
          depth={50}
          count={6000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
          color={STAR_COLOR}
        />

        <Earth />
        <NorthAxis />
        <EquatorCircle />
        <VernalEquinoxAxis />

        <AscendingNodeLine raanDeg={values.raan} />
        <RaanArc values={values} />
        <InclinationArc values={values} />
        <OmegaArc values={values} />
        <NuArc values={values} />

        <PeriapsisLine values={values} />
        <PeriapsisMarker values={values} />
        <ApoapsisMarker values={values} />
        <OrbitPath values={values} />
        <Satellite position={satPosition} />

        <CameraRig
          view={view}
          values={values}
          animationKey={animationKey}
          controlsRef={controlsRef}
        />
        <OrbitControls ref={controlsRef} enableDamping={false} />
      </Canvas>
    </div>
  );
}
