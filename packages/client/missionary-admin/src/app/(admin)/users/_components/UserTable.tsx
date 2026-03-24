'use client';

import { Badge } from '@samilhero/design-system';
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
  if (!gender) return '-';
  if (gender === 'M' || gender === 'MALE') return '남';
  if (gender === 'F' || gender === 'FEMALE') return '여';
  return gender;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <tr key={i} className="border-b border-gray-200">
          <td className="px-5 py-3.5">
            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-5 w-12 bg-gray-100 rounded-full animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-5 w-14 bg-gray-100 rounded-full animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-4 w-6 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-5 w-5 bg-gray-100 rounded-full animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function UserTable({
  users,
  isLoading,
  selectedUserId,
  onRowClick,
}: UserTableProps) {
  if (!isLoading && users.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
        조건에 맞는 유저가 없습니다
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto">
      <table className="w-full text-left min-w-[1200px]">
        <caption className="sr-only">유저 목록</caption>
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-gray-200 bg-gray-50">
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap sticky left-0 bg-gray-50 z-20"
            >
              이름
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap"
            >
              이메일
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap"
            >
              역할
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap"
            >
              인증방식
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap"
            >
              로그인ID
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap"
            >
              전화번호
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap"
            >
              생년월일
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap"
            >
              성별
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap"
            >
              세례
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap"
            >
              주민번호
            </th>
            <th
              scope="col"
              className="px-5 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap"
            >
              가입일
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonRows />
          ) : (
            users.map((user) => {
              const isSelected = selectedUserId === user.id;

              return (
                <tr
                  key={user.id}
                  onClick={() => onRowClick(user.id)}
                  aria-selected={isSelected}
                  className={`border-b border-gray-200 last:border-b-0 transition-colors duration-150 cursor-pointer group ${
                    isSelected ? 'bg-blue-50/5' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-5 py-3.5 whitespace-nowrap sticky left-0 z-10 bg-white relative">
                    <div
                      className={`absolute inset-0 pointer-events-none transition-colors ${
                        isSelected ? 'bg-blue-50/5' : 'group-hover:bg-gray-50'
                      }`}
                    />
                    <span className="relative text-sm font-semibold text-gray-900">
                      {user.name || '-'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    {user.email || '-'}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <Badge variant={getProviderBadgeVariant(user.provider)}>
                      {user.provider || '-'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    {user.loginId || '-'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    {user.phoneNumber || '-'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(user.birthDate)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    {formatGender(user.gender)}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {user.isBaptized ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-10 text-green-60">
                        <Check size={12} strokeWidth={2.5} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-300">
                        <X size={12} strokeWidth={2.5} />
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    {maskIdentityNumber(user.identityNumber)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
