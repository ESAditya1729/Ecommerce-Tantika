import { Link } from 'react-router-dom';
import { ShoppingBag, Home, Palette, Coffee } from 'lucide-react';

const CategoryShowcase = () => {
  const categories = [
    {
      id: 1,
      name: 'Textiles & Clothing',
      description: 'Traditional Bengali sarees, fabrics, and garments',
      icon: <ShoppingBag className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      count: '20+ items',
    },
    {
      id: 2,
      name: 'Home Decor',
      description: 'Handcrafted pottery, wall art, and home accessories',
      icon: <Home className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      count: '15+ items',
    },
    {
      id: 3,
      name: 'Art & Craft',
      description: 'Traditional paintings, sculptures, and crafts',
      icon: <Palette className="w-8 h-8" />,
      color: 'from-pink-500 to-pink-600',
      count: '10+ items',
    },
    {
      id: 4,
      name: 'Food & Sweets',
      description: 'Authentic Bengali sweets and traditional food items',
      icon: <Coffee className="w-8 h-8" />,
      color: 'from-orange-500 to-orange-600',
      count: '5+ items',
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Explore Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our curated collection of authentic Bengali products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                {/* Category Header */}
                <div className={`bg-gradient-to-r ${category.color} p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      {category.icon}
                    </div>
                    <span className="text-white/80 text-sm font-medium">
                      {category.count}
                    </span>
                  </div>
                </div>

                {/* Category Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="text-blue-600 font-medium text-sm group-hover:underline">
                    Browse Items →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;