export function labelStyle(color: string): React.CSSProperties {
  return {
    color,
    fontSize: '12px',
    fontFamily: 'sans-serif',
    whiteSpace: 'nowrap',
    textShadow: '0 0 4px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.95)',
    pointerEvents: 'none',
    userSelect: 'none',
  };
}
