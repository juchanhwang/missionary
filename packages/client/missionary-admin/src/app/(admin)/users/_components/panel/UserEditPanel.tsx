'use client';

import { overlay } from '@samilhero/design-system';
import { PANEL_TRANSITION_MS, SidePanel } from 'components/ui/SidePanel';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { DeleteUserModal } from './DeleteUserModal';
import { UnsavedChangesModal } from './UnsavedChangesModal';
import { UserForm } from './UserForm';
import { useGetUser } from '../../_hooks/useGetUser';

import type { User } from 'apis/user';
import type { SidePanelMenuItem } from 'components/ui/SidePanel';

interface UserEditPanelProps {
  userId: string;
  users: User[];
  initialData?: User;
  isOpen: boolean;
  onClose: () => void;
  onExited: () => void;
}

export function UserEditPanel({
  userId,
  users,
  initialData,
  isOpen,
  onClose,
  onExited,
}: UserEditPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDirtyRef = useRef(false);

  const { data: user, isLoading, isError } = useGetUser(userId, initialData);

  const currentIndex = users.findIndex((u) => u.id === userId);
  const prevUser = currentIndex > 0 ? users[currentIndex - 1] : null;
  const nextUser =
    currentIndex >= 0 && currentIndex < users.length - 1
      ? users[currentIndex + 1]
      : null;

  const confirmIfDirty = async (): Promise<boolean> => {
    if (!isDirtyRef.current) return true;

    const confirmed = await overlay.openAsync<boolean>(
      ({ isOpen: isModalOpen, close, unmount }) => (
        <UnsavedChangesModal
          isOpen={isModalOpen}
          close={(result) => {
            close(result);
            setTimeout(unmount, PANEL_TRANSITION_MS);
          }}
        />
      ),
    );
    return !!confirmed;
  };

  const requestClose = async () => {
    if (await confirmIfDirty()) {
      onClose();
    }
  };

  // Escape 키 → dirty guard 경유하여 닫기
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        requestClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateToUser = async (targetUserId: string) => {
    if (!(await confirmIfDirty())) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('userId', targetUserId);
    router.push(`/users?${params.toString()}`);
  };

  const handleDirtyChange = (dirty: boolean) => {
    isDirtyRef.current = dirty;
  };

  const menuItems: SidePanelMenuItem[] = user
    ? [
        {
          label: '유저 삭제',
          variant: 'destructive' as const,
          onClick: async () => {
            const deleted = await overlay.openAsync<boolean>(
              ({ isOpen: isModalOpen, close, unmount }) => (
                <DeleteUserModal
                  isOpen={isModalOpen}
                  close={(result) => {
                    close(result);
                    setTimeout(unmount, PANEL_TRANSITION_MS);
                  }}
                  userId={user.id}
                  userName={user.name ?? '-'}
                />
              ),
            );
            if (deleted) {
              onClose();
            }
          },
        },
      ]
    : [];

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={requestClose}
      onExited={onExited}
      title={user?.name ?? '-'}
      onPrev={prevUser ? () => navigateToUser(prevUser.id) : null}
      onNext={nextUser ? () => navigateToUser(nextUser.id) : null}
      menuItems={menuItems}
      isLoading={isLoading}
      isError={isError || !user}
      errorMessage="유저 정보를 불러오는 중 오류가 발생했습니다"
    >
      {user && <UserForm user={user} onDirtyChange={handleDirtyChange} />}
    </SidePanel>
  );
}
