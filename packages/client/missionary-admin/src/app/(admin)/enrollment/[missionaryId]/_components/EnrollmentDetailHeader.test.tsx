import { render, screen } from 'test/test-utils';

import { EnrollmentDetailHeader } from './EnrollmentDetailHeader';

import type { EnrollmentMissionSummary } from 'apis/enrollment';

const MISSIONARY_ID = 'missionary-1';

vi.mock('lib/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', role: 'ADMIN', email: '', provider: '' },
  }),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ missionaryId: MISSIONARY_ID }),
}));

function createMission(
  overrides: Partial<EnrollmentMissionSummary> = {},
): EnrollmentMissionSummary {
  return {
    id: MISSIONARY_ID,
    name: '여름 선교',
    order: 1,
    category: 'DOMESTIC',
    status: 'IN_PROGRESS',
    enrollmentDeadline: null,
    missionStartDate: '2026-07-01',
    missionEndDate: '2026-07-15',
    maximumParticipantCount: null,
    currentParticipantCount: 3,
    paidCount: 1,
    managerName: null,
    missionGroupId: null,
    missionGroupName: null,
    isAcceptingResponses: true,
    closedMessage: null,
    ...overrides,
  };
}

describe('EnrollmentDetailHeader', () => {
  it('"팀 관리" 버튼이 teams 서브 라우트를 가리킨다', () => {
    render(<EnrollmentDetailHeader mission={createMission()} />);

    const teamLink = screen.getByRole('link', { name: /팀 관리/ });
    expect(teamLink).toHaveAttribute(
      'href',
      `/enrollment/${MISSIONARY_ID}/teams`,
    );
  });

  it('"등록 폼 관리" 버튼이 form-builder 서브 라우트를 가리킨다', () => {
    render(<EnrollmentDetailHeader mission={createMission()} />);

    const formLink = screen.getByRole('link', { name: /등록 폼 관리/ });
    expect(formLink).toHaveAttribute(
      'href',
      `/enrollment/${MISSIONARY_ID}/form-builder`,
    );
  });

  it('breadcrumb에 차수명이 표시된다', () => {
    render(
      <EnrollmentDetailHeader mission={createMission({ name: '겨울 선교' })} />,
    );

    expect(
      screen.getByRole('heading', { name: '겨울 선교' }),
    ).toBeInTheDocument();
  });
});
