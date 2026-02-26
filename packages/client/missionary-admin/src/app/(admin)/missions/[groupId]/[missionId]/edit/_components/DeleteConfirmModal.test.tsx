import { render, screen } from 'test/test-utils';
import { vi } from 'vitest';

import { DeleteConfirmModal } from './DeleteConfirmModal';

describe('DeleteConfirmModal', () => {
  const mockClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('삭제 확인 메시지와 선교명을 표시한다', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        close={mockClose}
        missionaryName="1차 필리핀 선교"
      />,
    );

    expect(screen.getByText('선교 삭제')).toBeInTheDocument();
    expect(screen.getByText(/1차 필리핀 선교/)).toBeInTheDocument();
  });

  it('삭제 버튼을 클릭하면 close(true)를 호출한다', async () => {
    const { user } = render(
      <DeleteConfirmModal
        isOpen={true}
        close={mockClose}
        missionaryName="1차 필리핀 선교"
      />,
    );

    await user.click(
      screen.getByRole('button', { name: '삭제', hidden: true }),
    );

    expect(mockClose).toHaveBeenCalledWith(true);
  });

  it('취소 버튼을 클릭하면 close(false)를 호출한다', async () => {
    const { user } = render(
      <DeleteConfirmModal
        isOpen={true}
        close={mockClose}
        missionaryName="1차 필리핀 선교"
      />,
    );

    await user.click(
      screen.getByRole('button', { name: '취소', hidden: true }),
    );

    expect(mockClose).toHaveBeenCalledWith(false);
  });

  it('isPending일 때 버튼이 비활성화된다', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        close={mockClose}
        missionaryName="1차 필리핀 선교"
        isPending={true}
      />,
    );

    expect(
      screen.getByRole('button', { name: '삭제', hidden: true }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: '취소', hidden: true }),
    ).toBeDisabled();
  });

  it('isOpen이 false면 모달 내용이 보이지 않는다', () => {
    render(
      <DeleteConfirmModal
        isOpen={false}
        close={mockClose}
        missionaryName="1차 필리핀 선교"
      />,
    );

    expect(screen.queryByText('선교 삭제')).not.toBeInTheDocument();
  });
});
