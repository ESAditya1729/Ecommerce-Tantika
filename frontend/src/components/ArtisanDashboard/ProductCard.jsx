// frontend\src\components\ArtisanDashboard\ProductCard.jsx
import React, { useState } from "react";
import { 
  Edit2, 
  Trash2, 
  Eye, 
  Star, 
  ShoppingCart, 
  EyeOff, 
  Calendar,
  AlertCircle,
  Plus,
  Minus,
  Package,
  X
} from "lucide-react";

const ProductCard = ({
  product,
  onView,
  onEdit,
  onDelete,
  onQuickStockUpdate,
  getStatusBadge,
  getCategoryIcon,
  formatCurrency,
  formatDate,
  canEditProduct,
  canDeleteProduct
}) => {
  const [showStockUpdate, setShowStockUpdate] = useState(false);
  const [stockValue, setStockValue] = useState(product.stock || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!product) return null;

  const statusBadge = getStatusBadge(product.status, product.approvalStatus, product.stock);
  const StatusIcon = statusBadge.icon;
  const CategoryIcon = getCategoryIcon(product.category);
  const canEdit = canEditProduct(product);
  const canDelete = canDeleteProduct(product);
  const isLowStock = product.stock <= 5 && product.stock > 0;
  const isOutOfStock = product.stock < 5;

  const handleStockUpdate = async () => {
    if (stockValue === product.stock) {
      setShowStockUpdate(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onQuickStockUpdate(product._id || product.id, stockValue);
      setShowStockUpdate(false);
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const incrementStock = () => {
    setStockValue(prev => prev + 1);
  };

  const decrementStock = () => {
    setStockValue(prev => Math.max(0, prev - 1));
  };

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-amber-100 dark:border-gray-700 overflow-hidden transform hover:-translate-y-2 relative"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
      
      {/* Product Image with Overlay */}
      <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
        <img
          src={product.images?.[0] || product.image || 'https://via.placeholder.com/400x400?text=Handcrafted+Product'}
          alt={product.name || 'Handcrafted product'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x400?text=Handcrafted+Product';
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${statusBadge.color} backdrop-blur-sm bg-opacity-90 shadow-lg`}>
            <StatusIcon size={12} className="mr-1" />
            {statusBadge.label}
          </span>
        </div>

        {/* Stock Badge with Quick Update */}
        {(isLowStock || isOutOfStock) && (
          <div className="absolute bottom-3 left-3 right-3 z-10">
            {!showStockUpdate ? (
              <button
                onClick={() => {
                  setShowStockUpdate(true);
                  setStockValue(product.stock);
                }}
                className="w-full px-2 py-1.5 rounded-lg text-xs font-bold text-center shadow-lg backdrop-blur-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-200 animate-pulse flex items-center justify-center gap-2"
              >
                <Package size={14} />
                {isOutOfStock ? 'Out of Stock - Click to Restock' : `Only ${product.stock} left - Click to Update Stock`}
              </button>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-xl border border-amber-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Update Stock</span>
                  <button
                    onClick={() => setShowStockUpdate(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={decrementStock}
                    className="p-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    disabled={stockValue <= 0}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={stockValue}
                    onChange={(e) => setStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 text-center text-sm border border-gray-200 dark:border-gray-600 rounded-lg py-1 bg-white dark:bg-gray-700 dark:text-white"
                    min="0"
                  />
                  <button
                    onClick={incrementStock}
                    className="p-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={handleStockUpdate}
                    disabled={isUpdating || stockValue === product.stock}
                    className="flex-1 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? '...' : 'Update'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
          <button
            onClick={() => onView(product)}
            className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 rounded-lg hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
            title="Quick View"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onEdit(product)}
            className={`p-2 backdrop-blur-sm rounded-lg hover:scale-110 transition-all duration-200 shadow-lg ${
              canEdit || isLowStock || isOutOfStock
                ? 'bg-white/90 text-amber-600 hover:bg-white'
                : 'bg-gray-200/90 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!canEdit && !isLowStock && !isOutOfStock}
            title={canEdit ? 'Edit Product' : isLowStock || isOutOfStock ? 'Update Stock' : 'Cannot edit approved products'}
          >
            <Edit2 size={18} />
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg text-xs font-medium shadow-lg">
            <CategoryIcon size={12} className="mr-1 text-amber-500" />
            {product.category || 'Uncategorized'}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Title and Rating */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base line-clamp-1 flex-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {product.name || 'Unnamed Masterpiece'}
          </h3>
          <div className="flex items-center ml-2 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-0.5">
              {(product.rating || 4.0).toFixed(1)}
            </span>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 h-8">
          {product.description || 'No description available'}
        </p>
        
        {/* Stats Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs flex items-center gap-1 text-gray-500">
              <ShoppingCart size={12} className="text-emerald-500" />
              {product.sales || 0} sold
            </span>
            <span className="text-xs flex items-center gap-1 text-gray-500">
              <EyeOff size={12} className="text-blue-500" />
              {product.views || 0} views
            </span>
          </div>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(product.createdAt)}
          </span>
        </div>

        {/* Stock Level Indicator */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">Stock Level</span>
            <span className={`font-medium ${
              isOutOfStock ? 'text-purple-600' :
              isLowStock ? 'text-orange-600' : 
              'text-emerald-600'
            }`}>
              {product.stock} units
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${
                isOutOfStock ? 'bg-purple-500' :
                isLowStock ? 'bg-orange-500' : 
                'bg-emerald-500'
              }`}
              style={{ width: `${Math.min((product.stock / 20) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Price</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-gray-800 dark:text-white">
                {formatCurrency(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {formatCurrency(product.oldPrice)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDelete(product._id || product.id)}
              className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                canDelete
                  ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
              title={canDelete ? 'Delete Product' : 'Cannot delete approved products'}
              disabled={!canDelete}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Rejection Reason */}
        {product.approvalStatus === 'rejected' && product.rejectionReason && (
          <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
            <p className="text-xs text-rose-600 dark:text-rose-400">
              <span className="font-medium block mb-1">Rejection Reason:</span>
              {product.rejectionReason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;