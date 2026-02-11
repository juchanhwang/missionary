'use client';

import { useParams } from 'next/navigation';

import { MissionaryEditForm } from './components/MissionaryEditForm';
import { useMissionary } from './hooks/useMissionary';

export default function MissionaryEditPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: missionary, isLoading: isMissionaryLoading } =
    useMissionary(id);
  if (isMissionaryLoading) {
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
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">선교 수정</h1>
      <MissionaryEditForm missionary={missionary} />
    </div>
  );
}
