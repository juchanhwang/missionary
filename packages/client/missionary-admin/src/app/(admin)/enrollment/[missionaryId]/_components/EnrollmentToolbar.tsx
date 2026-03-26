'use client';

import { Button, SearchBox, Select } from '@samilhero/design-system';
import { useAuth } from 'lib/auth/AuthContext';
import { Download, Loader2 } from 'lucide-react';

interface EnrollmentToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isPaidFilter: string;
  onIsPaidFilterChange: (value: string) => void;
  attendanceTypeFilter: string;
  onAttendanceTypeFilterChange: (value: string) => void;
  selectedCount: number;
  onBulkApprove: () => void;
  onCsvDownload: () => void;
  isCsvDownloading: boolean;
}

export function EnrollmentToolbar({
  searchQuery,
  onSearchChange,
  isPaidFilter,
  onIsPaidFilterChange,
  attendanceTypeFilter,
  onAttendanceTypeFilterChange,
  selectedCount,
  onBulkApprove,
  onCsvDownload,
  isCsvDownloading,
}: EnrollmentToolbarProps) {
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <SearchBox
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="이름 검색"
          className="w-48"
        />
        <Select
          value={isPaidFilter}
          onChange={onIsPaidFilterChange}
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
          onChange={onAttendanceTypeFilterChange}
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
      </div>
      <div className="flex items-center gap-2">
        {isAdmin && selectedCount > 0 && (
          <Button
            variant="filled"
            color="primary"
            size="md"
            onClick={onBulkApprove}
          >
            납부 일괄 승인 ({selectedCount})
          </Button>
        )}
        <Button
          variant="outline"
          color="neutral"
          size="md"
          onClick={onCsvDownload}
          disabled={isCsvDownloading}
        >
          {isCsvDownloading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          CSV 다운로드
        </Button>
      </div>
    </div>
  );
}
