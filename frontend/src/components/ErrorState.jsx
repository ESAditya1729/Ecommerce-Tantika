import { AlertCircle } from 'lucide-react';

export const ErrorState = ({ error, onLogin, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
    <div className="text-center p-8 max-w-md">
      <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <div className="space-y-3">
        <button
          onClick={onLogin}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
        >
          Go to Login
        </button>
        <button
          onClick={onRetry}
          className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);