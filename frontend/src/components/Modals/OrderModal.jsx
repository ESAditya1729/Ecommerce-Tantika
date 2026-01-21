import { useState, useEffect } from 'react';
import { X, ShoppingBag, User, Phone, Mail, MapPin, AlertCircle, Plus, ChevronDown, Check } from 'lucide-react';
import axios from 'axios';

const OrderModal = ({ isOpen, onClose, product, userId }) => {
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
  
  // Address selection states
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddressData, setNewAddressData] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    type: 'home'
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!isOpen) {
      resetAllState();
    } else {
      resetAllState();
      if (userId) {
        fetchSavedAddresses();
      }
    }
  }, [isOpen, product, userId]);

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
    setSelectedAddressId(null);
    setShowAddressDropdown(false);
    setShowAddAddressForm(false);
    setNewAddressData({
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      type: 'home'
    });
  };

  // Fetch saved addresses
  const fetchSavedAddresses = async () => {
    if (!userId) return;
    
    try {
      setLoadingAddresses(true);
      const token = localStorage.getItem('tantika_token');
      
      const response = await fetch(`${API_BASE_URL}/api/usernorms/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSavedAddresses(data.data || []);
          
          // Auto-select default address if available
          const defaultAddress = data.data.find(addr => addr.isDefault);
          if (defaultAddress) {
            selectAddress(defaultAddress);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Select an address and populate form
  const selectAddress = (address) => {
    setSelectedAddressId(address._id);
    
    // Populate form with selected address
    setFormData(prev => ({
      ...prev,
      name: address.name,
      phone: address.phone,
      address: `${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}`,
      city: address.city,
      state: address.state,
      pincode: address.pincode
    }));
    
    setShowAddressDropdown(false);
  };

  // Add new address
  const handleAddAddress = async () => {
    try {
      const token = localStorage.getItem('tantika_token');
      const response = await fetch(`${API_BASE_URL}/api/usernorms/addresses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAddressData)
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh addresses list
        await fetchSavedAddresses();
        
        // Select the newly added address
        if (data.data) {
          selectAddress(data.data);
        }
        
        // Close add address form
        setShowAddAddressForm(false);
        
        // Reset new address form
        setNewAddressData({
          name: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
          type: 'home'
        });
      } else {
        setErrorMessage(data.message || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      setErrorMessage('Failed to add address. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
        shippingAddress: selectedAddressId, // Send selected address ID
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
          timeout: 10000
        }
      );
      
      console.log('Order response:', response.data);
      
      if (response.data.success) {
        setSubmitSuccess(true);
        setOrderDetails(response.data.data);
        
        // Reset form
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
        setSelectedAddressId(null);
        
        // Close modal after 5 seconds
        const closeTimer = setTimeout(() => {
          handleCloseModal();
        }, 5000);
        
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

  const handleNewAddressChange = (e) => {
    setNewAddressData({
      ...newAddressData,
      [e.target.name]: e.target.value
    });
  };

  const handleCloseModal = () => {
    resetAllState();
    onClose();
  };

  if (!isOpen) return null;

  // Address dropdown component
  const renderAddressDropdown = () => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowAddressDropdown(!showAddressDropdown)}
        className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
      >
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-gray-500" />
          <span className="text-sm">
            {selectedAddressId 
              ? `Selected Address (${savedAddresses.find(a => a._id === selectedAddressId)?.name})`
              : 'Select a saved address'
            }
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${showAddressDropdown ? 'rotate-180' : ''}`} />
      </button>
      
      {showAddressDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2">
            {loadingAddresses ? (
              <div className="py-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : savedAddresses.length === 0 ? (
              <div className="py-3 px-4 text-center text-gray-500">
                <p className="mb-2">No saved addresses</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressDropdown(false);
                    setShowAddAddressForm(true);
                  }}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Plus className="w-3 h-3" />
                  Add new address
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {savedAddresses.map((address) => (
                  <button
                    key={address._id}
                    type="button"
                    onClick={() => selectAddress(address)}
                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-between ${
                      selectedAddressId === address._id ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium">{address.name}</span>
                        {address.isDefault && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {address.addressLine1}, {address.city} - {address.pincode}
                      </p>
                    </div>
                    {selectedAddressId === address._id && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))}
                <div className="pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressDropdown(false);
                      setShowAddAddressForm(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Address
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Add address form component
  const renderAddAddressForm = () => (
    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold">Add New Address</h4>
        <button
          type="button"
          onClick={() => setShowAddAddressForm(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={newAddressData.name}
            onChange={handleNewAddressChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Enter full name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={newAddressData.phone}
            onChange={handleNewAddressChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="10-digit mobile number"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 1 *
          </label>
          <input
            type="text"
            name="addressLine1"
            value={newAddressData.addressLine1}
            onChange={handleNewAddressChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="House no., Building, Street, Area"
            required
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            name="addressLine2"
            value={newAddressData.addressLine2}
            onChange={handleNewAddressChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Landmark, Nearby location"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={newAddressData.city}
            onChange={handleNewAddressChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Enter city"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <input
            type="text"
            name="state"
            value={newAddressData.state}
            onChange={handleNewAddressChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="Enter state"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pincode *
          </label>
          <input
            type="text"
            name="pincode"
            value={newAddressData.pincode}
            onChange={handleNewAddressChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="6-digit pincode"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Type
          </label>
          <select
            name="type"
            value={newAddressData.type}
            onChange={handleNewAddressChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={handleAddAddress}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          Save Address
        </button>
        <button
          type="button"
          onClick={() => setShowAddAddressForm(false)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );

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

                {/* Address Selection */}
                {userId && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Select Saved Address (Optional)
                      </label>
                      <span className="text-xs text-gray-500">
                        {savedAddresses.length} saved
                      </span>
                    </div>
                    {renderAddressDropdown()}
                    {showAddAddressForm && renderAddAddressForm()}
                  </div>
                )}

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