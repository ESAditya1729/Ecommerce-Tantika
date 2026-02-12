import { Link } from 'react-router-dom';
import { ArrowRight, Users, Medal, Heart, Leaf, MapPin, Star, ShoppingBag, Sparkles, Shield, Clock } from 'lucide-react';

const FeaturedProducts = () => {
  const impactStats = [
    {
      id: 1,
      icon: <Users className="w-6 h-6 text-blue-600" />,
      value: 'Growing Community',
      label: 'Active Artisans'
    },
    {
      id: 2,
      icon: <Medal className="w-6 h-6 text-purple-600" />,
      value: 'Generations Old',
      label: 'Traditional Crafts'
    },
    {
      id: 3,
      icon: <Heart className="w-6 h-6 text-pink-600" />,
      value: 'Thousands Happy',
      label: 'Customers & Counting'
    },
    {
      id: 4,
      icon: <Leaf className="w-6 h-6 text-green-600" />,
      value: '100%',
      label: 'Authentic Handmade'
    }
  ];

  const artisanStories = [
    {
      id: 1,
      name: 'Mita Das',
      craft: 'Kantha Embroidery Artisan',
      location: 'Shantiniketan, West Bengal',
      story: 'Learning Kantha from my grandmother, I now teach this ancient art to women in my village, keeping our heritage alive.',
      image: 'https://images.unsplash.com/photo-1607748178563-6a7c6f66937b?w=400&h=400&fit=crop',
      legacy: 'Fourth generation artisan',
      impact: 'Mentoring next generation'
    },
    {
      id: 2,
      name: 'Ratan Pal',
      craft: 'Terracotta Potter',
      location: 'Bankura, West Bengal',
      story: 'Fifth generation potter, creating the iconic Bankura horses while experimenting with contemporary designs.',
      image: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=400&h=400&fit=crop',
      legacy: 'Family tradition since 1890',
      impact: 'Reviving ancient techniques'
    },
    {
      id: 3,
      name: 'Swapna Bauri',
      craft: 'Dokra Metal Craft',
      location: 'Bikna, West Bengal',
      story: 'Reviving the ancient lost-wax casting technique, now teaching this 4,000-year-old art to young women in her community.',
      image: 'https://images.unsplash.com/photo-1596815064286-45a8b9f7e8dc?w=400&h=400&fit=crop',
      legacy: 'Preserving tribal heritage',
      impact: 'Empowering women artisans'
    },
    {
      id: 4,
      name: 'Bikash Chitrakar',
      craft: 'Patachitra Artist',
      location: 'Midnapore, West Bengal',
      story: 'Telling mythological stories through traditional scroll paintings, carrying forward a lineage of visual storytellers.',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
      legacy: 'Traditional scroll painters',
      impact: 'Keeping folk art alive'
    }
  ];

  const craftCategories = [
    {
      name: 'Kantha Stitch',
      description: 'Traditional embroidery',
      region: 'Shantiniketan',
      icon: '🧵',
      color: 'from-blue-50 to-blue-100'
    },
    {
      name: 'Terracotta',
      description: 'Bankura pottery',
      region: 'Bankura',
      icon: '🏺',
      color: 'from-orange-50 to-orange-100'
    },
    {
      name: 'Dokra Metal',
      description: 'Lost-wax casting',
      region: 'Bikna',
      icon: '🔨',
      color: 'from-amber-50 to-amber-100'
    },
    {
      name: 'Patachitra',
      description: 'Scroll paintings',
      region: 'Midnapore',
      icon: '🎨',
      color: 'from-purple-50 to-purple-100'
    },
    {
      name: 'Madhurjya',
      description: 'Traditional sweets',
      region: 'Krishnanagar',
      icon: '🍬',
      color: 'from-pink-50 to-pink-100'
    },
    {
      name: 'Dokra',
      description: 'Bell metal craft',
      region: 'Purulia',
      icon: '🕯️',
      color: 'from-yellow-50 to-yellow-100'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-4">
            ❤️ Empowering Artisans, Preserving Heritage
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Meet Our Artisan Community
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Every product carries a story of tradition, skill, and dedication passed down through generations
          </p>
        </div>

        {/* Impact Stats - Text Only */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {impactStats.map((stat) => (
            <div 
              key={stat.id}
              className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl text-center border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  {stat.icon}
                </div>
              </div>
              <div className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
                {stat.value}
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
        {/* Traditional Crafts of Bengal */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Traditional Crafts of Bengal</h3>
            <p className="text-gray-600">Each craft tells a unique story of heritage and skill</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {craftCategories.map((craft) => (
              <div 
                key={craft.name}
                className={`bg-gradient-to-br ${craft.color} p-5 rounded-2xl text-center hover:scale-105 transition-all duration-300 cursor-pointer group`}
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {craft.icon}
                </div>
                <h4 className="font-semibold text-gray-800 text-sm mb-1">
                  {craft.name}
                </h4>
                <p className="text-xs text-gray-600 mb-1">
                  {craft.description}
                </p>
                <p className="text-xs text-gray-500">
                  {craft.region}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <Heart className="w-12 h-12 mx-auto mb-4 text-white/90" />
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Our Promise to Artisans
            </h3>
            <p className="text-lg mb-6 max-w-2xl mx-auto text-white/90">
              Every purchase directly supports artisan families, preserves ancient crafts, 
              and ensures these traditions live on for future generations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Shop with Purpose
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-6 py-3 bg-white/20 backdrop-blur text-white rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/40"
              >
                Learn Our Story
              </Link>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Be part of our journey to preserve Bengal's artistic heritage
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/register"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Join as Artisan
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;