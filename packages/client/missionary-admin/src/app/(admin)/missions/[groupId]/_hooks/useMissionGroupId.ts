import { useParams } from 'next/navigation';

export function useMissionGroupId(): string {
  const params = useParams<{ groupId: string }>();

  if (!params.groupId) {
    throw new Error('useMissionGroupId must be used within a [groupId] route');
  }

  return params.groupId;
}
