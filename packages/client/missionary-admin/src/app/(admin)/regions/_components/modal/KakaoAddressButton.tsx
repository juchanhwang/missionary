'use client';

import { Button } from '@samilhero/design-system';

import { useKakaoAddress } from '../../_hooks/useKakaoAddress';

interface KakaoAddressButtonProps {
  onSelect: (address: string) => void;
}

export function KakaoAddressButton({ onSelect }: KakaoAddressButtonProps) {
  const { openSearch } = useKakaoAddress({ onSelect });

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
