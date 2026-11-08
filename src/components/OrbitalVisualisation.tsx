import { useCallback, useState } from 'react';
import { PresetsPanel } from '@components/PresetsPanel';
import type {
  OrbitalPreset,
  KeplerianElements,
  OrbitalValues,
} from '@typeProps/orbitParams';
import { PRESETS } from '@constants/orbits';
import { OrbitalControls } from './OrbitalControls';
import { OrbitScene } from './OrbitScene';
import { GroundTrackView } from './GroundTrackView';

type SceneTab = '3d' | 'ground';

function elementsToOrbitalValues(elements: KeplerianElements): OrbitalValues {
  return {
    a: elements.a,
    e: elements.e,
    i: elements.i,
    raan: elements.raan,
    omega: elements.w,
    nu: elements.nu,
  };
}

const issPreset = PRESETS.find((p) => p.id === 'iss');
if (!issPreset) throw new Error('ISS preset missing from PRESETS');
const INITIAL_VALUES = elementsToOrbitalValues(issPreset.elements);

// ─── tab bar ─────────────────────────────────────────────────────────────────

const TAB_ITEMS: { id: SceneTab; label: string; icon: string }[] = [
  { id: '3d', label: '3D view', icon: '🌐' },
  { id: 'ground', label: 'Ground track', icon: '🗺️' },
];

interface TabBarProps {
  active: SceneTab;
  onChange: (tab: SceneTab) => void;
}

function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 20,
        display: 'flex',
        gap: 4,
        background: 'rgba(4,6,15,0.82)',
        padding: '4px',
        borderRadius: 8,
        border: '1px solid #1e2a40',
      }}
    >
      {TAB_ITEMS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: '5px 12px',
            fontSize: 12,
            fontFamily: 'sans-serif',
            borderRadius: 5,
            border: 'none',
            cursor: 'pointer',
            background: active === tab.id ? '#1e3a5f' : 'transparent',
            color: active === tab.id ? '#38bdf8' : '#6a7a94',
            fontWeight: active === tab.id ? 500 : 400,
            transition: 'all 0.15s',
          }}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── root ─────────────────────────────────────────────────────────────────────

export function OrbitalVisualisation() {
  const [activePresetId, setActivePresetId] = useState<string | null>('iss');
  const [values, setValues] = useState<OrbitalValues>(INITIAL_VALUES);
  const [tab, setTab] = useState<SceneTab>('3d');

  const handlePresetSelect = useCallback((preset: OrbitalPreset) => {
    setValues(elementsToOrbitalValues(preset.elements));
    setActivePresetId(preset.id);
  }, []);

  const handleValueChange = useCallback((id: string, value: number) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    setActivePresetId(null);
  }, []);

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-sm shrink-0 overflow-y-auto">
        <h1 className="sr-only">
          Orbital Parameters – Interactive Keplerian Orbit Visualiser
        </h1>
        <PresetsPanel
          presets={PRESETS}
          activePresetId={activePresetId}
          onSelect={handlePresetSelect}
        />
        <OrbitalControls values={values} onChange={handleValueChange} />
      </aside>

      {/* Main view */}
      <main className="flex-1 h-full" style={{ position: 'relative' }}>
        {/* Tab switcher — floats top-right over whichever view is active */}
        <TabBar active={tab} onChange={setTab} />

        {/* 3D scene — always mounted so OrbitControls state is preserved */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            visibility: tab === '3d' ? 'visible' : 'hidden',
            pointerEvents: tab === '3d' ? 'auto' : 'none',
          }}
        >
          <OrbitScene values={values} />
        </div>

        {/* Ground track — always mounted so canvas doesn't re-init */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            visibility: tab === 'ground' ? 'visible' : 'hidden',
            pointerEvents: tab === 'ground' ? 'auto' : 'none',
          }}
        >
          <GroundTrackView values={values} />
        </div>
      </main>
    </div>
  );
}
