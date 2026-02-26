import { type Missionary } from 'apis/missionary';
import { useRouter } from 'next/navigation';
import { render, screen } from 'test/test-utils';
import { vi } from 'vitest';

import { MissionaryEditForm } from './MissionaryEditForm';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('../_actions/missionaryActions', () => ({
  updateMissionaryAction: vi.fn(),
  deleteMissionaryAction: vi.fn(),
}));

function createMockMissionary(overrides: Partial<Missionary> = {}): Missionary {
  return {
    id: 'mission-1',
    name: '1차 필리핀 선교',
    startDate: '2024-07-01',
    endDate: '2024-07-15',
    participationStartDate: '2024-05-01',
    participationEndDate: '2024-06-30',
    pastorName: '김목사',
    status: 'ENROLLMENT_OPENED',
    order: 1,
    missionGroupId: 'group-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('MissionaryEditForm', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof useRouter>);
  });

  it('제목에 선교명을 표시한다', () => {
    render(<MissionaryEditForm missionary={createMockMissionary()} />);

    expect(screen.getByText('선교 수정')).toBeInTheDocument();
    expect(screen.getByText('1차 필리핀 선교')).toBeInTheDocument();
  });

  it('기존 선교 데이터를 폼에 표시한다', () => {
    render(<MissionaryEditForm missionary={createMockMissionary()} />);

    expect(screen.getByLabelText('선교 이름')).toHaveValue('1차 필리핀 선교');
    expect(screen.getByLabelText('담당 교역자')).toHaveValue('김목사');
    expect(screen.getByLabelText('차수')).toHaveValue(1);
  });

  it('폼이 변경되지 않으면 수정하기 버튼이 비활성화된다', () => {
    render(<MissionaryEditForm missionary={createMockMissionary()} />);

    expect(screen.getByRole('button', { name: '수정하기' })).toBeDisabled();
  });

  it('취소 버튼을 클릭하면 그룹 상세로 이동한다', async () => {
    const { user } = render(
      <MissionaryEditForm missionary={createMockMissionary()} />,
    );

    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(mockPush).toHaveBeenCalledWith('/missions/group-1');
  });

  it('더보기 버튼이 존재한다', () => {
    render(<MissionaryEditForm missionary={createMockMissionary()} />);

    expect(screen.getByRole('button', { name: '더보기' })).toBeInTheDocument();
  });
});
