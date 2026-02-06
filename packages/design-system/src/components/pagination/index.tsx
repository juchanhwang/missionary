'use client';

import {
  PaginationRoot,
  PaginationButton,
  PageNumber,
} from './PaginationLayout';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const PAGE_GROUP_SIZE = 5;

function getPageGroup(currentPage: number, totalPages: number): number[] {
  const groupIndex = Math.floor((currentPage - 1) / PAGE_GROUP_SIZE);
  const start = groupIndex * PAGE_GROUP_SIZE + 1;
  const end = Math.min(start + PAGE_GROUP_SIZE - 1, totalPages);

  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const pages = getPageGroup(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <PaginationRoot className={className} aria-label="페이지 네비게이션">
      <PaginationButton
        type="button"
        disabled={!hasPrev}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="이전 페이지"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 4L6 8L10 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </PaginationButton>

      {pages.map((page) => (
        <PageNumber
          key={page}
          type="button"
          active={page === currentPage}
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </PageNumber>
      ))}

      <PaginationButton
        type="button"
        disabled={!hasNext}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="다음 페이지"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </PaginationButton>
    </PaginationRoot>
  );
}
Pagination.displayName = 'Pagination';
