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

  it('aria-label에 이름·기수·소속이 포함된다', () => {
    render(<TeamMemberCard participation={createParticipation()} />);

    expect(screen.getByTestId('team-member-card-p-1')).toHaveAttribute(
      'aria-label',
      '홍길동, 12기 · 대학부, 팀 멤버 드래그 가능',
    );
  });

  it('서브텍스트가 없으면 aria-label에 이름만 포함된다', () => {
    render(
      <TeamMemberCard
        participation={createParticipation({ cohort: 0, affiliation: '' })}
      />,
    );

    expect(screen.getByTestId('team-member-card-p-1')).toHaveAttribute(
      'aria-label',
      '홍길동, 팀 멤버 드래그 가능',
    );
  });

  describe('isLeader', () => {
    it('팀장일 때 "팀장" 배지를 렌더한다', () => {
      render(<TeamMemberCard participation={createParticipation()} isLeader />);

      expect(
        screen.getByTestId('team-member-card-p-1-leader-badge'),
      ).toHaveTextContent('팀장');
    });

    it('팀장일 때 Crown 아이콘을 렌더한다 (GripVertical 대신)', () => {
      render(<TeamMemberCard participation={createParticipation()} isLeader />);

      expect(
        screen.getByTestId('team-member-card-p-1-leader-icon'),
      ).toBeInTheDocument();
    });

    it('팀장이 아니면 "팀장" 배지나 Crown 아이콘을 렌더하지 않는다', () => {
      render(<TeamMemberCard participation={createParticipation()} />);

      expect(
        screen.queryByTestId('team-member-card-p-1-leader-badge'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('team-member-card-p-1-leader-icon'),
      ).not.toBeInTheDocument();
    });

    it('팀장일 때 aria-label에 "팀장, 드래그 불가"가 포함된다', () => {
      render(<TeamMemberCard participation={createParticipation()} isLeader />);

      expect(screen.getByTestId('team-member-card-p-1')).toHaveAttribute(
        'aria-label',
        '홍길동, 12기 · 대학부, 팀장, 드래그 불가',
      );
    });

    it('팀장일 때 cursor-default 클래스를 가진다 (드래그 커서 아님)', () => {
      render(<TeamMemberCard participation={createParticipation()} isLeader />);

      const card = screen.getByTestId('team-member-card-p-1');
      expect(card.className).toContain('cursor-default');
      expect(card.className).not.toContain('cursor-grab');
    });
  });
});
