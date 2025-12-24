import { Mail, Phone, Linkedin, MessageSquare } from 'lucide-react';

const TeamContact = () => {
  const teamContacts = [
    {
      name: 'Ananya Chatterjee',
      role: 'Founder & CEO',
      department: 'Leadership & Strategy',
      email: 'ananya@tantika.com',
      phone: '+91 98765 43211',
      responsibility: 'Overall business strategy, artisan relations, partnerships',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Priya Sen',
      role: 'Chief Marketing Officer',
      department: 'Marketing & Communications',
      email: 'priya@tantika.com',
      phone: '+91 98765 43212',
      responsibility: 'Brand marketing, PR, social media, customer outreach',
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Amit Sharma',
      role: 'Customer Relations Head',
      department: 'Customer Support',
      email: 'amit@tantika.com',
      phone: '+91 98765 43213',
      responsibility: 'Order inquiries, customer support, issue resolution',
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Suman Das',
      role: 'Artisan Relations Manager',
      department: 'Artisan Network',
      email: 'suman@tantika.com',
      phone: '+91 98765 43214',
      responsibility: 'Artisan onboarding, quality control, fair trade practices',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Contact Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Reach out to specific team members for specialized assistance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {teamContacts.map((member, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Header with Gradient */}
                <div className={`h-2 bg-gradient-to-r ${member.color}`}></div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                    <div className="text-blue-600 font-medium mb-1">{member.role}</div>
                    <div className="text-sm text-gray-500">{member.department}</div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-3" />
                      <a 
                        href={`mailto:${member.email}`}
                        className="text-sm text-gray-700 hover:text-blue-600"
                      >
                        {member.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-3" />
                      <a 
                        href={`tel:${member.phone}`}
                        className="text-sm text-gray-700 hover:text-blue-600"
                      >
                        {member.phone}
                      </a>
                    </div>
                  </div>

                  {/* Responsibility */}
                  <div className="text-sm">
                    <div className="font-medium mb-2 text-gray-700">Responsible for:</div>
                    <p className="text-gray-600">{member.responsibility}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Department Contact Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Department Contacts</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-bold mb-2">General Inquiries</h4>
                <p className="text-sm text-gray-600 mb-2">hello@tantika.com</p>
                <p className="text-xs text-gray-500">Response within 24 hours</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-full mb-4">
                  <Phone className="w-6 h-6" />
                </div>
                <h4 className="font-bold mb-2">Customer Support</h4>
                <p className="text-sm text-gray-600 mb-2">support@tantika.com</p>
                <p className="text-xs text-gray-500">Mon-Sat, 10AM-7PM</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-bold mb-2">Artisan Relations</h4>
                <p className="text-sm text-gray-600 mb-2">artisans@tantika.com</p>
                <p className="text-xs text-gray-500">For collaboration inquiries</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-full mb-4">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h4 className="font-bold mb-2">Business & Media</h4>
                <p className="text-sm text-gray-600 mb-2">business@tantika.com</p>
                <p className="text-xs text-gray-500">Partnerships & PR</p>
              </div>
            </div>
          </div>

          {/* Social Media Contact */}
          <div className="text-center mt-12">
            <h3 className="text-xl font-bold mb-6">Connect on Social Media</h3>
            <div className="flex justify-center space-x-6">
              <a 
                href="#" 
                className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center hover:bg-pink-200"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="w-12 h-12 bg-blue-100 text-blue-400 rounded-full flex items-center justify-center hover:bg-blue-200"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-12 h-12 bg-blue-100 text-blue-400 rounded-full flex items-center justify-center hover:bg-blue-200"
                aria-label="Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};