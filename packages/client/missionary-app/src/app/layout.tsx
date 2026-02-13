import '../../../design-system/src/styles/tailwind.css';
import '../../../design-system/src/styles/_global.scss';
import { QueryProvider } from 'lib/QueryProvider';

import type { Metadata } from 'next';

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="ko">
    <QueryProvider>
      <body>{children}</body>
    </QueryProvider>
  </html>
);

export default RootLayout;

export const metadata: Metadata = {
  title: '선교 어플리케이션',
};
