'use client';

import { overlay } from '@samilhero/design-system';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import Modal from 'react-modal';
import { toast } from 'sonner';

import { MissionaryRegionForm } from './MissionaryRegionForm';
import { useCreateMissionaryRegion } from '../../_hooks/useCreateMissionaryRegion';
import { useUpdateMissionaryRegion } from '../../_hooks/useUpdateMissionaryRegion';

import type { MissionaryRegionFormValues } from '../../_schemas/missionaryRegionSchema';
import type { RegionListItem } from 'apis/missionaryRegion';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  close: (confirmed: boolean) => void;
}

function UnsavedChangesModal({ isOpen, close }: UnsavedChangesModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => close(false)}
      contentLabel="변경사항 확인"
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 z-[60] bg-black/30 flex items-center justify-center"
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
    >
      <div className="bg-white rounded-xl border border-gray-50 p-6 max-w-sm w-full">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          변경사항이 있습니다
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          저장하지 않은 변경사항이 있습니다. 그래도 닫으시겠습니까?
        </p>
        <div className="flex gap-3 justify-end">
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
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            나가기
          </button>
        </div>
      </div>
    </Modal>
  );
}

interface MissionaryRegionFormModalProps {
  mode: 'create' | 'edit';
  isOpen: boolean;
  close: (result: boolean) => void;
  region?: RegionListItem;
  defaultMissionGroupId?: string;
  defaultMissionaryId?: string;
}

export function MissionaryRegionFormModal({
  mode,
  isOpen,
  close,
  region,
  defaultMissionGroupId,
  defaultMissionaryId,
}: MissionaryRegionFormModalProps) {
  const createMutation = useCreateMissionaryRegion();
  const updateMutation = useUpdateMissionaryRegion();
  const isDirtyRef = useRef(false);

  const isCreate = mode === 'create';
  const isPending = isCreate
    ? createMutation.isPending
    : updateMutation.isPending;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body');
    }
  }, []);

  const handleDirtyChange = (dirty: boolean) => {
    isDirtyRef.current = dirty;
  };

  const requestClose = async () => {
    if (!isDirtyRef.current) {
      close(false);
      return;
    }

    const confirmed = await overlay.openAsync<boolean>(
      ({ isOpen: modalOpen, close: modalClose, unmount }) => (
        <UnsavedChangesModal
          isOpen={modalOpen}
          close={(result) => {
            modalClose(result);
            setTimeout(unmount, 300);
          }}
        />
      ),
    );

    if (confirmed) {
      close(false);
    }
  };

  const handleSubmit = (data: MissionaryRegionFormValues) => {
    const { missionaryId } = data;
    const rest = data;
    const payload = {
      name: rest.name,
      pastorName: rest.pastorName || undefined,
      pastorPhone: rest.pastorPhone || undefined,
      addressBasic: rest.addressBasic || undefined,
      addressDetail: rest.addressDetail || undefined,
    };

    if (isCreate) {
      createMutation.mutate(
        { missionaryId, data: payload },
        {
          onSuccess: () => {
            toast.success('연계지가 등록되었습니다');
            close(true);
          },
          onError: () => {
            toast.error('연계지 등록에 실패했습니다');
          },
        },
      );
    } else if (region) {
      updateMutation.mutate(
        {
          missionaryId: region.missionaryId,
          regionId: region.id,
          data: { ...payload, missionaryId: missionaryId || undefined },
        },
        {
          onSuccess: () => {
            toast.success('연계지 정보가 수정되었습니다');
            close(true);
          },
          onError: () => {
            toast.error('연계지 수정에 실패했습니다');
          },
        },
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={requestClose}
      contentLabel={isCreate ? '연계지 등록' : '연계지 수정'}
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
      shouldCloseOnEsc={!isPending}
      shouldCloseOnOverlayClick={!isPending}
    >
      <div
        className="bg-white rounded-xl border border-gray-50 w-full flex flex-col max-h-[90vh]"
        style={{ maxWidth: 480 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="region-modal-title"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2
            id="region-modal-title"
            className="text-lg font-bold text-gray-900"
          >
            {isCreate ? '연계지 등록' : '연계지 수정'}
          </h2>
          <button
            type="button"
            onClick={requestClose}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <MissionaryRegionForm
          mode={mode}
          region={region}
          defaultMissionGroupId={defaultMissionGroupId}
          defaultMissionaryId={defaultMissionaryId}
          onSubmit={handleSubmit}
          onCancel={requestClose}
          onDirtyChange={handleDirtyChange}
          isPending={isPending}
        />
      </div>
    </Modal>
  );
}
