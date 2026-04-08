import { findParticipationInTeams } from './findParticipationInTeams';

import type { GroupedParticipations } from '../types';
import type { Announcements, ScreenReaderInstructions } from '@dnd-kit/core';
import type { Team } from 'apis/team';

/**
 * dnd-kit 스크린리더 한국어 안내. fe-plan v1.2 §10.
 * 기본값은 영문이라 한국어 UI와 튀므로 동일한 의미의 한글 문구로 대체한다.
 * 참고: https://docs.dndkit.com/api-documentation/context-provider/accessibility
 */
export const KANBAN_SCREEN_READER_INSTRUCTIONS: ScreenReaderInstructions = {
  draggable:
    '드래그 가능한 항목에 포커스한 뒤 스페이스 또는 엔터를 눌러 잡으세요. 방향키로 이동하고, 다시 스페이스나 엔터를 눌러 놓을 수 있습니다. 취소하려면 Esc를 누르세요.',
};

/**
 * dnd-kit draggable id(`participation-p-1`)를 참가자 이름으로 변환한다.
 * 내부 ID가 그대로 스크린리더에 노출되지 않도록 한다. fe-plan §10.
 */
function createResolveParticipationName(
  grouped: GroupedParticipations,
): (id: string) => string {
  return (id) => {
    const participationId = stripPrefix(id, 'participation-');
    const found =
      grouped.unassigned.find((p) => p.id === participationId) ??
      findParticipationInTeams(grouped.byTeamId, participationId);
    return found?.name ?? '참가자';
  };
}

/**
 * dnd-kit droppable id(`team-t-1` 또는 `unassigned`)를 드롭 영역 이름으로 변환한다.
 */
function createResolveDropAreaName(teams: Team[]): (id: string) => string {
  return (id) => {
    if (id === 'unassigned') return '미배치 영역';
    const teamId = stripPrefix(id, 'team-');
    const team = teams.find((t) => t.id === teamId);
    return team ? `${team.teamName} 팀` : '팀';
  };
}

function stripPrefix(value: string, prefix: string): string {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

/**
 * 한국어 스크린리더 안내 팩토리. dnd-kit 내부 ID가 아닌
 * 참가자 이름/팀 이름을 읽어주도록 팀/그룹 데이터를 주입받아 클로저로 lookup을 구성한다.
 *
 * @example
 * <DndContext accessibility={{ announcements: buildKanbanAnnouncements(teams, grouped) }}>
 */
export function buildKanbanAnnouncements(
  teams: Team[],
  grouped: GroupedParticipations,
): Announcements {
  const resolveParticipationName = createResolveParticipationName(grouped);
  const resolveDropAreaName = createResolveDropAreaName(teams);

  return {
    onDragStart({ active }) {
      return `${resolveParticipationName(String(active.id))} 항목을 잡았습니다.`;
    },
    onDragOver({ active, over }) {
      const name = resolveParticipationName(String(active.id));
      if (over) {
        return `${name} 항목이 ${resolveDropAreaName(String(over.id))} 위에 있습니다.`;
      }
      return `${name} 항목이 드롭 영역 밖으로 이동했습니다.`;
    },
    onDragEnd({ active, over }) {
      const name = resolveParticipationName(String(active.id));
      if (over) {
        return `${name} 항목을 ${resolveDropAreaName(String(over.id))} 위에 놓았습니다.`;
      }
      return `${name} 항목을 놓았습니다.`;
    },
    onDragCancel({ active }) {
      return `${resolveParticipationName(String(active.id))} 항목 드래그가 취소되었습니다.`;
    },
  };
}
