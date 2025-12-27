import React, { useState } from 'react';
import { Save, Bell, Shield, CreditCard, Truck, Mail, Globe, Users, Database, Key } from 'lucide-react';

const SettingsPanel = () => {
  const [settings, setSettings] = useState({
    // Store Settings
    storeName: 'তন্তিকা - Bengali Crafts',
    storeEmail: 'support@tantika.com',
    storePhone: '+91 98765 43210',
    storeAddress: 'Kolkata, West Bengal, India',
    
    // Notification Settings
    emailNotifications: true,
    orderNotifications: true,
    stockAlerts: true,
    marketingEmails: false,
    
    // Shipping Settings
    shippingEnabled: true,
    freeShippingThreshold: 2000,
    shippingMethods: ['Standard', 'Express'],
    
    // Payment Settings
    paymentMethods: ['UPI', 'Credit Card', 'Debit Card', 'COD'],
    
    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: 30,
    ipWhitelist: false,
  });

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
    // API call would go here
    alert('Settings saved successfully!');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">Configure your store settings and preferences</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-5 h-5 mr-2" />
          Save All Changes
        </button>
      </div>

      <div className="space-y-8">
        {/* Store Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mr-4">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Store Settings</h3>
              <p className="text-gray-600">Configure your store information</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => handleSettingChange('store', 'storeName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Email</label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => handleSettingChange('store', 'storeEmail', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={settings.storePhone}
                onChange={(e) => handleSettingChange('store', 'storePhone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
              <textarea
                value={settings.storeAddress}
                onChange={(e) => handleSettingChange('store', 'storeAddress', e.target.value)}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-50 rounded-xl flex items-center justify-center mr-4">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Notification Settings</h3>
              <p className="text-gray-600">Configure email and system notifications</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive email alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Order Notifications</p>
                <p className="text-sm text-gray-600">New order alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.orderNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'orderNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Stock Alerts</p>
                <p className="text-sm text-gray-600">Low stock notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.stockAlerts}
                  onChange={(e) => handleSettingChange('notifications', 'stockAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Marketing Emails</p>
                <p className="text-sm text-gray-600">Promotional content</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.marketingEmails}
                  onChange={(e) => handleSettingChange('notifications', 'marketingEmails', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl flex items-center justify-center mr-4">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Shipping Settings</h3>
              <p className="text-gray-600">Configure shipping methods and rates</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold</label>
              <div className="flex items-center">
                <span className="mr-2">₹</span>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => handleSettingChange('shipping', 'freeShippingThreshold', e.target.value)}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="ml-4 text-gray-600">Minimum order amount for free shipping</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Shipping Methods</label>
              <div className="flex flex-wrap gap-3">
                {['Standard', 'Express', 'Same Day', 'International'].map((method) => (
                  <label key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.shippingMethods.includes(method)}
                      onChange={(e) => {
                        const newMethods = e.target.checked
                          ? [...settings.shippingMethods, method]
                          : settings.shippingMethods.filter(m => m !== method);
                        handleSettingChange('shipping', 'shippingMethods', newMethods);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-100 to-amber-50 rounded-xl flex items-center justify-center mr-4">
              <CreditCard className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Payment Settings</h3>
              <p className="text-gray-600">Configure payment gateways and methods</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Accepted Payment Methods</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['UPI', 'Credit Card', 'Debit Card', 'COD', 'Net Banking', 'Wallet'].map((method) => (
                <label key={method} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={settings.paymentMethods.includes(method)}
                    onChange={(e) => {
                      const newMethods = e.target.checked
                        ? [...settings.paymentMethods, method]
                        : settings.paymentMethods.filter(m => m !== method);
                      handleSettingChange('payment', 'paymentMethods', newMethods);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 font-medium text-gray-900">{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-red-100 to-red-50 rounded-xl flex items-center justify-center mr-4">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
              <p className="text-gray-600">Configure security and access controls</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Extra security for admin login</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">IP Whitelist</p>
                <p className="text-sm text-gray-600">Restrict access by IP address</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.ipWhitelist}
                  onChange={(e) => handleSettingChange('security', 'ipWhitelist', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Access Log</label>
              <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                View Access Log
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mr-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Danger Zone</h3>
              <p className="text-gray-600">Irreversible and destructive actions</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
              <div>
                <p className="font-bold text-gray-900">Delete All Data</p>
                <p className="text-sm text-gray-600">Permanently delete all store data</p>
              </div>
              <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
              <div>
                <p className="font-bold text-gray-900">Reset All Settings</p>
                <p className="text-sm text-gray-600">Reset all settings to default values</p>
              </div>
              <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Reset
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
              <div>
                <p className="font-bold text-gray-900">Export All Data</p>
                <p className="text-sm text-gray-600">Download complete database backup</p>
              </div>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;