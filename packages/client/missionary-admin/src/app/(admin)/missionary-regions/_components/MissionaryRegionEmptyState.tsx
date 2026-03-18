import { Button } from '@samilhero/design-system';
import { Building2, MapPin } from 'lucide-react';

interface MissionaryRegionEmptyStateProps {
  type: 'no-missionary' | 'no-regions';
  isAdmin: boolean;
  onCreateClick?: () => void;
}

export function MissionaryRegionEmptyState({
  type,
  isAdmin,
  onCreateClick,
}: MissionaryRegionEmptyStateProps) {
  if (type === 'no-missionary') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
        <MapPin className="h-12 w-12 text-gray-300" />
        <p className="text-base font-medium text-gray-900">
          선교를 선택해주세요
        </p>
        <p className="text-sm text-gray-400">
          위 드롭다운에서 선교를 선택하면 연계지 목록이 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
      <Building2 className="h-12 w-12 text-gray-300" />
      <p className="text-base font-medium text-gray-900">
        등록된 연계지가 없습니다
      </p>
      <p className="text-sm text-gray-400">
        이 선교에 연결된 연계지가 아직 없습니다.
      </p>
      {isAdmin && onCreateClick && (
        <Button variant="filled" size="md" onClick={onCreateClick}>
          + 연계지 등록
        </Button>
      )}
    </div>
  );
}
