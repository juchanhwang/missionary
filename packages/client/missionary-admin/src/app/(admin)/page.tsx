'use client';

import { Button } from '@samilhero/design-system';
import Link from 'next/link';

export default function MainPage() {
  return (
    <>
      <div className="flex items-center w-full px-8 py-5 rounded-xl bg-white border border-gray-10">
        <p className="m-0 text-base font-medium leading-snug text-gray-70">
          선교 생성 후 신청자 조회 및 준비팀 권한 부여를 진행해주세요.
        </p>
      </div>

      <div className="flex flex-col items-center max-w-lg py-10 mt-6 rounded-xl bg-white border border-gray-10">
        <h2 className="mb-8 text-2xl font-bold leading-snug text-center text-gray-90">
          선교 관리
        </h2>
        <div className="flex flex-col gap-4">
          <Link href="/missions">
            <Button size="xlg" width={240} color="neutral">
              선교 그룹 관리
            </Button>
          </Link>
          <Link href="/missions/create">
            <Button size="xlg" width={240} color="neutral" variant="outline">
              신규 선교 그룹 생성
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
