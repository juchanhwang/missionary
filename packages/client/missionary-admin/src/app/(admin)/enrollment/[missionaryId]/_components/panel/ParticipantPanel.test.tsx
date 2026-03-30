import {
  createMockAttendanceOption,
  createMockFormFieldDefinition,
  createMockParticipation,
} from 'test/mocks/data';
import { render, screen, waitFor } from 'test/test-utils';

import { ParticipantPanel } from './ParticipantPanel';
import { useGetParticipation } from '../../_hooks/useGetParticipation';

import type {
  AttendanceOption,
  FormFieldDefinition,
  Participation,
} from 'apis/participation';

// 의존 모듈 mock
vi.mock('@samilhero/design-system', () => {
  const SelectOption = ({ children }: { children: React.ReactNode }) => (
    <option>{children}</option>
  );
  const SelectOptions = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  const SelectTrigger = ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  );
  const Select = Object.assign(
    ({
      children,
    }: {
      children: React.ReactNode;
      value?: string;
      onChange?: (v: string) => void;
    }) => <div>{children}</div>,
    { Trigger: SelectTrigger, Options: SelectOptions, Option: SelectOption },
  );

  return {
    Badge: ({ children }: { children: React.ReactNode }) => (
      <span>{children}</span>
    ),
    Button: ({
      children,
      onClick,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
    }) => (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
    InputField: ({
      value,
      onChange,
      label,
      ...props
    }: {
      value?: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      label?: string;
      placeholder?: string;
      readOnly?: boolean;
    }) => (
      <div>
        {label && <label>{label}</label>}
        <input value={value} onChange={onChange} {...props} />
      </div>
    ),
    Select,
    Switch: ({
      checked,
      onChange,
    }: {
      checked?: boolean;
      onChange?: (v: boolean) => void;
    }) => (
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
    ),
    overlay: {
      openAsync: vi.fn().mockResolvedValue(true),
    },
  };
});

vi.mock('components/ui/SidePanel', () => ({
  PANEL_TRANSITION_MS: 0,
  SidePanel: ({
    children,
    title,
    subtitle,
    isOpen,
    onClose,
    onPrev,
    onNext,
    isLoading,
    isError,
    errorMessage,
  }: {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    badge?: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    onExited: () => void;
    onPrev: (() => void) | null;
    onNext: (() => void) | null;
    isLoading: boolean;
    isError: boolean;
    errorMessage?: string;
  }) =>
    isOpen ? (
      <div data-testid="side-panel">
        <span data-testid="panel-title">{title}</span>
        {subtitle && <span data-testid="panel-subtitle">{subtitle}</span>}
        <button type="button" onClick={onClose} data-testid="panel-close">
          닫기
        </button>
        {onPrev && (
          <button type="button" onClick={onPrev} data-testid="panel-prev">
            이전
          </button>
        )}
        {onNext && (
          <button type="button" onClick={onNext} data-testid="panel-next">
            다음
          </button>
        )}
        {isLoading && <span>로딩 중...</span>}
        {isError && <span>{errorMessage}</span>}
        {!isLoading && !isError && children}
      </div>
    ) : null,
}));

vi.mock('../../_hooks/useGetParticipation', () => ({
  useGetParticipation: vi.fn(),
}));

vi.mock('../../_hooks/useUpdateParticipation', () => ({
  useUpdateParticipation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('lib/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'a@a.com', role: 'ADMIN', provider: 'LOCAL' },
  }),
}));

describe('ParticipantPanel', () => {
  const participants: Participation[] = [
    createMockParticipation({ id: 'p1', name: '홍길동' }),
    createMockParticipation({ id: 'p2', name: '김철수' }),
    createMockParticipation({ id: 'p3', name: '이영희' }),
  ];

  const attendanceOptions: AttendanceOption[] = [
    createMockAttendanceOption({ id: 'att-1', label: '전체 참석' }),
  ];

  const formFields: FormFieldDefinition[] = [
    createMockFormFieldDefinition({ id: 'f1', label: '교회명' }),
  ];

  const defaultProps = {
    participants,
    attendanceOptions,
    formFields,
    missionName: '2026 여름 선교',
    isOpen: true,
    onClose: vi.fn(),
    onExited: vi.fn(),
    onNavigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetParticipation).mockReturnValue({
      data: participants[0],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useGetParticipation>);
  });

  it('참가자 이름을 패널 제목에 표시한다', () => {
    render(<ParticipantPanel {...defaultProps} participantId="p1" />);

    expect(screen.getByTestId('panel-title')).toHaveTextContent('홍길동');
  });

  it('isOpen이 false일 때 패널을 렌더링하지 않는다', () => {
    render(
      <ParticipantPanel {...defaultProps} participantId="p1" isOpen={false} />,
    );

    expect(screen.queryByTestId('side-panel')).not.toBeInTheDocument();
  });

  it('로딩 중일 때 로딩 상태를 표시한다', () => {
    vi.mocked(useGetParticipation).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useGetParticipation>);

    render(<ParticipantPanel {...defaultProps} participantId="p1" />);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  describe('네비게이션', () => {
    it('중간 참가자일 때 이전/다음 버튼을 모두 표시한다', () => {
      vi.mocked(useGetParticipation).mockReturnValue({
        data: participants[1],
        isLoading: false,
        isError: false,
      } as ReturnType<typeof useGetParticipation>);

      render(<ParticipantPanel {...defaultProps} participantId="p2" />);

      expect(screen.getByTestId('panel-prev')).toBeInTheDocument();
      expect(screen.getByTestId('panel-next')).toBeInTheDocument();
    });

    it('첫 번째 참가자일 때 이전 버튼을 숨긴다', () => {
      render(<ParticipantPanel {...defaultProps} participantId="p1" />);

      expect(screen.queryByTestId('panel-prev')).not.toBeInTheDocument();
      expect(screen.getByTestId('panel-next')).toBeInTheDocument();
    });

    it('마지막 참가자일 때 다음 버튼을 숨긴다', () => {
      vi.mocked(useGetParticipation).mockReturnValue({
        data: participants[2],
        isLoading: false,
        isError: false,
      } as ReturnType<typeof useGetParticipation>);

      render(<ParticipantPanel {...defaultProps} participantId="p3" />);

      expect(screen.getByTestId('panel-prev')).toBeInTheDocument();
      expect(screen.queryByTestId('panel-next')).not.toBeInTheDocument();
    });

    it('다음 버튼 클릭 시 onNavigate를 호출한다', async () => {
      const onNavigate = vi.fn();
      const { user } = render(
        <ParticipantPanel
          {...defaultProps}
          participantId="p1"
          onNavigate={onNavigate}
        />,
      );

      await user.click(screen.getByTestId('panel-next'));

      await waitFor(() => {
        expect(onNavigate).toHaveBeenCalledWith('p2');
      });
    });
  });
});
