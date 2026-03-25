export interface SkeletonColumn {
  width: string;
  rounded?: 'full';
}

interface TableSkeletonProps {
  columns: SkeletonColumn[];
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <tr key={i} className="border-b border-gray-200">
          {columns.map((col, j) => (
            <td key={j} className="px-5 py-3.5">
              <div
                className={`${col.width} bg-gray-100 animate-pulse ${
                  col.rounded === 'full' ? 'h-5 rounded-full' : 'h-4 rounded'
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
