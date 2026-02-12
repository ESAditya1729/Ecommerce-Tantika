import { Sparkles, Heart, Shield, Palette, Brush, Award } from "lucide-react";
import { motion } from "framer-motion";
import TantikaLogo from "../../Assets/TantikaLogo.png";
import BannerAd from '../../components/AdScript';

const ShopHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-rose-50/30 to-white py-12 md:py-16">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 via-purple-400 to-amber-400"></div>
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full opacity-30 blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full opacity-30 blur-2xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left Column - Brand & Message */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:w-1/2"
            >
              {/* Logo & Tagline */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 p-1">
                  <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                    <img
                      src={TantikaLogo}
                      alt="Tantika"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Tantika</h1>
                  <p className="text-sm text-gray-600">Handcrafted Stories from Bengal</p>
                </div>
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="block text-gray-800 mb-2">Where Every Piece</span>
                <span className="block bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent">
                  Tells a Story
                </span>
              </h2>

              <p className="text-gray-600 mb-8 leading-relaxed">
                Discover authentic Bengali craftsmanship where tradition meets modern sensibility. 
                Each creation is a labor of love, preserving centuries-old techniques for today's world.
              </p>

              {/* Key Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Handmade with Love</h4>
                    <p className="text-sm text-gray-600">Every stitch, every brushstroke matters</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Artisan Direct</h4>
                    <p className="text-sm text-gray-600">Supporting skilled craft communities</p>
                  </div>
                </div>
              </div>

              {/* Quick Craft Categories */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-rose-500" />
                  Explore Our Crafts
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Home Decor", "Accessories","Jewelry", "Art"].map((craft) => (
                    <span
                      key={craft}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                    >
                      {craft}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Visual Element */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:w-1/2"
            >
              <div className="relative">
                {/* Main Visual Card */}
                <div className="bg-gradient-to-br from-white to-rose-50 rounded-2xl border-2 border-rose-100 shadow-lg p-6">
                  {/* Decorative top border */}
                  <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-rose-400 via-purple-400 to-amber-400 rounded-t-2xl"></div>
                  
                  {/* Craft Tools Illustration */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <motion.div
                      animate={{ rotate: [0, 5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="col-span-2 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4 flex items-center justify-center"
                    >
                      <Brush className="w-8 h-8 text-rose-600" />
                    </motion.div>
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 flex items-center justify-center">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="col-span-2 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-600">100%</div>
                        <div className="text-xs text-emerald-500">Handmade</div>
                      </div>
                    </div>
                  </div>

                  {/* Story Card */}
                  <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 flex items-center justify-center">
                        <span className="text-white font-bold">T</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">The Tantika Way</h4>
                        <p className="text-xs text-gray-600">Preserving heritage, empowering artisans</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      We bridge the gap between Bengal's master artisans and conscious collectors. 
                      Each piece carries the soul of its creator and the essence of Bengali culture.
                    </p>
                  </div>

                  {/* Floating Decorative Elements */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-3 -left-3 bg-white p-2 rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-rose-400 to-amber-400"></div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute -bottom-3 -right-3 bg-white p-2 rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="text-xs font-semibold text-gray-700">
                      Made in<br />Bengal
                    </div>
                  </motion.div>
                </div>

                {/* Value Tags */}
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    <span className="text-sm font-medium text-rose-700">Authentic</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-sm font-medium text-amber-700">Sustainable</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium text-purple-700">Ethical</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-emerald-700">Unique</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Subtle CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-10 pt-8 border-t border-gray-100"
          >
            <div className="mt-4 flex justify-center">
          <BannerAd 
            key="708f1310e8b739077a59073d869d1360"
            height={90}
            width={728}
            className="rounded-lg shadow-md"
          />
        </div>
            <p className="text-gray-600 mb-4">Discover the beauty of handcrafted excellence</p>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-flex items-center gap-2 text-rose-600"
            >
              <span className="text-sm font-medium">Start Exploring</span>
              <div className="w-5 h-8 border border-rose-200 rounded-full flex justify-center">
                <div className="w-0.5 h-2 bg-rose-400 rounded-full mt-2"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ShopHero;