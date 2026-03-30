import { useAuth } from 'lib/auth/AuthContext';
import { render, screen } from 'test/test-utils';

import { PaymentBadge } from './PaymentBadge';

vi.mock('lib/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('PaymentBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ADMIN 역할', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 'u1', email: 'a@a.com', role: 'ADMIN', provider: 'LOCAL' },
      } as ReturnType<typeof useAuth>);
    });

    it('납부완료 상태에서 버튼을 렌더링한다', () => {
      render(<PaymentBadge isPaid onToggle={vi.fn()} />);

      expect(
        screen.getByRole('button', { name: /납부완료 - 클릭하여 변경/ }),
      ).toBeInTheDocument();
      expect(screen.getByText('납부완료')).toBeInTheDocument();
    });

    it('미납 상태에서 버튼을 렌더링한다', () => {
      render(<PaymentBadge isPaid={false} onToggle={vi.fn()} />);

      expect(
        screen.getByRole('button', { name: /미납 - 클릭하여 변경/ }),
      ).toBeInTheDocument();
      expect(screen.getByText('미납')).toBeInTheDocument();
    });

    it('클릭 시 onToggle을 호출한다', async () => {
      const onToggle = vi.fn();
      const { user } = render(
        <PaymentBadge isPaid={false} onToggle={onToggle} />,
      );

      await user.click(screen.getByRole('button'));

      expect(onToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('USER 역할', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 'u1', email: 'u@u.com', role: 'USER', provider: 'LOCAL' },
      } as ReturnType<typeof useAuth>);
    });

    it('버튼 대신 정적 배지를 렌더링한다', () => {
      render(<PaymentBadge isPaid onToggle={vi.fn()} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.getByText('납부완료')).toBeInTheDocument();
    });

    it('미납 상태에서 정적 배지를 렌더링한다', () => {
      render(<PaymentBadge isPaid={false} onToggle={vi.fn()} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.getByText('미납')).toBeInTheDocument();
    });
  });
});
