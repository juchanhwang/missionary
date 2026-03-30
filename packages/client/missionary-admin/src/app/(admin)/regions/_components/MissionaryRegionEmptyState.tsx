'use client';

import { Button } from '@samilhero/design-system';
import { CircleAlert, Building2, Search } from 'lucide-react';

interface MissionaryRegionEmptyStateProps {
  type: 'empty' | 'no-results' | 'error';
  query?: string;
  isAdmin?: boolean;
  onClearSearch?: () => void;
  onRetry?: () => void;
  onCreateClick?: () => void;
}

export function MissionaryRegionEmptyState({
  type,
  query,
  isAdmin,
  onClearSearch,
  onRetry,
  onCreateClick,
}: MissionaryRegionEmptyStateProps) {
  if (type === 'error') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
        <CircleAlert size={48} className="text-error-60" />
        <p className="text-sm font-semibold text-gray-900">
          데이터를 불러오지 못했습니다
        </p>
        <p className="text-sm text-gray-400">
          네트워크 오류가 발생했습니다. 다시 시도해주세요.
        </p>
        {onRetry && (
          <Button variant="outline" color="neutral" size="md" onClick={onRetry}>
            다시 시도
          </Button>
        )}
      </div>
    );
  }

  if (type === 'no-results') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
        <Search size={48} className="text-gray-300" />
        <p className="text-sm font-semibold text-gray-900">
          검색 결과가 없습니다
        </p>
        <p className="text-sm text-gray-400">
          &apos;{query}&apos;에 해당하는 연계지를 찾을 수 없습니다.
        </p>
        {onClearSearch && (
          <Button
            variant="outline"
            color="neutral"
            size="md"
            onClick={onClearSearch}
          >
            검색어 초기화
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
      <Building2 size={48} className="text-gray-300" />
      <p className="text-sm font-semibold text-gray-900">
        등록된 연계지가 없습니다
      </p>
      <p className="text-sm text-gray-400">연결된 연계지가 아직 없습니다.</p>
      {isAdmin && onCreateClick && (
        <Button
          variant="filled"
          color="primary"
          size="md"
          onClick={onCreateClick}
        >
          + 연계지 등록
        </Button>
      )}
    </div>
  );
}
