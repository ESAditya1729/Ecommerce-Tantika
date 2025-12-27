import { User, Mail, Phone, MapPin, Shield, LogOut } from 'lucide-react';

const ProfileCard = ({ user, onLogout }) => (
  <div className="bg-white rounded-2xl shadow-xl p-8">
    <div className="flex justify-between items-start mb-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
        <User className="w-6 h-6 mr-3 text-blue-600" />
        Profile Overview
      </h2>
      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
        {user.role}
      </span>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-xl">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            <User className="w-4 h-4 inline mr-2" />
            Full Name
          </label>
          <p className="text-lg font-semibold text-gray-900">{user.username}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-xl">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address
          </label>
          <p className="text-lg font-semibold text-gray-900">{user.email}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-xl">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            <Shield className="w-4 h-4 inline mr-2" />
            Account Type
          </label>
          <p className="text-lg font-semibold text-gray-900 capitalize">{user.role}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {user.phone && (
          <div className="bg-gray-50 p-4 rounded-xl">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <p className="text-lg font-semibold text-gray-900">{user.phone}</p>
          </div>
        )}
        
        {user.address && (
          <div className="bg-gray-50 p-4 rounded-xl">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              <MapPin className="w-4 h-4 inline mr-2" />
              Default Address
            </label>
            <p className="text-sm text-gray-900">{user.address}</p>
          </div>
        )}
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Member ID
          </label>
          <p className="text-lg font-semibold text-gray-900 font-mono">
            TNT{user.id?.toString().padStart(6, '0') || '000001'}
          </p>
        </div>
      </div>
    </div>
    
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
      <button
        onClick={() => window.location.href = '/profile/edit'}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
      >
        Edit Profile
      </button>
      
      <button
        onClick={onLogout}
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
      >
        <LogOut className="mr-2 w-5 h-5" />
        Logout
      </button>
    </div>
  </div>
);