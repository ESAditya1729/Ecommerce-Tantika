// frontend\src\components\ArtisanDashboard\AnalyticsTab.jsx
import React from 'react';
import { BarChart3 } from 'lucide-react';

const AnalyticsTab = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Analytics Dashboard</h3>
      
      <div className="text-center py-12">
        <BarChart3 className="h-16 w-16 text-amber-300 mx-auto mb-4" />
        <p className="text-gray-500">Analytics section coming soon...</p>
        <p className="text-sm text-gray-400 mt-2">View your sales, trends, and performance metrics</p>
      </div>
    </div>
  );
};

export default AnalyticsTab;