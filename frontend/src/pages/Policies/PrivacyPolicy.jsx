// src/pages/Policies/PrivacyPolicy.jsx
import React, { useState } from "react";
import {
  Shield,
  Lock,
  Eye,
  UserCheck,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Heart,
  CheckCircle,
  Database,
  Cookie,
  Users,
  Share2,
  Trash2,
  Bell,
  CreditCard,
  Activity,
  Clock,
} from "lucide-react";

const PrivacyPolicy = () => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const dataCollectionItems = [
    {
      icon: <UserCheck className="w-5 h-5 text-amber-700" />,
      title: "Personal Information",
      details: [
        "Name and contact details (email, phone number, address)",
        "Date of birth (for age verification)",
        "Profile information and preferences",
      ],
    },
    {
      icon: <CreditCard className="w-5 h-5 text-amber-700" />,
      title: "Transaction Data",
      details: [
        "Order history and purchase details",
        "Payment information (processed securely)",
        "Shipping and delivery preferences",
      ],
    },
    {
      icon: <Activity className="w-5 h-5 text-amber-700" />,
      title: "Usage Information",
      details: [
        "Browsing behavior and session data",
        "Device information and IP address",
        "Cookies and similar tracking technologies",
      ],
    },
  ];

  const rightsData = [
    {
      icon: <Eye className="w-5 h-5 text-amber-700" />,
      title: "Right to Access",
      description: "Request a copy of your personal data we hold",
    },
    {
      icon: <Trash2 className="w-5 h-5 text-amber-700" />,
      title: "Right to Deletion",
      description: "Request deletion of your personal data",
    },
    {
      icon: <Share2 className="w-5 h-5 text-amber-700" />,
      title: "Right to Portability",
      description: "Transfer your data to another service",
    },
    {
      icon: <Bell className="w-5 h-5 text-amber-700" />,
      title: "Right to Object",
      description: "Object to certain data processing activities",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-amber-800 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src="https://res.cloudinary.com/drariarqq/image/upload/v1772736683/Screenshot_2026-03-06_001619_iwdmga.png"
            alt="Handicraft background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-16 h-16 text-amber-300" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
              Privacy Policy
            </h1>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto">
              Your privacy matters to us. We protect your data like our artisans protect their craft.
            </p>
            <div className="mt-4 text-amber-200">
              Last Updated: March 5, 2026
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-amber-100">
          <div className="flex items-start gap-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <Heart className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                At Tantika, we respect your privacy and are committed to protecting your personal data. 
                This Privacy Policy explains how we collect, use, and safeguard your information when 
                you interact with our platform. Just as our artisans carefully craft each piece, we 
                meticulously handle your data with the utmost care and responsibility.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                By using our website, you trust us with your information. We promise to be transparent 
                about our practices and give you control over your data. This policy applies to all 
                services offered by Tantika and our associated platforms.
              </p>
            </div>
          </div>
        </div>

        {/* Data Collection Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-amber-100">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">
            2. Information We Collect
          </h2>
          <p className="text-gray-700 mb-6">
            We collect information to provide better services to all our users. Here's what we collect:
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {dataCollectionItems.map((item, index) => (
              <div
                key={index}
                className="bg-amber-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-100 p-2 rounded-lg">{item.icon}</div>
                  <h3 className="font-semibold text-amber-900">{item.title}</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  {item.details.map((detail, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* How We Use Data */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-amber-100">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">
            3. How We Use Your Information
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-amber-50 p-4 rounded-xl flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Database className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Order Processing</h3>
                <p className="text-sm text-gray-700">
                  To process transactions, deliver products, and provide customer support
                </p>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Artisan Coordination</h3>
                <p className="text-sm text-gray-700">
                  To connect you with artisans and facilitate customization requests
                </p>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Bell className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Communication</h3>
                <p className="text-sm text-gray-700">
                  To send order updates, promotional offers, and important announcements
                </p>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Platform Improvement</h3>
                <p className="text-sm text-gray-700">
                  To enhance user experience, analyze trends, and optimize our services
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cookie Policy */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-amber-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-amber-100 p-3 rounded-full">
              <Cookie className="w-6 h-6 text-amber-700" />
            </div>
            <h2 className="text-2xl font-semibold text-amber-900">
              4. Cookie Policy
            </h2>
          </div>

          <p className="text-gray-700 mb-4">
            We use cookies and similar tracking technologies to enhance your browsing experience. 
            These small data files help us understand how you use our platform and personalize content.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-amber-50 p-4 rounded-xl text-center">
              <div className="text-amber-800 font-semibold">Essential Cookies</div>
              <p className="text-sm text-gray-600 mt-1">
                Required for basic site functionality and security
              </p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl text-center">
              <div className="text-amber-800 font-semibold">Analytics Cookies</div>
              <p className="text-sm text-gray-600 mt-1">
                Help us understand how visitors interact with our site
              </p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl text-center">
              <div className="text-amber-800 font-semibold">Preference Cookies</div>
              <p className="text-sm text-gray-600 mt-1">
                Remember your settings and preferences for future visits
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            You can manage your cookie preferences through your browser settings. Note that 
            disabling certain cookies may affect the functionality of our website.
          </p>
        </div>

        {/* Data Protection Measures */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-amber-100">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">
            5. Data Protection Measures
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <Lock className="w-6 h-6 text-green-700 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-green-800">Encryption</h3>
                <p className="text-gray-700">
                  All data transmitted between your device and our servers is encrypted using 
                  industry-standard SSL/TLS protocols. Your payment information is never stored 
                  in plain text.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <Shield className="w-6 h-6 text-blue-700 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-800">Security Infrastructure</h3>
                <p className="text-gray-700">
                  We employ advanced security measures including firewalls, intrusion detection 
                  systems, and regular security audits to protect your data from unauthorized access.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <UserCheck className="w-6 h-6 text-purple-700 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-purple-800">Access Control</h3>
                <p className="text-gray-700">
                  Access to personal data is strictly limited to authorized personnel who need it 
                  for their work. All employees undergo data protection training.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-amber-100">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">
            6. Your Rights
          </h2>

          <p className="text-gray-700 mb-6">
            Under applicable data protection laws, you have the following rights regarding your 
            personal data:
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {rightsData.map((right, index) => (
              <div
                key={index}
                className="bg-amber-50 p-4 rounded-xl flex items-center gap-3 hover:bg-amber-100 transition-colors duration-300"
              >
                <div className="bg-amber-100 p-2 rounded-lg">{right.icon}</div>
                <div>
                  <h3 className="font-semibold text-amber-900 text-sm">
                    {right.title}
                  </h3>
                  <p className="text-sm text-gray-600">{right.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-sm text-gray-700">
              <strong>To exercise your rights:</strong> Contact us at{" "}
              <a
                href="mailto:privacy@tantika.com"
                className="text-amber-700 font-medium hover:underline"
              >
                privacy@tantika.com
              </a>{" "}
              or call our support team. We'll respond within 30 days.
            </p>
          </div>
        </div>

        {/* Third-Party Sharing Accordion */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-amber-100">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">
            7. Third-Party Sharing
          </h2>

          <div className="space-y-4">
            <div className="border border-amber-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("shipping")}
                className="w-full px-6 py-4 flex justify-between items-center bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <span className="font-semibold text-amber-800">
                  Shipping Partners
                </span>
                {openSections.shipping ? (
                  <ChevronUp className="text-amber-600" />
                ) : (
                  <ChevronDown className="text-amber-600" />
                )}
              </button>
              {openSections.shipping && (
                <div className="px-6 py-4 bg-white">
                  <p className="text-gray-700">
                    We share necessary shipping information with our logistics partners 
                    (India Post, Delhivery, Blue Dart, DTDC) to deliver your orders. They 
                    are contractually obligated to protect your data.
                  </p>
                </div>
              )}
            </div>

            <div className="border border-amber-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("payment")}
                className="w-full px-6 py-4 flex justify-between items-center bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <span className="font-semibold text-amber-800">
                  Payment Processors
                </span>
                {openSections.payment ? (
                  <ChevronUp className="text-amber-600" />
                ) : (
                  <ChevronDown className="text-amber-600" />
                )}
              </button>
              {openSections.payment && (
                <div className="px-6 py-4 bg-white">
                  <p className="text-gray-700">
                    Payment transactions are processed through secure third-party payment 
                    gateways. We do not store your complete payment information on our servers.
                  </p>
                </div>
              )}
            </div>

            <div className="border border-amber-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("analytics")}
                className="w-full px-6 py-4 flex justify-between items-center bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <span className="font-semibold text-amber-800">
                  Analytics Providers
                </span>
                {openSections.analytics ? (
                  <ChevronUp className="text-amber-600" />
                ) : (
                  <ChevronDown className="text-amber-600" />
                )}
              </button>
              {openSections.analytics && (
                <div className="px-6 py-4 bg-white">
                  <p className="text-gray-700">
                    We use analytics tools to understand site usage. These services may use 
                    cookies and collect anonymized data to help us improve our platform.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Section - Animated */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-900 rounded-2xl shadow-lg p-8 mb-8 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -inset-[10px] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3)_0%,transparent_50%)] animate-pulse"></div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-ping opacity-20"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-300 rounded-full blur-3xl animate-pulse opacity-30"></div>
          </div>

          <div className="relative z-10 text-center">
            <h2 className="text-3xl font-semibold mb-4">8. Contact Us</h2>

            <p className="text-amber-100 mb-8 max-w-2xl mx-auto text-lg">
              Have questions about our Privacy Policy? Our team is here to help you understand 
              how we protect your data.
            </p>

            <div className="flex justify-center">
              <button
                onClick={() => (window.location.href = "/contact")}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-amber-900 bg-white rounded-full overflow-hidden shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-amber-200/50 active:scale-95"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-200 to-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100">
                  <span className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shine"></span>
                </span>
                <span className="relative flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  Contact Privacy Team
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-amber-200">
              <div className="flex items-center gap-2 hover:text-white transition-colors duration-300 cursor-pointer group">
                <Mail className="w-4 h-4" />
                <span>privacy@tantika.com</span>
              </div>
              <div className="flex items-center gap-2 hover:text-white transition-colors duration-300 cursor-pointer group">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 hover:text-white transition-colors duration-300 cursor-pointer group">
                <Clock className="w-4 h-4 group-hover:animate-spin-slow" />
                <span>Mon-Sat, 10AM-6PM IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center py-8">
          <div className="bg-amber-100 rounded-2xl p-8">
            <Shield className="w-12 h-12 text-amber-700 mx-auto mb-4" />
            <p className="text-lg text-amber-900 font-medium mb-2">
              Your trust is our most valuable treasure
            </p>
            <p className="text-amber-700">
              At Tantika, we treat your data with the same care and respect as the 
              beautiful handcrafted items you love. We're committed to transparency, 
              security, and your peace of mind.
            </p>
            <div className="mt-4 text-amber-800 font-serif italic">
              Tantika - Where Every Creation Tells a Story
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;