import React from 'react';
import type { PaginationMeta } from '../types/user';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
  const { page, totalPages, total } = meta;

  if (totalPages <= 1) return null;

  const getVisiblePages = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return pages;
  };

  return (
    <div className="pagination" id="pagination">
      <span className="pagination__info">
        Всього: <strong>{total}</strong> записів
      </span>
      <div className="pagination__controls">
        <button
          className="btn btn--sm btn--ghost"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          id="pagination-prev"
        >
          ←
        </button>
        {getVisiblePages().map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="pagination__ellipsis">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`btn btn--sm ${p === page ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => onPageChange(p)}
              id={`pagination-page-${p}`}
            >
              {p}
            </button>
          )
        )}
        <button
          className="btn btn--sm btn--ghost"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          id="pagination-next"
        >
          →
        </button>
      </div>
    </div>
  );
};
