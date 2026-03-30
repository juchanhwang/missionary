import { createMockEnrollmentSummary } from 'test/mocks/data';
import { render, screen } from 'test/test-utils';

import { MissionEnrollmentCard } from './MissionEnrollmentCard';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('MissionEnrollmentCard', () => {
  it('선교명을 렌더링한다', () => {
    const mission = createMockEnrollmentSummary({
      name: '2026 여름 단기선교',
    });

    render(<MissionEnrollmentCard mission={mission} />);

    expect(screen.getByText('2026 여름 단기선교')).toBeInTheDocument();
  });

  it('카테고리 배지를 렌더링한다 (해외)', () => {
    const mission = createMockEnrollmentSummary({ category: 'ABROAD' });

    render(<MissionEnrollmentCard mission={mission} />);

    expect(screen.getByText('해외')).toBeInTheDocument();
  });

  it('카테고리 배지를 렌더링한다 (국내)', () => {
    const mission = createMockEnrollmentSummary({ category: 'DOMESTIC' });

    render(<MissionEnrollmentCard mission={mission} />);

    expect(screen.getByText('국내')).toBeInTheDocument();
  });

  it('신청 현황을 렌더링한다', () => {
    const mission = createMockEnrollmentSummary({
      currentParticipantCount: 30,
      maximumParticipantCount: 50,
      paidCount: 20,
    });

    render(<MissionEnrollmentCard mission={mission} />);

    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText(/50명/)).toBeInTheDocument();
    expect(screen.getByText(/납부완료 20/)).toBeInTheDocument();
    expect(screen.getByText(/미납 10/)).toBeInTheDocument();
  });

  it('담당자명을 렌더링한다', () => {
    const mission = createMockEnrollmentSummary({ managerName: '김목사' });

    render(<MissionEnrollmentCard mission={mission} />);

    expect(screen.getByText('담당: 김목사')).toBeInTheDocument();
  });

  it('정원이 없을 때 퍼센트를 표시하지 않는다', () => {
    const mission = createMockEnrollmentSummary({
      maximumParticipantCount: null,
    });

    render(<MissionEnrollmentCard mission={mission} />);

    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('마감일이 없을 때 D-day 배지를 표시하지 않는다', () => {
    const mission = createMockEnrollmentSummary({
      enrollmentDeadline: null,
    });

    render(<MissionEnrollmentCard mission={mission} />);

    expect(screen.queryByText(/D-/)).not.toBeInTheDocument();
    expect(screen.queryByText('마감')).not.toBeInTheDocument();
  });

  it('마감일이 지났을 때 "마감" 배지를 표시한다', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const mission = createMockEnrollmentSummary({
      enrollmentDeadline: pastDate.toISOString(),
    });

    render(<MissionEnrollmentCard mission={mission} />);

    expect(screen.getByText('마감')).toBeInTheDocument();
  });

  it('링크가 올바른 경로로 연결된다', () => {
    const mission = createMockEnrollmentSummary({ id: 'mission-123' });

    render(<MissionEnrollmentCard mission={mission} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/enrollment/mission-123');
  });
});
