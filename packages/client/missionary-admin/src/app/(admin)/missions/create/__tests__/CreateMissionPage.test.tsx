import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { useRegions } from '../../hooks/useRegions';
import { useCreateMissionary } from '../hooks/useCreateMissionary';
import CreateMissionPage from '../page';

vi.mock('../hooks/useCreateMissionary', () => ({
  useCreateMissionary: vi.fn(),
}));

vi.mock('../../hooks/useRegions', () => ({
  useRegions: vi.fn(),
}));

describe('CreateMissionPage', () => {
  const mockMutate = vi.fn();
  const mockUseCreateMissionary = vi.mocked(useCreateMissionary);
  const mockUseRegions = vi.mocked(useRegions);

  beforeEach(() => {
    mockUseCreateMissionary.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    mockUseRegions.mockReturnValue({
      data: [
        { id: 'region-1', name: '서울', type: 'DOMESTIC' },
        { id: 'region-2', name: '부산', type: 'DOMESTIC' },
      ],
    } as any);

    vi.clearAllMocks();
  });

  it('빈 폼을 제출하면 7개 필드의 에러 메시지를 표시한다', async () => {
    render(<CreateMissionPage />);

    const submitButton = screen.getByRole('button', { name: '생성하기' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('선교 이름을 입력해주세요')).toBeInTheDocument();
    });

    expect(screen.getByText('선교 시작일을 선택해주세요')).toBeInTheDocument();
    expect(screen.getByText('선교 종료일을 선택해주세요')).toBeInTheDocument();
    expect(screen.getByText('담당 교역자를 입력해주세요')).toBeInTheDocument();
    expect(screen.getByText('지역을 선택해주세요')).toBeInTheDocument();
    expect(
      screen.getByText('참가 신청 시작일을 선택해주세요'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('참가 신청 종료일을 선택해주세요'),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('유효한 데이터를 제출하면 ISO 문자열 날짜로 mutate를 호출한다', async () => {
    render(<CreateMissionPage />);

    const nameInput = screen.getByPlaceholderText('선교 이름을 입력하세요');
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

    const selectTrigger = screen.getByText('지역을 선택하세요');
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      expect(screen.getByText('서울')).toBeInTheDocument();
    });

    const seoulOption = screen.getByText('서울');
    fireEvent.click(seoulOption);

    const submitButton = screen.getByRole('button', { name: '생성하기' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '2024 여름 단기선교',
          pastorName: '김목사',
          regionId: 'region-1',
          startDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
          endDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
          participationStartDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
          participationEndDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        }),
        expect.any(Object),
      );
    });
  });

  it('isPending 상태일 때 버튼이 비활성화되고 "생성 중..." 텍스트를 표시한다', () => {
    mockUseCreateMissionary.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as any);

    render(<CreateMissionPage />);

    const submitButton = screen.getByRole('button', { name: '생성 중...' });

    expect(submitButton).toBeDisabled();
  });

  it('Select를 통해 regionId를 선택할 수 있다', async () => {
    render(<CreateMissionPage />);

    const selectTrigger = screen.getByText('지역을 선택하세요');
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      expect(screen.getAllByText('부산').length).toBeGreaterThan(0);
    });

    const busanOptions = screen.getAllByText('부산');
    const busanOption = busanOptions[busanOptions.length - 1];
    fireEvent.click(busanOption);

    await waitFor(() => {
      const triggerButton = screen.getByRole('button', { name: '부산' });
      expect(triggerButton).toBeInTheDocument();
    });
  });

  it('DatePicker를 통해 날짜를 선택할 수 있다', async () => {
    render(<CreateMissionPage />);

    const startDateInput = screen.getAllByPlaceholderText('YYYY-MM-DD')[0];

    fireEvent.change(startDateInput, { target: { value: '2024-07-01' } });
    fireEvent.blur(startDateInput);

    await waitFor(() => {
      expect(startDateInput).toHaveValue('2024-07-01');
    });
  });
});
