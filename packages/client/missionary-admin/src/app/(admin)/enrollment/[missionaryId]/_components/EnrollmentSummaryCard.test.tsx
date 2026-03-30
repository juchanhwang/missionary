import { createMockMissionEnrollmentSummary } from 'test/mocks/data';
import { render, screen } from 'test/test-utils';

import { EnrollmentSummaryCard } from './EnrollmentSummaryCard';

const TEST_MISSIONARY_ID = 'test-missionary-id';

describe('EnrollmentSummaryCard', () => {
  it('총 신청 수를 렌더링한다', () => {
    const summary = createMockMissionEnrollmentSummary({
      totalParticipants: 42,
    });

    render(
      <EnrollmentSummaryCard
        missionaryId={TEST_MISSIONARY_ID}
        initialData={summary}
      />,
    );

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('총 신청')).toBeInTheDocument();
  });

  it('납부완료 수를 렌더링한다', () => {
    const summary = createMockMissionEnrollmentSummary({ paidCount: 25 });

    render(
      <EnrollmentSummaryCard
        missionaryId={TEST_MISSIONARY_ID}
        initialData={summary}
      />,
    );

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('납부완료')).toBeInTheDocument();
  });

  it('미납 수를 렌더링한다', () => {
    const summary = createMockMissionEnrollmentSummary({ unpaidCount: 17 });

    render(
      <EnrollmentSummaryCard
        missionaryId={TEST_MISSIONARY_ID}
        initialData={summary}
      />,
    );

    expect(screen.getByText('17')).toBeInTheDocument();
    expect(screen.getByText('미납')).toBeInTheDocument();
  });

  it('정원이 있을 때 정원 대비 퍼센트를 표시한다', () => {
    const summary = createMockMissionEnrollmentSummary({
      totalParticipants: 30,
      maxParticipants: 50,
    });

    render(
      <EnrollmentSummaryCard
        missionaryId={TEST_MISSIONARY_ID}
        initialData={summary}
      />,
    );

    expect(screen.getByText(/정원 대비/)).toBeInTheDocument();
    expect(screen.getByText(/30 \/ 50명/)).toBeInTheDocument();
    expect(screen.getByText(/60%/)).toBeInTheDocument();
  });

  it('정원이 없을 때 정원 대비를 표시하지 않는다', () => {
    const summary = createMockMissionEnrollmentSummary({
      maxParticipants: null,
    });

    render(
      <EnrollmentSummaryCard
        missionaryId={TEST_MISSIONARY_ID}
        initialData={summary}
      />,
    );

    expect(screen.queryByText(/정원 대비/)).not.toBeInTheDocument();
  });

  it('참가자가 0명일 때 납부율과 미납률을 0%로 표시한다', () => {
    const summary = createMockMissionEnrollmentSummary({
      totalParticipants: 0,
      paidCount: 0,
      unpaidCount: 0,
    });

    render(
      <EnrollmentSummaryCard
        missionaryId={TEST_MISSIONARY_ID}
        initialData={summary}
      />,
    );

    const percentTexts = screen.getAllByText(/0%/);
    expect(percentTexts.length).toBeGreaterThanOrEqual(2);
  });
});
