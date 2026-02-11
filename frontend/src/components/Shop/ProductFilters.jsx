import { Filter, ChevronDown, ChevronUp, Tag, DollarSign, Sparkles } from 'lucide-react';
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
  const [isSortOpen, setIsSortOpen] = useState(true);
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);
  const debounceTimeout = useRef(null);

  const sortOptions = [
    { value: 'featured', label: 'Featured', icon: Sparkles },
    { value: 'newest', label: 'New Arrivals', icon: Tag },
    { value: 'price-low', label: 'Price: Low to High', icon: DollarSign },
    { value: 'price-high', label: 'Price: High to Low', icon: DollarSign },
    { value: 'rating', label: 'Highest Rated', icon: '★' }
  ];

  // Ensure "All" is included and remove duplicates
  const allCategories = ['All', ...new Set(categories.filter(cat => cat !== 'All'))];

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
    }, 300);
  };

  const handleMinPriceChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    const newMin = Math.min(value, localPriceRange.max);
    handlePriceChange({ ...localPriceRange, min: newMin });
  };

  const handleMaxPriceChange = (e) => {
    const value = parseInt(e.target.value) || 10000;
    const newMax = Math.max(value, localPriceRange.min);
    handlePriceChange({ ...localPriceRange, max: newMax });
  };

  const handleResetFilters = () => {
    onCategoryChange('All');
    onPriceChange({ min: 0, max: 10000 });
    onSortChange('featured');
    setLocalPriceRange({ min: 0, max: 10000 });
  };

  const hasActiveFilters = selectedCategory !== 'All' || priceRange.min > 0 || priceRange.max < 10000;

  return (
    <>
      {/* Mobile filter toggle button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={onMobileFiltersToggle}
          className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-3">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-gray-800 block">Filters & Sort</span>
              <span className="text-xs text-gray-500">
                {hasActiveFilters ? 'Active filters applied' : 'Customize your view'}
              </span>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isMobileFiltersOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters sidebar */}
      <div className={`
        ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}
        bg-white rounded-2xl border border-gray-100 p-6 shadow-sm
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-gray-800">Filters</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Sort Section */}
        <div className="mb-8">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center justify-between w-full mb-4 p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Sort By</span>
            </div>
            {isSortOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          <div className={`space-y-2 pl-8 ${isSortOpen ? 'block' : 'hidden'}`}>
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className={`flex items-center w-full p-3 rounded-xl text-left transition-all ${
                    sortBy === option.value
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    sortBy === option.value 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {sortBy === option.value && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {typeof Icon === 'string' ? (
                      <span className="text-amber-500 font-bold">{Icon}</span>
                    ) : (
                      <Icon className={`w-4 h-4 ${sortBy === option.value ? 'text-blue-600' : 'text-gray-500'}`} />
                    )}
                    <span className={`text-sm ${
                      sortBy === option.value ? 'text-blue-700 font-semibold' : 'text-gray-700'
                    }`}>
                      {option.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-8">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center justify-between w-full mb-4 p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center">
                <Tag className="w-3 h-3 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Categories</span>
            </div>
            {isCategoryOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          <div className={`space-y-1 pl-8 ${isCategoryOpen ? 'block' : 'hidden'}`}>
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`flex items-center w-full p-3 rounded-xl text-left transition-all group ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedCategory === category 
                    ? 'border-purple-500 bg-purple-500' 
                    : 'border-gray-300 group-hover:border-purple-300'
                }`}>
                  {selectedCategory === category && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  )}
                </div>
                <span className={`text-sm ${
                  selectedCategory === category ? 'text-purple-700 font-semibold' : 'text-gray-700'
                }`}>
                  {category}
                </span>
                {category === 'All' && (
                  <span className="ml-auto text-xs text-gray-400">({allCategories.length - 1})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Section */}
        <div className="mb-6">
          <button
            onClick={() => setIsPriceOpen(!isPriceOpen)}
            className="flex items-center justify-between w-full mb-4 p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-3 h-3 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Price Range</span>
            </div>
            {isPriceOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          <div className={`pl-8 ${isPriceOpen ? 'block' : 'hidden'}`}>
            <div className="mb-6 space-y-8">
              {/* Min Price Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="min-price" className="text-xs font-medium text-gray-600">
                    Minimum
                  </label>
                  <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                    {formatPrice(localPriceRange.min)}
                  </span>
                </div>
                <input
                  id="min-price"
                  type="range"
                  min="0"
                  max={priceRange.max}
                  value={localPriceRange.min}
                  onChange={handleMinPriceChange}
                  className="w-full h-2 bg-gradient-to-r from-emerald-100 to-emerald-300 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                />
              </div>
              
              {/* Max Price Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="max-price" className="text-xs font-medium text-gray-600">
                    Maximum
                  </label>
                  <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                    {formatPrice(localPriceRange.max)}
                  </span>
                </div>
                <input
                  id="max-price"
                  type="range"
                  min={priceRange.min}
                  max="20000"
                  value={localPriceRange.max}
                  onChange={handleMaxPriceChange}
                  className="w-full h-2 bg-gradient-to-r from-emerald-100 to-emerald-300 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                />
              </div>
            </div>
            
            {/* Price Range Display */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-100">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">From</div>
                <div className="text-lg font-bold text-emerald-700">
                  {formatPrice(localPriceRange.min)}
                </div>
              </div>
              <div className="w-8 h-0.5 bg-emerald-300"></div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">To</div>
                <div className="text-lg font-bold text-emerald-700">
                  {formatPrice(localPriceRange.max)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Filters Button (Desktop) */}
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="hidden lg:flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
          >
            <Filter className="w-4 h-4" />
            Clear All Filters
          </button>
        )}
      </div>
    </>
  );
};

export default ProductFilters;