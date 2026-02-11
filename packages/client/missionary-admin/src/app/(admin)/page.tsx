'use client';

interface MissionCard {
  id: number;
  name: string;
  type: '국내' | '해외';
  startDate: string;
  endDate: string;
  participants: number;
  maxParticipants: number;
  status: 'active' | 'upcoming' | 'completed';
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const MOCK_ACTIVE_MISSIONS: MissionCard[] = [
  {
    id: 1,
    name: '2026 필리핀 단기선교',
    type: '해외',
    startDate: '2026.01.15',
    endDate: '2026.02.28',
    participants: 24,
    maxParticipants: 30,
    status: 'active',
  },
  {
    id: 2,
    name: '부산 지역 봉사선교',
    type: '국내',
    startDate: '2026.02.01',
    endDate: '2026.03.15',
    participants: 12,
    maxParticipants: 20,
    status: 'active',
  },
  {
    id: 3,
    name: '캄보디아 의료선교',
    type: '해외',
    startDate: '2026.02.10',
    endDate: '2026.03.10',
    participants: 18,
    maxParticipants: 25,
    status: 'active',
  },
];

const MOCK_INACTIVE_MISSIONS: MissionCard[] = [
  {
    id: 4,
    name: '2025 태국 단기선교',
    type: '해외',
    startDate: '2025.07.01',
    endDate: '2025.08.15',
    participants: 30,
    maxParticipants: 30,
    status: 'completed',
  },
  {
    id: 5,
    name: '제주 농촌봉사',
    type: '국내',
    startDate: '2025.09.01',
    endDate: '2025.09.30',
    participants: 15,
    maxParticipants: 20,
    status: 'completed',
  },
  {
    id: 6,
    name: '2026 여름 인도 선교',
    type: '해외',
    startDate: '2026.07.01',
    endDate: '2026.08.15',
    participants: 0,
    maxParticipants: 25,
    status: 'upcoming',
  },
];

const STATS: StatCard[] = [
  {
    label: '총 선교',
    value: 6,
    color: 'bg-blue-10 text-blue-60',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M11 3C11 3 14.5 7 14.5 11C14.5 15 11 19 11 19"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M11 3C11 3 7.5 7 7.5 11C7.5 15 11 19 11 19"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M3 11H19" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: '진행중',
    value: 3,
    color: 'bg-green-10 text-green-60',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 11L10.5 13.5L15 8.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: '완료',
    value: 2,
    color: 'bg-gray-20 text-gray-60',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3"
          y="3"
          width="16"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8 8L14 14M14 8L8 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: '총 참여자',
    value: 99,
    color: 'bg-warning-10 text-warning-60',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="15" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M2 19C2 15.68 4.68 13 8 13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M20 19C20 15.68 17.32 13 15 13C13.5 13 12.12 13.72 11 14.76"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

function StatusBadge({ status }: { status: MissionCard['status'] }) {
  const config = {
    active: { label: '진행중', className: 'bg-green-10 text-green-60' },
    upcoming: { label: '예정', className: 'bg-blue-10 text-blue-60' },
    completed: { label: '완료', className: 'bg-gray-20 text-gray-60' },
  } as const;

  const { label, className } = config[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function MissionCardItem({ mission }: { mission: MissionCard }) {
  const progress = Math.round(
    (mission.participants / mission.maxParticipants) * 100,
  );

  return (
    <div className="flex flex-col gap-4 p-5 bg-white rounded-xl border border-gray-30 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-90 truncate">
            {mission.name}
          </h3>
          <span className="text-xs text-gray-50 mt-0.5">{mission.type}</span>
        </div>
        <StatusBadge status={mission.status} />
      </div>

      <div className="flex flex-col gap-2 text-sm text-gray-60">
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 text-gray-50"
          >
            <rect
              x="1.75"
              y="2.25"
              width="10.5"
              height="10"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M1.75 5.25H12.25"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M4.5 1V3.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M9.5 1V3.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span>
            {mission.startDate} ~ {mission.endDate}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 text-gray-50"
          >
            <circle
              cx="7"
              cy="5"
              r="2.25"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M2.5 12.5C2.5 10 4.5 8.5 7 8.5C9.5 8.5 11.5 10 11.5 12.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span>
            {mission.participants} / {mission.maxParticipants}명
          </span>
        </div>
      </div>

      <div className="w-full">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-50">참여율</span>
          <span className="font-medium text-gray-70">{progress}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-gray-20">
          <div
            className={`h-full rounded-full transition-all ${
              mission.status === 'active' ? 'bg-green-50' : 'bg-gray-40'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-30"
          >
            <div
              className={`flex items-center justify-center w-11 h-11 rounded-xl ${stat.color}`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-90">{stat.value}</p>
              <p className="text-sm text-gray-50">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <h2 className="text-lg font-semibold text-gray-90">진행중인 선교</h2>
          <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-green-10 text-xs font-semibold text-green-60">
            {MOCK_ACTIVE_MISSIONS.length}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_ACTIVE_MISSIONS.map((mission) => (
            <MissionCardItem key={mission.id} mission={mission} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <h2 className="text-lg font-semibold text-gray-90">비진행 선교</h2>
          <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-gray-30 text-xs font-semibold text-gray-60">
            {MOCK_INACTIVE_MISSIONS.length}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_INACTIVE_MISSIONS.map((mission) => (
            <MissionCardItem key={mission.id} mission={mission} />
          ))}
        </div>
      </section>
    </div>
  );
}
