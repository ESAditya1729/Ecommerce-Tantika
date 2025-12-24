import { MapPin, Star } from 'lucide-react';

const ArtisansSection = () => {
  const artisans = [
    {
      id: 1,
      name: 'Maya Das',
      craft: 'Kantha Embroidery',
      location: 'Shantiniketan, West Bengal',
      experience: '25+ years',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    },
    {
      id: 2,
      name: 'Rajesh Pal',
      craft: 'Terracotta Pottery',
      location: 'Bishnupur, West Bengal',
      experience: '30+ years',
      image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop',
    },
    {
      id: 3,
      name: 'Anjali Roy',
      craft: 'Madhubani Painting',
      location: 'Murshidabad, West Bengal',
      experience: '20+ years',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop',
    },
    {
      id: 4,
      name: 'Bikash Mondal',
      craft: 'Jute Craft',
      location: 'Kolkata, West Bengal',
      experience: '15+ years',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Meet Our Artisans</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The talented hands behind every তন্তিকা product
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {artisans.map((artisan) => (
            <div 
              key={artisan.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Artisan Image */}
              <div className="h-48 overflow-hidden">
                <img 
                  src={artisan.image} 
                  alt={artisan.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              {/* Artisan Info */}
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <h3 className="text-xl font-bold mr-2">{artisan.name}</h3>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-blue-600 font-medium">{artisan.craft}</div>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {artisan.location}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{artisan.experience} experience</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    Featured
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 max-w-3xl mx-auto">
            Each of our artisans goes through a rigorous selection process to ensure they maintain 
            traditional techniques while meeting our quality standards. We work closely with them 
            to provide fair wages and sustainable working conditions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ArtisansSection;