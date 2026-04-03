'use client';

import { Button } from '@samilhero/design-system';
import { AlertTriangle, LogIn, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
          <AlertTriangle size={24} className="text-red-600" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-gray-900">
            페이지를 불러올 수 없습니다
          </h2>
          <p className="text-sm text-gray-400">
            {error.message || '일시적인 오류가 발생했습니다.'}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button variant="filled" color="neutral" size="sm" onClick={reset}>
            <RotateCcw size={14} />
            다시 시도
          </Button>
          <Link href="/login">
            <Button variant="outline" color="neutral" size="sm">
              <LogIn size={14} />
              로그인 페이지로
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
