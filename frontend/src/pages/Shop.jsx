import { useState, useEffect } from "react";
import ShopHero from "../components/Shop/ShopHero";
import ProductFilters from "../components/Shop/ProductFilters";
import ProductGrid from "../components/Shop/ProductGrid";
import Pagination from "../components/Shop/Pagination";
import { Loader2, AlertCircle } from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/api";

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Get categories
      const catRes = await fetch(`${API_URL}/products/categories`);
      
      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData.success) {
          setCategories(["All", ...(catData.categories || [])]);
        }
      } else {
        setCategories(["All", "Sarees", "Home Decor", "Clothing", "Jewelry"]);
      }

      // Build products query
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
      });

      if (selectedCategory !== "All") {
        params.append("category", selectedCategory);
      }

      if (priceRange.min > 0) {
        params.append("minPrice", priceRange.min.toString());
      }
      if (priceRange.max < 5000) {
        params.append("maxPrice", priceRange.max.toString());
      }

      // Add sorting
      if (sortBy === "price-low") {
        params.append("sort", "price");
        params.append("order", "asc");
      } else if (sortBy === "price-high") {
        params.append("sort", "price");
        params.append("order", "desc");
      } else if (sortBy === "newest") {
        params.append("sort", "createdAt");
        params.append("order", "desc");
      }

      // Get products
      const url = `${API_URL}/products?${params.toString()}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Failed to load products`);
      }

      const data = await res.json();
      
      if (data.success) {
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
      } else {
        throw new Error(data.message || "Failed to load products");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, selectedCategory, sortBy, priceRange]);

  return (
    <div>
      <ShopHero />
      
      <div className="container mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
                <button 
                  onClick={fetchData}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

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
              onPriceChange={setPriceRange}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {products.length} of {totalProducts} products
                </div>
                <ProductGrid products={products} />
                {totalProducts > 12 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalProducts / 12)}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Try adjusting your filters or check back later
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;