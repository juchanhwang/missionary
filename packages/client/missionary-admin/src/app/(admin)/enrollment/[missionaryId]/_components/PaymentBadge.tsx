'use client';

import { Badge } from '@samilhero/design-system';
import { useAuth } from 'lib/auth/AuthContext';

interface PaymentBadgeProps {
  isPaid: boolean;
  onToggle: () => void;
}

export function PaymentBadge({ isPaid, onToggle }: PaymentBadgeProps) {
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';

  if (isAdmin) {
    return (
      <button
        type="button"
        role="button"
        aria-label={
          isPaid ? '납부완료 - 클릭하여 변경' : '미납 - 클릭하여 변경'
        }
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="cursor-pointer"
      >
        <Badge variant={isPaid ? 'success' : 'warning'}>
          {isPaid ? '납부완료' : '미납'}
        </Badge>
      </button>
    );
  }

  return (
    <Badge variant={isPaid ? 'success' : 'warning'}>
      {isPaid ? '납부완료' : '미납'}
    </Badge>
  );
}
