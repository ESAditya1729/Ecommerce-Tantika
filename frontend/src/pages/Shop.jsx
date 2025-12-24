import { useState, useEffect } from 'react';
import ShopHero from '../components/Shop/ShopHero';
import ProductFilters from '../components/Shop/ProductFilters';
import ProductGrid from '../components/Shop/ProductGrid';
import Pagination from '../components/Shop/Pagination';
import productsData, { categories } from '../data/products';

const Products = () => {
  // State
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Load products
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProducts(productsData);
      setFilteredProducts(productsData);
      setIsLoading(false);
    }, 500);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Apply price filter
    result = result.filter(product => product.price >= priceRange.min && product.price <= priceRange.max);

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id); // Using ID as proxy for date
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        result.sort((a, b) => b.featured - a.featured || b.rating - a.rating);
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, selectedCategory, priceRange, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setIsMobileFiltersOpen(!isMobileFiltersOpen);
  };

  // Stats
  const stats = {
    total: products.length,
    filtered: filteredProducts.length,
    categories: [...new Set(products.map(p => p.category))].length
  };

  return (
    <div>
      <ShopHero />
      
      <div className="container mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
            {selectedCategory !== 'All' && (
              <span className="font-medium"> in "{selectedCategory}"</span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <span className="font-medium mr-2">Categories:</span>
              <span className="text-blue-600">{stats.categories}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">Artisans:</span>
              <span className="text-purple-600">
                {[...new Set(products.map(p => p.artisan))].length}+
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <ProductFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              isMobileFiltersOpen={isMobileFiltersOpen}
              onMobileFiltersToggle={toggleMobileFilters}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            <ProductGrid
              products={paginatedProducts}
              isLoading={isLoading}
            />
            
            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            )}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">How Our Order Process Works</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold">1</span>
                </div>
                <h4 className="font-bold mb-2">Express Interest</h4>
                <p className="text-gray-600 text-sm">
                  Click "Express Interest" on any product to share your details
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold">2</span>
                </div>
                <h4 className="font-bold mb-2">We Contact You</h4>
                <p className="text-gray-600 text-sm">
                  Our team contacts you within 24 hours to discuss details
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bold">3</span>
                </div>
                <h4 className="font-bold mb-2">Personalized Service</h4>
                <p className="text-gray-600 text-sm">
                  We handle delivery, customization, and payment as per your preference
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;