'use client';

import {
  Badge,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@samilhero/design-system';
import { TableEmptyState, TableSkeleton } from 'components/table';
import { ROLE_LABELS } from 'lib/constants/role';
import { formatDate } from 'lib/utils/formatDate';
import { Check, X } from 'lucide-react';

import { maskIdentityNumber } from '../_utils/maskIdentityNumber';

import type { User } from 'apis/user';
import type { SkeletonColumn } from 'components/table';

const NULL_PLACEHOLDER = '—';

const SKELETON_COLUMNS: SkeletonColumn[] = [
  { width: 'w-16' },
  { width: 'w-32' },
  { width: 'w-12', rounded: 'full' },
  { width: 'w-14', rounded: 'full' },
  { width: 'w-20' },
  { width: 'w-28' },
  { width: 'w-20' },
  { width: 'w-6' },
  { width: 'w-5', rounded: 'full' },
  { width: 'w-24' },
  { width: 'w-20' },
];

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

function UserRow({
  user,
  isSelected,
  onRowClick,
}: {
  user: User;
  isSelected: boolean;
  onRowClick: (id: string) => void;
}) {
  return (
    <TableRow
      className={`cursor-pointer group ${
        isSelected ? 'bg-blue-50/5' : 'hover:bg-gray-50'
      }`}
      onClick={() => onRowClick(user.id)}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onRowClick(user.id);
      }}
      tabIndex={0}
      aria-current={isSelected ? 'true' : undefined}
    >
      <TableCell className="sticky left-0 z-10 bg-white relative">
        <div
          className={`absolute inset-0 pointer-events-none transition-colors ${
            isSelected ? 'bg-blue-50/5' : 'group-hover:bg-gray-50'
          }`}
        />
        <span className="relative font-semibold text-gray-900">
          {user.name || NULL_PLACEHOLDER}
        </span>
      </TableCell>
      <TableCell>{user.email || NULL_PLACEHOLDER}</TableCell>
      <TableCell>
        <Badge variant={getRoleBadgeVariant(user.role)}>
          {ROLE_LABELS[user.role] ?? user.role}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={getProviderBadgeVariant(user.provider)}>
          {user.provider || NULL_PLACEHOLDER}
        </Badge>
      </TableCell>
      <TableCell>{user.loginId || NULL_PLACEHOLDER}</TableCell>
      <TableCell>{user.phoneNumber || NULL_PLACEHOLDER}</TableCell>
      <TableCell>{formatDate(user.birthDate)}</TableCell>
      <TableCell>{formatGender(user.gender)}</TableCell>
      <TableCell>
        {user.isBaptized ? (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-10 text-green-60">
            <Check size={12} strokeWidth={2.5} />
          </span>
        ) : (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-300">
            <X size={12} strokeWidth={2.5} />
          </span>
        )}
      </TableCell>
      <TableCell>{maskIdentityNumber(user.identityNumber)}</TableCell>
      <TableCell className="text-xs text-gray-400">
        {formatDate(user.createdAt)}
      </TableCell>
    </TableRow>
  );
}

export function UserTable({
  users,
  isLoading,
  selectedUserId,
  onRowClick,
}: UserTableProps) {
  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <Table style={{ minWidth: '1200px' }}>
        <TableCaption>유저 목록</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky top-0 left-0 z-20 bg-gray-50">
              이름
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-gray-50">
              이메일
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-gray-50">역할</TableHead>
            <TableHead className="sticky top-0 z-10 bg-gray-50">
              인증방식
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-gray-50">
              로그인ID
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-gray-50">
              전화번호
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-gray-50">
              생년월일
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-gray-50">성별</TableHead>
            <TableHead className="sticky top-0 z-10 bg-gray-50">세례</TableHead>
            <TableHead className="sticky top-0 z-10 bg-gray-50">
              주민번호
            </TableHead>
            <TableHead className="sticky top-0 z-10 bg-gray-50">
              가입일
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton columns={SKELETON_COLUMNS} />
          ) : users.length === 0 ? (
            <TableEmptyState
              colSpan={11}
              message="조건에 맞는 유저가 없습니다"
            />
          ) : (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                isSelected={selectedUserId === user.id}
                onRowClick={onRowClick}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
