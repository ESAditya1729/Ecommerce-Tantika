import { Filter, Search } from 'lucide-react';

const ShopHero = () => {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Discover <span className="text-blue-600">Authentic</span> Bengali Crafts
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Each piece is handcrafted by skilled artisans preserving traditional techniques
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name, artisan, or material..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              <span>50+ Unique Products</span>
            </div>
            <div className="flex items-center">
              <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
              <span>10+ Skilled Artisans</span>
            </div>
            <div className="flex items-center">
              <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
              <span>100% Handcrafted</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopHero;