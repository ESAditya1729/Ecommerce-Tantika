// src/components/ShippingPolicy.jsx
import React, { useState } from "react";
import {
  Package,
  Truck,
  Clock,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  ChevronDown,
  ChevronUp,
  Shield,
  Globe,
  Heart,
  AlertCircle,
} from "lucide-react";

const ShippingPolicy = () => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const shippingTimeData = [
    { destination: "Metro Cities", time: "3-5 business days" },
    { destination: "Urban Areas", time: "4-7 business days" },
    { destination: "Rural Locations", time: "5-10 business days" },
    { destination: "Remote Areas", time: "7-12 business days" },
  ];

  const partners = ["India Post", "Delhivery", "Blue Dart", "DTDC"];

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
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
              Shipping Policy
            </h1>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto">
              Every handmade piece arrives with love and care
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
                Welcome to Tantika, your destination for unique handmade crafts
                created by talented artisans across India. Our shipping process
                is designed to ensure that each handcrafted piece reaches you
                with the same love and care that went into creating it.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Unlike mass-produced items, each product on Tantika is
                individually handcrafted, and we believe in maintaining a
                personal connection throughout your shopping journey. This
                Shipping Policy explains how we handle the delivery of your
                cherished handmade items.
              </p>
            </div>
          </div>
        </div>

        {/* Process Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-amber-100">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">
            2. How Our Shipping Process Works
          </h2>

          <div className="space-y-6">
            {/* Order Confirmation */}
            <div className="border-l-4 border-amber-600 pl-4">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Order Confirmation (Within 24 hours)
              </h3>
              <p className="text-gray-700">
                You'll receive an order confirmation with your order details
                immediately after purchase.
              </p>
            </div>

            {/* Artisan Connect */}
            <div className="border-l-4 border-amber-600 pl-4">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Artisan Connect (Within 48-72 hours)
              </h3>
              <p className="text-gray-700 mb-2">
                Our team or the artisan themselves will reach out to you via
                phone or email to discuss:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Any customization requests you may have</li>
                <li>
                  Confirmation of product details, colors, sizes, or materials
                </li>
                <li>Estimated crafting time (if the item is made-to-order)</li>
                <li>Any questions you might have about the product</li>
              </ul>
            </div>

            {/* Customization Discussion */}
            <div className="border-l-4 border-amber-600 pl-4">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Customization Discussion
              </h3>
              <p className="text-gray-700 mb-2">
                Many of our artisans offer customization options. During our
                follow-up call, we'll discuss:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Personalization options (engraving, embroidery, etc.)</li>
                <li>Color variations</li>
                <li>Size adjustments</li>
                <li>Material preferences (where applicable)</li>
                <li>Any special requests you may have</li>
              </ul>
            </div>

            {/* Address Confirmation */}
            <div className="border-l-4 border-amber-600 pl-4">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Shipping Address Confirmation
              </h3>
              <p className="text-gray-700 mb-2">
                During our communication, we'll verify your shipping address to
                ensure accurate delivery. Please note:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>We only ship to addresses within India at this time</li>
                <li>
                  We require a valid phone number for courier coordination
                </li>
                <li>
                  Addresses cannot be changed after the item has been dispatched
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Shipping Charges Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-amber-100">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">
            3. Shipping Charges
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-amber-50 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-6 h-6 text-amber-700" />
                <h3 className="text-lg font-semibold text-amber-800">
                  Delivery Charges
                </h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>• Shipping fee collected separately at shipment time</li>
                <li>• Paid directly to delivery agent at delivery</li>
                <li>• Costs vary by destination, weight, and speed</li>
              </ul>
            </div>

            <div className="bg-amber-50 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-amber-700" />
                <h3 className="text-lg font-semibold text-amber-800">
                  Cost Transparency
                </h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>• Estimated costs provided during follow-up call</li>
                <li>• Option to accept or decline based on charges</li>
                <li>• Most economical shipping options used</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Shipping Timeframes */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-amber-100">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">
            4. Shipping Timeframes
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-3">
                Crafting/Processing Time
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Ready-to-ship items: 2-3 business days</li>
                <li>• Made-to-order items: 5-15 business days</li>
                <li>
                  • Customized orders: Timeline discussed during consultation
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-3">
                Transit Time
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-amber-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                        Destination Type
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-amber-900">
                        Estimated Delivery Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-200">
                    {shippingTimeData.map((item, index) => (
                      <tr key={index} className="hover:bg-amber-50">
                        <td className="px-6 py-4 text-gray-700">
                          {item.destination}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{item.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Partners */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-amber-100">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">
            5. Shipping Partners
          </h2>

          <div className="flex flex-wrap gap-4 mb-4">
            {partners.map((partner, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
              >
                {partner}
              </span>
            ))}
          </div>
          <p className="text-gray-700">
            We choose the most appropriate shipping partner based on your
            location to ensure safe and timely delivery.
          </p>
        </div>

        {/* Special Circumstances Accordion */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-amber-100">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">
            6. Special Circumstances
          </h2>

          <div className="space-y-4">
            {/* Multiple Items */}
            <div className="border border-amber-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("multiple")}
                className="w-full px-6 py-4 flex justify-between items-center bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <span className="font-semibold text-amber-800">
                  Multiple Items in One Order
                </span>
                {openSections.multiple ? (
                  <ChevronUp className="text-amber-600" />
                ) : (
                  <ChevronDown className="text-amber-600" />
                )}
              </button>
              {openSections.multiple && (
                <div className="px-6 py-4 bg-white">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Items may ship separately from different locations</li>
                    <li>
                      You'll receive tracking information for each shipment
                    </li>
                    <li>Shipping charges will apply per shipment</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Festival Season */}
            <div className="border border-amber-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("festival")}
                className="w-full px-6 py-4 flex justify-between items-center bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <span className="font-semibold text-amber-800">
                  Festival Season Delays
                </span>
                {openSections.festival ? (
                  <ChevronUp className="text-amber-600" />
                ) : (
                  <ChevronDown className="text-amber-600" />
                )}
              </button>
              {openSections.festival && (
                <div className="px-6 py-4 bg-white">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>
                      Shipping may take longer than usual (add 2-4 business
                      days)
                    </li>
                    <li>
                      We recommend ordering well in advance for
                      festival-specific items
                    </li>
                    <li>
                      Courier partners may have limited operations on holidays
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Weather Events */}
            <div className="border border-amber-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("weather")}
                className="w-full px-6 py-4 flex justify-between items-center bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <span className="font-semibold text-amber-800">
                  Weather and Unforeseen Events
                </span>
                {openSections.weather ? (
                  <ChevronUp className="text-amber-600" />
                ) : (
                  <ChevronDown className="text-amber-600" />
                )}
              </button>
              {openSections.weather && (
                <div className="px-6 py-4 bg-white">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>
                      Shipping may be delayed during natural calamities or
                      strikes
                    </li>
                    <li>We'll keep you informed of any significant delays</li>
                    <li>
                      Your understanding during such situations is appreciated
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
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
            <h2 className="text-3xl font-semibold mb-4">7. Need Help?</h2>

            <p className="text-amber-100 mb-8 max-w-2xl mx-auto text-lg">
              Have questions about shipping? Our team is here to help you with
              any queries about delivery, tracking, or your handmade treasures.
            </p>

            {/* Animated Button */}
            <div className="flex justify-center">
              <button
                onClick={() => (window.location.href = "/contact")}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-amber-900 bg-white rounded-full overflow-hidden shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-amber-200/50 active:scale-95"
              >
                {/* Button background animation */}
                <span className="absolute inset-0 bg-gradient-to-r from-amber-200 to-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>

                {/* Shine effect */}
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100">
                  <span className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shine"></span>
                </span>

                {/* Button content */}
                <span className="relative flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  Contact Shipping Team
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

                {/* Ripple effect on hover */}
                <span className="absolute inset-0 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 group-hover:animate-ripple"></span>
              </button>
            </div>

            {/* Quick contact options */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-amber-200">
              <div className="flex items-center gap-2 hover:text-white transition-colors duration-300 cursor-pointer group">
              </div>
              <div className="flex items-center gap-2 hover:text-white transition-colors duration-300 cursor-pointer group">
                <Clock className="w-4 h-4 group-hover:animate-spin-slow" />
                <span>Mon-Sat, 10AM-6PM IST</span>
              </div>
            </div>

            {/* Social links
            <div className="mt-6 flex justify-center gap-4">
              <a
                href="#"
                className="p-2 bg-amber-700/50 rounded-full hover:bg-amber-600 transition-all duration-300 hover:scale-110 hover:rotate-12 group"
              >
                <Instagram className="w-5 h-5 group-hover:animate-pulse" />
              </a>
              <a
                href="#"
                className="p-2 bg-amber-700/50 rounded-full hover:bg-amber-600 transition-all duration-300 hover:scale-110 hover:-rotate-12 group"
              >
                <Facebook className="w-5 h-5 group-hover:animate-pulse" />
              </a>
            </div> */}
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center py-8">
          <div className="bg-amber-100 rounded-2xl p-8">
            <Heart className="w-12 h-12 text-amber-700 mx-auto mb-4" />
            <p className="text-lg text-amber-900 font-medium mb-2">
              Thank you for supporting handmade crafts and the amazing artisans
              of Tantika!
            </p>
            <p className="text-amber-700">
              Every purchase you make helps preserve traditional crafts and
              supports artisan livelihoods. We're honored to be part of your
              journey in discovering unique, handcrafted treasures.
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

export default ShippingPolicy;
