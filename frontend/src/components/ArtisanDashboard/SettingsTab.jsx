// frontend\src\components\ArtisanDashboard\SettingsTab.jsx
import React from 'react';
import { Settings } from 'lucide-react';

const SettingsTab = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Settings</h3>
      
      <div className="text-center py-12">
        <Settings className="h-16 w-16 text-amber-300 mx-auto mb-4" />
        <p className="text-gray-500">Settings section coming soon...</p>
        <p className="text-sm text-gray-400 mt-2">Manage your profile, payment, and preferences</p>
      </div>
    </div>
  );
};

export default SettingsTab;