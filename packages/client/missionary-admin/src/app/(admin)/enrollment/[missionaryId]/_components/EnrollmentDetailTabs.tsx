'use client';

import { Tab } from '@samilhero/design-system';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createContext, useContext } from 'react';

import type { ReactNode } from 'react';

/**
 * 등록 상세 페이지의 탭 식별자.
 * - `participants`: 기존 참가자 명단/상세 패널 (기본값)
 * - `teams`: 신규 팀 관리 칸반 보드
 */
export type EnrollmentTabValue = 'participants' | 'teams';

interface EnrollmentDetailTabsContextValue {
  activeTab: EnrollmentTabValue;
}

const EnrollmentDetailTabsContext =
  createContext<EnrollmentDetailTabsContextValue | null>(null);

function useEnrollmentDetailTabsContext(consumer: string) {
  const ctx = useContext(EnrollmentDetailTabsContext);
  if (!ctx) {
    throw new Error(
      `<EnrollmentDetailTabs.${consumer}>는 <EnrollmentDetailTabs> 내부에서만 사용할 수 있습니다.`,
    );
  }
  return ctx;
}

const TAB_LIST: Array<{ value: string; label: string }> = [
  { value: 'participants', label: '참가자 목록' },
  { value: 'teams', label: '팀 관리' },
];

function isEnrollmentTabValue(value: string): value is EnrollmentTabValue {
  return value === 'participants' || value === 'teams';
}

function parseEnrollmentTabValue(value: string | null): EnrollmentTabValue {
  return value !== null && isEnrollmentTabValue(value) ? value : 'participants';
}

interface EnrollmentDetailTabsRootProps {
  children: ReactNode;
}

/**
 * 등록 상세 페이지의 탭 셸. fe-plan v1.2 §4-5.
 *
 * - 탭 상태(`'participants' | 'teams'`)만 관리하고 자식 패널은
 *   `<EnrollmentDetailTabs.Participants>` / `<EnrollmentDetailTabs.Teams>`
 *   compound 컴포넌트로 합성한다 (component-patterns.md §1).
 * - 양쪽 콘텐츠를 항상 마운트한 채 `display: none` 토글로만 전환한다 (R-10):
 *   탭 전환 시 입력값/스크롤 위치 유실을 방지하고, 미배치 카운트 등 양쪽
 *   탭에서 실시간 갱신이 필요한 데이터를 한 번의 fetch로 공유할 수 있다.
 * - URL 동기화는 하지 않는다 (브라우저 새로고침 시 항상 `participants`).
 */
function EnrollmentDetailTabsRoot({ children }: EnrollmentDetailTabsRootProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = parseEnrollmentTabValue(searchParams.get('tab'));

  const setActiveTab = (nextTab: EnrollmentTabValue) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', nextTab);
    const qs = params.toString();

    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <EnrollmentDetailTabsContext.Provider value={{ activeTab }}>
      <div className="flex flex-col flex-1 min-h-0">
        <Tab
          list={TAB_LIST}
          selectedValue={activeTab}
          onChange={(value) => {
            if (isEnrollmentTabValue(value)) {
              setActiveTab(value);
            }
          }}
          className="border-b border-gray-200"
        />

        {/*
          DS `Tab` 컴포넌트는 `<button role="tab">`에 id를 렌더하지 않는다
          (`design-system/src/components/tab/index.tsx`). 따라서 tabpanel을
          `aria-labelledby`로 탭 버튼에 연결할 수 없고, 대신 `aria-label`로
          패널 이름을 직접 지정한다.
        */}
        {/*
          탭 nav와 콘텐츠 사이 여백은 ui-spec §3-1 "콘텐츠 gap = gap-5 (20px)"에 맞춘다.
          mockup Screen 1은 부모(`p-8 flex flex-col gap-5`)의 직접 자식으로 탭과 콘텐츠를
          나란히 두지만, 코드는 EnrollmentDetailTabs를 sub-container로 분리했기 때문에
          부모 gap-5가 Tab → tabpanel 사이로 내려오지 못한다. 그래서 tabpanel 자체에서
          `pt-5`로 보정해 양쪽 탭 모두 일관된 20px 여백을 만든다.
        */}
        {children}
      </div>
    </EnrollmentDetailTabsContext.Provider>
  );
}

interface EnrollmentDetailTabsPanelProps {
  children: ReactNode;
}

function EnrollmentDetailTabsParticipants({
  children,
}: EnrollmentDetailTabsPanelProps) {
  const { activeTab } = useEnrollmentDetailTabsContext('Participants');
  return (
    <div
      role="tabpanel"
      aria-label="참가자 목록"
      hidden={activeTab !== 'participants'}
      className="flex flex-col flex-1 min-h-0 pt-5"
    >
      {children}
    </div>
  );
}

function EnrollmentDetailTabsTeams({
  children,
}: EnrollmentDetailTabsPanelProps) {
  const { activeTab } = useEnrollmentDetailTabsContext('Teams');
  return (
    <div
      role="tabpanel"
      aria-label="팀 관리"
      hidden={activeTab !== 'teams'}
      className="flex flex-col flex-1 min-h-0 pt-5"
    >
      {children}
    </div>
  );
}

export const EnrollmentDetailTabs = Object.assign(EnrollmentDetailTabsRoot, {
  Participants: EnrollmentDetailTabsParticipants,
  Teams: EnrollmentDetailTabsTeams,
});
