import { Package, Heart, ShoppingCart, Award } from 'lucide-react';
import { StatCard } from './StatsCard';

export const StatsGrid = ({ stats, onOpenWishlist }) => {  // Add onOpenWishlist prop
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Orders"
        value={stats.totalOrders}
        icon={Package}
        color="blue"
        link="/orders"
        trend={stats.totalOrders > 0 ? "+12%" : null}
      />
      
      <StatCard
        title="Wishlist Items"
        value={stats.wishlistCount}
        icon={Heart}
        color="purple"
        onClick={onOpenWishlist}  // Use onClick instead of link
      />
      
      <StatCard
        title="Cart Items"
        value={stats.cartCount}
        icon={ShoppingCart}
        color="pink"
        link="/cart"
      />
      
      <div className="rounded-2xl shadow-lg p-6 border-l-4 border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 hover:scale-[1.02] transition-transform duration-300">
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