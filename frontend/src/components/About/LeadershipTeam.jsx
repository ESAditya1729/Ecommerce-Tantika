import { Linkedin, Instagram, Mail, Globe } from 'lucide-react';

const LeadershipTeam = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Purba Banerjee',
      role: 'Founder & CEO',
      bio: 'Passionate about preserving Bengali heritage, Ananya left her corporate career to build তন্তিকা. She holds a Masters in Cultural Anthropology from Jadavpur University.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
      social: {
        linkedin: '#',
        instagram: '#',
        email: 'purba@tantika.com',
        website: '#'
      },
      color: 'from-blue-500 to-blue-600',
      quote: '"Every artisan we work with is preserving a piece of our culture."'
    },
    {
      id: 2,
      name: 'Aditya Mukherjee',
      role: 'Co-founder & COO',
      bio: 'With 10+ years in e-commerce operations, Rohan ensures that every তন্তিকা product reaches customers with care and efficiency. He oversees logistics and artisan relations.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      social: {
        linkedin: '#',
        instagram: '#',
        email: 'rohan@tantika.com',
        website: '#'
      },
      color: 'from-purple-500 to-purple-600',
      quote: '"We build bridges between tradition and modernity."'
    },
    {
      id: 3,
      name: 'Parna Banerjee',
      role: 'Chief Marketing Officer',
      bio: 'Priya brings her expertise in digital marketing and brand strategy to share the তন্তিকা story with the world. She previously worked with heritage brands across India.',
      image: 'data:image/jpeg;base64,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',
      social: {
        linkedin: '#',
        instagram: '#',
        email: 'parna@tantika.com',
        website: '#'
      },
      color: 'from-pink-500 to-pink-600',
      quote: '"Marketing heritage requires authenticity above all else."'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
            <span className="font-medium">Leadership Team</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Meet Our Leadership
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Passionate individuals dedicated to preserving Bengali craftsmanship 
            while building a sustainable future for artisans.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {teamMembers.map((member) => (
            <div 
              key={member.id}
              className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Gradient Top Border */}
              <div className={`h-2 bg-gradient-to-r ${member.color}`}></div>
              
              <div className="p-8">
                {/* Profile Image */}
                <div className="relative mb-8">
                  <div className="w-40 h-40 mx-auto relative">
                    <div className={`absolute inset-0 bg-gradient-to-r ${member.color} rounded-full opacity-20 blur-xl`}></div>
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="relative w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
                    />
                  </div>
                  
                  {/* Role Badge */}
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${member.color} text-white px-6 py-2 rounded-full font-semibold shadow-lg`}>
                    {member.role}
                  </div>
                </div>

                {/* Name and Bio */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-3">{member.name}</h3>
                  <p className="text-gray-600 leading-relaxed">{member.bio}</p>
                </div>

                {/* Quote */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border-l-4 border-blue-400">
                  <p className="text-gray-700 italic">"{member.quote}"</p>
                </div>

                {/* Social Links */}
                <div className="flex justify-center space-x-4">
                  <a 
                    href={member.social.linkedin}
                    className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                    aria-label={`Connect with ${member.name} on LinkedIn`}
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a 
                    href={member.social.instagram}
                    className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center hover:bg-pink-200 transition-colors"
                    aria-label={`Follow ${member.name} on Instagram`}
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a 
                    href={`mailto:${member.social.email}`}
                    className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    aria-label={`Email ${member.name}`}
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                  <a 
                    href={member.social.website}
                    className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
                    aria-label={`Visit ${member.name}'s website`}
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Team Philosophy */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12 border border-blue-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Our Collective Vision</h3>
              <p className="text-gray-700 text-lg">
                We believe that businesses can be a force for good. Our leadership team combines 
                passion for cultural preservation with modern business expertise to create a platform 
                that benefits artisans, customers, and the cultural ecosystem of Bengal.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                <div className="text-gray-700 font-medium">Bengali Heritage</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-purple-600 mb-2">Fair</div>
                <div className="text-gray-700 font-medium">Trade Practices</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-pink-600 mb-2">Sustainable</div>
                <div className="text-gray-700 font-medium">Growth Focus</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Interested in joining our team or collaborating with us? We're always looking for 
              passionate individuals who share our vision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:careers@tantika.com"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-shadow"
              >
                Explore Careers
              </a>
              <a 
                href="mailto:partnerships@tantika.com"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors"
              >
                Partnership Inquiries
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadershipTeam;