interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}
export declare function Pagination({ currentPage, totalPages, onPageChange, className, }: PaginationProps): import("react/jsx-runtime").JSX.Element;
export declare namespace Pagination {
    var displayName: string;
}
export {};
