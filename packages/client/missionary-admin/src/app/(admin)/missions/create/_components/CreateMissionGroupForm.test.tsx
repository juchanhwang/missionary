import { http, HttpResponse } from 'msw';
import { useRouter } from 'next/navigation';
import { server } from 'test/mocks/server';
import { render, screen, waitFor } from 'test/test-utils';
import { vi } from 'vitest';

import { CreateMissionGroupForm } from './CreateMissionGroupForm';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('CreateMissionGroupForm', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof useRouter>);
  });

  it('제목과 설명 텍스트를 렌더링한다', () => {
    render(<CreateMissionGroupForm />);

    expect(screen.getByText('선교 그룹 생성')).toBeInTheDocument();
    expect(
      screen.getByText('새로운 선교 그룹을 생성합니다'),
    ).toBeInTheDocument();
  });

  it('생성하기 버튼과 취소 버튼이 존재한다', () => {
    render(<CreateMissionGroupForm />);

    expect(
      screen.getByRole('button', { name: '생성하기' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('유효한 데이터를 제출하면 그룹을 생성하고 목록으로 이동한다', async () => {
    const { user } = render(<CreateMissionGroupForm />);

    await user.type(screen.getByLabelText('선교 그룹명'), '필리핀 선교');
    await user.click(screen.getByRole('button', { name: '선교 유형 선택' }));
    await user.click(screen.getByText('해외'));
    await user.click(screen.getByRole('button', { name: '생성하기' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/missions');
    });
  });

  it('취소 버튼을 클릭하면 목록으로 이동한다', async () => {
    const { user } = render(<CreateMissionGroupForm />);

    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(mockPush).toHaveBeenCalledWith('/missions');
  });

  it('필수 필드가 비어있으면 에러 메시지를 표시하고 API를 호출하지 않는다', async () => {
    const { user } = render(<CreateMissionGroupForm />);

    await user.click(screen.getByRole('button', { name: '생성하기' }));

    expect(
      await screen.findByText('선교 그룹명을 입력해주세요'),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('API 에러 발생 시 페이지 이동 없이 에러를 로깅한다', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    server.use(
      http.post('http://localhost/mission-groups', () =>
        HttpResponse.json(
          { message: 'Internal Server Error' },
          { status: 500 },
        ),
      ),
    );

    const { user } = render(<CreateMissionGroupForm />);

    await user.type(screen.getByLabelText('선교 그룹명'), '필리핀 선교');
    await user.click(screen.getByRole('button', { name: '선교 유형 선택' }));
    await user.click(screen.getByText('해외'));
    await user.click(screen.getByRole('button', { name: '생성하기' }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    expect(mockPush).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
