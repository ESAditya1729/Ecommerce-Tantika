import { useState, useEffect, useCallback } from 'react';
import ShopHero from '../components/Shop/ShopHero';
import ProductFilters from '../components/Shop/ProductFilters';
import ProductGrid from '../components/Shop/ProductGrid';
import Pagination from '../components/Shop/Pagination';
import OrderModal from '../components/Modals/OrderModal'; // Add this import
import { Loader2 } from 'lucide-react';

const Products = () => {
  // State
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  // Add OrderModal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);

  // Get API URL from environment variable
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/products/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(['All', ...data.categories]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, [API_URL]);

  // Fetch products from API
  const fetchProducts = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sort: getSortField(sortBy),
        order: getSortOrder(sortBy)
      });

      // Add category filter if not "All"
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }

      // Add price range filter
      if (priceRange.min > 0 || priceRange.max < 10000) {
        params.append('minPrice', priceRange.min.toString());
        params.append('maxPrice', priceRange.max.toString());
      }

      const response = await fetch(`${API_URL}/products?${params.toString()}`); // Fixed URL - added /api
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
        setFilteredProducts(data.products);
        setTotalProducts(data.total);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        
        // Update price range if needed
        if (priceRange.max === 10000 && data.products.length > 0) {
          const maxPriceInProducts = Math.max(...data.products.map(p => p.price));
          setPriceRange(prev => ({ 
            ...prev, 
            max: Math.ceil(maxPriceInProducts / 100) * 100 // Round up to nearest 100
          }));
        }
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, priceRange, sortBy, itemsPerPage, API_URL]);

  // Helper functions for sorting
  const getSortField = (sortOption) => {
    switch (sortOption) {
      case 'price-low':
      case 'price-high':
        return 'price';
      case 'newest':
        return 'createdAt';
      case 'rating':
        return 'rating';
      case 'featured':
      default:
        return 'sales';
    }
  };

  const getSortOrder = (sortOption) => {
    switch (sortOption) {
      case 'price-low':
        return 'asc';
      case 'price-high':
        return 'desc';
      case 'newest':
        return 'desc';
      case 'rating':
        return 'desc';
      case 'featured':
      default:
        return 'desc';
    }
  };

  // Handle express interest from ProductGrid
  const handleExpressInterest = (product) => {
    console.log('Opening order modal for:', product.name);
    setSelectedProductForOrder(product);
    setShowOrderModal(true);
  };

  // Handle share from ProductGrid
  const handleShare = (product) => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: `${window.location.origin}/product/${product._id}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/product/${product._id}`);
      alert('Product link copied to clipboard!');
    }
  };

  // Handle wishlist from ProductGrid
  const handleAddToWishlist = (product, added) => {
    console.log(`${added ? 'Added' : 'Removed'} from wishlist:`, product.name);
    // TODO: Add API call to update wishlist
  };

  // Prepare product data for OrderModal
  const getProductForModal = (product) => {
    if (!product) return null;
    
    return {
      id: product._id,
      name: product.name,
      price: product.price,
      images: product.images && product.images.length > 0 ? product.images : 
              product.image ? [product.image] : [],
      artisan: product.artisan || 'Handcrafted by Artisans',
      location: product.location || 'Across India',
      category: product.category,
      description: product.description
    };
  };

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchProducts(1);
  }, [fetchCategories, fetchProducts]);

  // Handle filter changes
  useEffect(() => {
    fetchProducts(1);
  }, [selectedCategory, priceRange, sortBy, itemsPerPage, fetchProducts]);

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('tantika_user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setIsMobileFiltersOpen(!isMobileFiltersOpen);
  };

  // Stats
  const stats = {
    total: totalProducts,
    filtered: products.length,
    categories: categories.length - 1 // Exclude "All"
  };

  // Handle price range change
  const handlePriceRangeChange = (newRange) => {
    setPriceRange(newRange);
  };

  return (
    <div>
      <ShopHero />
      
      <div className="container mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading products...
              </div>
            ) : error ? (
              <span className="text-red-600">Error: {error}</span>
            ) : (
              <>
                Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
                {selectedCategory !== 'All' && (
                  <span className="font-medium"> in "{selectedCategory}"</span>
                )}
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <span className="font-medium mr-2">Categories:</span>
              <span className="text-blue-600">{stats.categories}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">Total Products:</span>
              <span className="text-purple-600">{stats.total}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              priceRange={priceRange}
              onPriceChange={handlePriceRangeChange}
              isMobileFiltersOpen={isMobileFiltersOpen}
              onMobileFiltersToggle={toggleMobileFilters}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {error ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">Failed to load products</div>
                <button
                  onClick={() => fetchProducts(1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <ProductGrid
                  products={products}
                  isLoading={isLoading}
                  onExpressInterest={handleExpressInterest} // Pass the handler
                  onShare={handleShare} // Pass share handler
                  onAddToWishlist={handleAddToWishlist} // Pass wishlist handler
                />
                
                {/* Pagination */}
                {!isLoading && products.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                )}
                
                {!isLoading && products.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-500 mb-2">No products found</div>
                    <div className="text-sm text-gray-400">
                      Try adjusting your filters or come back later
                    </div>
                  </div>
                )}
              </>
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

      {/* Order Modal */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedProductForOrder(null);
        }}
        userId={user?.id}
        product={getProductForModal(selectedProductForOrder)}
      />
    </div>
  );
};

export default Products;