// components/CategoryShowcase.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Home, Palette, Coffee, Loader } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Category icons mapping
const categoryIcons = {
  'All': <ShoppingBag className="w-8 h-8" />,
  'Textiles & Clothing': <ShoppingBag className="w-8 h-8" />,
  'Home Decor': <Home className="w-8 h-8" />,
  'Art & Craft': <Palette className="w-8 h-8" />,
  'Food & Sweets': <Coffee className="w-8 h-8" />,
};

// Category colors mapping
const categoryColors = {
  'All': 'from-gray-500 to-gray-600',
  'Textiles & Clothing': 'from-blue-500 to-blue-600',
  'Home Decor': 'from-purple-500 to-purple-600',
  'Art & Craft': 'from-pink-500 to-pink-600',
  'Food & Sweets': 'from-orange-500 to-orange-600',
};

const CategoryShowcase = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/products/categories`);
        
        // Filter out "All" category since we want to display individual categories
        const filteredCategories = response.data.data.filter(cat => cat.name !== 'All');
        setCategories(filteredCategories);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
        
        // Fallback to hardcoded categories if API fails
        setCategories([
          {
            name: 'Textiles & Clothing',
            count: 20,
            avgPrice: 0,
            totalStock: 0
          },
          {
            name: 'Home Decor',
            count: 15,
            avgPrice: 0,
            totalStock: 0
          },
          {
            name: 'Art & Craft',
            count: 10,
            avgPrice: 0,
            totalStock: 0
          },
          {
            name: 'Food & Sweets',
            count: 5,
            avgPrice: 0,
            totalStock: 0
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Get description for category
  const getCategoryDescription = (categoryName) => {
    const descriptions = {
      'Textiles & Clothing': 'Traditional Bengali sarees, fabrics, and garments',
      'Home Decor': 'Handcrafted pottery, wall art, and home accessories',
      'Art & Craft': 'Traditional paintings, sculptures, and crafts',
      'Food & Sweets': 'Authentic Bengali sweets and traditional food items',
    };
    return descriptions[categoryName] || 'Explore our collection';
  };

  // Format category name for URL
  const formatCategoryUrl = (categoryName) => {
    return categoryName
      .toLowerCase()
      .replace(/ & /g, '-and-')
      .replace(/ & /g, '-')
      .replace(/ /g, '-');
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Explore Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our curated collection of authentic Bengali products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/shop?category=${formatCategoryUrl(category.name)}`}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col">
                {/* Category Header */}
                <div className={`bg-gradient-to-r ${categoryColors[category.name] || 'from-gray-500 to-gray-600'} p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      {categoryIcons[category.name] || <ShoppingBag className="w-8 h-8" />}
                    </div>
                    <span className="text-white/80 text-sm font-medium">
                      {category.count}+ items
                    </span>
                  </div>
                </div>

                {/* Category Info */}
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 flex-grow">
                    {getCategoryDescription(category.name)}
                  </p>
                  <div className="text-blue-600 font-medium text-sm group-hover:underline">
                    Browse Items →
                  </div>
                  
                  {/* Display average price if available */}
                  {category.avgPrice > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                      Avg. Price: ₹{category.avgPrice}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-flex items-center border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            View All Categories
          </Link>
        </div>

        {error && (
          <div className="mt-4 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 text-sm hover:underline mt-2"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryShowcase;