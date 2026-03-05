// src/components/ReturnRefundPolicy.jsx
import React, { useState } from 'react';
import { 
  RefreshCw,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Package,
  Shield,
  Clock,
  Mail,
  Phone,
  MessageCircle,
  ArrowLeft,
  Camera,
  Tag,
  Heart,
  FileText,
  Info,
  Ban
} from 'lucide-react';

const ReturnRefundPolicy = () => {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const policyHighlights = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Minimum Order Value",
      description: "Orders below ₹100 are not eligible for returns",
      color: "from-amber-500 to-amber-600"
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "30% Processing Fee",
      description: "Deducted from approved returns/refunds",
      color: "from-amber-600 to-amber-700"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "7 Days Window",
      description: "Submit requests within 7 days of delivery",
      color: "from-amber-700 to-amber-800"
    }
  ];

  const nonReturnableItems = [
    "Perishable goods",
    "Customized products",
    "Intimate apparel",
    "Digital downloads",
    "Personalized items",
    "Hygiene products"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section with Back Button */}
      <div className="relative bg-amber-800 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img 
            src="https://res.cloudinary.com/drariarqq/image/upload/v1772736683/Screenshot_2026-03-06_001619_iwdmga.png" 
            alt="Return and Refund background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Back button */}
          <button 
            onClick={() => window.location.href = '/'}
            className="absolute top-4 left-4 flex items-center gap-2 text-amber-100 hover:text-white transition-colors duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          <div className="text-center">
            <div className="inline-block p-3 bg-amber-700/30 rounded-full mb-4 animate-pulse">
              <RefreshCw className="w-8 h-8 text-amber-200" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
              Return & Refund Policy
            </h1>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto">
              Your satisfaction is our priority, crafted with care and transparency
            </p>
            <div className="mt-4 text-amber-200">
              Last Updated: March 5, 2026
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-amber-100 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-start gap-4">
            <div className="bg-amber-100 p-3 rounded-full animate-bounce">
              <Heart className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-4">
                Thank You for Shopping With Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We strive to ensure your satisfaction with every purchase. Please read our Refund and Return Policy 
                carefully before making a purchase. This policy outlines the conditions under which returns and refunds 
                are processed. By placing an order, you agree to these terms.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Highlights Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {policyHighlights.map((highlight, index) => (
            <div
              key={index}
              className="relative group cursor-pointer"
              onMouseEnter={() => setActiveTooltip(index)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <div className={`bg-gradient-to-br ${highlight.color} rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl`}>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Info className="w-4 h-4" />
                </div>
                <div className="mb-4 transform group-hover:rotate-12 transition-transform">
                  {highlight.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{highlight.title}</h3>
                <p className="text-amber-100 text-sm">{highlight.description}</p>
              </div>
              
              {/* Tooltip */}
              {activeTooltip === index && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50 animate-fade-in">
                  Click for more details
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Main Policy Content */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Key Policies */}
          <div className="lg:col-span-2 space-y-6">
            {/* Minimum Order Value */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-600 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <Ban className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-amber-900">Minimum Order Value</h3>
              </div>
              <p className="text-gray-700">
                If you order an amount less than <span className="font-bold text-amber-700">₹100/-</span>, 
                then there is no way to return or get a refund.
              </p>
            </div>

            {/* Processing Fee */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-600 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-100 p-2 rounded-full">
                  <DollarSign className="w-5 h-5 text-amber-700" />
                </div>
                <h3 className="text-xl font-semibold text-amber-900">Processing Fee</h3>
              </div>
              <p className="text-gray-700">
                For any approved return or refund, a minimum processing charge of{' '}
                <span className="font-bold text-amber-700">30% of the product's price</span> will be deducted. 
                This fee covers restocking, inspection, and administrative costs.
              </p>
            </div>

            {/* Return Window */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-600 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-amber-900">Return Window</h3>
              </div>
              <p className="text-gray-700 mb-3">
                All return or refund requests must be submitted via email to our support team within{' '}
                <span className="font-bold text-amber-700">7 days from the date of delivery</span>.
              </p>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Please include in your email:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                    Your order number
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                    Details of the issue
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                    Supporting evidence (photos of the product)
                  </li>
                </ul>
              </div>
            </div>

            {/* Condition of Returned Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-600 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-amber-900">Condition of Returned Items</h3>
              </div>
              <p className="text-gray-700 mb-3">
                Products must be returned in their original condition, unused, with all tags, packaging, and accessories intact.
              </p>
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>We reserve the right to reject returns that do not meet these criteria.</span>
              </div>
            </div>

            {/* Inspection and Approval */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-amber-600 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-amber-900">Inspection and Approval</h3>
              </div>
              <p className="text-gray-700">
                Upon receiving the returned item, our team will inspect it within{' '}
                <span className="font-bold text-amber-700">5-7 business days</span>. If approved, the refund 
                (minus the 30% charge) will be processed within{' '}
                <span className="font-bold text-amber-700">10-15 business days</span>.
              </p>
            </div>

            {/* Damaged/Defective Products */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-amber-900">Damaged or Defective Products</h3>
              </div>
              <p className="text-gray-700">
                If you receive a damaged, defective, or incorrect product, please contact us immediately within the 
                7-day window. We may waive the processing fee in such cases, subject to verification.
              </p>
            </div>
          </div>

          {/* Right Column - Non-Returnable Items & Contact */}
          <div className="space-y-6">
            {/* Non-Returnable Items Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-amber-200 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-100 p-3 rounded-full">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-amber-900">Non-Returnable Items</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                Certain items are non-returnable for hygiene, safety, or other reasons:
              </p>

              <div className="space-y-3">
                {nonReturnableItems.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <Ban className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              {/* Quick Contact Card */}
              <div className="mt-8 p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
                <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Need to return an item?
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Email us within 7 days of delivery:
                </p>
                <a 
                  href="mailto:tantikacustomercare@outlook.com"
                  className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all group"
                >
                  <span className="text-amber-700 text-sm font-medium">
                    tantikacustomercare@outlook.com
                  </span>
                  <Mail className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Changes Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-amber-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-amber-700" />
            </div>
            <h2 className="text-2xl font-semibold text-amber-900">Policy Changes</h2>
          </div>
          <p className="text-gray-700">
            We reserve the right to update this policy at any time. Changes will be posted on our website, 
            and continued use of our services constitutes acceptance of the updated terms.
          </p>
        </div>

        {/* Contact Section - Animated Button */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-900 rounded-2xl shadow-lg p-8 mb-8 text-white overflow-hidden relative">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -inset-[10px] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3)_0%,transparent_50%)] animate-pulse"></div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-ping opacity-20"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-300 rounded-full blur-3xl animate-pulse opacity-30"></div>
          </div>

          <div className="relative z-10 text-center">
            <h2 className="text-3xl font-semibold mb-4">
              Questions About Returns?
            </h2>
            
            <p className="text-amber-100 mb-8 max-w-2xl mx-auto text-lg">
              If you have any questions about this policy, please reach out to us. We appreciate your understanding and look forward to serving you!
            </p>

            {/* Animated Button */}
            <div className="flex justify-center">
              <button 
                onClick={() => window.location.href = '/contact'}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-amber-900 bg-white rounded-full overflow-hidden shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-amber-200/50 active:scale-95"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-200 to-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100">
                  <span className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shine"></span>
                </span>
                
                <span className="relative flex items-center gap-3">
                  <MessageCircle className="w-5 h-5" />
                  Contact Customer Care
                  <svg 
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>

                <span className="absolute inset-0 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 group-hover:animate-ripple"></span>
              </button>
            </div>

            {/* Email Contact */}
            <div className="mt-6 text-amber-200">
              <span className="text-sm">Or email us directly: </span>
              <a 
                href="mailto:tantikacustomercare@outlook.com"
                className="text-white font-medium hover:underline"
              >
                tantikacustomercare@outlook.com
              </a>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center py-8">
          <div className="bg-amber-100 rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-200/50 to-amber-300/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
            <div className="relative">
              <Heart className="w-12 h-12 text-amber-700 mx-auto mb-4 animate-pulse" />
              <p className="text-lg text-amber-900 font-medium mb-2">
                Thank you for supporting handmade crafts!
              </p>
              <p className="text-amber-700">
                We're committed to making your experience with Tantika as beautiful as our products.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnRefundPolicy;