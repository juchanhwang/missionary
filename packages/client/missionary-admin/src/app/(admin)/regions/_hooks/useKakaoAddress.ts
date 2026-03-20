'use client';

import { useKakaoPostcodePopup } from 'react-daum-postcode';

interface UseKakaoAddressOptions {
  onSelect: (address: string) => void;
}

export function useKakaoAddress({ onSelect }: UseKakaoAddressOptions) {
  const openPopup = useKakaoPostcodePopup();

  const openSearch = () => {
    openPopup({
      onComplete: (data) => {
        onSelect(data.roadAddress || data.jibunAddress);
      },
    });
  };

  return { openSearch };
}
