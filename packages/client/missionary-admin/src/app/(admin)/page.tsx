'use client';

import { Button } from '@samilhero/design-system';
import Link from 'next/link';

export default function MainPage() {
  return (
    <>
      <div className="flex items-center w-full h-24 px-10 rounded-lg bg-white shadow-md">
        <p className="m-0 text-[28px] font-bold leading-snug text-black">
          선교 생성 후 신청자 조회 및 준비팀 권한 부여를 진행해주세요.
        </p>
      </div>

      <div className="flex flex-col items-center max-w-lg py-12 mt-10 rounded-lg bg-white shadow-md">
        <h2 className="mb-12 text-[34px] font-bold leading-snug text-center text-black">
          선교 관리
        </h2>
        <div className="flex flex-col gap-5">
          <Link href="/missions/create">
            <Button size="xlg" width={240} color="primary">
              신규 국내선교 생성
            </Button>
          </Link>
          <Button size="xlg" width={240} color="primary" variant="outline">
            신규 해외선교 생성
          </Button>
        </div>
      </div>
    </>
  );
}
