const HeroAbout = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
      
      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6">
            <span className="font-medium">Our Story</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">তন্তিকা</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            তন্তিকা is more than just an ecommerce platform. We are a bridge connecting the rich heritage 
            of Bengali craftsmanship with modern consumers who appreciate authenticity and quality.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-blue-600">2024</div>
              <div className="text-gray-600">Founded</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-purple-600">50+</div>
              <div className="text-gray-600">Products</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-pink-600">10+</div>
              <div className="text-gray-600">Artisans</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-green-600">100%</div>
              <div className="text-gray-600">Authentic</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroAbout;