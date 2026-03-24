'use client';

import { TableEmptyState } from './TableEmptyState';
import { TableSkeleton } from './TableSkeleton';
import { TABLE_STYLES } from './tableStyles';

import type { Column } from './types';

interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  caption: string;
  getRowKey: (item: T) => string;

  isLoading?: boolean;
  skeletonRows?: number;

  emptyIcon?: React.ReactNode;
  emptyMessage: string;
  emptySubMessage?: string;

  onRowClick?: (item: T) => void;
  isRowSelected?: (item: T) => boolean;
  rowClassName?: string | ((item: T) => string);

  stickyHeader?: boolean;
  minWidth?: string;
  wrapperClassName?: string;
}

export function AdminTable<T>({
  data,
  columns,
  caption,
  getRowKey,
  isLoading = false,
  skeletonRows = 5,
  emptyIcon,
  emptyMessage,
  emptySubMessage,
  onRowClick,
  isRowSelected,
  rowClassName,
  stickyHeader = false,
  minWidth,
  wrapperClassName,
}: AdminTableProps<T>) {
  const skeletonCols = columns.map((col) => col.skeleton ?? { width: 'w-20' });

  const resolveRowClassName = (item: T): string => {
    if (!rowClassName) return '';
    return typeof rowClassName === 'function'
      ? rowClassName(item)
      : rowClassName;
  };

  return (
    <div className={wrapperClassName ?? 'flex-1 min-h-0 overflow-auto'}>
      <table
        className={TABLE_STYLES.table}
        style={minWidth ? { minWidth } : undefined}
      >
        <caption className="sr-only">{caption}</caption>
        <thead className={stickyHeader ? 'sticky top-0 z-10' : undefined}>
          <tr className={TABLE_STYLES.headerRow}>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`${TABLE_STYLES.headerCell}${col.width ? ` ${col.width}` : ''}${col.headerClassName ? ` ${col.headerClassName}` : ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton columns={skeletonCols} rows={skeletonRows} />
          ) : data.length === 0 ? (
            <TableEmptyState
              colSpan={columns.length}
              icon={emptyIcon}
              message={emptyMessage}
              subMessage={emptySubMessage}
            />
          ) : (
            data.map((item) => {
              const clickable = !!onRowClick;
              const selected = isRowSelected?.(item) ?? false;

              return (
                <tr
                  key={getRowKey(item)}
                  role={clickable ? 'button' : undefined}
                  className={[
                    TABLE_STYLES.bodyRow,
                    clickable && 'cursor-pointer',
                    clickable && !selected && 'hover:bg-gray-50',
                    selected && 'bg-blue-50/5',
                    resolveRowClassName(item),
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={clickable ? () => onRowClick(item) : undefined}
                  onKeyDown={
                    clickable
                      ? (e: React.KeyboardEvent) => {
                          if (e.key === 'Enter') onRowClick(item);
                        }
                      : undefined
                  }
                  tabIndex={clickable ? 0 : undefined}
                  aria-selected={isRowSelected ? selected : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={col.cellClassName ?? TABLE_STYLES.bodyCell}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
