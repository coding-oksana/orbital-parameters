import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { OrbitControls as OrbitalControlsImpl } from 'three-stdlib';
import { useMemo, useRef, useState } from 'react';
import type { OrbitalValues, ViewPreset } from '@typeProps/orbitParams';
import { keplerianToCartesian } from '@utils/orbitMath';
import {
  SCALE,
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
import { ResponsiveFov } from './ResponsiveFov';
import { SceneLegend } from './SceneLegend';
import { useIsMobile } from '@utils/useMediaQuery';
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

const VIEW_BUTTONS: { label: string; short: string; value: ViewPreset }[] = [
  { label: 'Free', short: 'Free', value: 'free' },
  { label: 'From Vernal Eq.', short: 'Equinox', value: 'vernal' },
  { label: 'From North', short: 'North', value: 'north' },
  { label: 'Orbital Plane', short: 'Plane', value: 'orbitalPlane' },
];

const CAMERA_FOV = 50;

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
  const isMobile = useIsMobile();
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
          // leave room for the 3D / Ground track tab bar on the right
          maxWidth: 'calc(100% - 120px)',
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
            {isMobile ? btn.short : btn.label}
          </button>
        ))}
      </div>

      <SceneLegend items={LEGEND_ITEMS} />

      <Canvas camera={{ position: [15, 10, 15], fov: CAMERA_FOV }}>
        <ResponsiveFov fov={CAMERA_FOV} />
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
