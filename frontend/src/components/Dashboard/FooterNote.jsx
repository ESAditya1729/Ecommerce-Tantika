import { Shield } from 'lucide-react';

export const FooterNote = ({ onRefresh }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <Shield className="w-5 h-5" />
          <span className="font-medium">Secure Connection</span>
        </div>
        <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
        <div className="text-sm text-gray-500">
          Your data is securely encrypted. Last updated: {new Date().toLocaleTimeString()}
        </div>
        <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
        <button
          onClick={onRefresh}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Refresh Data
        </button>
      </div>
    </div>
  </div>
);