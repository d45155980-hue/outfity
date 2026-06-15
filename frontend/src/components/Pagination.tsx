'use client';

import Link from 'next/link';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  baseUrl?: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  const renderLink = (page: number, children: React.ReactNode) => {
    if (onPageChange) {
      return (
        <button onClick={() => onPageChange(page)} className="w-9 h-9 flex items-center justify-center text-xs font-medium rounded-full transition-colors">
          {children}
        </button>
      );
    }
    const url = baseUrl ? `${baseUrl}&page=${page}` : `?page=${page}`;
    return (
      <Link href={url} className="w-9 h-9 flex items-center justify-center text-xs font-medium rounded-full transition-colors">
        {children}
      </Link>
    );
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      {currentPage > 1 && renderLink(currentPage - 1, <HiOutlineChevronLeft size={14} />)}

      {pages.map((page, idx) =>
        typeof page === 'string' ? (
          <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-xs text-stone-400">...</span>
        ) : (
          <div key={page}>
            {page === currentPage ? (
              <span className="w-9 h-9 flex items-center justify-center text-xs font-medium rounded-full bg-stone-900 text-white">
                {page}
              </span>
            ) : (
              renderLink(page, <span className="text-stone-600 hover:bg-stone-50">{page}</span>)
            )}
          </div>
        )
      )}

      {currentPage < totalPages && renderLink(currentPage + 1, <HiOutlineChevronRight size={14} />)}
    </div>
  );
}
