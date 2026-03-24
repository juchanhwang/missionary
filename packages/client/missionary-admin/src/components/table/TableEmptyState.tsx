interface TableEmptyStateProps {
  colSpan: number;
  icon?: React.ReactNode;
  message: string;
  subMessage?: string;
}

export function TableEmptyState({
  colSpan,
  icon,
  message,
  subMessage,
}: TableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-16 text-center">
        <div className="flex flex-col items-center gap-2">
          {icon}
          <p className="text-sm text-gray-500">{message}</p>
          {subMessage && <p className="text-xs text-gray-400">{subMessage}</p>}
        </div>
      </td>
    </tr>
  );
}
