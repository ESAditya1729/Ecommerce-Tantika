import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const WelcomeBanner = () => (
  <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <div className="flex items-center mb-4">
          <Sparkles className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold">Welcome to তন্তিকা Family!</h2>
        </div>
        <p className="text-blue-100 mb-4 max-w-2xl">
          We're delighted to have you join our community of Bengali craft lovers. 
          Your journey into authentic handcrafted art begins here. Every purchase 
          supports traditional artisans and helps preserve cultural heritage.
        </p>
      </div>
      <Link
        to="/shop"
        className="mt-4 md:mt-0 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors"
      >
        Start Shopping →
      </Link>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="bg-white/20 p-4 rounded-xl">
        <div className="flex items-center mb-2">
          <span className="text-lg mr-2">🎨</span>
          <h3 className="font-bold">Explore Crafts</h3>
        </div>
        <p className="text-sm text-blue-100">Discover unique handcrafted items from Bengal</p>
      </div>
      <div className="bg-white/20 p-4 rounded-xl">
        <div className="flex items-center mb-2">
          <span className="text-lg mr-2">💝</span>
          <h3 className="font-bold">Create Wishlist</h3>
        </div>
        <p className="text-sm text-blue-100">Save your favorite items for later</p>
      </div>
      <div className="bg-white/20 p-4 rounded-xl">
        <div className="flex items-center mb-2">
          <span className="text-lg mr-2">🚀</span>
          <h3 className="font-bold">Support Artisans</h3>
        </div>
        <p className="text-sm text-blue-100">Every purchase helps traditional artists</p>
      </div>
    </div>
  </div>
);