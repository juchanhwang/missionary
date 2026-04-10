import { render, screen } from 'test/test-utils';
import { vi } from 'vitest';

import { DragOverlayCard } from './DragOverlayCard';

import type { DropData } from './types';
import type { Participation } from 'apis/participation';
import type { Team } from 'apis/team';

const useDndContextMock = vi.fn();

vi.mock('@dnd-kit/core', () => ({
  useDndContext: () => useDndContextMock(),
}));

function createParticipation(
  overrides: Partial<Participation> = {},
): Participation {
  return {
    id: 'p-1',
    name: '박민수',
    birthDate: '2000-01-01',
    applyFee: null,
    isPaid: false,
    identificationNumber: null,
    isOwnCar: false,
    missionaryId: 'missionary-1',
    userId: 'user-1',
    teamId: null,
    team: null,
    createdAt: '2026-04-01T00:00:00.000Z',
    affiliation: '청년부',
    attendanceOptionId: 'att-1',
    attendanceOption: null,
    cohort: 8,
    hasPastParticipation: null,
    isCollegeStudent: null,
    formAnswers: [],
    ...overrides,
  };
}

function createTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: 'team-1',
    teamName: '1팀',
    leaderUserId: 'user-1',
    leaderUserName: '홍길동',
    missionaryId: 'missionary-1',
    churchId: null,
    missionaryRegionId: null,
    missionaryRegion: null,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
    ...overrides,
  };
}

function setOver(data: DropData | null) {
  useDndContextMock.mockReturnValue({
    over: data === null ? null : { id: 'mock', data: { current: data } },
  });
}

describe('DragOverlayCard', () => {
  beforeEach(() => {
    useDndContextMock.mockReset();
  });

  it('호버 타깃이 없으면 drag label을 렌더하지 않는다', () => {
    setOver(null);

    render(
      <DragOverlayCard
        participation={createParticipation()}
        teams={[createTeam()]}
      />,
    );

    expect(screen.getByText('박민수')).toBeInTheDocument();
    expect(screen.queryByTestId('drag-overlay-label')).not.toBeInTheDocument();
  });

  it('팀 위에 호버 중이면 "→ {팀명}" 라벨을 표시한다', () => {
    setOver({ type: 'team', teamId: 'team-1' });

    render(
      <DragOverlayCard
        participation={createParticipation()}
        teams={[createTeam({ id: 'team-1', teamName: '2팀' })]}
      />,
    );

    expect(screen.getByTestId('drag-overlay-label')).toHaveTextContent('→ 2팀');
  });

  it('미배치 영역 위에 호버 중이면 "→ 미배치" 라벨을 표시한다', () => {
    setOver({ type: 'unassigned' });

    render(
      <DragOverlayCard participation={createParticipation()} teams={[]} />,
    );

    expect(screen.getByTestId('drag-overlay-label')).toHaveTextContent(
      '→ 미배치',
    );
  });

  it('호버 중인 teamId가 teams에 없으면 라벨을 렌더하지 않는다', () => {
    setOver({ type: 'team', teamId: 'team-unknown' });

    render(
      <DragOverlayCard
        participation={createParticipation()}
        teams={[createTeam({ id: 'team-1' })]}
      />,
    );

    expect(screen.queryByTestId('drag-overlay-label')).not.toBeInTheDocument();
  });
});
