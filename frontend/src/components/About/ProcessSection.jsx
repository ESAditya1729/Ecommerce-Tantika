import { Search, Handshake, Truck, Heart } from 'lucide-react';

const ProcessSection = () => {
  const steps = [
    {
      step: '01',
      title: 'Artisan Discovery',
      description: 'We travel across Bengal to discover skilled artisans preserving traditional crafts.',
      icon: <Search className="w-8 h-8" />,
      color: 'blue',
    },
    {
      step: '02',
      title: 'Collaboration',
      description: 'We work with artisans to understand their craft and ensure quality standards.',
      icon: <Handshake className="w-8 h-8" />,
      color: 'purple',
    },
    {
      step: '03',
      title: 'Quality Check',
      description: 'Every product undergoes multiple quality checks before being listed.',
      icon: <Heart className="w-8 h-8" />,
      color: 'pink',
    },
    {
      step: '04',
      title: 'Delivery',
      description: 'Products are carefully packaged and delivered to your doorstep.',
      icon: <Truck className="w-8 h-8" />,
      color: 'green',
    },
  ];

  const getColorClasses = (color) => {
    switch(color) {
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'purple': return 'bg-purple-100 text-purple-600';
      case 'pink': return 'bg-pink-100 text-pink-600';
      case 'green': return 'bg-green-100 text-green-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Process</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From artisan discovery to your doorstep - ensuring quality every step of the way
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => (
              <div 
                key={step.step}
                className={`flex flex-col lg:flex-row items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
              >
                {/* Step Content */}
                <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12 text-right' : 'lg:pl-12'}`}>
                  <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md mx-auto lg:mx-0">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${getColorClasses(step.color)} mb-4`}>
                      {step.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-400 mb-2">{step.step}</div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
                
                {/* Timeline Dot */}
                <div className="flex items-center justify-center my-6 lg:my-0 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
                  <div className={`w-8 h-8 rounded-full border-4 border-white ${getColorClasses(step.color).replace('100', '500').replace('text', 'bg')} shadow-lg`}></div>
                </div>
                
                {/* Empty spacer for alignment */}
                <div className="lg:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;