import { ShoppingBag, Star, MapPin, Eye } from 'lucide-react';
import { useState } from 'react';

const ProductCard = ({ product, onOrderClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div className="group bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Product Images */}
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        <img
          src={product.images[currentImageIndex]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Image Navigation */}
        {product.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}
        
        {/* Quick View */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Quick view functionality can be added here
          }}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
          aria-label="Quick view"
        >
          <Eye className="w-5 h-5 text-gray-600" />
        </button>
        
        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            Featured
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Category and Location */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-blue-600">{product.category}</span>
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="w-3 h-3 mr-1" />
            {product.location.split(',')[0]}
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
        
        {/* Artisan Info */}
        <div className="text-sm text-gray-600 mb-3">
          By <span className="font-medium">{product.artisan}</span>
        </div>
        
        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex mr-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        {/* Price and Stock */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-2xl font-bold text-gray-900">₹{product.price}</div>
            <div className="text-sm text-gray-500">
              {product.stock > 5 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
            </div>
          </div>
        </div>

        {/* Order Button */}
        <button
          onClick={onOrderClick}
          disabled={product.stock === 0}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center transition-all ${
            product.stock === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-lg'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          {product.stock === 0 ? 'Out of Stock' : 'Express Interest'}
        </button>

        {/* Description Preview */}
        <p className="text-sm text-gray-600 mt-4 line-clamp-2">
          {product.description}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;