interface SummaryStatItemProps {
  label: string;
  value: string | number;
  subValue?: string;
  valueClassName?: string;
}

export function SummaryStatItem({
  label,
  value,
  subValue,
  valueClassName = '',
}: SummaryStatItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-2xl font-bold text-gray-900 ${valueClassName}`}>
        {value}
      </span>
      {subValue && <span className="text-sm text-gray-500">{subValue}</span>}
    </div>
  );
}
