import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-[600px] md:min-h-[800px] flex items-center">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          {/* Use the imported video as source */}
          <source src='https://res.cloudinary.com/drariarqq/video/upload/v1773571081/hero-background_yqs8s5.mp4' type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
          Your browser does not support the video tag.
        </video>
        
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 mix-blend-overlay">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      {/* Content - now appears above the video */}
      <div className="relative container mx-auto px-4 z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tagline */}
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-full mb-8">
            {/* <span className="font-medium">🎉 Launching Soon!</span> */}
          </div>
          
          {/* Main Heading - Updated text color for better contrast */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
              তন্তিকা
            </span>
          </h1>
          
          {/* Subtitle - Updated for better contrast */}
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-3xl mx-auto">
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
              className="group border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center backdrop-blur-sm"
            >
              <span>Join Our Community</span>
            </Link>
          </div>
          
          {/* Small Stats - Updated for better contrast */}
          <div className="mt-16 flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-300">50+</div>
              <div className="text-gray-200">Products Coming</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-300">10+</div>
              <div className="text-gray-200">Local Artisans</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-300">100%</div>
              <div className="text-gray-200">Authentic</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;