import { Truck, Shield, RefreshCw, Heart } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Handcrafted with Love',
      description: 'Each product is carefully crafted by skilled Bengali artisans',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Quality Guaranteed',
      description: 'We ensure every product meets our quality standards',
    },
    // {
    //   icon: <Truck className="w-8 h-8" />,
    //   title: 'Nationwide Delivery',
    //   description: 'Free shipping on orders above ₹999',
    // },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: 'Easy Returns',
      description: '15-day return policy for your peace of mind',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose তন্তিকা?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're more than just a marketplace - we're a community supporting traditional craftsmanship
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gradient-to-b from-white to-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 rounded-xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;