import React from 'react';
import type { PaginationMeta } from '../types/user';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
  const { page, totalPages, total } = meta;

  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    pages.push(1);
    if (left > 2) pages.push('...');

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="pagination" id="pagination">
      <span className="pagination__info">
        Сторінка {page} з {totalPages} (всього {total})
      </span>
      <div className="pagination__controls">
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          id="prev-page-btn"
        >
          ← Назад
        </button>
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="pagination__ellipsis">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`btn btn--sm ${p === page ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => onPageChange(p)}
              id={`page-btn-${p}`}
            >
              {p}
            </button>
          ),
        )}
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          id="next-page-btn"
        >
          Далі →
        </button>
      </div>
    </div>
  );
};
