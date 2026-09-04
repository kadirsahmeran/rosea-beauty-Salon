import { ChevronLeft, ChevronRight } from "lucide-react";

function getPageNumbers(current, total) {
  const delta = 1;
  const pages = [];

  for (let page = 1; page <= total; page++) {
    const isEdge = page === 1 || page === total;
    const isNearCurrent = page >= current - delta && page <= current + delta;

    if (isEdge || isNearCurrent) {
      pages.push(page);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      className="mt-14 flex items-center justify-center gap-2"
      aria-label="Sayfalama"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-blush-100 bg-white text-ink/70 transition hover:bg-blush-100/60 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Önceki sayfa"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((page, index) =>
        page === "…" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1 text-sm text-ink/40"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
              page === currentPage
                ? "bg-ink text-cream-50 shadow-lg shadow-ink/10"
                : "border border-blush-100 bg-white text-ink/70 hover:bg-blush-100/60"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-blush-100 bg-white text-ink/70 transition hover:bg-blush-100/60 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Sonraki sayfa"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
