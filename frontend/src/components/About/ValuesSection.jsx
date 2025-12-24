import { Award, Leaf, Users, Shield } from 'lucide-react';

const ValuesSection = () => {
  const values = [
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Authenticity',
      description: 'Every product is genuine, made using traditional techniques passed down through generations.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: 'Sustainability',
      description: 'We use eco-friendly materials and promote sustainable practices in all our operations.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Fair Trade',
      description: 'Artisans receive fair compensation for their work, ensuring sustainable livelihoods.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Quality',
      description: 'Rigorous quality checks ensure every product meets our high standards before reaching you.',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The principles that guide everything we do at তন্তিকা
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Top Gradient Bar */}
              <div className={`h-2 bg-gradient-to-r ${value.color}`}></div>
              
              <div className="p-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${value.color.replace('500', '100').replace('600', '200')} rounded-2xl mb-6`}>
                  <div className={`${value.color.includes('blue') ? 'text-blue-600' : 
                                   value.color.includes('green') ? 'text-green-600' : 
                                   value.color.includes('purple') ? 'text-purple-600' : 
                                   'text-orange-600'}`}>
                    {value.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-3xl mx-auto border border-gray-100">
            <p className="text-lg text-gray-700 font-medium">
              "At তন্তিকা, we believe that preserving cultural heritage and supporting artisans 
              isn't just good business - it's our responsibility to future generations."
            </p>
            <div className="mt-4 text-gray-600">
              — The তন্তিকা Team
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;