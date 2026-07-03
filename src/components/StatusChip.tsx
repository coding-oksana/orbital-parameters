import { STATUS_STYLES } from '@constants/styles';
import { ParamStatus } from '@utils/orbitalLimits';

interface StatusChipProps {
  status: ParamStatus;
}

export function StatusChip({ status }: StatusChipProps) {
  if (!status.message) return null;
  const s = STATUS_STYLES[status.level];
  return (
    <div
      role="alert"
      className={`
        flex items-start gap-1.5 px-2 py-1.5 rounded-md
        text-[11px] leading-snug
        ${s.bg} ${s.text}
      `}
    >
      <span
        className={`mt-[3px] shrink-0 w-1.5 h-1.5 rounded-full ${s.dot}`}
        aria-hidden
      />
      <span>{status.message}</span>
    </div>
  );
}
