'use client';

import { Button, Tooltip, overlay } from '@samilhero/design-system';
import { useAuth } from 'lib/auth/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { MissionaryRegionEmptyState } from './MissionaryRegionEmptyState';
import { MissionaryRegionTable } from './MissionaryRegionTable';
import { MissionarySelect } from './MissionarySelect';
import { DeleteMissionaryRegionModal } from './modal/DeleteMissionaryRegionModal';
import { MissionaryRegionFormModal } from './modal/MissionaryRegionFormModal';
import { useDeleteMissionaryRegion } from '../_hooks/useDeleteMissionaryRegion';
import { useGetMissionaryRegions } from '../_hooks/useGetMissionaryRegions';

import type { MissionaryRegion } from 'apis/missionaryRegion';

export function MissionaryRegionsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';
  const [, startTransition] = useTransition();

  const missionaryIdParam = searchParams.get('missionaryId');
  const missionaryId = missionaryIdParam ? Number(missionaryIdParam) : null;

  const {
    data: regions,
    isLoading,
    isError,
    refetch,
  } = useGetMissionaryRegions(missionaryId);

  const deleteMutation = useDeleteMissionaryRegion(missionaryId ?? 0);

  const handleMissionaryChange = (id: number | null) => {
    const params = new URLSearchParams();
    if (id !== null) {
      params.set('missionaryId', String(id));
    }
    const queryString = params.toString();
    startTransition(() => {
      router.push(
        queryString
          ? `/missionary-regions?${queryString}`
          : '/missionary-regions',
      );
    });
  };

  const handleCreate = () => {
    if (missionaryId === null) return;
    overlay.open(({ isOpen, close, unmount }) => (
      <MissionaryRegionFormModal
        isOpen={isOpen}
        close={() => {
          close();
          setTimeout(unmount, 200);
        }}
        mode="create"
        missionaryId={missionaryId}
      />
    ));
  };

  const handleEdit = (region: MissionaryRegion) => {
    if (missionaryId === null) return;
    overlay.open(({ isOpen, close, unmount }) => (
      <MissionaryRegionFormModal
        isOpen={isOpen}
        close={() => {
          close();
          setTimeout(unmount, 200);
        }}
        mode="edit"
        missionaryId={missionaryId}
        region={region}
      />
    ));
  };

  const handleDelete = async (region: MissionaryRegion) => {
    if (missionaryId === null) return;

    const confirmed = await overlay.openAsync<boolean>(
      ({ isOpen, close, unmount }) => (
        <DeleteMissionaryRegionModal
          isOpen={isOpen}
          close={(result: boolean) => {
            close(result);
            setTimeout(unmount, 200);
          }}
          regionName={region.name}
          isPending={false}
        />
      ),
    );

    if (confirmed) {
      await deleteMutation.mutateAsync(region.id);
      toast.success('연계지가 삭제되었습니다');
    }
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col p-8">
        <div className="mb-6 flex shrink-0 items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">연계지 관리</h1>
          {isAdmin &&
            (missionaryId === null ? (
              <Tooltip text="선교를 먼저 선택해주세요">
                <Button
                  variant="filled"
                  size="md"
                  disabled
                  onClick={handleCreate}
                >
                  + 연계지 등록
                </Button>
              </Tooltip>
            ) : (
              <Button variant="filled" size="md" onClick={handleCreate}>
                + 연계지 등록
              </Button>
            ))}
        </div>

        <div className="shrink-0">
          <MissionarySelect
            value={missionaryId}
            onChange={handleMissionaryChange}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex shrink-0 items-center border-b border-gray-200 px-5 py-3.5">
            <p className="text-sm font-semibold text-gray-900">
              연계지 목록
              {regions && (
                <span className="ml-1.5 text-xs font-normal text-gray-400">
                  {regions.length}건
                </span>
              )}
            </p>
          </div>

          {missionaryId === null ? (
            <MissionaryRegionEmptyState
              type="no-missionary"
              isAdmin={isAdmin}
            />
          ) : isError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <p className="text-sm text-red-500">
                연계지 목록을 불러오는 중 오류가 발생했습니다
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                다시 시도
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex-1 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="mb-3 h-12 animate-pulse rounded-md bg-gray-100"
                />
              ))}
            </div>
          ) : regions && regions.length > 0 ? (
            <MissionaryRegionTable
              regions={regions}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <MissionaryRegionEmptyState
              type="no-regions"
              isAdmin={isAdmin}
              onCreateClick={handleCreate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
