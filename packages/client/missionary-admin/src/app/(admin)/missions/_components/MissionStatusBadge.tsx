import { Badge } from '@samilhero/design-system';
import { type MissionStatus } from 'apis/missionary';

import { MISSION_STATUS_LABEL } from '../_utils/missionStatus';

const STATUS_STYLE: Record<
  MissionStatus,
  { variant: 'info' | 'success'; className?: string }
> = {
  ENROLLMENT_OPENED: { variant: 'info' },
  ENROLLMENT_CLOSED: {
    variant: 'info',
    className: 'bg-gray-100 text-gray-600',
  },
  IN_PROGRESS: { variant: 'success' },
  COMPLETED: {
    variant: 'info',
    className: 'bg-gray-100 text-gray-600',
  },
};

export function MissionStatusBadge({ status }: { status: MissionStatus }) {
  const style = STATUS_STYLE[status];
  if (!style) return null;

  return (
    <Badge variant={style.variant} className={style.className}>
      {MISSION_STATUS_LABEL[status]}
    </Badge>
  );
}
