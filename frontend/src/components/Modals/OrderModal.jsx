import { useState, useEffect } from 'react';
import { X, ShoppingBag, User, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import axios from 'axios';

const OrderModal = ({ isOpen, onClose, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // API base URL - update this with your backend URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // RESET STATE WHEN MODAL OPENS/CLOSES OR PRODUCT CHANGES
  useEffect(() => {
    if (!isOpen) {
      // Reset everything when modal closes
      resetAllState();
    } else {
      // Reset state when modal opens with a new product
      resetAllState();
    }
  }, [isOpen, product]); // Reset when modal opens/closes OR product changes

  const resetAllState = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      message: ''
    });
    setIsSubmitting(false);
    setSubmitSuccess(false);
    setOrderDetails(null);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const orderData = {
        productId: product.id || product._id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.images?.[0] || '',
        artisan: product.artisan || 'Unknown Artisan',
        productLocation: product.location || 'Unknown Location',
        customerDetails: {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          message: formData.message.trim()
        }
      };
      
      console.log('Submitting order to:', `${API_BASE_URL}/api/orders/express-interest`);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/orders/express-interest`, 
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
          timeout: 10000 // 10 second timeout
        }
      );
      
      console.log('Order response:', response.data);
      
      if (response.data.success) {
        setSubmitSuccess(true);
        setOrderDetails(response.data.data);
        
        // Reset form immediately
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          message: ''
        });
        
        // Close modal after 5 seconds
        const closeTimer = setTimeout(() => {
          handleCloseModal();
        }, 5000);
        
        // Clean up timer
        return () => clearTimeout(closeTimer);
      } else {
        throw new Error(response.data.error || 'Failed to submit interest');
      }
      
    } catch (error) {
      console.error('Order submission error:', error);
      
      let errorMsg = 'Failed to submit interest. Please try again.';
      
      if (error.response) {
        errorMsg = error.response.data.error || error.response.data.message || errorMsg;
      } else if (error.request) {
        errorMsg = 'No response from server. Please check your connection.';
      } else {
        errorMsg = error.message || errorMsg;
      }
      
      setErrorMessage(errorMsg);
      
      // Optional: Show toast instead of alert
      // toast.error(`❌ ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCloseModal = () => {
    // Reset all state first
    resetAllState();
    // Then close the modal
    onClose();
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ShoppingBag className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h2 className="text-xl font-bold">Express Interest</h2>
                <p className="text-gray-600 text-sm">
                  {submitSuccess ? 'Thank you for your interest!' : `For: ${product.name}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {submitSuccess && orderDetails && (
          <div className="p-6">
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-700 mb-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Interest submitted successfully!</span>
              </div>
              <p className="text-green-600 text-sm mb-3">
                We'll contact you within 24 hours to discuss your order.
              </p>
              
              {/* Order Details */}
              <div className="mt-4 p-3 bg-white border border-green-100 rounded">
                <h4 className="font-semibold text-gray-700 mb-2">Order Details:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">{orderDetails.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{orderDetails.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium">{orderDetails.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Contact:</span>
                    <span className="font-medium">{orderDetails.estimatedContact}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center text-gray-500 text-sm">
              <p>This modal will close automatically in a few seconds...</p>
            </div>
          </div>
        )}

        {/* Product Info - Only show when not in success state */}
        {!submitSuccess && (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start space-x-4">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">By {product.artisan} • {product.location}</p>
                  <div className="text-2xl font-bold text-blue-600">₹{product.price}</div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Submission Error</span>
                </div>
                <p className="text-red-600 text-sm mt-1">
                  {errorMessage}
                </p>
                <button
                  onClick={() => setErrorMessage('')}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Form */}
            {!errorMessage && (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <p className="text-gray-700">
                      <span className="font-semibold">Note:</span> This is not a traditional checkout. 
                      After submitting, our team will contact you to discuss delivery, customization, 
                      and payment options.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline w-4 h-4 mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline w-4 h-4 mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter pincode"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Complete Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows="3"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your complete address with landmarks"
                  />
                </div>

                {/* City and State */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter your state"
                    />
                  </div>
                </div>

                {/* Additional Message */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="3"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Any specific requirements or questions?"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Interest'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderModal;