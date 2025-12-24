import { MapPin, Navigation, Train, Bus } from 'lucide-react';

const MapLocation = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Visit Our Office</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Located in the heart of Kolkata's craft district
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Map Container */}
            <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
              <div className="h-96 relative">
                {/* Google Maps Embed Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">তন্তিকা Headquarters</h3>
                    <p className="text-gray-600">Kolkata, West Bengal</p>
                    <div className="mt-6">
                      <a 
                        href="https://maps.google.com/?q=123+Craft+Street+Kolkata+700001"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:shadow-md transition-shadow"
                      >
                        <Navigation className="w-5 h-5 mr-2" />
                        Open in Google Maps
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Map Coordinates */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div className="text-sm text-gray-700">
                    <div>22.5726° N, 88.3639° E</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 h-full">
                <h3 className="text-2xl font-bold mb-6">Location Details</h3>
                
                {/* Address */}
                <div className="mb-8">
                  <div className="flex items-start mb-4">
                    <MapPin className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                    <div>
                      <h4 className="font-bold mb-2">Address</h4>
                      <p className="text-gray-700">
                        123 Craft Street,<br/>
                        Ballygunge,<br/>
                        Kolkata - 700001<br/>
                        West Bengal, India
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transportation */}
                <div className="mb-8">
                  <h4 className="font-bold mb-4">How to Reach</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Train className="w-5 h-5 text-purple-600 mr-3" />
                      <div>
                        <div className="font-medium">Metro Railway</div>
                        <div className="text-sm text-gray-600">Ballygunge Station (5 min walk)</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Bus className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <div className="font-medium">Bus Station</div>
                        <div className="text-sm text-gray-600">Gariahat Bus Stand (10 min walk)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visiting Hours */}
                <div>
                  <h4 className="font-bold mb-4">Visiting Hours</h4>
                  <div className="bg-white rounded-xl p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monday - Friday</span>
                        <span className="font-medium">9:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Saturday</span>
                        <span className="font-medium">10:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sunday</span>
                        <span className="font-medium text-red-600">Closed</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> Please schedule an appointment before visiting to ensure someone is available to assist you.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Parking Information */}
                <div className="mt-8 p-4 bg-blue-100 rounded-xl">
                  <h5 className="font-bold mb-2 text-blue-800">Parking Information</h5>
                  <p className="text-sm text-blue-700">
                    Limited parking available on premises. Public parking available at Gariahat Market (2 min walk).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapLocation;