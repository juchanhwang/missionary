export default function UsersLayout({
  children,
  panel,
}: {
  children: React.ReactNode;
  panel: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-0">
      {children}
      {panel}
    </div>
  );
}
