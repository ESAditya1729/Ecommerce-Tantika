// src/components/Modals/OrderModal.jsx
import { useState, useEffect } from 'react';
import { X, ShoppingBag, User, Phone, Mail, MapPin, AlertCircle, Plus, ChevronDown, Check, Home, Building, Briefcase } from 'lucide-react';

const OrderModal = ({ isOpen, onClose, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userToken, setUserToken] = useState('');
  
  const [artisanId, setArtisanId] = useState(null);
  const [artisanName, setArtisanName] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (isOpen && product) {
      const userStr = localStorage.getItem('tantika_user');
      const token = localStorage.getItem('tantika_token');
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserId(user.id || user._id);
          setUserEmail(user.email || '');
          setUserToken(token || '');
          
          if (user.email) {
            setFormData(prev => ({ ...prev, email: user.email }));
          }
          
          if (user.name) {
            setFormData(prev => ({ ...prev, name: user.name }));
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      
      let extractedArtisanId = null;
      let extractedArtisanName = '';
      
      if (product.artisanId) {
        extractedArtisanId = product.artisanId;
        extractedArtisanName = product.artisanName || 'Artisan';
      } 
      else if (product.artisan && typeof product.artisan === 'object' && product.artisan !== null) {
        extractedArtisanId = product.artisan._id;
        extractedArtisanName = product.artisanName || product.artisan.name || product.artisan.businessName || 'Artisan';
      } 
      else if (product.artisan && typeof product.artisan === 'string') {
        extractedArtisanId = product.artisan;
        extractedArtisanName = product.artisanName || 'Artisan';
      }
      else if (product.artisan_id) {
        extractedArtisanId = product.artisan_id;
        extractedArtisanName = product.artisan_name || 'Artisan';
      } 
      else if (product.createdBy) {
        if (typeof product.createdBy === 'object' && product.createdBy._id) {
          extractedArtisanId = product.createdBy._id;
        } else {
          extractedArtisanId = product.createdBy;
        }
        extractedArtisanName = 'Artisan';
      }
      
      setArtisanId(extractedArtisanId);
      
      if (product.artisanName && typeof product.artisanName === 'string') {
        setArtisanName(product.artisanName);
      } else if (extractedArtisanName && typeof extractedArtisanName === 'string') {
        setArtisanName(extractedArtisanName);
      } else if (product.artisan && typeof product.artisan === 'object' && product.artisan.businessName) {
        setArtisanName(product.artisan.businessName);
      } else if (product.artisan && typeof product.artisan === 'object' && product.artisan.name) {
        setArtisanName(product.artisan.name);
      } else {
        setArtisanName('Artisan');
      }
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (isOpen && userId && userToken) {
      fetchSavedAddresses();
    }
  }, [isOpen, userId, userToken]);

  const fetchSavedAddresses = async () => {
    if (!userId || !userToken) return;
    
    try {
      setLoadingAddresses(true);
      
      const response = await fetch(`${API_URL}/usernorms/addresses`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          const addresses = data.data || [];
          setSavedAddresses(addresses);
          
          if (addresses.length > 0) {
            const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
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

  const selectAddress = (address) => {
    if (!address) return;
    
    setSelectedAddressId(address._id);
    
    const fullAddress = address.addressLine2 
      ? `${address.addressLine1}, ${address.addressLine2}`
      : address.addressLine1;
    
    setFormData(prevFormData => ({
      ...prevFormData,
      name: address.name || '',
      phone: address.phone || '',
      address: fullAddress,
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      country: address.country || 'India'
    }));
    
    setFormData(prevFormData => {
      if (userEmail && !prevFormData.email) {
        return { ...prevFormData, email: userEmail };
      }
      return prevFormData;
    });
    
    setShowAddressDropdown(false);
  };

  const handleAddNewAddress = async (newAddressData) => {
    try {
      const response = await fetch(`${API_URL}/usernorms/addresses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAddressData)
      });

      const data = await response.json();
      if (data.success) {
        await fetchSavedAddresses();
        if (data.data) selectAddress(data.data);
        setShowAddAddressForm(false);
      }
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const resetFormState = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      message: ''
    });
    setIsSubmitting(false);
    setSubmitSuccess(false);
    setOrderDetails(null);
    setErrorMessage('');
    setSelectedAddressId(null);
    setShowAddressDropdown(false);
    setShowAddAddressForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || 
        !formData.address.trim() || !formData.city.trim() || !formData.state.trim() || 
        !formData.pincode.trim()) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.replace(/\D/g, ''))) {
      setErrorMessage('Please enter a valid 6-digit pincode');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('tantika_token');
      
      if (!token) {
        setErrorMessage('Please log in to place an order');
        setIsSubmitting(false);
        return;
      }

      const orderData = {
        productId: product._id || product.id,
        quantity: 1,
        customerDetails: {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          street: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.pincode.trim(),
          country: formData.country || 'India',
          landmark: formData.addressLine2?.trim() || ''
        },
        paymentMethod: 'cod',
        notes: formData.message.trim() || ''
      };
      
      const response = await fetch(`${API_URL}/orders/express-interest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSubmitSuccess(true);
        setOrderDetails({
          orderNumber: data.data?.orderNumber || 'N/A',
          customerName: formData.name,
          totalAmount: product?.price || 0,
          status: data.data?.status || 'pending'
        });
        
        setTimeout(() => {
          handleCloseModal();
        }, 5000);
      } else {
        const errorMsg = data.error || data.message || data.msg || 'Failed to place order';
        throw new Error(errorMsg);
      }
      
    } catch (error) {
      setErrorMessage(error.message || 'Failed to submit interest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'addressLine2') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (name === 'address') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCloseModal = () => {
    resetFormState();
    onClose();
  };

  const renderAddressSection = () => {
    if (!userId) {
      return (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-700">
              Please log in to see your saved addresses.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Delivery Address
        </label>
        
        <div className="relative mb-4">
          <button
            type="button"
            onClick={() => setShowAddressDropdown(!showAddressDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm">
                {loadingAddresses 
                  ? 'Loading addresses...' 
                  : selectedAddressId 
                    ? `Selected: ${savedAddresses.find(a => a && a._id === selectedAddressId)?.name || 'Address'}`
                    : 'Choose a saved address'
                }
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showAddressDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showAddressDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              <div className="p-2">
                {loadingAddresses ? (
                  <div className="py-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : !savedAddresses || savedAddresses.length === 0 ? (
                  <div className="py-3 px-4 text-center text-gray-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="mb-2">No saved addresses found</p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressDropdown(false);
                        setShowAddAddressForm(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Add your first address
                    </button>
                  </div>
                ) : (
                  savedAddresses.map((address) => {
                    if (!address) return null;
                    
                    const addressId = address._id;
                    const addressName = address.name || '';
                    const addressPhone = address.phone || '';
                    const fullAddress = address.addressLine2 
                      ? `${address.addressLine1}, ${address.addressLine2}`
                      : address.addressLine1;
                    const addressCity = address.city || '';
                    const addressState = address.state || '';
                    const addressPincode = address.pincode || '';
                    const addressType = address.type || 'home';
                    const isDefault = address.isDefault || false;
                    
                    const Icon = addressType === 'work' ? Building : addressType === 'other' ? Briefcase : Home;
                    const color = addressType === 'work' ? 'text-green-600' : addressType === 'other' ? 'text-purple-600' : 'text-blue-600';
                    
                    return (
                      <button
                        key={addressId}
                        type="button"
                        onClick={() => selectAddress(address)}
                        className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-start justify-between ${
                          selectedAddressId === addressId ? 'bg-blue-50 border border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`p-1.5 mt-0.5 mr-2 rounded ${color.replace('text', 'bg')} bg-opacity-20`}>
                            <Icon className={`w-3 h-3 ${color}`} />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-900">{addressName}</span>
                              {isDefault && (
                                <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">{addressPhone}</p>
                            <p className="text-sm text-gray-700 mt-1">{fullAddress}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {addressCity}, {addressState} - {addressPincode}
                            </p>
                          </div>
                        </div>
                        {selectedAddressId === addressId && (
                          <Check className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setShowAddressDropdown(false);
              setShowAddAddressForm(!showAddAddressForm);
            }}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            <Plus className="w-4 h-4" />
            {showAddAddressForm ? 'Cancel adding new address' : 'Add new address'}
          </button>
          
          {!loadingAddresses && savedAddresses.length > 0 && (
            <span className="text-xs text-gray-500">
              {savedAddresses.length} saved address(es)
            </span>
          )}
        </div>

        {showAddAddressForm && (
          <AddAddressForm 
            onAddAddress={handleAddNewAddress}
            onCancel={() => setShowAddAddressForm(false)}
            userToken={userToken}
            API_URL={API_URL}
          />
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  const getArtisanDisplayName = () => {
    if (artisanName && typeof artisanName === 'string') {
      return artisanName;
    }
    if (product?.artisan) {
      if (typeof product.artisan === 'object' && product.artisan !== null) {
        return product.artisan.businessName || product.artisan.name || 'Artisan';
      }
      return String(product.artisan);
    }
    return 'Artisan';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ShoppingBag className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Express Interest</h2>
                <p className="text-gray-600 text-sm">
                  {submitSuccess ? 'Thank you for your interest!' : `For: ${product?.name || 'Product'}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {submitSuccess && orderDetails && (
          <div className="p-6">
            <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="flex items-start gap-3 text-green-700 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Interest submitted successfully!</h3>
                  <p className="text-green-600">
                    We'll contact you within 24 hours to discuss your order.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-white/50 border border-green-100 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">Order Details:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium text-gray-900">{orderDetails?.orderNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium text-gray-900">{orderDetails?.customerName || formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium text-green-600">₹{orderDetails?.totalAmount || product?.price || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-gray-900">{orderDetails?.status || 'pending'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center text-gray-500 text-sm">
              <p>This modal will close automatically in 5 seconds...</p>
            </div>
          </div>
        )}

        {!submitSuccess && product && (
          <>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                  {product.images?.[0] || product.image ? (
                    <img
                      src={product.images?.[0] || product.image}
                      alt={product.name || 'Product'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/80';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name || 'Product'}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    By {getArtisanDisplayName()} • {product.location || product.origin || 'India'}
                  </p>
                  <div className="text-2xl font-bold text-blue-600">₹{product.price || 0}</div>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700 mb-2">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-600 text-sm">{errorMessage}</p>
                <button
                  onClick={() => setErrorMessage('')}
                  className="mt-3 text-sm text-red-700 hover:text-red-900 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Note:</span> This is not a traditional checkout. 
                    After submitting, our team will contact you within 24 hours to discuss delivery, 
                    customization, and payment options.
                  </p>
                </div>
              </div>

              {renderAddressSection()}

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                    placeholder="House no., Building, Street, Area"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                  placeholder="Nearby landmark, locality"
                />
              </div>

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
                    placeholder="Enter your state"
                  />
                </div>
              </div>

              <input type="hidden" name="country" value={formData.country || 'India'} />

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 resize-none"
                  placeholder="Any specific requirements, customization requests, or questions?"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>Submit Interest</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const AddAddressForm = ({ onAddAddress, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    type: 'home',
    isDefault: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddAddress(formData);
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-4">Add New Address</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
            Set as default shipping address
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Save Address
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderModal;