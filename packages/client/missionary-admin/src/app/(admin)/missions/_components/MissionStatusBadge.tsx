import { Badge } from '@samilhero/design-system';
import { type Missionary } from 'apis/missionary';

type MissionStatus = Missionary['status'];

const STATUS_CONFIG: Record<
  MissionStatus,
  { variant: 'info' | 'success'; label: string; className?: string }
> = {
  ENROLLMENT_OPENED: { variant: 'info', label: '모집중' },
  ENROLLMENT_CLOSED: {
    variant: 'info',
    label: '모집종료',
    className: 'bg-gray-100 text-gray-600',
  },
  IN_PROGRESS: { variant: 'success', label: '진행중' },
  COMPLETED: {
    variant: 'info',
    label: '완료',
    className: 'bg-gray-100 text-gray-600',
  },
};

export function MissionStatusBadge({ status }: { status: MissionStatus }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
