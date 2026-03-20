'use client';

import { useState } from 'react';

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: {
          roadAddress: string;
          jibunAddress: string;
        }) => void;
      }) => { open: () => void };
    };
  }
}

interface UseKakaoAddressOptions {
  onSelect: (address: string) => void;
}

export function useKakaoAddress({ onSelect }: UseKakaoAddressOptions) {
  const [isKakaoAvailable, setIsKakaoAvailable] = useState(true);

  const openSearch = () => {
    if (!window.daum?.Postcode) {
      setIsKakaoAvailable(false);
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        onSelect(data.roadAddress || data.jibunAddress);
      },
    }).open();
  };

  return { openSearch, isKakaoAvailable };
}
