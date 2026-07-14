import { useRef, useState } from 'react';

export interface InfoTooltipProps {
  /** Plain-text or short JSX content shown in the tooltip */
  content: React.ReactNode;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <span className="relative inline-flex items-center">
      <button
        ref={btnRef}
        type="button"
        aria-label="Parameter info"
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="
          flex items-center justify-center
          w-3.5 h-3.5 rounded-full
          text-slate-400 dark:text-slate-500
          hover:text-slate-600 dark:hover:text-slate-300
          focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400
          transition-colors duration-100
          select-none
        "
      >
        {/* inline SVG so we don't need an icon library */}
        <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
          <circle
            cx="7"
            cy="7"
            r="6.25"
            stroke="currentColor"
            strokeWidth="1.25"
          />
          <path
            d="M7 6.3v4"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <circle cx="7" cy="4.2" r="0.7" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          role="tooltip"
          className="
            absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2
            w-56 px-3 py-2.5
            bg-slate-900 dark:bg-slate-800
            text-slate-100 dark:text-slate-200
            text-[11px] leading-relaxed
            rounded-lg shadow-xl
            pointer-events-none
          "
        >
          {content}
          {/* arrow */}
          <span
            className="
              absolute top-full left-1/2 -translate-x-1/2
              border-4 border-transparent border-t-slate-900 dark:border-t-slate-800
            "
            aria-hidden
          />
        </div>
      )}
    </span>
  );
}
