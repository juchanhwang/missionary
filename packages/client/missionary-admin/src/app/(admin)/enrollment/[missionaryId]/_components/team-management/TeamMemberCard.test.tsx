import { render, screen } from 'test/test-utils';

import { TeamMemberCard } from './TeamMemberCard';

import type { Participation } from 'apis/participation';

function createParticipation(
  overrides: Partial<Participation> = {},
): Participation {
  return {
    id: 'p-1',
    name: '홍길동',
    birthDate: '2000-01-01',
    applyFee: null,
    isPaid: false,
    identificationNumber: null,
    isOwnCar: false,
    missionaryId: 'missionary-1',
    userId: 'user-1',
    teamId: 'team-1',
    team: null,
    createdAt: '2026-04-01T00:00:00.000Z',
    affiliation: '대학부',
    attendanceOptionId: 'att-1',
    attendanceOption: null,
    cohort: 12,
    hasPastParticipation: null,
    isCollegeStudent: null,
    formAnswers: [],
    ...overrides,
  };
}

describe('TeamMemberCard', () => {
  it('이름과 기수·소속을 렌더한다', () => {
    render(<TeamMemberCard participation={createParticipation()} />);

    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('12기 · 대학부')).toBeInTheDocument();
    expect(screen.getByTestId('team-member-card-p-1')).toBeInTheDocument();
  });

  it('cohort·affiliation이 모두 없으면 서브텍스트 영역을 생략한다', () => {
    render(
      <TeamMemberCard
        participation={createParticipation({ cohort: 0, affiliation: '' })}
      />,
    );

    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.queryByText(/기 ·/)).not.toBeInTheDocument();
  });

  it('cohort만 있으면 "N기"만 표시한다', () => {
    render(
      <TeamMemberCard
        participation={createParticipation({ cohort: 5, affiliation: '' })}
      />,
    );

    expect(screen.getByText('5기')).toBeInTheDocument();
  });
});
