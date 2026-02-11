import { Globe } from 'lucide-react';

export default function MissionsPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-20">
        <Globe size={28} className="text-gray-50" />
      </div>
      <p className="text-sm font-medium text-gray-60">
        좌측에서 선교 그룹을 선택하세요
      </p>
      <p className="text-xs text-gray-50">
        그룹을 선택하면 소속 선교 목록을 확인할 수 있습니다
      </p>
    </div>
  );
}
