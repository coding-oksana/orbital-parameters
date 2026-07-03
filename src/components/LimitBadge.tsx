import { round } from '@utils/params';

interface LimitBadgeProps {
  label: string;
  value: number;
  decimals: number;
  unit?: string;
  violated: boolean;
}

export function LimitBadge({
  label,
  value,
  decimals,
  unit,
  violated,
}: LimitBadgeProps) {
  return (
    <span
      className={`
        text-[10px] font-mono tabular-nums
        ${
          violated
            ? 'text-red-500 dark:text-red-400 font-semibold'
            : 'text-slate-400 dark:text-slate-500'
        }
      `}
    >
      {label} {round(value, decimals)}
      {unit ?? ''}
    </span>
  );
}
