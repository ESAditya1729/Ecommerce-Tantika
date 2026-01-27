import { Package, Heart, ShoppingCart, Award } from 'lucide-react';
import { StatCard } from './StatsCard';

export const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Orders - Non-clickable */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300 cursor-default">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
            <Package className="w-6 h-6" />
          </div>
          {stats.totalOrders > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              +12%
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm font-medium mb-1">Total Orders</p>
        <div className="flex items-baseline">
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">Completed purchases</p>
      </div>
      
      {/* Wishlist Items - Non-clickable */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow duration-300 cursor-default">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600">
            <Heart className="w-6 h-6" />
          </div>
        </div>
        <p className="text-gray-500 text-sm font-medium mb-1">Wishlist Items</p>
        <div className="flex items-baseline">
          <p className="text-2xl font-bold text-gray-900">{stats.wishlistCount}</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">Saved for later</p>
      </div>
      
      {/* Cart Items - Non-clickable */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-pink-500 hover:shadow-xl transition-shadow duration-300 cursor-default">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-pink-100 text-pink-600">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>
        <p className="text-gray-500 text-sm font-medium mb-1">Cart Items</p>
        <div className="flex items-baseline">
          <p className="text-2xl font-bold text-gray-900">{stats.cartCount}</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">Ready to checkout</p>
      </div>
      
      {/* Loyalty Points - Non-clickable */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-500 hover:shadow-xl transition-shadow duration-300 cursor-default">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600">
            <Award className="w-6 h-6" />
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            Level {stats.points > 0 ? Math.floor(stats.points / 100) + 1 : 1}
          </span>
        </div>
        <p className="text-gray-500 text-sm font-medium mb-1">Loyalty Points</p>
        <div className="flex items-baseline">
          <p className="text-2xl font-bold text-gray-900 mr-2">{stats.points}</p>
          <span className="text-gray-600">pts</span>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (stats.points % 100))}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {100 - (stats.points % 100)} points to next level
          </p>
        </div>
      </div>
    </div>
  );
};