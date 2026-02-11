import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage = 12,
  onItemsPerPageChange 
}) => {
  // Don't show pagination if only 1 page or no pages
  if (totalPages <= 1 || !totalPages) return null;

  const pages = [];
  const maxPagesToShow = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  // Adjust start page if we're at the end
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Handle edge case where currentPage is greater than totalPages
  if (currentPage > totalPages) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Page {currentPage} doesn't exist. Redirecting to page 1...</p>
        <button
          onClick={() => onPageChange(1)}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to First Page
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-gray-200">
      {/* Items per page selector - Optional */}
      {onItemsPerPageChange && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value={9}>9</option>
            <option value={12}>12</option>
            <option value={18}>18</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
          <span className="text-sm text-gray-600">per page</span>
        </div>
      )}

      {/* Page numbers */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* First page with ellipsis */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-sm sm:text-base ${currentPage === 1 ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-1 sm:px-2 text-gray-400">...</span>
            )}
          </>
        )}

        {/* Middle pages */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-sm sm:text-base min-w-[40px] sm:min-w-[48px] ${currentPage === page ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            {page}
          </button>
        ))}

        {/* Last page with ellipsis */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-1 sm:px-2 text-gray-400">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-sm sm:text-base ${currentPage === totalPages ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Page info */}
      <div className="text-sm text-gray-600">
        Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
      </div>
    </div>
  );
};

// Default props for backward compatibility
Pagination.defaultProps = {
  itemsPerPage: 12,
  onItemsPerPageChange: null
};

export default Pagination;