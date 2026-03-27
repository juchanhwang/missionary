'use client';

import { overlay } from '@samilhero/design-system';
import { PANEL_TRANSITION_MS } from 'components/ui/SidePanel';
import { useDebounce } from 'hooks/useDebounce';
import { useAuth } from 'lib/auth/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { BulkApproveModal } from './BulkApproveModal';
import { EnrollmentDetailHeader } from './EnrollmentDetailHeader';
import { EnrollmentSummaryCard } from './EnrollmentSummaryCard';
import { EnrollmentToolbar } from './EnrollmentToolbar';
import { AttendanceOptionManager } from './form-builder/AttendanceOptionManager';
import { FormBuilderSection } from './form-builder/FormBuilderSection';
import { ParticipantPanel } from './panel/ParticipantPanel';
import { ParticipantTable } from './ParticipantTable';
import { useBulkApprovePayment } from '../_hooks/useBulkApprovePayment';
import { useGetAttendanceOptions } from '../_hooks/useGetAttendanceOptions';
import { useGetMissionEnrollmentSummary } from '../_hooks/useGetMissionEnrollmentSummary';
import { useGetParticipations } from '../_hooks/useGetParticipations';
import { useTogglePayment } from '../_hooks/useTogglePayment';
import { downloadCsv } from '../_utils/csvDownload';

import type {
  EnrollmentMissionSummary,
  MissionEnrollmentSummary,
} from 'apis/enrollment';
import type {
  AttendanceOption,
  FormFieldDefinition,
  PaginatedParticipationsResponse,
} from 'apis/participation';

const PAGE_SIZE = 20;

interface EnrollmentDetailPageProps {
  mission: EnrollmentMissionSummary;
  initialParticipations: PaginatedParticipationsResponse;
  initialEnrollmentSummary: MissionEnrollmentSummary;
  formFields: FormFieldDefinition[];
  attendanceOptions: AttendanceOption[];
}

export function EnrollmentDetailPage({
  mission,
  initialParticipations,
  initialEnrollmentSummary,
  formFields,
  attendanceOptions: initialAttendanceOptions,
}: EnrollmentDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';

  // URL searchParams 기반 필터
  const isPaidFilter = searchParams.get('isPaid') ?? '';
  const attendanceTypeFilter = searchParams.get('attendanceType') ?? '';
  const currentPage = Number(searchParams.get('page') ?? '1');
  const selectedParticipantId = searchParams.get('participantId');

  // 패널 마운트 상태 (애니메이션용)
  const [mountedParticipantId, setMountedParticipantId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (selectedParticipantId) {
      setMountedParticipantId(selectedParticipantId);
    }
  }, [selectedParticipantId]);

  // 로컬 상태
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [isCsvDownloading, setIsCsvDownloading] = useState(false);

  // 참석 옵션 (클라이언트 갱신용)
  const { data: attendanceOptions = initialAttendanceOptions } =
    useGetAttendanceOptions({
      missionaryId: mission.id,
      initialData: initialAttendanceOptions,
    });

  // 등록 통계
  const { data: enrollmentSummary } = useGetMissionEnrollmentSummary({
    missionaryId: mission.id,
    initialData: initialEnrollmentSummary,
  });

  // attendanceType 검증
  const validAttendanceType =
    attendanceTypeFilter === 'FULL' || attendanceTypeFilter === 'PARTIAL'
      ? attendanceTypeFilter
      : undefined;

  // 데이터 훅
  const { data, isLoading } = useGetParticipations({
    params: {
      missionaryId: mission.id,
      limit: PAGE_SIZE,
      offset: (currentPage - 1) * PAGE_SIZE,
      isPaid:
        isPaidFilter === 'true'
          ? true
          : isPaidFilter === 'false'
            ? false
            : undefined,
      attendanceType: validAttendanceType,
      query: debouncedSearchQuery || undefined,
    },
    initialData: initialParticipations,
  });

  const togglePayment = useTogglePayment();
  const bulkApprove = useBulkApprovePayment();

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // URL 업데이트 헬퍼
  const updateSearchParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/enrollment/${mission.id}?${params.toString()}`);
  };

  const handleIsPaidFilterChange = (value?: string | string[] | null) => {
    const strValue = typeof value === 'string' ? value : '';
    updateSearchParams({ isPaid: strValue, page: '' });
    setCheckedIds(new Set());
  };

  const handleAttendanceTypeFilterChange = (
    value?: string | string[] | null,
  ) => {
    const strValue = typeof value === 'string' ? value : '';
    updateSearchParams({ attendanceType: strValue, page: '' });
    setCheckedIds(new Set());
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page > 1 ? String(page) : '' });
    setCheckedIds(new Set());
  };

  const handleRowClick = (id: string) => {
    updateSearchParams({ participantId: id });
  };

  const handlePanelClose = () => {
    updateSearchParams({ participantId: '' });
  };

  const handlePanelExited = () => {
    setMountedParticipantId(null);
  };

  const handlePanelNavigate = (id: string) => {
    updateSearchParams({ participantId: id });
  };

  const handleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCheckAll = () => {
    const items = data?.data ?? [];
    const allChecked = items.every((p) => checkedIds.has(p.id));
    if (allChecked) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(items.map((p) => p.id)));
    }
  };

  const handleTogglePayment = (id: string, isPaid: boolean) => {
    togglePayment.mutate({ id, isPaid });
  };

  const handleBulkApprove = async () => {
    const ids = Array.from(checkedIds);
    const confirmed = await overlay.openAsync<boolean>(
      ({ isOpen, close, unmount }) => (
        <BulkApproveModal
          isOpen={isOpen}
          close={(result) => {
            close(result);
            setTimeout(unmount, PANEL_TRANSITION_MS);
          }}
          count={ids.length}
        />
      ),
    );

    if (confirmed) {
      bulkApprove.mutate(ids, {
        onSuccess: () => setCheckedIds(new Set()),
      });
    }
  };

  const handleCsvDownload = async () => {
    setIsCsvDownloading(true);
    try {
      await downloadCsv(mission.id, `${mission.name}_등록자`);
    } catch {
      toast.error('CSV 다운로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsCsvDownloading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0">
      <div className="flex flex-col flex-1 p-8 gap-5 min-h-0">
        <EnrollmentDetailHeader
          missionName={mission.name}
          status={mission.status}
        />

        {isAdmin && <AttendanceOptionManager missionaryId={mission.id} />}

        {enrollmentSummary && (
          <EnrollmentSummaryCard summary={enrollmentSummary} />
        )}

        <EnrollmentToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isPaidFilter={isPaidFilter}
          onIsPaidFilterChange={handleIsPaidFilterChange}
          attendanceTypeFilter={attendanceTypeFilter}
          onAttendanceTypeFilterChange={handleAttendanceTypeFilterChange}
          selectedCount={checkedIds.size}
          onBulkApprove={handleBulkApprove}
          onCsvDownload={handleCsvDownload}
          isCsvDownloading={isCsvDownloading}
        />

        <ParticipantTable
          data={data}
          isLoading={isLoading}
          selectedParticipantId={selectedParticipantId}
          checkedIds={checkedIds}
          showCheckbox={isAdmin}
          customFields={formFields}
          onCheck={handleCheck}
          onCheckAll={handleCheckAll}
          onClick={handleRowClick}
          onTogglePayment={handleTogglePayment}
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />

        {/* ADMIN 전용: 폼 빌더 */}
        {isAdmin && <FormBuilderSection missionaryId={mission.id} />}
      </div>

      {/* 등록자 상세 패널 */}
      {mountedParticipantId && (
        <ParticipantPanel
          key={mountedParticipantId}
          participantId={mountedParticipantId}
          participants={data?.data ?? []}
          attendanceOptions={attendanceOptions}
          formFields={formFields}
          missionName={mission.name}
          isOpen={!!selectedParticipantId}
          onClose={handlePanelClose}
          onExited={handlePanelExited}
          onNavigate={handlePanelNavigate}
        />
      )}
    </div>
  );
}
