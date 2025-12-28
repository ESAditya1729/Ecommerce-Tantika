// components/Shop/ProductFilters.jsx
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const ProductFilters = ({
  categories = [],
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceChange,
  isMobileFiltersOpen,
  onMobileFiltersToggle
}) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);
  const debounceTimeout = useRef(null);

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  // Sync local price range with prop
  useEffect(() => {
    setLocalPriceRange(priceRange);
  }, [priceRange]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handlePriceChange = (newRange) => {
    setLocalPriceRange(newRange);
    
    // Debounce API calls
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      onPriceChange(newRange);
    }, 300); // 300ms delay to prevent rapid API calls
  };

  const handleMinPriceChange = (e) => {
    const newMin = Math.min(parseInt(e.target.value), localPriceRange.max);
    handlePriceChange({ ...localPriceRange, min: newMin });
  };

  const handleMaxPriceChange = (e) => {
    const newMax = Math.max(parseInt(e.target.value), localPriceRange.min);
    handlePriceChange({ ...localPriceRange, max: newMax });
  };

  return (
    <>
      {/* Mobile filter toggle button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={onMobileFiltersToggle}
          className="flex items-center justify-between w-full p-4 bg-white border border-gray-300 rounded-lg shadow-sm"
        >
          <div className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            <span className="font-medium">Filters & Sort</span>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${isMobileFiltersOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters sidebar */}
      <div className={`
        ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}
        bg-white rounded-xl border border-gray-200 p-6 shadow-sm
      `}>
        {/* Sort Section */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Sort By
          </label>
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={sortBy === option.value}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                  sortBy === option.value 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {sortBy === option.value && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories Section - FIXED: No duplicate "All" */}
        <div className="mb-8">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="text-sm font-semibold text-gray-700">Categories</span>
            {isCategoryOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          <div className={`space-y-2 ${isCategoryOpen ? 'block' : 'hidden'}`}>
            {categories.map((category) => (
              <label key={category} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                  selectedCategory === category 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedCategory === category && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-sm text-gray-700">{category}</span>
                {/* Counts have been completely removed */}
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Section */}
        <div className="mb-6">
          <button
            onClick={() => setIsPriceOpen(!isPriceOpen)}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="text-sm font-semibold text-gray-700">Price Range</span>
            {isPriceOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          <div className={`${isPriceOpen ? 'block' : 'hidden'}`}>
            <div className="mb-4 space-y-6">
              {/* Min Price Slider */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  Min Price: {formatPrice(localPriceRange.min)}
                </label>
                <input
                  type="range"
                  min="0"
                  max={priceRange.max}
                  value={localPriceRange.min}
                  onChange={handleMinPriceChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                />
              </div>
              
              {/* Max Price Slider */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  Max Price: {formatPrice(localPriceRange.max)}
                </label>
                <input
                  type="range"
                  min={priceRange.min}
                  max={10000}
                  value={localPriceRange.max}
                  onChange={handleMaxPriceChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
                {formatPrice(localPriceRange.min)}
              </div>
              <span className="text-gray-400">to</span>
              <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
                {formatPrice(localPriceRange.max)}
              </div>
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(selectedCategory !== 'All' || priceRange.min > 0 || priceRange.max < 10000) && (
          <button
            onClick={() => {
              onCategoryChange('All');
              onPriceChange({ min: 0, max: 10000 });
              onSortChange('featured');
              setLocalPriceRange({ min: 0, max: 10000 });
            }}
            className="w-full py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </>
  );
};

export default ProductFilters;