// pages/ArtisanStories.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Users, 
  Heart, 
  TrendingUp, 
  MapPin, 
  Star, 
  Sparkles, 
  Coffee,
  BookOpen,
  ShoppingBag,
  Target,
  DollarSign,
  Shield,
  ChevronRight,
  Instagram,
  Facebook,
  Share2,
  Zap,
  Leaf,
  Gem,
  Clock,
  UserPlus
} from 'lucide-react';

// Realistic startup numbers
const artisanStats = {
  totalArtisans: 42,
  totalEarnings: 1250000,
  craftsRepresented: 18,
  averageIncomeIncrease: 45,
  communitiesSupported: 12,
  womenArtisans: 28,
  customerReviews: 156,
  repeatCustomers: 87
};

// Featured artisan with realistic numbers
const featuredArtisans = [
  {
    id: 1,
    name: "Mitali Das",
    location: "Santiniketan, WB",
    craft: "Kantha Embroidery",
    years: 8,
    story: "Preserving family stitch patterns while innovating with contemporary designs. Through তন্তিকা, she now teaches 5 other women in her village.",
    image: "https://images.unsplash.com/photo-1599733337426-782c90a9f2ef?w=400&h=400&fit=crop&crop=face",
    productsSold: 42,
    rating: 4.9,
    monthlyIncome: "₹25,000+",
    featuredProducts: 3,
    social: "@mitali_kantha"
  },
  {
    id: 2,
    name: "Arjun Mehta",
    location: "Jaipur, RJ",
    craft: "Blue Pottery",
    years: 6,
    story: "Reviving traditional Jaipur blue pottery with modern home decor pieces. His workshop now supports 3 apprentice artisans.",
    image: "https://images.unsplash.com/photo-1575503802870-45de2d3e2d87?w=400&h=400&fit=crop&crop=face",
    productsSold: 38,
    rating: 4.8,
    monthlyIncome: "₹32,000+",
    featuredProducts: 5,
    social: "@arjunpottery"
  },
  {
    id: 3,
    name: "Lakshmi Nair",
    location: "Alleppey, KL",
    craft: "Coir Crafts",
    years: 5,
    story: "Leading a women's cooperative creating sustainable coir products. 15 women now earn steady income through their craft.",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=face",
    productsSold: 67,
    rating: 4.7,
    monthlyIncome: "₹18,000+",
    featuredProducts: 7,
    social: "@lakshmicoir"
  }
];

// More artisans for carousel
const moreArtisans = [
  {
    id: 4,
    name: "Rajesh Kumar",
    location: "Varanasi, UP",
    craft: "Banarasi Weaving",
    years: 12,
    productsSold: 29,
    rating: 4.9
  },
  {
    id: 5,
    name: "Sunita Patel",
    location: "Patna, Bihar",
    craft: "Madhubani Art",
    years: 7,
    productsSold: 51,
    rating: 4.8
  },
  {
    id: 6,
    name: "Mohammed Ali",
    location: "Moradabad, UP",
    craft: "Brass Art",
    years: 9,
    productsSold: 33,
    rating: 4.7
  }
];

// Customer testimonials
const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    comment: "Knowing my purchase directly supports artisans makes each piece special. The quality is exceptional!",
    rating: 5,
    product: "Kantha Stole"
  },
  {
    name: "Rahul Verma",
    location: "Delhi",
    comment: "Finally found authentic handcrafted home decor. The artisans' stories add so much value to each item.",
    rating: 5,
    product: "Blue Pottery Vase"
  },
  {
    name: "Ananya Roy",
    location: "Kolkata",
    comment: "As a conscious consumer, I love supporting traditional crafts. তন্তিকা makes it so easy and meaningful.",
    rating: 4,
    product: "Coir Baskets"
  }
];

const ArtisanStories = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const impactStats = [
    { 
      icon: Users, 
      value: `${artisanStats.totalArtisans}+`, 
      label: 'Artisans Supported',
      description: 'Growing community of traditional craftspersons',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    { 
      icon: DollarSign, 
      value: `₹${(artisanStats.totalEarnings / 100000).toFixed(1)}L+`, 
      label: 'Direct Earnings',
      description: 'Paid directly to artisans, no middlemen',
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    { 
      icon: TrendingUp, 
      value: `${artisanStats.averageIncomeIncrease}%`, 
      label: 'Income Growth',
      description: 'Average increase for our artisans',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    { 
      icon: Heart, 
      value: `${artisanStats.customerReviews}+`, 
      label: 'Happy Customers',
      description: 'Rated 4.8+ by conscious buyers',
      color: 'from-rose-500 to-red-500',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-700'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section - Updated Colors */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=1920')] opacity-20 bg-cover bg-center"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Preserving Heritage, Empowering Lives</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">Makers</span>
            </h1>
            <p className="text-xl text-slate-200 max-w-3xl mx-auto mb-10 leading-relaxed">
              Every handmade piece at তন্তিকা carries a story of tradition, skill, and transformation. Discover how your purchase creates meaningful impact.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/shop" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ShoppingBag className="w-5 h-5" />
                Shop Artisan Collections
                <ChevronRight className="w-4 h-4" />
              </Link>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all">
                <Share2 className="w-5 h-5" />
                Share Their Stories
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stats - Better Color Scheme */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {impactStats.map((stat, index) => (
            <div 
              key={index} 
              className={`${stat.bgColor} rounded-2xl p-6 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl border border-white`}
            >
              <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} mb-4 shadow-sm`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className={`font-semibold ${stat.textColor}`}>{stat.label}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Promise Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Handmade</span>?
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Each purchase supports traditional craftsmanship while bringing unique, soulful pieces into your life.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl transform group-hover:scale-105 transition-transform duration-500"></div>
            <div className="relative p-8 rounded-2xl border border-blue-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Gem className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Unique & Authentic</h3>
              <p className="text-gray-600 mb-6">
                No two handmade pieces are identical. Each carries the artisan's personal touch and traditional techniques.
              </p>
              <div className="text-sm text-blue-600 font-medium">
                <span className="inline-flex items-center gap-1">
                  Explore Collections
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
          
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl transform group-hover:scale-105 transition-transform duration-500"></div>
            <div className="relative p-8 rounded-2xl border border-emerald-100">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Eco-Friendly</h3>
              <p className="text-gray-600 mb-6">
                Natural materials, sustainable practices, and minimal waste. Traditional crafts are inherently eco-conscious.
              </p>
              <div className="text-sm text-emerald-600 font-medium">
                <span className="inline-flex items-center gap-1">
                  Learn About Sustainability
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
          
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl transform group-hover:scale-105 transition-transform duration-500"></div>
            <div className="relative p-8 rounded-2xl border border-amber-100">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Direct Impact</h3>
              <p className="text-gray-600 mb-6">
                70-80% of your payment goes directly to artisans, creating tangible change in their communities.
              </p>
              <div className="text-sm text-amber-600 font-medium">
                <span className="inline-flex items-center gap-1">
                  See Impact Stories
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Artisans - Updated */}
      <div className="bg-gradient-to-b from-slate-50 to-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full mb-4 shadow-sm">
                <Award className="w-4 h-4" />
                <span className="font-medium">Featured Artisans</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Star Makers</span>
              </h2>
              <p className="text-gray-600 mt-2 max-w-2xl">
                These talented artisans are creating beautiful pieces while building better futures.
              </p>
            </div>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 px-6 py-3 mt-4 md:mt-0 bg-white border border-slate-200 text-slate-700 font-medium rounded-full hover:bg-slate-50 transition-all shadow-sm hover:shadow"
            >
              View All Products
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredArtisans.map(artisan => (
              <div key={artisan.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={artisan.image} 
                    alt={artisan.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-gray-900">{artisan.rating}</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {artisan.productsSold} sold
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{artisan.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 text-sm">{artisan.location}</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          {artisan.years} yrs
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-purple-600">{artisan.craft}</div>
                      <div className="text-xs text-gray-500">{artisan.featuredProducts} products</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {artisan.story}
                  </p>
                  
                  <div className="space-y-3 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">Monthly Income</div>
                      <div className="text-sm font-semibold text-emerald-600">{artisan.monthlyIncome}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">Follow</div>
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-500" />
                        <span className="text-sm text-gray-700">{artisan.social}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/shop?artisan=${artisan.id}`}
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-medium rounded-lg hover:from-slate-800 hover:to-slate-600 transition-all group"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    View {artisan.name}'s Collection
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Love */}
      <div className="bg-gradient-to-br from-slate-900 to-purple-900 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full mb-4">
              <Heart className="w-4 h-4" />
              <span className="font-medium">Customer Love</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Customers <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">Love Us</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`bg-white/10 backdrop-blur-sm rounded-2xl p-8 transition-all duration-500 ${
                  activeTestimonial === index 
                    ? 'transform scale-105 border border-white/20 shadow-xl' 
                    : 'opacity-80 hover:opacity-100'
                }`}
                onClick={() => setActiveTestimonial(index)}
              >
                <div className="flex items-center gap-2 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        i < testimonial.rating 
                          ? 'text-amber-400 fill-amber-400' 
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-lg italic mb-6 text-slate-200">
                  "{testimonial.comment}"
                </p>
                <div className="pt-6 border-t border-white/20">
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-sm text-slate-300">
                    {testimonial.location} • Bought: {testimonial.product}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeTestimonial === index 
                    ? 'bg-amber-400 w-8' 
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Join Community - Updated */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full mb-6 shadow-sm">
                <UserPlus className="w-4 h-4" />
                <span className="font-medium">Join Our Movement</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">তন্তিকা Artisan</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                We're looking for passionate traditional artisans to join our growing community. Together, we can preserve heritage crafts while building sustainable livelihoods.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Fair & Transparent</div>
                    <div className="text-sm text-gray-600">Keep 70-80% of sale price, clear monthly payments</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Growth Support</div>
                    <div className="text-sm text-gray-600">Marketing, photography, and business guidance</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Community</div>
                    <div className="text-sm text-gray-600">Connect with fellow artisans, share skills, grow together</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-cyan-700 transition-all hover:scale-105 shadow-lg">
                  Apply as Artisan
                </button>
                <button className="px-8 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-full hover:bg-slate-50 transition-all">
                  Download Info Pack
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
                    <Clock className="w-8 h-8 text-amber-600 mb-3" />
                    <div className="text-2xl font-bold text-gray-900">2-3 Days</div>
                    <div className="text-sm text-gray-600">Average response time</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6">
                    <DollarSign className="w-8 h-8 text-emerald-600 mb-3" />
                    <div className="text-2xl font-bold text-gray-900">0%</div>
                    <div className="text-sm text-gray-600">Registration fees</div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                    <Sparkles className="w-8 h-8 text-blue-600 mb-3" />
                    <div className="text-2xl font-bold text-gray-900">100%</div>
                    <div className="text-sm text-gray-600">Verified artisans</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                    <BookOpen className="w-8 h-8 text-purple-600 mb-3" />
                    <div className="text-2xl font-bold text-gray-900">24/7</div>
                    <div className="text-sm text-gray-600">Support available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-slate-900 to-gray-900 text-white py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
            Shop <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">Consciously</span>,<br />Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">Change</span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Every purchase from তন্তিকা supports traditional artisans, preserves cultural heritage, and creates sustainable livelihoods.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full hover:from-amber-600 hover:to-orange-600 transition-all hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <ShoppingBag className="w-5 h-5" />
              Explore Artisan Collections
              <ChevronRight className="w-5 h-5" />
            </Link>
            <button className="inline-flex items-center gap-3 px-10 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all">
              <Share2 className="w-5 h-5" />
              Share This Page
            </button>
          </div>
          
          <div className="mt-12 pt-12 border-t border-white/10">
            <p className="text-slate-400 text-sm">
              তন্তিকা • Traditional Crafts • Fair Trade • Sustainable Living • Cultural Preservation
            </p>
            <div className="flex justify-center gap-6 mt-6">
              <Facebook className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
              <Instagram className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
              <Share2 className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanStories;