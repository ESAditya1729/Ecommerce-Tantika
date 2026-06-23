// src/components/Product/ProductGrid.jsx
import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import axios from 'axios';

const ProductGrid = ({ products, isLoading, viewMode }) => {
  const [productsWithDiscounts, setProductsWithDiscounts] = useState([]);

  useEffect(() => {
    // If products already have discount data from API, use it
    if (products && products.length > 0) {
      // Check if products already have discount data
      const hasDiscountData = products.some(p => p.discount !== undefined);
      
      if (hasDiscountData) {
        setProductsWithDiscounts(products);
      } else {
        // Fetch discount data for products
        fetchDiscountsForProducts(products);
      }
    }
  }, [products]);

  const fetchDiscountsForProducts = async (productList) => {
    try {
      // Fetch all active offers/discounts
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/offers`);
      
      if (response.data.success) {
        const discountedProducts = response.data.data;
        
        // Merge discount data with products
        const mergedProducts = productList.map(product => {
          const discountedProduct = discountedProducts.find(
            dp => dp._id === product._id
          );
          return {
            ...product,
            discount: discountedProduct?.discount || null
          };
        });
        
        setProductsWithDiscounts(mergedProducts);
      } else {
        setProductsWithDiscounts(productList);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      setProductsWithDiscounts(productList);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-300"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 rounded mb-3"></div>
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-300 rounded"></div>
                <div className="h-4 w-20 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (productsWithDiscounts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">No products available</div>
        <div className="text-gray-500 text-sm">Check back later for new arrivals</div>
      </div>
    );
  }

  // List view mode
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {productsWithDiscounts.map((product) => (
          <div key={product._id} className="flex gap-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-32 h-32 flex-shrink-0">
              <img
                src={product.images?.[0] || product.image || ''}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">
                  {product.discount?.isActive 
                    ? `₹${(product.price - (product.discount.type === 'percentage' 
                        ? product.price * product.discount.value / 100 
                        : product.discount.value)).toFixed(0)}`
                    : `₹${product.price}`
                  }
                </span>
                <ProductCard product={product} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Grid view mode (default)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {productsWithDiscounts.map((product) => (
        <ProductCard 
          key={product._id} 
          product={product}
        />
      ))}
    </div>
  );
};

export default ProductGrid;