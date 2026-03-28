interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className = '' }: ProgressBarProps) {
  const clampedValue = Math.min(value, 100);

  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-gray-100 ${className}`}
    >
      <div
        className="h-full rounded-full bg-current transition-all duration-300"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
