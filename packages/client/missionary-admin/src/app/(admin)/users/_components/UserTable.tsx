'use client';

import { Badge } from '@samilhero/design-system';
import {
  AdminTable,
  NULL_PLACEHOLDER,
  TABLE_STYLES,
  type Column,
} from 'components/table';
import { ROLE_LABELS } from 'lib/constants/role';
import { formatDate } from 'lib/utils/formatDate';
import { Check, X } from 'lucide-react';

import { maskIdentityNumber } from '../_utils/maskIdentityNumber';

import type { User } from 'apis/user';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  selectedUserId?: string | null;
  onRowClick: (id: string) => void;
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'ADMIN':
      return 'info' as const;
    case 'STAFF':
      return 'success' as const;
    default:
      return 'outline' as const;
  }
}

function getProviderBadgeVariant(provider: string | null) {
  switch (provider) {
    case 'GOOGLE':
      return 'destructive' as const;
    case 'KAKAO':
      return 'warning' as const;
    default:
      return 'outline' as const;
  }
}

function formatGender(gender: string | null): string {
  if (!gender) return NULL_PLACEHOLDER;
  if (gender === 'M' || gender === 'MALE') return '남';
  if (gender === 'F' || gender === 'FEMALE') return '여';
  return gender;
}

function buildColumns(
  selectedUserId: string | null | undefined,
): Column<User>[] {
  return [
    {
      key: 'name',
      header: '이름',
      headerClassName: 'sticky left-0 bg-gray-50 z-20',
      cellClassName:
        'px-5 py-3.5 whitespace-nowrap sticky left-0 z-10 bg-white relative',
      render: (user) => {
        const isSelected = selectedUserId === user.id;
        return (
          <>
            <div
              className={`absolute inset-0 pointer-events-none transition-colors ${
                isSelected ? 'bg-blue-50/5' : 'group-hover:bg-gray-50'
              }`}
            />
            <span className="relative text-sm font-semibold text-gray-900">
              {user.name || NULL_PLACEHOLDER}
            </span>
          </>
        );
      },
      skeleton: { width: 'w-16' },
    },
    {
      key: 'email',
      header: '이메일',
      render: (user) => user.email || NULL_PLACEHOLDER,
      skeleton: { width: 'w-32' },
    },
    {
      key: 'role',
      header: '역할',
      cellClassName: 'px-5 py-3.5 whitespace-nowrap',
      render: (user) => (
        <Badge variant={getRoleBadgeVariant(user.role)}>
          {ROLE_LABELS[user.role] ?? user.role}
        </Badge>
      ),
      skeleton: { width: 'w-12', rounded: 'full' },
    },
    {
      key: 'provider',
      header: '인증방식',
      cellClassName: 'px-5 py-3.5 whitespace-nowrap',
      render: (user) => (
        <Badge variant={getProviderBadgeVariant(user.provider)}>
          {user.provider || NULL_PLACEHOLDER}
        </Badge>
      ),
      skeleton: { width: 'w-14', rounded: 'full' },
    },
    {
      key: 'loginId',
      header: '로그인ID',
      render: (user) => user.loginId || NULL_PLACEHOLDER,
      skeleton: { width: 'w-20' },
    },
    {
      key: 'phoneNumber',
      header: '전화번호',
      render: (user) => user.phoneNumber || NULL_PLACEHOLDER,
      skeleton: { width: 'w-28' },
    },
    {
      key: 'birthDate',
      header: '생년월일',
      render: (user) => formatDate(user.birthDate),
      skeleton: { width: 'w-20' },
    },
    {
      key: 'gender',
      header: '성별',
      render: (user) => formatGender(user.gender),
      skeleton: { width: 'w-6' },
    },
    {
      key: 'isBaptized',
      header: '세례',
      cellClassName: 'px-5 py-3.5 whitespace-nowrap',
      render: (user) =>
        user.isBaptized ? (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-10 text-green-60">
            <Check size={12} strokeWidth={2.5} />
          </span>
        ) : (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-300">
            <X size={12} strokeWidth={2.5} />
          </span>
        ),
      skeleton: { width: 'w-5', rounded: 'full' },
    },
    {
      key: 'identityNumber',
      header: '주민번호',
      render: (user) => maskIdentityNumber(user.identityNumber),
      skeleton: { width: 'w-24' },
    },
    {
      key: 'createdAt',
      header: '가입일',
      cellClassName: TABLE_STYLES.bodyCellDate,
      render: (user) => formatDate(user.createdAt),
      skeleton: { width: 'w-20' },
    },
  ];
}

export function UserTable({
  users,
  isLoading,
  selectedUserId,
  onRowClick,
}: UserTableProps) {
  const columns = buildColumns(selectedUserId);

  return (
    <AdminTable
      data={users}
      columns={columns}
      caption="유저 목록"
      getRowKey={(user) => user.id}
      isLoading={isLoading}
      onRowClick={(user) => onRowClick(user.id)}
      isRowSelected={(user) => selectedUserId === user.id}
      rowClassName="group"
      stickyHeader
      minWidth="1200px"
      emptyMessage="조건에 맞는 유저가 없습니다"
    />
  );
}
