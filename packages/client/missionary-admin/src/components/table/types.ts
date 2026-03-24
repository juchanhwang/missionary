import type { SkeletonColumn } from './TableSkeleton';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (item: T) => React.ReactNode;
  skeleton?: SkeletonColumn;
}
