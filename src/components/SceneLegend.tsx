import { useState } from 'react';
import { useIsMobile } from '@utils/useMediaQuery';

interface SceneLegendProps {
  items: [color: string, label: string][];
}

/** Floating bottom-left legend. Collapsed by default on small screens. */
export function SceneLegend({ items }: SceneLegendProps) {
  const isMobile = useIsMobile();
  // null = user hasn't toggled yet → follow the screen size
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const open = userOpen ?? !isMobile;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 14,
        left: 14,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4,
        background: 'rgba(4,6,15,0.75)',
        padding: '8px 12px',
        borderRadius: 8,
      }}
    >
      <button
        type="button"
        onClick={() => setUserOpen(!open)}
        aria-expanded={open}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: '#6a7a94',
          fontSize: 10,
          fontFamily: 'sans-serif',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        Legend {open ? '▾' : '▸'}
      </button>
      {open &&
        items.map(([color, label]) => (
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
  );
}
