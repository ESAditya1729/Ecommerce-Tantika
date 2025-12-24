import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../ProductCard';

const FeaturedProducts = () => {
  const featuredProducts = [
    { 
      id: 1, 
      name: 'Kantha Stitch Saree', 
      price: 2499, 
      category: 'Textiles',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop'
    },
    { 
      id: 2, 
      name: 'Terracotta Pot', 
      price: 899, 
      category: 'Home Decor',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop'
    },
    { 
      id: 3, 
      name: 'Madhubani Painting', 
      price: 1299, 
      category: 'Art',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop'
    },
    { 
      id: 4, 
      name: 'Jute Handbag', 
      price: 599, 
      category: 'Accessories',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop'
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-3xl font-bold mb-3">Featured Products</h2>
            <p className="text-gray-600">Handpicked collection from our artisans</p>
          </div>
          <Link 
            to="/products" 
            className="group flex items-center text-blue-600 hover:text-blue-700 font-semibold"
          >
            View All Products
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;