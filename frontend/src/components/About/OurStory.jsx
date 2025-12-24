import { Target, Heart, Users } from 'lucide-react';

const OurStory = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Journey</h2>
              <div className="space-y-6">
                <p className="text-gray-600 text-lg">
                  Founded in 2024, তন্তিকা was born from a simple idea: to preserve and promote the 
                  exquisite craftsmanship of Bengal in the digital age. Our founders, passionate about 
                  traditional arts, noticed that many skilled artisans struggled to reach a wider audience.
                </p>
                <p className="text-gray-600 text-lg">
                  We started with just 5 artisans from rural Bengal and have grown into a platform 
                  that showcases the best of Bengali craftsmanship to customers across India and beyond.
                </p>
                <p className="text-gray-600 text-lg">
                  Every product on তন্তিকা tells a story - of tradition, skill, and the hands that 
                  carefully crafted it. We're not just selling products; we're sharing heritage.
                </p>
              </div>
            </div>
            
            {/* Right Content - Mission/Vision/Values */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-100">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold">Our Mission</h3>
                </div>
                <p className="text-gray-600">
                  To preserve Bengali craftsmanship by connecting artisans with conscious consumers 
                  who value authenticity, quality, and cultural heritage.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold">Our Values</h3>
                </div>
                <p className="text-gray-600">
                  Authenticity, sustainability, fair trade, and community empowerment guide 
                  everything we do at তন্তিকা.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-pink-50 to-orange-50 p-8 rounded-2xl border border-pink-100">
                <div className="flex items-center mb-4">
                  <div className="bg-pink-100 p-3 rounded-lg mr-4">
                    <Users className="w-6 h-6 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-bold">Our Vision</h3>
                </div>
                <p className="text-gray-600">
                  To become the most trusted platform for authentic Bengali crafts, creating 
                  sustainable livelihoods for artisans while enriching homes with cultural heritage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;