import { http, HttpResponse } from 'msw';
import { server } from 'test/mocks/server';
import { renderHook, waitFor } from 'test/test-utils';

import { useGetMissionGroup } from './useGetMissionGroup';

describe('useGetMissionGroup', () => {
  it('ID가 있으면 그룹 상세를 조회한다', async () => {
    const { result } = renderHook(() => useGetMissionGroup('group-1'));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(
      expect.objectContaining({
        id: 'group-1',
        name: '필리핀 선교',
        category: 'ABROAD',
      }),
    );
  });

  it('빈 ID면 쿼리를 실행하지 않는다', () => {
    const { result } = renderHook(() => useGetMissionGroup(''));

    expect(result.current.isFetching).toBe(false);
  });

  it('API 에러 시 에러 상태를 반환한다', async () => {
    server.use(
      http.get('http://localhost/mission-groups/:id', () =>
        HttpResponse.json({ message: 'Not Found' }, { status: 404 }),
      ),
    );

    const { result } = renderHook(() => useGetMissionGroup('invalid-id'));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
