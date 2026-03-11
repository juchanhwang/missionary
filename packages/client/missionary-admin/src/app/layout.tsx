import 'react-datepicker/dist/react-datepicker.css';
import '../../../design-system/src/components/date-picker/DatePickerStyles.css';
import 'styles/tailwind.css';
import 'styles/_global.scss';
import { QueryProvider } from 'lib/QueryProvider';
import { Toaster } from 'sonner';

import type { Metadata } from 'next';


const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ko">
      <QueryProvider>
        <body>{children}</body>
      </QueryProvider>
      <Toaster position="bottom-right" richColors />
    </html>
  );
};

export default RootLayout;

export const metadata: Metadata = {
  title: '선교 상륙 작전',
};
