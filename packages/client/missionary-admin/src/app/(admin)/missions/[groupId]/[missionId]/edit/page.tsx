'use client';

import { useParams } from 'next/navigation';

import { MissionaryEditForm } from './_components/MissionaryEditForm';
import { useMissionary } from './_hooks/useMissionary';

export default function EditMissionPage() {
  const params = useParams();
  const missionId = params.missionId as string;

  const { data: missionary, isLoading } = useMissionary(missionId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">로딩 중...</div>
    );
  }

  if (!missionary) {
    return (
      <div className="flex justify-center items-center h-full">
        선교를 찾을 수 없습니다
      </div>
    );
  }

  return (
    <div className="max-w-2xl flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-90 mb-2">선교 수정</h1>
      <MissionaryEditForm missionary={missionary} />
    </div>
  );
}
