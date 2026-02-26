import {
  createMockMissionary,
  createMockMissionGroupDetail,
} from 'test/mocks/data';
import { render, screen } from 'test/test-utils';
import { vi } from 'vitest';

import { MissionGroupDetail } from './MissionGroupDetail';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useParams: vi.fn(() => ({ groupId: 'group-1' })),
}));

vi.mock('next/link', () => ({
  default: (props: React.ComponentPropsWithRef<'a'>) => <a {...props} />,
}));

describe('MissionGroupDetail', () => {
  it('그룹명과 카테고리를 표시한다', () => {
    render(<MissionGroupDetail group={createMockMissionGroupDetail()} />);

    expect(screen.getByText('필리핀 선교')).toBeInTheDocument();
    expect(screen.getByText('해외')).toBeInTheDocument();
  });

  it('국내 그룹은 "국내" 카테고리 배지를 표시한다', () => {
    render(
      <MissionGroupDetail
        group={createMockMissionGroupDetail({ category: 'DOMESTIC' })}
      />,
    );

    expect(screen.getByText('국내')).toBeInTheDocument();
  });

  it('그룹 설명이 있으면 표시한다', () => {
    render(
      <MissionGroupDetail
        group={createMockMissionGroupDetail({
          description: '매년 여름 진행되는 단기선교',
        })}
      />,
    );

    expect(screen.getByText('매년 여름 진행되는 단기선교')).toBeInTheDocument();
  });

  it('선교가 없을 때 빈 상태를 표시한다', () => {
    render(<MissionGroupDetail group={createMockMissionGroupDetail()} />);

    expect(screen.getByText('등록된 선교가 없습니다')).toBeInTheDocument();
    expect(screen.getByText('0건')).toBeInTheDocument();
  });

  it('선교 목록을 테이블로 렌더링한다', () => {
    const group = createMockMissionGroupDetail({
      missionaries: [
        createMockMissionary({
          id: 'mission-1',
          name: '1차 필리핀 선교',
          order: 1,
          pastorName: '김목사',
          maximumParticipantCount: 30,
          status: 'ENROLLMENT_OPENED',
        }),
        createMockMissionary({
          id: 'mission-2',
          name: '2차 필리핀 선교',
          order: 2,
          status: 'COMPLETED',
        }),
      ],
    });

    render(<MissionGroupDetail group={group} />);

    expect(screen.getByText('1차 필리핀 선교')).toBeInTheDocument();
    expect(screen.getByText('2차 필리핀 선교')).toBeInTheDocument();
    expect(screen.getByText('2건')).toBeInTheDocument();
    expect(screen.getByText('30명')).toBeInTheDocument();
    expect(screen.getByText('모집중')).toBeInTheDocument();
    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('담당 교역자가 없으면 대시(—)를 표시한다', () => {
    const group = createMockMissionGroupDetail({
      missionaries: [createMockMissionary({ pastorName: '' })],
    });

    render(<MissionGroupDetail group={group} />);

    const dashElements = screen.getAllByText('—');

    expect(dashElements.length).toBeGreaterThanOrEqual(1);
  });

  it('"선교 추가" 버튼과 "그룹 수정" 버튼이 존재한다', () => {
    render(<MissionGroupDetail group={createMockMissionGroupDetail()} />);

    expect(
      screen.getByRole('button', { name: '선교 추가' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '그룹 수정' }),
    ).toBeInTheDocument();
  });
});
