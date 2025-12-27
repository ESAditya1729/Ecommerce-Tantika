// components/ProductCard.jsx
import React from 'react';
import { Edit, Trash2, Eye, Package, Star, TrendingUp } from 'lucide-react';

const ProductCard = ({ 
  product, 
  onView, 
  onEdit, 
  onDelete, 
  onManageStock 
}) => {
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'green', label: 'Active' },
      out_of_stock: { color: 'red', label: 'Out of Stock' },
      low_stock: { color: 'yellow', label: 'Low Stock' },
      draft: { color: 'gray', label: 'Draft' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${config.color}-100 text-${config.color}-800`}>
        {config.label}
      </span>
    );
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Out of Stock</span>;
    if (stock < 5) return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>;
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">In Stock</span>;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.category}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{product.rating?.toFixed(1) || '0.0'}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Price</span>
            <span className="text-lg font-bold text-gray-900">₹{product.price?.toLocaleString() || '0'}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Stock</span>
            <div className="flex items-center space-x-2">
              {getStockBadge(product.stock)}
              <span className="text-sm font-medium">{product.stock || 0} units</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status</span>
            {getStatusBadge(product.status)}
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Sales</span>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="font-medium">{product.sales || 0} units</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <div className="flex space-x-2">
            <button 
              onClick={() => onView(product)}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onEdit(product)}
              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
              title="Edit Product"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(product)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => onManageStock(product)}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            Manage Stock
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;