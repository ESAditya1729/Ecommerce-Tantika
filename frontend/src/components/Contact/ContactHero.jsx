import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const ContactHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-16 md:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6">
            <span className="font-medium">Get in Touch</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">তন্তিকা</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Have questions about our products, want to collaborate with artisans, 
            or need assistance with an order? We're here to help!
          </p>
          
          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Email Us</h3>
              <p className="text-gray-600 text-sm">For general inquiries</p>
              <a 
                href="mailto:hello@tantika.com" 
                className="text-blue-600 font-medium hover:text-blue-700 inline-block mt-2"
              >
                hello@tantika.com
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-lg mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Call Us</h3>
              <p className="text-gray-600 text-sm">Mon-Sat, 10AM-7PM</p>
              <a 
                href="tel:+919876543210" 
                className="text-purple-600 font-medium hover:text-purple-700 inline-block mt-2"
              >
                +91 98765 43210
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 text-pink-600 rounded-lg mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Visit Us</h3>
              <p className="text-gray-600 text-sm">Kolkata, West Bengal</p>
              <p className="text-gray-700 text-sm mt-2">
                123 Craft Street,<br/>
                Kolkata - 700001
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Business Hours</h3>
              <p className="text-gray-600 text-sm">We're here to help</p>
              <div className="text-gray-700 text-sm mt-2 space-y-1">
                <div>Mon-Fri: 9AM - 6PM</div>
                <div>Saturday: 10AM - 4PM</div>
                <div>Sunday: Closed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;