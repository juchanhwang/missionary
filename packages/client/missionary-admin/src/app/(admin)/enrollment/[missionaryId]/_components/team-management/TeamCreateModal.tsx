'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';
import Modal from 'react-modal';

import { TeamForm } from './TeamForm';
import { useCreateTeam } from '../../_hooks/useCreateTeam';

import type { TeamFormValues } from './_schemas/teamSchema';
import type { RegionListItem } from 'apis/missionaryRegion';
import type { Participation } from 'apis/participation';

interface TeamCreateModalProps {
  isOpen: boolean;
  close: (created: boolean) => void;
  missionaryId: string;
  participations: Participation[];
  regions: RegionListItem[];
}

/**
 * 팀 생성 모달. fe-plan v1.2 §3-1, ui-spec §5, mockup Screen 3.
 *
 * 호출 패턴: `overlay.openAsync<boolean>(({ isOpen, close, unmount }) => ...)`
 * 성공 시 `close(true)`, 취소 시 `close(false)`.
 *
 * 폼 상태는 `TeamForm`이 관리하고, 이 컴포넌트는 mutation + 모달 shell만 담당.
 */
export function TeamCreateModal({
  isOpen,
  close,
  missionaryId,
  participations,
  regions,
}: TeamCreateModalProps) {
  const createTeam = useCreateTeam();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body');
    }
  }, []);

  const handleSubmit = (values: TeamFormValues) => {
    const leader = participations.find((p) => p.userId === values.leaderUserId);
    if (!leader) return;

    createTeam.mutate(
      {
        missionaryId,
        teamName: values.teamName.trim(),
        leaderUserId: leader.userId,
        leaderUserName: leader.name,
        missionaryRegionId: values.missionaryRegionId || undefined,
      },
      {
        onSuccess: () => close(true),
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        if (!createTeam.isPending) close(false);
      }}
      contentLabel="팀 추가"
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
      shouldCloseOnEsc={!createTeam.isPending}
      shouldCloseOnOverlayClick={!createTeam.isPending}
    >
      <div
        className="bg-white rounded-xl border border-gray-50 w-full max-w-sm flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-create-modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <h2
            id="team-create-modal-title"
            className="text-base font-bold text-gray-900"
          >
            팀 추가
          </h2>
          <button
            type="button"
            onClick={() => close(false)}
            disabled={createTeam.isPending}
            aria-label="닫기"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed"
          >
            <X size={16} />
          </button>
        </div>

        <TeamForm
          mode="create"
          defaultValues={{
            teamName: '',
            leaderUserId: '',
            missionaryRegionId: '',
          }}
          participations={participations}
          regions={regions}
          isPending={createTeam.isPending}
          onSubmit={handleSubmit}
          onCancel={() => close(false)}
        />
      </div>
    </Modal>
  );
}
