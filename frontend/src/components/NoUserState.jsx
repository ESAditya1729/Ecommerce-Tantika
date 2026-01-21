import { Shield } from 'lucide-react';

export const NoUserState = ({ onLogin }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
    <div className="text-center p-8">
      <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Shield className="w-12 h-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
      <p className="text-gray-600 mb-6">Please login to access your dashboard</p>
      <button
        onClick={onLogin}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
      >
        Go to Login
      </button>
    </div>
  </div>
);