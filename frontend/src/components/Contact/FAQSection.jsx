import { useState } from 'react';
import { ChevronDown, HelpCircle, Package, Truck, CreditCard, Users,Mail,Phone } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How does the ordering process work?',
      answer: 'Instead of traditional checkout, you express interest in a product. Our team contacts you within 24 hours to discuss delivery options, customization possibilities, and payment methods that work best for you.',
      icon: <Package className="w-5 h-5" />,
      category: 'Ordering'
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery times vary based on your location and the artisan\'s production schedule. Typically, it takes 7-14 days within West Bengal and 10-21 days for other states. Our team will provide exact timelines when we contact you.',
      icon: <Truck className="w-5 h-5" />,
      category: 'Shipping'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept multiple payment methods including bank transfers, UPI, credit/debit cards, and cash on delivery (available in select areas). We discuss payment options with you directly to ensure a secure and convenient transaction.',
      icon: <CreditCard className="w-5 h-5" />,
      category: 'Payment'
    },
    {
      question: 'Can I customize a product?',
      answer: 'Yes! Many of our artisans accept custom orders. When you express interest, mention your customization requirements, and our team will coordinate with the artisan to discuss possibilities, timelines, and additional costs.',
      icon: <HelpCircle className="w-5 h-5" />,
      category: 'Customization'
    },
    {
      question: 'How do you ensure product quality?',
      answer: 'Every product undergoes multiple quality checks by both the artisan and our team. We work only with skilled artisans who maintain traditional techniques while meeting our quality standards. Each piece is inspected before dispatch.',
      icon: <Package className="w-5 h-5" />,
      category: 'Quality'
    },
    {
      question: 'Can I collaborate as an artisan?',
      answer: 'We\'re always looking to collaborate with skilled artisans! Please contact us with details about your craft, experience, and portfolio. Our team reviews all applications and contacts potential collaborators for further discussion.',
      icon: <Users className="w-5 h-5" />,
      category: 'Collaboration'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 7-day return policy for damaged or defective items. Due to the handmade nature of our products, returns for change of mind are evaluated on a case-by-case basis. Please contact us immediately if you receive a damaged product.',
      icon: <HelpCircle className="w-5 h-5" />,
      category: 'Returns'
    },
    {
      question: 'Do you offer wholesale prices?',
      answer: 'Yes, we offer special pricing for bulk orders, weddings, corporate gifts, and retail partnerships. Please select "Wholesale Inquiry" in the contact form or email us directly at wholesale@tantika.com.',
      icon: <CreditCard className="w-5 h-5" />,
      category: 'Wholesale'
    }
  ];

  const categories = ['All', 'Ordering', 'Shipping', 'Payment', 'Customization', 'Quality', 'Collaboration', 'Returns', 'Wholesale'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFaqs = selectedCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find quick answers to common questions about তন্তিকা
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start">
                    <div className="mr-4 mt-1 text-blue-600">
                      {faq.icon}
                    </div>
                    <div>
                      <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-2">
                        {faq.category}
                      </div>
                      <h3 className="font-bold text-lg">{faq.question}</h3>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {openIndex === index && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                    <div className="pl-10">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      {faq.category === 'Ordering' && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <strong>Note:</strong> Our process is designed to provide personalized service and ensure the best experience with handmade products.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still Have Questions */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
              <h3 className="text-xl font-bold mb-4">Still have questions?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Can't find the answer you're looking for? Our team is ready to help you with any questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:support@tantika.com" 
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Email Support
                </a>
                <a 
                  href="tel:+919876543210" 
                  className="inline-flex items-center border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;