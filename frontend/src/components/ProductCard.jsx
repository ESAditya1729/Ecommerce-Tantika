import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
      {/* Product Image */}
      <div className="relative h-64 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
            -{product.discount}%
          </div>
        )}
        
        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
        
        {/* Quick Add to Cart */}
        <button className="absolute bottom-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:shadow-lg">
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <span className="text-sm text-blue-600 font-medium">{product.category}</span>
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
        
        {/* Rating */}
        <div className="flex items-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className={`w-4 h-4 ${star <= Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
            />
          ))}
          <span className="text-sm text-gray-600 ml-2">({product.rating})</span>
        </div>

        {/* Price and Action */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
            {product.discount && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ₹{(product.price / (1 - product.discount/100)).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* View Details */}
        <Link 
          to={`/product/${product.id}`}
          className="block text-center mt-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 hover:text-white hover:from-blue-600 hover:to-purple-600 font-semibold rounded-lg transition-all duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;