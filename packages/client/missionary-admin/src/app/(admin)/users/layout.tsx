export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-1 min-h-0">{children}</div>;
}
