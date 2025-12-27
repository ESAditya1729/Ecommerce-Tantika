// components/SummaryCards.jsx
import React from 'react';
import { Package, TrendingUp, Star } from 'lucide-react';

const SummaryCards = ({ products, summaryStats, onLowStockAlert, onOutOfStockAlert }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Inventory Alert</h3>
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">Products with low stock</p>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-gray-900">
            {summaryStats?.lowStockCount || 0}
          </span>
          <button 
            onClick={onLowStockAlert}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Restock
          </button>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Top Seller</h3>
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">Best performing product</p>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">
            {products.length > 0 
              ? products.reduce((prev, current) => (prev.sales > current.sales) ? prev : current).name
              : 'No products'
            }
          </span>
          <span className="text-sm bg-green-200 text-green-800 px-2 py-1 rounded">
            {products.length > 0 
              ? `${products.reduce((prev, current) => (prev.sales > current.sales) ? prev : current).sales || 0} sales`
              : '0 sales'
            }
          </span>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Out of Stock</h3>
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">Products need restocking</p>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-gray-900">
            {summaryStats?.outOfStockCount || 0}
          </span>
          <button 
            onClick={onOutOfStockAlert}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            View All
          </button>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Avg. Rating</h3>
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Star className="w-6 h-6 text-amber-600" />
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">Customer satisfaction</p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900 mr-2">
              {summaryStats?.avgRating ? summaryStats.avgRating.toFixed(1) : '0.0'}
            </span>
            <span className="text-gray-600">/5.0</span>
          </div>
          <span className="text-sm bg-amber-200 text-amber-800 px-2 py-1 rounded">
            {summaryStats?.avgRating >= 4.5 ? 'Excellent' : 
             summaryStats?.avgRating >= 4.0 ? 'Good' : 
             summaryStats?.avgRating >= 3.0 ? 'Average' : 'Poor'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;