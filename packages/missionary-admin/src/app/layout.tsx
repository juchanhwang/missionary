import '@styles/_global.scss';
import { EmotionProvider } from 'lib/EmotionProvider';

import type { Metadata } from 'next';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ko">
      <EmotionProvider>
        <body>{children}</body>
      </EmotionProvider>
    </html>
  );
};

export default RootLayout;

export const metadata: Metadata = {
  title: '선교 상륙 작전',
};
