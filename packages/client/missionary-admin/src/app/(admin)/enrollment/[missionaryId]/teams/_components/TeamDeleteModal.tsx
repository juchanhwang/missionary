'use client';

import { Button } from '@samilhero/design-system';
import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';
import Modal from 'react-modal';

import { useDeleteTeam } from '../_hooks/useDeleteTeam';

import type { Team } from 'apis/team';

interface TeamDeleteModalProps {
  isOpen: boolean;
  close: (deleted: boolean) => void;
  team: Team;
  memberCount: number;
}

/**
 * 팀 삭제 확인 모달. fe-plan v1.2 §3-1, ui-spec §5, mockup Screen 5.
 *
 * 분기:
 * - `memberCount > 0`: 경고 박스 ("N명이 미배치 상태로 돌아갑니다")
 * - `memberCount === 0`: "삭제한 팀은 복구할 수 없습니다" 설명만
 *
 * `useDeleteTeam`은 성공 시 participations 캐시를 invalidate하므로
 * 칸반 보드가 자동으로 미배치 사이드바에 멤버를 반영한다.
 */
export function TeamDeleteModal({
  isOpen,
  close,
  team,
  memberCount,
}: TeamDeleteModalProps) {
  const deleteTeam = useDeleteTeam();
  const hasMembers = memberCount > 0;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body');
    }
  }, []);

  const handleDelete = () => {
    deleteTeam.mutate(team.id, {
      onSuccess: () => close(true),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        if (!deleteTeam.isPending) close(false);
      }}
      contentLabel="팀 삭제"
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
      shouldCloseOnEsc={!deleteTeam.isPending}
      shouldCloseOnOverlayClick={!deleteTeam.isPending}
    >
      <div
        data-testid="team-delete-modal"
        className="bg-white rounded-xl border border-gray-50 w-full max-w-sm flex flex-col p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-delete-modal-title"
      >
        <div className="flex items-center justify-between mb-3">
          <h2
            id="team-delete-modal-title"
            className="text-base font-bold text-gray-900"
          >
            팀 삭제
          </h2>
          <button
            type="button"
            onClick={() => close(false)}
            disabled={deleteTeam.isPending}
            aria-label="닫기"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-sm text-gray-700 mb-3">
          &lsquo;{team.teamName}&rsquo;을(를) 삭제하시겠습니까?
        </p>

        {hasMembers ? (
          <div
            data-testid="team-delete-warning"
            className="mb-5 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3"
          >
            <AlertTriangle
              size={15}
              className="shrink-0 mt-0.5 text-amber-600"
              aria-hidden
            />
            <p className="text-xs text-amber-700">
              배치된 <strong>{memberCount}명</strong>이 미배치 상태로
              돌아갑니다.
            </p>
          </div>
        ) : (
          <p className="mb-5 text-xs text-gray-400">
            삭제한 팀은 복구할 수 없습니다.
          </p>
        )}

        <div className="flex gap-2.5 justify-end">
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="md"
            onClick={() => close(false)}
            disabled={deleteTeam.isPending}
          >
            취소
          </Button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteTeam.isPending}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            삭제
          </button>
        </div>
      </div>
    </Modal>
  );
}
