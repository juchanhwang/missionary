'use client';

import { Button, SearchBox, Select } from '@samilhero/design-system';
import { useAuth } from 'lib/auth/AuthContext';
import { Check, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useEnrollmentUrl } from '../_hooks/useEnrollmentUrl';
import { downloadCsv } from '../_utils/csvDownload';

interface EnrollmentToolbarProps {
  missionaryId: string;
  missionName: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCount: number;
  onBulkApprove: () => void;
}

export function EnrollmentToolbar({
  missionaryId,
  missionName,
  searchQuery,
  onSearchChange,
  selectedCount,
  onBulkApprove,
}: EnrollmentToolbarProps) {
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';
  const { searchParams, updateSearchParams } = useEnrollmentUrl();

  // URL 기반 필터 상태 (직접 읽기/쓰기)
  const isPaidFilter = searchParams.get('isPaid') ?? '';
  const attendanceTypeFilter = searchParams.get('attendanceType') ?? '';

  // CSV 다운로드 상태
  const [isCsvDownloading, setIsCsvDownloading] = useState(false);

  const handleFilterChange = (
    key: string,
    value?: string | string[] | null,
  ) => {
    const strValue = typeof value === 'string' ? value : '';
    updateSearchParams({ [key]: strValue, page: '' });
  };

  const handleCsvDownload = async () => {
    setIsCsvDownloading(true);
    try {
      await downloadCsv(missionaryId, `${missionName}_등록자`);
    } catch {
      toast.error('CSV 다운로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsCsvDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="max-w-[200px]">
        <SearchBox
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="이름 검색..."
          size="sm"
        />
      </div>
      <Select
        value={isPaidFilter}
        onChange={(value) => handleFilterChange('isPaid', value)}
        className="w-28"
      >
        <Select.Trigger>
          {isPaidFilter === 'true'
            ? '납부완료'
            : isPaidFilter === 'false'
              ? '미납'
              : '납부 전체'}
        </Select.Trigger>
        <Select.Options>
          <Select.Option item="">납부 전체</Select.Option>
          <Select.Option item="true">납부완료</Select.Option>
          <Select.Option item="false">미납</Select.Option>
        </Select.Options>
      </Select>
      <Select
        value={attendanceTypeFilter}
        onChange={(value) => handleFilterChange('attendanceType', value)}
        className="w-28"
      >
        <Select.Trigger>
          {attendanceTypeFilter === 'FULL'
            ? '풀참석'
            : attendanceTypeFilter === 'PARTIAL'
              ? '옵션참여'
              : '참석 전체'}
        </Select.Trigger>
        <Select.Options>
          <Select.Option item="">참석 전체</Select.Option>
          <Select.Option item="FULL">풀참석</Select.Option>
          <Select.Option item="PARTIAL">옵션참여</Select.Option>
        </Select.Options>
      </Select>
      <Button
        variant="outline"
        color="neutral"
        size="sm"
        onClick={handleCsvDownload}
        disabled={isCsvDownloading}
      >
        {isCsvDownloading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Download size={14} />
        )}
        CSV
      </Button>
      {isAdmin && (
        <Button
          variant="filled"
          color="primary"
          size="sm"
          onClick={onBulkApprove}
          disabled={selectedCount === 0}
        >
          <Check size={14} />
          납부 승인{selectedCount > 0 ? ` (${selectedCount})` : ''}
        </Button>
      )}
    </div>
  );
}
