import { http, HttpResponse } from 'msw';
import { server } from 'test/mocks/server';
import { renderHook, waitFor } from 'test/test-utils';

import { useGetMissionaries } from './useGetMissionaries';

describe('useGetMissionaries', () => {
  it('선교 목록을 조회한다', async () => {
    const { result } = renderHook(() => useGetMissionaries());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([
      expect.objectContaining({
        id: 'missionary-1',
        name: '1차 선교',
      }),
    ]);
  });

  it('API 에러 시 에러 상태를 반환한다', async () => {
    server.use(
      http.get('http://localhost/missionaries', () =>
        HttpResponse.json({ message: 'Server Error' }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useGetMissionaries());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
