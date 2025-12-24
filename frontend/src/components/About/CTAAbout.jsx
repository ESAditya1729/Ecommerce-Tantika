import { Link } from 'react-router-dom';
import { ShoppingBag, Users, Mail } from 'lucide-react';

const CTAAbout = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join Our Journey
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Whether you're looking for authentic crafts or want to support traditional artisans, 
              there's a place for you in the তন্তিকা community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Shop Authentic</h3>
              <p className="text-blue-100 mb-6">
                Discover unique Bengali crafts and bring heritage into your home
              </p>
              <Link 
                to="/products" 
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
              >
                Browse Products
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Support Artisans</h3>
              <p className="text-blue-100 mb-6">
                Every purchase directly supports traditional artisans and their families
              </p>
              <Link 
                to="/artisans" 
                className="inline-block border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10"
              >
                Meet Artisans
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center hover:bg-white/20 transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4">Get in Touch</h3>
              <p className="text-blue-100 mb-6">
                Have questions or want to collaborate? We'd love to hear from you
              </p>
              <Link 
                to="/contact" 
                className="inline-block border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="text-center">
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              তন্তিকা is more than a brand - it's a movement to preserve cultural heritage 
              while embracing modern commerce.
            </p>
            <Link 
              to="/register" 
              className="inline-block bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 hover:shadow-xl transition-all"
            >
              Join Our Community
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTAAbout;