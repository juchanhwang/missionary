import 'server-only';

import { createServerApi } from './serverInstance';

import type {
  GetParticipationsParams,
  PaginatedParticipationsResponse,
} from './participation';

// React.cache()는 인수를 참조 동등성으로 비교하므로 객체 파라미터 함수에서는
// dedupe가 동작하지 않는다 (호출 측에서 새 객체 리터럴을 넘기는 한 매번 캐시 미스).
// 잘못된 신호를 두지 않기 위해 cache()를 적용하지 않는다.
export async function getServerParticipations(params: GetParticipationsParams) {
  const serverApi = await createServerApi();
  const { data } = await serverApi.get<PaginatedParticipationsResponse>(
    '/participations',
    { params },
  );
  return data;
}
