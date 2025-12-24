import { Filter, X } from 'lucide-react';
import { categories } from '../../data/products';

const ProductFilters = ({ 
  selectedCategory, 
  onCategoryChange, 
  sortBy, 
  onSortChange,
  priceRange,
  onPriceChange,
  isMobileFiltersOpen,
  onMobileFiltersToggle
}) => {
  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={onMobileFiltersToggle}
        className="md:hidden flex items-center justify-center w-full bg-white border border-gray-300 rounded-lg py-3 px-4 mb-6"
      >
        <Filter className="w-5 h-5 mr-2" />
        Filters & Sort
      </button>

      {/* Filters Panel */}
      <div className={`
        ${isMobileFiltersOpen ? 'block' : 'hidden'} 
        md:block bg-white rounded-xl border border-gray-200 p-6
      `}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </h3>
          <button
            onClick={onMobileFiltersToggle}
            className="md:hidden text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h4 className="font-semibold mb-4 text-gray-700">Category</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className={`
                  ${selectedCategory === category ? 'text-blue-600 font-medium' : 'text-gray-600'}
                `}>
                  {category}
                </span>
                {category !== 'All' && (
                  <span className="ml-auto text-sm text-gray-500">12</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-8">
          <h4 className="font-semibold mb-4 text-gray-700">Price Range</h4>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>₹{priceRange.min}</span>
              <span>₹{priceRange.max}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              value={priceRange.max}
              onChange={(e) => onPriceChange({ ...priceRange, max: e.target.value })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center text-sm text-gray-500">
              Max: ₹{priceRange.max}
            </div>
          </div>
        </div>

        {/* Sort By */}
        <div className="mb-8">
          <h4 className="font-semibold mb-4 text-gray-700">Sort By</h4>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => {
            onCategoryChange('All');
            onPriceChange({ min: 0, max: 10000 });
            onSortChange('featured');
          }}
          className="w-full border-2 border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </>
  );
};

export default ProductFilters;