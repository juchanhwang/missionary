'use client';

import { GroupPanel } from './_components/GroupPanel';

export default function MissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-0">
      <GroupPanel />
      <div className="flex flex-col flex-1 min-w-0">{children}</div>
    </div>
  );
}
