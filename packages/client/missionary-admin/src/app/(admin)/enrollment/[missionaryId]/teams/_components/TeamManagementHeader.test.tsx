import { render, screen } from 'test/test-utils';

import { TeamManagementHeader } from './TeamManagementHeader';

import type { EnrollmentMissionSummary } from 'apis/enrollment';

function createMission(
  overrides: Partial<EnrollmentMissionSummary> = {},
): EnrollmentMissionSummary {
  return {
    id: 'missionary-1',
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

describe('TeamManagementHeader', () => {
  it('breadcrumb 링크가 등록 상세 페이지를 가리킨다', () => {
    render(<TeamManagementHeader mission={createMission()} />);

    const link = screen.getByRole('link', { name: /여름 선교/ });
    expect(link).toHaveAttribute('href', '/enrollment/missionary-1');
  });

  it('breadcrumb에 "팀 관리" 텍스트가 표시된다', () => {
    render(<TeamManagementHeader mission={createMission()} />);

    const breadcrumbSpan = screen.getByText('팀 관리', {
      selector: 'span',
    });
    expect(breadcrumbSpan).toBeInTheDocument();
  });

  it('타이틀에 차수명과 "팀 관리"가 함께 표시된다', () => {
    render(
      <TeamManagementHeader mission={createMission({ name: '겨울 선교' })} />,
    );

    expect(
      screen.getByRole('heading', { name: '겨울 선교 · 팀 관리' }),
    ).toBeInTheDocument();
  });

  it('다른 missionaryId에 대해 올바른 href를 생성한다', () => {
    render(
      <TeamManagementHeader
        mission={createMission({ id: 'mission-abc', name: 'ABC 선교' })}
      />,
    );

    const link = screen.getByRole('link', { name: /ABC 선교/ });
    expect(link).toHaveAttribute('href', '/enrollment/mission-abc');
  });
});
