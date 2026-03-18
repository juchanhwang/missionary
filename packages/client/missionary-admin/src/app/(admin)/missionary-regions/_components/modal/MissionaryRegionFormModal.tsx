'use client';

import { overlay } from '@samilhero/design-system';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'sonner';

import { MissionaryRegionForm } from './MissionaryRegionForm';
import { useCreateMissionaryRegion } from '../../_hooks/useCreateMissionaryRegion';
import { useUpdateMissionaryRegion } from '../../_hooks/useUpdateMissionaryRegion';

import type { MissionaryRegionFormValues } from '../../_schemas/missionaryRegionSchema';
import type { MissionaryRegion } from 'apis/missionaryRegion';

interface MissionaryRegionFormModalProps {
  isOpen: boolean;
  close: () => void;
  mode: 'create' | 'edit';
  missionaryId: number;
  region?: MissionaryRegion;
}

export function MissionaryRegionFormModal({
  isOpen,
  close,
  mode,
  missionaryId,
  region,
}: MissionaryRegionFormModalProps) {
  const [isDirty, setIsDirty] = useState(false);
  const createMutation = useCreateMissionaryRegion(missionaryId);
  const updateMutation = useUpdateMissionaryRegion(
    missionaryId,
    region?.id ?? 0,
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body');
    }
  }, []);

  const handleSubmit = async (data: MissionaryRegionFormValues) => {
    if (mode === 'create') {
      await createMutation.mutateAsync(data);
      toast.success('연계지가 등록되었습니다');
    } else {
      await updateMutation.mutateAsync(data);
      toast.success('연계지 정보가 수정되었습니다');
    }
    close();
  };

  const handleCancel = async () => {
    if (isDirty) {
      const confirmed = await overlay.openAsync<boolean>(
        ({ isOpen: innerOpen, close: innerClose, unmount }) => (
          <UnsavedChangesInner
            isOpen={innerOpen}
            close={(result: boolean) => {
              innerClose(result);
              setTimeout(unmount, 200);
            }}
          />
        ),
      );
      if (!confirmed) return;
    }
    close();
  };

  const defaultValues = region
    ? {
        name: region.name,
        visitPurpose: region.visitPurpose ?? '',
        pastorName: region.pastorName ?? '',
        pastorPhone: region.pastorPhone ?? '',
        addressBasic: region.addressBasic ?? '',
        addressDetail: region.addressDetail ?? '',
      }
    : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCancel}
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black/30 flex items-center justify-center"
    >
      <div className="w-full max-w-[480px] rounded-xl border border-gray-50 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? '연계지 등록' : '연계지 수정'}
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <MissionaryRegionForm
          mode={mode}
          defaultValues={defaultValues}
          isPending={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onDirtyChange={setIsDirty}
        />
      </div>
    </Modal>
  );
}

// 미저장 변경사항 확인 내부 모달
function UnsavedChangesInner({
  isOpen,
  close,
}: {
  isOpen: boolean;
  close: (result: boolean) => void;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body');
    }
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => close(false)}
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black/30 flex items-center justify-center"
      style={{ overlay: { zIndex: 60 } }}
    >
      <div className="w-full max-w-sm rounded-xl border border-gray-50 bg-white p-6 shadow-lg">
        <h3 className="mb-2 text-base font-semibold text-gray-900">
          저장하지 않은 변경사항
        </h3>
        <p className="mb-6 text-sm text-gray-500">
          저장하지 않은 변경사항이 있습니다. 나가시겠습니까?
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => close(false)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            계속 편집
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            나가기
          </button>
        </div>
      </div>
    </Modal>
  );
}
