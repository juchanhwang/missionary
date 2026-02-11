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
      <div className="flex items-center justify-center flex-1">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-30 border-t-gray-60 rounded-full animate-spin" />
          <p className="text-sm text-gray-50">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!missionary) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-sm text-gray-50">선교를 찾을 수 없습니다</p>
      </div>
    );
  }

  return <MissionaryEditForm missionary={missionary} />;
}
