import React from 'react';
import { Package, ShoppingBag, Clock, TrendingUp, Star, Info, Phone, CreditCard, Truck, Shield } from 'lucide-react';

const OverviewTab = ({ stats, recentOrders, pendingProducts, onTabChange }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      under_review: 'bg-orange-100 text-orange-800',
      changes_requested: 'bg-red-100 text-red-800',
      interested: 'bg-blue-100 text-blue-800'
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

  const PolicyCard = ({ icon: Icon, title, description }) => (
    <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg">
      <div className="flex-shrink-0">
        <Icon className="h-5 w-5 text-amber-600" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section with Instructions */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Welcome to Your Artisan Dashboard!</h2>
            <p className="text-amber-100">Here's how our platform works:</p>
          </div>
          <div className="flex items-center bg-white/20 rounded-lg px-3 py-2">
            <Star className="h-5 w-5 text-yellow-300 fill-current" />
            <span className="ml-2 font-semibold">{stats?.averageRating || '4.8'}</span>
          </div>
        </div>
        
        {/* Quick Instructions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-sm font-medium mb-1">📦 Adding Products</p>
            <p className="text-xs text-amber-100">Click on 'Create' in Products tab, fill details and submit for admin approval</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-sm font-medium mb-1">✅ Product Approval</p>
            <p className="text-xs text-amber-100">Once approved by admin, products appear in the main Shop page</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-sm font-medium mb-1">📋 Customer Interest</p>
            <p className="text-xs text-amber-100">Interested customers appear in Orders - contact them for customization</p>
          </div>
        </div>
      </div>
      {/* Platform Policies */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Policies & Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PolicyCard 
            icon={Phone}
            title="Customer Communication"
            description="Contact customers to confirm customization, quantity, and color preferences"
          />
          <PolicyCard 
            icon={CreditCard}
            title="Payment Terms"
            description="Discuss payment with customer after product confirmation"
          />
          <PolicyCard 
            icon={Truck}
            title="Delivery Process"
            description="Customer provides delivery address, discuss delivery date and charges"
          />
          <PolicyCard 
            icon={Shield}
            title="Platform Fee"
            description="Platform fee will be deducted by admin from your earnings"
          />
        </div>
        
        {/* Additional Guidelines */}
        <div className="mt-4 p-4 bg-amber-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">📋 Order Fulfillment Checklist:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>1. ✓ Contact customer immediately when they show interest</li>
            <li>2. ✓ Confirm customization details, quantity, and color preferences</li>
            <li>3. ✓ Update order status to 'confirmed' after customer confirmation</li>
            <li>4. ✓ Discuss delivery date and payment terms with customer</li>
            <li>5. ✓ Get delivery address from customer</li>
            <li>6. ✓ Platform fee will be handled by admin</li>
          </ul>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionButton icon={Package} label="Add Product" onClick={() => onTabChange('products')} />
          <QuickActionButton icon={ShoppingBag} label="View Orders" onClick={() => onTabChange('orders')} />
          <QuickActionButton icon={Clock} label="Pending Products" onClick={() => onTabChange('products')} />
          <QuickActionButton icon={TrendingUp} label="Earnings" onClick={() => onTabChange('analytics')} />
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