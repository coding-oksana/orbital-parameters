interface TooltipBodyProps {
  formula?: string;
  text: string;
}

export function TooltipBody({ formula, text }: TooltipBodyProps) {
  return (
    <span className="flex flex-col gap-1">
      {formula && (
        <span className="font-mono text-sky-300 dark:text-sky-400 text-[11px]">
          {formula}
        </span>
      )}
      <span>{text}</span>
    </span>
  );
}
