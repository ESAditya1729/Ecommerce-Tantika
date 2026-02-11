// SummaryCards.jsx (Updated to work with your current props structure)
import React from 'react';
import { 
  Package, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  ShoppingBag,
  DollarSign
} from 'lucide-react';

const SummaryCards = ({
  totalProducts = 0,        
  totalSales = 0,
  avgRating = 0,
  activeProducts = 0,
  outOfStockProducts = 0,
  pendingApprovalProducts = 0,
  lowStockProducts = 0,
  totalValue = 0,
  totalStock = 0,
  avgPrice = 0,
  minPrice = 0,
  maxPrice = 0
}) => {
  // Calculate percentages
  const activePercentage = totalProducts > 0 
    ? Math.round((activeProducts / totalProducts) * 100) 
    : 0;
  
  const outOfStockPercentage = totalProducts > 0 
    ? Math.round((outOfStockProducts / totalProducts) * 100) 
    : 0;
  
  const pendingPercentage = totalProducts > 0 
    ? Math.round((pendingApprovalProducts / totalProducts) * 100) 
    : 0;

  // Get rating label
  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Great';
    if (rating >= 3.0) return 'Good';
    if (rating >= 2.0) return 'Fair';
    return 'Poor';
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
      {/* Total Products Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl shadow-sm border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-blue-700 mb-1">Total Products</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {formatNumber(totalProducts)}
            </h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="pt-3 border-t border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Active</span>
            <span className="font-medium text-gray-900">
              {activeProducts} ({activePercentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* Total Sales Card */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl shadow-sm border border-green-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-green-700 mb-1">Total Sales</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {formatNumber(totalSales)}
            </h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="pt-3 border-t border-green-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Avg. Price</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(avgPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Average Rating Card */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl shadow-sm border border-amber-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-amber-700 mb-1">Avg. Rating</p>
            <div className="flex items-baseline">
              <h3 className="text-2xl font-bold text-gray-900 mr-2">
                {avgRating.toFixed(1)}
              </h3>
              <span className="text-gray-600 text-sm">/5.0</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <Star className="w-6 h-6 text-amber-600" />
          </div>
        </div>
        <div className="pt-3 border-t border-amber-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Rating</span>
            <span className={`font-medium px-2 py-1 rounded-full text-xs ${
              avgRating >= 4.0 ? 'bg-green-100 text-green-700' :
              avgRating >= 3.0 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {getRatingLabel(avgRating)}
            </span>
          </div>
        </div>
      </div>

      {/* Total Inventory Value */}
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl shadow-sm border border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-indigo-700 mb-1">Inventory Value</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalValue)}
            </h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <DollarSign className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <div className="pt-3 border-t border-indigo-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Stock</span>
            <span className="font-medium text-gray-900">
              {formatNumber(totalStock)} units
            </span>
          </div>
        </div>
      </div>

      {/* Active Products Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl shadow-sm border border-emerald-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-emerald-700 mb-1">Active Products</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {formatNumber(activeProducts)}
            </h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
        <div className="pt-3 border-t border-emerald-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Of Total</span>
            <span className="font-medium text-gray-900">
              {activePercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Out of Stock Card */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl shadow-sm border border-red-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-red-700 mb-1">Out of Stock</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {formatNumber(outOfStockProducts)}
            </h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <div className="pt-3 border-t border-red-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Of Total</span>
            <span className="font-medium text-gray-900">
              {outOfStockPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Low Stock Card */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl shadow-sm border border-orange-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-orange-700 mb-1">Low Stock</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {formatNumber(lowStockProducts)}
            </h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <ShoppingBag className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        <div className="pt-3 border-t border-orange-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Threshold: &lt; 5 units</span>
            <span className="font-medium px-2 py-1 rounded-full text-xs bg-orange-200 text-orange-700">
              Needs Restock
            </span>
          </div>
        </div>
      </div>

      {/* Pending Approval Card */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl shadow-sm border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-purple-700 mb-1">Pending Approval</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {formatNumber(pendingApprovalProducts)}
            </h3>
          </div>
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div className="pt-3 border-t border-purple-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Of Total</span>
            <span className="font-medium text-gray-900">
              {pendingPercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;