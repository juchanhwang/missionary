'use client';

import { Button } from '@samilhero/design-system';
import { useEffect } from 'react';

import { useKakaoAddress } from '../../_hooks/useKakaoAddress';

interface KakaoAddressButtonProps {
  onSelect: (address: string) => void;
  onFallback: () => void;
}

export function KakaoAddressButton({
  onSelect,
  onFallback,
}: KakaoAddressButtonProps) {
  const { openSearch, isKakaoAvailable } = useKakaoAddress({
    onSelect,
  });

  useEffect(() => {
    if (!isKakaoAvailable) {
      onFallback();
    }
  }, [isKakaoAvailable, onFallback]);

  if (!isKakaoAvailable) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      color="neutral"
      size="md"
      onClick={openSearch}
    >
      주소 검색
    </Button>
  );
}
