'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';
import Modal from 'react-modal';

import { TeamForm } from './TeamForm';
import { useUpdateTeam } from '../../_hooks/useUpdateTeam';

import type { TeamFormValues } from './_schemas/teamSchema';
import type { RegionListItem } from 'apis/missionaryRegion';
import type { Participation } from 'apis/participation';
import type { Team } from 'apis/team';

interface TeamEditModalProps {
  isOpen: boolean;
  close: (updated: boolean) => void;
  team: Team;
  participations: Participation[];
  regions: RegionListItem[];
}

/**
 * 팀 수정 모달. fe-plan v1.2 §3-1, ui-spec §5, mockup Screen 4.
 *
 * `TeamForm`을 재사용하며 `defaultValues`에 기존 팀 정보를 주입한다.
 * 제출 시 `useUpdateTeam`이 `{ teamName, leaderUserId, leaderUserName, missionaryRegionId }`를 PATCH.
 */
export function TeamEditModal({
  isOpen,
  close,
  team,
  participations,
  regions,
}: TeamEditModalProps) {
  const updateTeam = useUpdateTeam();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body');
    }
  }, []);

  const handleSubmit = (values: TeamFormValues) => {
    const leader = participations.find((p) => p.userId === values.leaderUserId);
    if (!leader) return;

    updateTeam.mutate(
      {
        id: team.id,
        data: {
          teamName: values.teamName.trim(),
          leaderUserId: leader.userId,
          leaderUserName: leader.name,
          missionaryRegionId: values.missionaryRegionId || undefined,
        },
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
        if (!updateTeam.isPending) close(false);
      }}
      contentLabel="팀 수정"
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
      shouldCloseOnEsc={!updateTeam.isPending}
      shouldCloseOnOverlayClick={!updateTeam.isPending}
    >
      <div
        className="bg-white rounded-xl border border-gray-50 w-full max-w-sm flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-edit-modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <h2
            id="team-edit-modal-title"
            className="text-base font-bold text-gray-900"
          >
            팀 수정
          </h2>
          <button
            type="button"
            onClick={() => close(false)}
            disabled={updateTeam.isPending}
            aria-label="닫기"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed"
          >
            <X size={16} />
          </button>
        </div>

        <TeamForm
          mode="edit"
          defaultValues={{
            teamName: team.teamName,
            leaderUserId: team.leaderUserId,
            missionaryRegionId: team.missionaryRegionId ?? '',
          }}
          participations={participations}
          regions={regions}
          isPending={updateTeam.isPending}
          onSubmit={handleSubmit}
          onCancel={() => close(false)}
        />
      </div>
    </Modal>
  );
}
