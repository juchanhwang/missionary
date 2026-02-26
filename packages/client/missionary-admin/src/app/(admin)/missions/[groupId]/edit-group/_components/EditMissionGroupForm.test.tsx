import { http, HttpResponse } from 'msw';
import { useParams, useRouter } from 'next/navigation';
import { createMockMissionGroupDetail } from 'test/mocks/data';
import { server } from 'test/mocks/server';
import { render, screen, waitFor } from 'test/test-utils';
import { vi } from 'vitest';

import { EditMissionGroupForm } from './EditMissionGroupForm';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useParams: vi.fn(),
}));

const mockGroup = createMockMissionGroupDetail({
  id: 'group-1',
  name: '필리핀 선교',
  category: 'ABROAD',
  description: '여름 단기선교',
});

describe('EditMissionGroupForm', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useParams).mockReturnValue({ groupId: 'group-1' });

    server.use(
      http.get('http://localhost/mission-groups/group-1', () =>
        HttpResponse.json(mockGroup),
      ),
    );
  });

  it('기존 그룹 데이터를 불러와 폼에 표시한다', async () => {
    render(<EditMissionGroupForm />);

    await waitFor(() => {
      expect(screen.getByLabelText('선교 그룹명')).toHaveValue('필리핀 선교');
    });
    expect(screen.getByLabelText('설명')).toHaveValue('여름 단기선교');
    expect(screen.getByText('해외')).toBeInTheDocument();
  });

  it('제목에 그룹명을 표시한다', async () => {
    render(<EditMissionGroupForm />);

    expect(await screen.findByText('선교 그룹 수정')).toBeInTheDocument();
    expect(screen.getByText('필리핀 선교')).toBeInTheDocument();
  });

  it('그룹을 찾을 수 없으면 안내 메시지를 표시한다', async () => {
    server.use(
      http.get('http://localhost/mission-groups/group-1', () =>
        HttpResponse.json({ message: 'Not Found' }, { status: 404 }),
      ),
    );

    render(<EditMissionGroupForm />);

    expect(
      await screen.findByText('그룹을 찾을 수 없습니다'),
    ).toBeInTheDocument();
  });

  it('데이터를 수정하고 제출하면 상세 페이지로 이동한다', async () => {
    const { user } = render(<EditMissionGroupForm />);

    await waitFor(() => {
      expect(screen.getByLabelText('선교 그룹명')).toHaveValue('필리핀 선교');
    });

    const nameInput = screen.getByLabelText('선교 그룹명');
    await user.clear(nameInput);
    await user.type(nameInput, '태국 선교');
    await user.click(screen.getByRole('button', { name: '수정하기' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/missions/group-1');
    });
  });

  it('취소 버튼을 클릭하면 상세 페이지로 이동한다', async () => {
    const { user } = render(<EditMissionGroupForm />);

    await screen.findByText('선교 그룹 수정');
    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(mockPush).toHaveBeenCalledWith('/missions/group-1');
  });

  it('폼이 변경되지 않으면 수정하기 버튼이 비활성화된다', async () => {
    render(<EditMissionGroupForm />);

    await waitFor(() => {
      expect(screen.getByLabelText('선교 그룹명')).toHaveValue('필리핀 선교');
    });

    expect(screen.getByRole('button', { name: '수정하기' })).toBeDisabled();
  });
});
