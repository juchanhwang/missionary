import { MissionGroupForm } from '../_components/MissionGroupForm';

export default function CreateMissionGroupPage() {
  return (
    <div className="max-w-2xl flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-90 mb-2">
        신규 선교 그룹 생성
      </h1>
      <MissionGroupForm submitLabel="생성하기" pendingLabel="생성 중..." />
    </div>
  );
}
