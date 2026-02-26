import { http, HttpResponse } from 'msw';
import { useParams, useRouter } from 'next/navigation';
import {
  createMockMissionary,
  createMockMissionGroupDetail,
} from 'test/mocks/data';
import { server } from 'test/mocks/server';
import { render, screen, waitFor } from 'test/test-utils';
import { vi } from 'vitest';

import { CreateMissionForm } from './CreateMissionForm';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));

describe('CreateMissionForm', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useParams).mockReturnValue({ groupId: 'group-1' });
  });

  it('기존 선교 차수를 기반으로 다음 차수와 이름을 자동 설정한다', async () => {
    server.use(
      http.get('http://localhost/mission-groups/group-1', () =>
        HttpResponse.json(
          createMockMissionGroupDetail({
            id: 'group-1',
            name: '필리핀 선교',
            missionaries: [
              createMockMissionary({ id: 'm-1', order: 1 }),
              createMockMissionary({ id: 'm-2', order: 2 }),
            ],
          }),
        ),
      ),
    );

    render(<CreateMissionForm />);

    await waitFor(() => {
      expect(screen.getByLabelText('선교 이름')).toHaveValue('3차 필리핀 선교');
    });
    expect(screen.getByLabelText('차수')).toHaveValue(3);
  });

  it('기존 선교가 없으면 1차로 설정한다', async () => {
    server.use(
      http.get('http://localhost/mission-groups/group-1', () =>
        HttpResponse.json(
          createMockMissionGroupDetail({
            id: 'group-1',
            name: '태국 선교',
            missionaries: [],
          }),
        ),
      ),
    );

    render(<CreateMissionForm />);

    await waitFor(() => {
      expect(screen.getByLabelText('선교 이름')).toHaveValue('1차 태국 선교');
    });
    expect(screen.getByLabelText('차수')).toHaveValue(1);
  });

  it('제목에 그룹명을 포함한 설명을 표시한다', async () => {
    server.use(
      http.get('http://localhost/mission-groups/group-1', () =>
        HttpResponse.json(
          createMockMissionGroupDetail({
            id: 'group-1',
            name: '필리핀 선교',
          }),
        ),
      ),
    );

    render(<CreateMissionForm />);

    expect(await screen.findByText('선교 생성')).toBeInTheDocument();
    expect(
      screen.getByText('필리핀 선교 그룹에 새로운 선교를 추가합니다'),
    ).toBeInTheDocument();
  });

  it('그룹을 찾을 수 없으면 안내 메시지를 표시한다', async () => {
    server.use(
      http.get('http://localhost/mission-groups/group-1', () =>
        HttpResponse.json({ message: 'Not Found' }, { status: 404 }),
      ),
    );

    render(<CreateMissionForm />);

    expect(
      await screen.findByText('그룹을 찾을 수 없습니다'),
    ).toBeInTheDocument();
  });

  it('취소 버튼을 클릭하면 상세 페이지로 이동한다', async () => {
    server.use(
      http.get('http://localhost/mission-groups/group-1', () =>
        HttpResponse.json(createMockMissionGroupDetail({ id: 'group-1' })),
      ),
    );

    const { user } = render(<CreateMissionForm />);

    await screen.findByText('선교 생성');
    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(mockPush).toHaveBeenCalledWith('/missions/group-1');
  });

  it('필수 필드가 비어있으면 에러 메시지를 표시한다', async () => {
    server.use(
      http.get('http://localhost/mission-groups/group-1', () =>
        HttpResponse.json(createMockMissionGroupDetail({ id: 'group-1' })),
      ),
    );

    const { user } = render(<CreateMissionForm />);

    await screen.findByText('선교 생성');

    // 자동 설정된 이름을 지워서 빈 상태로 만든다
    const nameInput = screen.getByLabelText('선교 이름');
    await user.clear(nameInput);

    await user.click(screen.getByRole('button', { name: '생성하기' }));

    expect(
      await screen.findByText('선교 이름을 입력해주세요'),
    ).toBeInTheDocument();
  });
});
