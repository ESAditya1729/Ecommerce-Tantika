// frontend\src\components\ArtisanDashboard\OverviewTab.jsx
import React from 'react';
import { Package, ShoppingBag, Clock, TrendingUp, Star } from 'lucide-react';

const OverviewTab = ({ stats, recentOrders, pendingProducts, onTabChange }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      under_review: 'bg-orange-100 text-orange-800',
      changes_requested: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const StatCard = ({ icon: Icon, label, value, bgColor, iconColor }) => (
    <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section with Rating */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Your Creative Corner</h2>
            <p className="text-amber-100">Your handmade creations are bringing joy to customers everyday.</p>
          </div>
          <div className="flex items-center bg-white/20 rounded-lg px-3 py-2">
            <Star className="h-5 w-5 text-yellow-300 fill-current" />
            <span className="ml-2 font-semibold">{stats?.averageRating || 4.8}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Package} 
          label="Total Products" 
          value={stats?.totalProducts || 0}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard 
          icon={Clock} 
          label="Pending Approval" 
          value={stats?.pendingApproval || 0}
          bgColor="bg-yellow-50"
          iconColor="text-yellow-600"
        />
        <StatCard 
          icon={ShoppingBag} 
          label="Active Orders" 
          value={stats?.activeOrders || 0}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Total Earnings" 
          value={`₹${stats?.totalEarnings?.toLocaleString() || 0}`}
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
            <button 
              onClick={() => onTabChange('orders')}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentOrders?.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 hover:bg-amber-50 rounded-lg transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Package size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{order.product}</p>
                      <p className="text-sm text-gray-500">by {order.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">{order.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </div>

        {/* Pending Products */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Pending Approval</h3>
            <button 
              onClick={() => onTabChange('products')}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {pendingProducts?.length > 0 ? (
              pendingProducts.map((product) => (
                <div key={product.id} className="p-3 hover:bg-amber-50 rounded-lg transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.price}</p>
                      <p className="text-xs text-gray-400 mt-1">Submitted: {product.submittedDate}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(product.status)}`}>
                      {product.status === 'under_review' ? 'Under Review' : 'Changes Needed'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No products pending</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionButton icon={Package} label="Add Product" onClick={() => onTabChange('products')} />
          <QuickActionButton icon={ShoppingBag} label="View Orders" onClick={() => onTabChange('orders')} />
          <QuickActionButton icon={TrendingUp} label="Analytics" onClick={() => onTabChange('analytics')} />
          <QuickActionButton icon={Star} label="Reviews" onClick={() => {}} />
        </div>
      </div>
    </div>
  );
};

const QuickActionButton = ({ icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition group"
  >
    <Icon className="h-6 w-6 text-amber-600 group-hover:text-amber-700 mb-2" />
    <span className="text-sm text-amber-700 group-hover:text-amber-800">{label}</span>
  </button>
);

export default OverviewTab;