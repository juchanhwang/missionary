import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { missionGroupApi } from 'apis/missionGroup';
import { useRouter, useParams } from 'next/navigation';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useCreateMissionaryAction } from '../_hooks/useCreateMissionaryAction';
import CreateMissionPage from '../page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock('../_hooks/useCreateMissionaryAction', () => ({
  useCreateMissionaryAction: vi.fn(),
}));

vi.mock('apis/missionGroup', () => ({
  missionGroupApi: {
    getMissionGroup: vi.fn(),
  },
}));

describe('CreateMissionPage', () => {
  const mockMutate = vi.fn();
  const mockUseCreateMissionary = vi.mocked(useCreateMissionaryAction);
  const mockUseRouter = vi.mocked(useRouter);
  const mockUseParams = vi.mocked(useParams);
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    mockUseCreateMissionary.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    mockUseRouter.mockReturnValue({
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as any);

    mockUseParams.mockReturnValue({ groupId: '1' });

    vi.mocked(missionGroupApi.getMissionGroup).mockResolvedValue({
      data: {
        id: '1',
        title: '2024년 여름 선교',
        year: 2024,
        season: 'SUMMER',
        status: 'RECRUITING',
      },
    } as any);

    vi.clearAllMocks();
  });

  it('빈 폼을 제출하면 6개 필드의 에러 메시지를 표시한다', async () => {
    vi.mocked(missionGroupApi.getMissionGroup).mockResolvedValue({
      data: {
        id: '1',
        title: '2024년 여름 선교',
        year: 2024,
        season: 'SUMMER',
        status: 'RECRUITING',
      },
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <CreateMissionPage />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByText('불러오는 중...')).not.toBeInTheDocument();
    });

    const nameInput =
      await screen.findByPlaceholderText('선교 이름을 입력하세요');
    const pastorInput =
      screen.getByPlaceholderText('담당 교역자 이름을 입력하세요');

    fireEvent.change(nameInput, { target: { value: '2024 여름 단기선교' } });
    fireEvent.change(pastorInput, { target: { value: '김목사' } });

    const startDateInput = screen.getAllByPlaceholderText('YYYY-MM-DD')[0];
    const endDateInput = screen.getAllByPlaceholderText('YYYY-MM-DD')[1];
    const participationStartInput =
      screen.getAllByPlaceholderText('YYYY-MM-DD')[2];
    const participationEndInput =
      screen.getAllByPlaceholderText('YYYY-MM-DD')[3];

    fireEvent.change(startDateInput, { target: { value: '2024-07-01' } });
    fireEvent.blur(startDateInput);

    fireEvent.change(endDateInput, { target: { value: '2024-07-15' } });
    fireEvent.blur(endDateInput);

    fireEvent.change(participationStartInput, {
      target: { value: '2024-05-01' },
    });
    fireEvent.blur(participationStartInput);

    fireEvent.change(participationEndInput, {
      target: { value: '2024-06-30' },
    });
    fireEvent.blur(participationEndInput);

    const submitButton = await screen.findByRole('button', {
      name: '생성하기',
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '2024 여름 단기선교',
          pastorName: '김목사',
          startDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
          endDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
          participationStartDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
          participationEndDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        }),
        expect.any(Object),
      );
    });
  });

  it('isPending 상태일 때 버튼이 비활성화되고 "생성 중..." 텍스트를 표시한다', async () => {
    vi.mocked(missionGroupApi.getMissionGroup).mockResolvedValue({
      data: {
        id: '1',
        title: '2024년 여름 선교',
        year: 2024,
        season: 'SUMMER',
        status: 'RECRUITING',
      },
    } as any);

    mockUseCreateMissionary.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <CreateMissionPage />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByText('불러오는 중...')).not.toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: '생성 중...' });

    expect(submitButton).toBeDisabled();
  });

  it('DatePicker를 통해 날짜를 선택할 수 있다', async () => {
    vi.mocked(missionGroupApi.getMissionGroup).mockResolvedValue({
      data: {
        id: '1',
        title: '2024년 여름 선교',
        year: 2024,
        season: 'SUMMER',
        status: 'RECRUITING',
      },
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <CreateMissionPage />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByText('불러오는 중...')).not.toBeInTheDocument();
    });

    const startDateInput = screen.getAllByPlaceholderText('YYYY-MM-DD')[0];

    fireEvent.change(startDateInput, { target: { value: '2024-07-01' } });
    fireEvent.blur(startDateInput);

    await waitFor(() => {
      expect(startDateInput).toHaveValue('2024-07-01');
    });
  });
});
