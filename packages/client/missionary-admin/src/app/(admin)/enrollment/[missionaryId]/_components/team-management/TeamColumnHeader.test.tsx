import { render, screen } from 'test/test-utils';

import { TeamColumnHeader } from './TeamColumnHeader';

import type { Team } from 'apis/team';

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

describe('TeamColumnHeader', () => {
  it('previewCount가 없으면 기본 인원 수만 표시한다', () => {
    render(<TeamColumnHeader team={createTeam()} memberCount={3} />);

    expect(screen.getByTestId('team-member-count-team-1')).toHaveTextContent(
      '3명',
    );
    expect(
      screen.queryByTestId('team-member-count-preview-team-1'),
    ).not.toBeInTheDocument();
  });

  it('previewCount가 memberCount와 다르면 미리보기 배지를 표시한다', () => {
    render(
      <TeamColumnHeader team={createTeam()} memberCount={3} previewCount={4} />,
    );

    const preview = screen.getByTestId('team-member-count-preview-team-1');
    expect(preview).toBeInTheDocument();
    expect(preview).toHaveTextContent('3 → 4명');
    // 동시 노출 방지: 기본 카운트 testid는 사라진다.
    expect(
      screen.queryByTestId('team-member-count-team-1'),
    ).not.toBeInTheDocument();
  });

  it('previewCount === memberCount면 미리보기를 표시하지 않는다 (재배치 깜박임 방지)', () => {
    render(
      <TeamColumnHeader team={createTeam()} memberCount={3} previewCount={3} />,
    );

    expect(screen.getByTestId('team-member-count-team-1')).toHaveTextContent(
      '3명',
    );
    expect(
      screen.queryByTestId('team-member-count-preview-team-1'),
    ).not.toBeInTheDocument();
  });
});
