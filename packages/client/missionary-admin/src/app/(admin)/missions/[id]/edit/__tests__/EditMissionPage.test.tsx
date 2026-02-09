import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams, useRouter } from 'next/navigation';
import { vi } from 'vitest';

import { useRegions } from '../../../hooks/useRegions';
import { useDeleteMissionary } from '../hooks/useDeleteMissionary';
import { useMissionary } from '../hooks/useMissionary';
import { useUpdateMissionary } from '../hooks/useUpdateMissionary';
import EditMissionPage from '../page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock('../hooks/useMissionary', () => ({
  useMissionary: vi.fn(),
}));

vi.mock('../hooks/useUpdateMissionary', () => ({
  useUpdateMissionary: vi.fn(),
}));

vi.mock('../hooks/useDeleteMissionary', () => ({
  useDeleteMissionary: vi.fn(),
}));

vi.mock('../../../hooks/useRegions', () => ({
  useRegions: vi.fn(),
}));

describe('EditMissionPage', () => {
  const mockRouter = { push: vi.fn() };
  const mockMutate = vi.fn();
  const mockDeleteMutate = vi.fn();

  const mockUseRouter = vi.mocked(useRouter);
  const mockUseParams = vi.mocked(useParams);
  const mockUseMissionary = vi.mocked(useMissionary);
  const mockUseUpdateMissionary = vi.mocked(useUpdateMissionary);
  const mockUseDeleteMissionary = vi.mocked(useDeleteMissionary);
  const mockUseRegions = vi.mocked(useRegions);

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseRouter.mockReturnValue(mockRouter);
    mockUseParams.mockReturnValue({ id: 'test-id' });

    mockUseMissionary.mockReturnValue({
      data: {
        id: 'test-id',
        name: '테스트 선교',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T00:00:00.000Z',
        pastorName: '김목사',
        regionId: 'region-1',
        participationStartDate: '2023-11-01T00:00:00.000Z',
        participationEndDate: '2023-11-30T00:00:00.000Z',
      },
      isLoading: false,
    } as any);

    mockUseUpdateMissionary.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    mockUseDeleteMissionary.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as any);

    mockUseRegions.mockReturnValue({
      data: [
        { id: 'region-1', name: '서울', type: 'DOMESTIC' },
        { id: 'region-2', name: '부산', type: 'DOMESTIC' },
      ],
    } as any);
  });

  it('API 데이터로 폼이 프리필된다', async () => {
    render(<EditMissionPage />);

    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('테스트 선교');
      expect(nameInput).toBeInTheDocument();

      const pastorNameInput = screen.getByDisplayValue('김목사');
      expect(pastorNameInput).toBeInTheDocument();

      const regionTrigger = screen.getByText('서울');
      expect(regionTrigger).toBeInTheDocument();

      const dateInputs = screen.getAllByPlaceholderText('YYYY-MM-DD');
      expect(dateInputs).toHaveLength(4);
    });
  });

  it('빈 이름으로 제출하면 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup();
    render(<EditMissionPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('테스트 선교')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('테스트 선교');
    await user.clear(nameInput);

    const submitButton = screen.getByRole('button', { name: /수정하기/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('선교 이름을 입력해주세요')).toBeInTheDocument();
    });
  });

  it('유효한 데이터를 제출하면 ISO 문자열 날짜로 mutate를 호출한다', async () => {
    const user = userEvent.setup();
    render(<EditMissionPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('테스트 선교')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /수정하기/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '테스트 선교',
          startDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
          endDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
          pastorName: '김목사',
          regionId: 'region-1',
          participationStartDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
          participationEndDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        }),
        expect.any(Object),
      );
    });
  });

  it('isPending 상태일 때 버튼이 비활성화되고 "수정 중..." 텍스트를 표시한다', async () => {
    mockUseUpdateMissionary.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as any);

    render(<EditMissionPage />);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /수정 중.../i });
      expect(button).toBeDisabled();
    });
  });

  it('로딩 상태일 때 "로딩 중..." 텍스트를 표시한다', () => {
    mockUseMissionary.mockReturnValue({
      data: null,
      isLoading: true,
    } as any);

    render(<EditMissionPage />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('삭제 버튼을 클릭하면 DeleteConfirmModal이 열린다', async () => {
    const user = userEvent.setup();
    render(<EditMissionPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('테스트 선교')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /삭제하기/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(
        screen.getByText(/정말.*선교를 삭제하시겠습니까/i),
      ).toBeInTheDocument();
    });
  });
});
