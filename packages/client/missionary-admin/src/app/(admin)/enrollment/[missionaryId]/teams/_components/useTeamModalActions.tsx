'use client';

import { overlay } from '@samilhero/design-system';

import { TeamCreateModal } from './TeamCreateModal';
import { TeamDeleteModal } from './TeamDeleteModal';
import { TeamEditModal } from './TeamEditModal';

import type { RegionListItem } from 'apis/missionaryRegion';
import type { Participation } from 'apis/participation';
import type { Team } from 'apis/team';

/**
 * overlay-kit unmount 지연 시간 — 닫힘 애니메이션이 끝난 뒤 DOM에서 제거.
 * 디자인 시스템 모달 fade-out 트랜지션이 약 200~250ms이므로 여유 50ms 추가.
 */
const MODAL_UNMOUNT_DELAY_MS = 300;

interface UseTeamModalActionsParams {
  missionaryId: string;
  /** 모달이 참가자 선택 UI를 그릴 때 사용한다. */
  participations: Participation[];
  /** 연계지 셀렉트 옵션. 데이터 패칭은 `useTeamManagementData`가 담당. */
  regions: RegionListItem[];
}

interface UseTeamModalActionsReturn {
  openCreateModal: () => void;
  openEditModal: (team: Team) => void;
  openDeleteModal: (team: Team, memberCount: number) => void;
}

/**
 * 팀 생성/수정/삭제 모달 오픈 핸들러 묶음. fe-plan v1.2 §3-2.
 *
 * 책임:
 * - `overlay.openAsync<boolean>` 호출과 close/unmount 패턴 캡슐화
 * - 세 모달이 공유하는 `participations`/`regions`/`missionaryId`를 한 곳에서 주입
 *
 * 데이터 패칭과 모달 호출 책임을 분리하기 위해 `regions`/`participations`는
 * 외부에서 prop으로 받는다.
 */
export function useTeamModalActions({
  missionaryId,
  participations,
  regions,
}: UseTeamModalActionsParams): UseTeamModalActionsReturn {
  const openCreateModal = () => {
    overlay.openAsync<boolean>(({ isOpen, close, unmount }) => (
      <TeamCreateModal
        isOpen={isOpen}
        close={(result) => {
          close(result);
          setTimeout(unmount, MODAL_UNMOUNT_DELAY_MS);
        }}
        missionaryId={missionaryId}
        participations={participations}
        regions={regions}
      />
    ));
  };

  const openEditModal = (team: Team) => {
    overlay.openAsync<boolean>(({ isOpen, close, unmount }) => (
      <TeamEditModal
        isOpen={isOpen}
        close={(result) => {
          close(result);
          setTimeout(unmount, MODAL_UNMOUNT_DELAY_MS);
        }}
        team={team}
        participations={participations}
        regions={regions}
      />
    ));
  };

  const openDeleteModal = (team: Team, memberCount: number) => {
    overlay.openAsync<boolean>(({ isOpen, close, unmount }) => (
      <TeamDeleteModal
        isOpen={isOpen}
        close={(result) => {
          close(result);
          setTimeout(unmount, MODAL_UNMOUNT_DELAY_MS);
        }}
        team={team}
        memberCount={memberCount}
      />
    ));
  };

  return {
    openCreateModal,
    openEditModal,
    openDeleteModal,
  };
}
