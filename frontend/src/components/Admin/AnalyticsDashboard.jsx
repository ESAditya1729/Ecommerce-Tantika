import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag, Calendar } from 'lucide-react';

const AnalyticsDashboard = ({ fullView = false }) => {
  const analyticsData = {
    revenueData: [
      { month: 'Jan', revenue: 45000 },
      { month: 'Feb', revenue: 52000 },
      { month: 'Mar', revenue: 48000 },
      { month: 'Apr', revenue: 61000 },
      { month: 'May', revenue: 55000 },
      { month: 'Jun', revenue: 72000 },
    ],
    topProducts: [
      { name: 'Kantha Saree', sales: 156, revenue: 546000 },
      { name: 'Terracotta Art', sales: 98, revenue: 186200 },
      { name: 'Jute Bags', sales: 87, revenue: 78300 },
      { name: 'Dhokra Sculpture', sales: 65, revenue: 168900 },
      { name: 'Block Print Kurtas', sales: 142, revenue: 213000 },
    ],
    trafficSources: [
      { source: 'Direct', visitors: 1245, percentage: 45 },
      { source: 'Social Media', visitors: 890, percentage: 32 },
      { source: 'Search Engines', visitors: 567, percentage: 20 },
      { source: 'Referrals', visitors: 123, percentage: 4 },
    ]
  };

  return (
    <div>
      {fullView ? (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">₹2.48L</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+24.5%</span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                <ShoppingBag className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">156</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12.3%</span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">342</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8.2%</span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
                <BarChart3 className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">3.2%</p>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">-0.5%</span>
                <span className="text-sm text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trends</h3>
              <div className="space-y-4">
                {analyticsData.revenueData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-16 text-sm text-gray-600">{item.month}</div>
                    <div className="flex-1 ml-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">₹{(item.revenue / 1000).toFixed(1)}K</span>
                        <span className="text-sm text-gray-500">
                          {index > 0 ? 
                            `${((item.revenue - analyticsData.revenueData[index-1].revenue) / analyticsData.revenueData[index-1].revenue * 100).toFixed(1)}%` 
                            : '-'
                          }
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(item.revenue / 80000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Selling Products</h3>
              <div className="space-y-4">
                {analyticsData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🏆</span>
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sales} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{(product.revenue / 1000).toFixed(1)}K</p>
                      <p className="text-sm text-gray-500">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic Sources</h3>
              <div className="space-y-4">
                {analyticsData.trafficSources.map((source, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">{source.source}</span>
                      <span className="text-sm text-gray-600">{source.visitors} visitors ({source.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${source.percentage}%`,
                          backgroundColor: index === 0 ? '#3B82F6' : 
                                         index === 1 ? '#8B5CF6' : 
                                         index === 2 ? '#10B981' : '#F59E0B'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { action: 'New order placed', time: '2 min ago', amount: '₹2,450' },
                  { action: 'Product restocked', time: '15 min ago', product: 'Kantha Saree' },
                  { action: 'User registered', time: '1 hour ago', user: 'Priya Sharma' },
                  { action: 'Order shipped', time: '2 hours ago', order: 'TNT-2455' },
                  { action: 'Review received', time: '3 hours ago', rating: '5 stars' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    {activity.amount && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        {activity.amount}
                      </span>
                    )}
                    {activity.product && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {activity.product}
                      </span>
                    )}
                    {activity.user && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                        {activity.user}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
              <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="font-bold text-gray-900">₹2.48L</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
              <ShoppingBag className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="font-bold text-gray-900">156</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="font-bold text-gray-900">342</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
              <BarChart3 className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="font-bold text-gray-900">3.2%</p>
              <p className="text-sm text-gray-600">Conversion</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Monthly Growth</span>
              <span className="text-sm font-medium text-green-600">+24.5%</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;