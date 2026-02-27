// frontend\src\components\ArtisanDashboard\ProductListView.jsx
import React, { useState } from "react";
import { 
  Edit2, 
  Trash2, 
  Eye, 
  Star, 
  ShoppingCart, 
  Package,
  Plus,
  Minus,
  X
} from "lucide-react";

const ProductListView = ({
  products,
  onView,
  onEdit,
  onDelete,
  onQuickStockUpdate,
  getStatusBadge,
  getCategoryIcon,
  formatCurrency,
  canEditProduct,
  canDeleteProduct
}) => {
  const [updatingStockFor, setUpdatingStockFor] = useState(null);
  const [stockValue, setStockValue] = useState(0);

  const handleStockUpdateClick = (product) => {
    setUpdatingStockFor(product._id || product.id);
    setStockValue(product.stock);
  };

  const handleStockUpdate = async (productId) => {
    await onQuickStockUpdate(productId, stockValue);
    setUpdatingStockFor(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-amber-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-600">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Product</th>
              <th className="px-4 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Category</th>
              <th className="px-4 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Price</th>
              <th className="px-4 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Stock</th>
              <th className="px-4 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-4 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Sales</th>
              <th className="px-4 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Rating</th>
              <th className="px-4 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product) => {
              if (!product) return null;
              
              const statusBadge = getStatusBadge(product.status, product.approvalStatus, product.stock);
              const StatusIcon = statusBadge.icon;
              const CategoryIcon = getCategoryIcon(product.category);
              const canEdit = canEditProduct(product);
              const canDelete = canDeleteProduct(product);
              const isLowStock = product.stock <= 5 && product.stock > 0;
              const isOutOfStock = product.stock < 5;
              const isUpdating = updatingStockFor === (product._id || product.id);
              
              return (
                <tr 
                  key={product._id || product.id} 
                  className="hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 transition-all duration-200 group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={product.images?.[0] || product.image || 'https://via.placeholder.com/300'}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300';
                          }}
                        />
                        {(isLowStock || isOutOfStock) && (
                          <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full animate-ping ${
                            isOutOfStock ? 'bg-purple-500' : 'bg-orange-500'
                          }`}></span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-800 dark:text-white">{product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">ID: {product._id?.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                      <CategoryIcon size={14} className="text-amber-500" />
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {formatCurrency(product.price)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isUpdating ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setStockValue(prev => Math.max(0, prev - 1))}
                          className="p-0.5 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200"
                          disabled={stockValue <= 0}
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          value={stockValue}
                          onChange={(e) => setStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-12 text-center text-xs border border-gray-200 rounded py-0.5"
                          min="0"
                        />
                        <button
                          onClick={() => setStockValue(prev => prev + 1)}
                          className="p-0.5 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => handleStockUpdate(product._id || product.id)}
                          className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded hover:from-amber-600 hover:to-orange-600"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setUpdatingStockFor(null)}
                          className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300"
                        >
                          ✗
                        </button>
                      </div>
                    ) : (
                      <span
                        onClick={() => (isLowStock || isOutOfStock) && handleStockUpdateClick(product)}
                        className={`text-sm cursor-pointer ${
                          isOutOfStock ? 'text-purple-600 font-medium' :
                          isLowStock ? 'text-orange-600 font-medium' : 
                          'text-gray-600 dark:text-gray-300'
                        } ${(isLowStock || isOutOfStock) ? 'hover:underline' : ''}`}
                        title={(isLowStock || isOutOfStock) ? 'Click to update stock' : ''}
                      >
                        {product.stock}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${statusBadge.color}`}>
                      <StatusIcon size={12} className="mr-1" />
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <ShoppingCart size={14} className="text-emerald-500" />
                      {product.sales || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      {(product.rating || 4.0).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(product)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                        title="View Product"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(product)}
                        className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                          canEdit || isLowStock || isOutOfStock
                            ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                        disabled={!canEdit && !isLowStock && !isOutOfStock}
                        title={canEdit ? 'Edit Product' : isLowStock || isOutOfStock ? 'Update Stock' : 'Cannot edit approved products'}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(product._id || product.id)}
                        className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                          canDelete
                            ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                        disabled={!canDelete}
                        title={canDelete ? 'Delete Product' : 'Cannot delete approved products'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductListView;