import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-pattern"></div>
      </div>

      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Support Traditional Craftsmanship?
          </h2>
          
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Every purchase helps preserve Bengali art and supports local artisans
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              Join Our Community
            </Link>
            
            <Link 
              to="/about" 
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300"
            >
              Learn About Our Mission
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80">
            <div className="text-center">
              <div className="font-bold">Secure Payments</div>
              <div className="text-sm">100% Safe</div>
            </div>
            <div className="text-center">
              <div className="font-bold">Easy Returns</div>
              <div className="text-sm">15-Day Policy</div>
            </div>
            <div className="text-center">
              <div className="font-bold">Customer Support</div>
              <div className="text-sm">24/7 Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;