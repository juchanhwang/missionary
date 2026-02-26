import { fireEvent } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import { render, screen, waitFor } from 'test/test-utils';
import { vi } from 'vitest';

import { useCreateMissionaryAction } from './_hooks/useCreateMissionaryAction';
import CreateMissionPage from './page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock('./_hooks/useCreateMissionaryAction', () => ({
  useCreateMissionaryAction: vi.fn(),
}));

describe('CreateMissionPage', () => {
  const mockMutate = vi.fn();
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof useRouter>);

    vi.mocked(useParams).mockReturnValue({ groupId: 'group-1' });

    vi.mocked(useCreateMissionaryAction).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateMissionaryAction>);
  });

  it('유효한 데이터를 제출하면 선교 생성 mutate를 호출한다', async () => {
    const { user } = render(<CreateMissionPage />);

    const nameInput = await screen.findByLabelText('선교 이름');
    const pastorInput = screen.getByLabelText('담당 교역자');

    await user.clear(nameInput);
    await user.type(nameInput, '2024 여름 단기선교');
    await user.type(pastorInput, '김목사');

    // DatePicker는 react-datepicker 특성상 fireEvent 사용
    const dateInputs = screen.getAllByPlaceholderText('YYYY-MM-DD');
    fireEvent.change(dateInputs[0], { target: { value: '2024-07-01' } });
    fireEvent.blur(dateInputs[0]);
    fireEvent.change(dateInputs[1], { target: { value: '2024-07-15' } });
    fireEvent.blur(dateInputs[1]);
    fireEvent.change(dateInputs[2], { target: { value: '2024-05-01' } });
    fireEvent.blur(dateInputs[2]);
    fireEvent.change(dateInputs[3], { target: { value: '2024-06-30' } });
    fireEvent.blur(dateInputs[3]);

    await user.click(screen.getByRole('button', { name: '생성하기' }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '2024 여름 단기선교',
          pastorName: '김목사',
        }),
        expect.any(Object),
      );
    });
  });

  it('isPending 상태일 때 버튼이 비활성화되고 "생성 중..." 텍스트를 표시한다', async () => {
    vi.mocked(useCreateMissionaryAction).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as unknown as ReturnType<typeof useCreateMissionaryAction>);

    render(<CreateMissionPage />);

    await screen.findByLabelText('선교 이름');

    const submitButton = screen.getByRole('button', { name: '생성 중...' });
    expect(submitButton).toBeDisabled();
  });

  it('DatePicker를 통해 날짜를 입력할 수 있다', async () => {
    render(<CreateMissionPage />);

    await screen.findByLabelText('선교 이름');

    const startDateInput = screen.getAllByPlaceholderText('YYYY-MM-DD')[0];

    fireEvent.change(startDateInput, { target: { value: '2024-07-01' } });
    fireEvent.blur(startDateInput);

    await waitFor(() => {
      expect(startDateInput).toHaveValue('2024-07-01');
    });
  });
});
