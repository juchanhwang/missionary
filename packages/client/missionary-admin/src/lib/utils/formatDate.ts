/**
 * ISO 날짜 문자열에서 날짜 부분(YYYY-MM-DD)만 추출한다.
 * regions, users 도메인에서 사용.
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return dateString.slice(0, 10);
}

/**
 * 날짜 문자열을 한국어 점 구분 형식(YYYY.MM.DD)으로 변환한다.
 * missions 도메인에서 사용.
 */
export function formatDateDotted(dateString: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\. /g, '.')
    .replace(/\.$/, '');
}
