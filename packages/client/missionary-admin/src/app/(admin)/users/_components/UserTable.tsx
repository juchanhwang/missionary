'use client';

import { Badge } from '@samilhero/design-system';
import { Check, X } from 'lucide-react';

import type { User } from 'apis/user';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  selectedUserId: string | null;
  onSelectUser: (id: string) => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return dateStr.slice(0, 10);
}

function maskIdentityNumber(value: string | null): string {
  if (!value) return '-';
  if (value.length <= 6) return value;
  return value.slice(0, 6) + '-' + '*'.repeat(value.length - 6);
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
  if (!gender) return '-';
  if (gender === 'M') return '남';
  if (gender === 'F') return '여';
  return gender;
}

export function UserTable({
  users,
  isLoading,
  selectedUserId,
  onSelectUser,
}: UserTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-gray-50">
        불러오는 중...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-gray-50">
        조건에 맞는 유저가 없습니다
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[1200px]">
        <thead>
          <tr className="border-b border-gray-30 bg-gray-10">
            <th className="px-5 py-3 text-xs font-semibold text-gray-50 whitespace-nowrap sticky left-0 bg-gray-10 z-10">
              이름
            </th>
            <th className="px-5 py-3 text-xs font-semibold text-gray-50 whitespace-nowrap">
              이메일
            </th>
            <th className="px-5 py-3 text-xs font-semibold text-gray-50 whitespace-nowrap">
              역할
            </th>
            <th className="px-5 py-3 text-xs font-semibold text-gray-50 whitespace-nowrap">
              인증방식
            </th>
            <th className="px-5 py-3 text-xs font-semibold text-gray-50 whitespace-nowrap">
              로그인ID
            </th>
            <th className="px-5 py-3 text-xs font-semibold text-gray-50 whitespace-nowrap">
              전화번호
            </th>
            <th className="px-5 py-3 text-xs font-semibold text-gray-50 whitespace-nowrap">
              생년월일
            </th>
            <th className="px-5 py-3 text-xs font-semibold text-gray-50 whitespace-nowrap">
              성별
            </th>
            <th className="px-5 py-3 text-xs font-semibold text-gray-50 whitespace-nowrap">
              세례
            </th>
            <th className="px-5 py-3 text-xs font-semibold text-gray-50 whitespace-nowrap">
              주민번호
            </th>
            <th className="px-5 py-3 text-xs font-semibold text-gray-50 whitespace-nowrap">
              가입일
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelected = selectedUserId === user.id;

            return (
              <tr
                key={user.id}
                onClick={() => onSelectUser(user.id)}
                className={`border-b border-gray-30 last:border-b-0 transition-colors cursor-pointer group ${
                  isSelected ? 'bg-blue-50/5' : 'hover:bg-primary-10/40'
                }`}
              >
                <td
                  className={`px-5 py-3.5 whitespace-nowrap sticky left-0 z-10 transition-colors ${
                    isSelected
                      ? 'bg-blue-50/5'
                      : 'bg-white group-hover:bg-primary-10/40'
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      isSelected
                        ? 'text-primary-50'
                        : 'text-gray-90 group-hover:text-primary-50'
                    }`}
                  >
                    {user.name || '-'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-60 whitespace-nowrap">
                  {user.email || '-'}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <Badge variant={getProviderBadgeVariant(user.provider)}>
                    {user.provider || '-'}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-60 whitespace-nowrap">
                  {user.loginId || '-'}
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-60 whitespace-nowrap">
                  {user.phoneNumber || '-'}
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-60 whitespace-nowrap">
                  {formatDate(user.birthDate)}
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-60 whitespace-nowrap">
                  {formatGender(user.gender)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  {user.isBaptized ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-10 text-green-60">
                      <Check size={12} strokeWidth={2.5} />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-20 text-gray-40">
                      <X size={12} strokeWidth={2.5} />
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-60 whitespace-nowrap">
                  {maskIdentityNumber(user.identityNumber)}
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-60 whitespace-nowrap">
                  {formatDate(user.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
