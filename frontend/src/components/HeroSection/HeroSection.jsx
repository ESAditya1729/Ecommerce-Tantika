import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 md:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tagline */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-8">
            {/* <span className="font-medium">🎉 Launching Soon!</span> */}
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              তন্তিকা
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Discover authentic Bengali crafts and artisanal products. 
            We're building a marketplace that celebrates traditional craftsmanship and supports local artisans.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/shop" 
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center"
            >
              <span>Browse Products</span>
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
            
            <Link 
              to="/register" 
              className="group border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 flex items-center justify-center"
            >
              <span>Join Our Community</span>
            </Link>
          </div>
          
          {/* Small Stats */}
          <div className="mt-16 flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">50+</div>
              <div className="text-gray-600">Products Coming</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">10+</div>
              <div className="text-gray-600">Local Artisans</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">100%</div>
              <div className="text-gray-600">Authentic</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;