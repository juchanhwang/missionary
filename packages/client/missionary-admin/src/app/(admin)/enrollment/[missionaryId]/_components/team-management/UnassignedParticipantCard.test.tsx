import { render, screen } from 'test/test-utils';

import { UnassignedParticipantCard } from './UnassignedParticipantCard';

import type { Participation } from 'apis/participation';

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
    affiliation: '',
    attendanceOptionId: 'att-1',
    attendanceOption: null,
    cohort: 0,
    hasPastParticipation: null,
    isCollegeStudent: null,
    formAnswers: [],
    ...overrides,
  };
}

describe('UnassignedParticipantCard', () => {
  it('이름과 기수·소속을 렌더한다', () => {
    render(
      <UnassignedParticipantCard
        participation={createParticipation({
          cohort: 8,
          affiliation: '청년부',
        })}
      />,
    );

    expect(screen.getByText('박민수')).toBeInTheDocument();
    expect(screen.getByText('8기 · 청년부')).toBeInTheDocument();
    expect(screen.getByTestId('unassigned-card-p-1')).toBeInTheDocument();
  });

  it('메타 정보가 없으면 서브텍스트를 생략한다', () => {
    render(<UnassignedParticipantCard participation={createParticipation()} />);

    expect(screen.getByText('박민수')).toBeInTheDocument();
    expect(screen.queryByText(/기/)).not.toBeInTheDocument();
  });
});
