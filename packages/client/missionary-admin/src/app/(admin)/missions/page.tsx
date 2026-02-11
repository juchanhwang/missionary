export default function MissionsPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-20">
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-50"
        >
          <circle
            cx="14"
            cy="14"
            r="10"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M14 4C14 4 18 9 18 14C18 19 14 24 14 24"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M14 4C14 4 10 9 10 14C10 19 14 24 14 24"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M4 14H24" stroke="currentColor" strokeWidth="1.5" />
        </svg>
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
