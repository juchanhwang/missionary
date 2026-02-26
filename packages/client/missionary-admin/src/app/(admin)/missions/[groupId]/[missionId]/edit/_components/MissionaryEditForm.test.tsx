import { useRouter } from 'next/navigation';
import { createMockMissionary } from 'test/mocks/data';
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

const MISSIONARY_OVERRIDES = { name: '1차 필리핀 선교' };

describe('MissionaryEditForm', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof useRouter>);
  });

  it('제목에 선교명을 표시한다', () => {
    render(
      <MissionaryEditForm
        missionary={createMockMissionary(MISSIONARY_OVERRIDES)}
      />,
    );

    expect(screen.getByText('선교 수정')).toBeInTheDocument();
    expect(screen.getByText('1차 필리핀 선교')).toBeInTheDocument();
  });

  it('기존 선교 데이터를 폼에 표시한다', () => {
    render(
      <MissionaryEditForm
        missionary={createMockMissionary(MISSIONARY_OVERRIDES)}
      />,
    );

    expect(screen.getByLabelText('선교 이름')).toHaveValue('1차 필리핀 선교');
    expect(screen.getByLabelText('담당 교역자')).toHaveValue('김목사');
    expect(screen.getByLabelText('차수')).toHaveValue(1);
  });

  it('폼이 변경되지 않으면 수정하기 버튼이 비활성화된다', () => {
    render(
      <MissionaryEditForm
        missionary={createMockMissionary(MISSIONARY_OVERRIDES)}
      />,
    );

    expect(screen.getByRole('button', { name: '수정하기' })).toBeDisabled();
  });

  it('취소 버튼을 클릭하면 그룹 상세로 이동한다', async () => {
    const { user } = render(
      <MissionaryEditForm
        missionary={createMockMissionary(MISSIONARY_OVERRIDES)}
      />,
    );

    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(mockPush).toHaveBeenCalledWith('/missions/group-1');
  });

  it('더보기 버튼이 존재한다', () => {
    render(
      <MissionaryEditForm
        missionary={createMockMissionary(MISSIONARY_OVERRIDES)}
      />,
    );

    expect(screen.getByRole('button', { name: '더보기' })).toBeInTheDocument();
  });
});
