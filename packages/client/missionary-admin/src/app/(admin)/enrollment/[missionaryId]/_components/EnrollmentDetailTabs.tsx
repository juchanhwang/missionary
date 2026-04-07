'use client';

import { Tab } from '@samilhero/design-system';
import { useState } from 'react';

import type { ReactNode } from 'react';

/**
 * 등록 상세 페이지의 탭 식별자.
 * - `participants`: 기존 참가자 명단/상세 패널 (기본값)
 * - `teams`: 신규 팀 관리 칸반 보드
 */
export type EnrollmentTabValue = 'participants' | 'teams';

interface EnrollmentDetailTabsProps {
  /** 참가자 목록 탭 콘텐츠 */
  participantsContent: ReactNode;
  /** 팀 관리 탭 콘텐츠 */
  teamsContent: ReactNode;
}

const TAB_LIST: Array<{ value: string; label: string }> = [
  { value: 'participants', label: '참가자 목록' },
  { value: 'teams', label: '팀 관리' },
];

function isEnrollmentTabValue(value: string): value is EnrollmentTabValue {
  return value === 'participants' || value === 'teams';
}

/**
 * 등록 상세 페이지의 탭 셸. fe-plan v1.2 §4-5.
 *
 * - 탭 상태(`'participants' | 'teams'`)만 관리하고 자식 콘텐츠는 props로 받는다.
 * - 양쪽 콘텐츠를 항상 마운트한 채 `display: none` 토글로만 전환한다 (R-10):
 *   탭 전환 시 입력값/스크롤 위치 유실을 방지하고, 미배치 카운트 등 양쪽
 *   탭에서 실시간 갱신이 필요한 데이터를 한 번의 fetch로 공유할 수 있다.
 * - URL 동기화는 하지 않는다 (브라우저 새로고침 시 항상 `participants`).
 */
export function EnrollmentDetailTabs({
  participantsContent,
  teamsContent,
}: EnrollmentDetailTabsProps) {
  const [activeTab, setActiveTab] =
    useState<EnrollmentTabValue>('participants');

  return (
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

      <div
        role="tabpanel"
        aria-labelledby="tab-participants"
        hidden={activeTab !== 'participants'}
        className="flex flex-col flex-1 min-h-0"
      >
        {participantsContent}
      </div>

      <div
        role="tabpanel"
        aria-labelledby="tab-teams"
        hidden={activeTab !== 'teams'}
        className="flex flex-col flex-1 min-h-0"
      >
        {teamsContent}
      </div>
    </div>
  );
}
