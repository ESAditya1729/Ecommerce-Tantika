import { useState, useEffect } from 'react';
import { X, Plus, MapPin, Edit2, Trash2, Check, Home, Building, Briefcase } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const AddressBookModal = ({ isOpen, onClose, userId }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    type: 'home', // home, work, other
    isDefault: false
  });

  const addressTypes = [
    { value: 'home', label: 'Home', icon: Home, color: 'text-blue-600' },
    { value: 'work', label: 'Work', icon: Building, color: 'text-green-600' },
    { value: 'other', label: 'Other', icon: Briefcase, color: 'text-purple-600' }
  ];

  const fetchAddresses = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('tantika_token');
      const response = await fetch(`${API_BASE_URL}/usernorms/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
      if (data.success) {
        setAddresses(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to load addresses');
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchAddresses();
    }
  }, [isOpen, userId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
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
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (address) => {
    setFormData({
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country || 'India',
      type: address.type || 'home',
      isDefault: address.isDefault || false
    });
    setEditingId(address._id);
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('tantika_token');
      const response = await fetch(`${API_BASE_URL}/usernorms/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setAddresses(prev => prev.filter(addr => addr._id !== addressId));
        setSuccess('Address deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to delete address');
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('tantika_token');
      const response = await fetch(`${API_BASE_URL}/usernorms/addresses/${addressId}/set-default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Update all addresses to reflect new default
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          isDefault: addr._id === addressId
        })));
        setSuccess('Default address updated');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to set default address');
      }
    } catch (err) {
      console.error('Error setting default address:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.phone.trim() || !formData.addressLine1.trim() || 
        !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.replace(/\D/g, ''))) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('tantika_token');
      const url = editingId 
        ? `${API_BASE_URL}/usernorms/addresses/${editingId}`
        : `${API_BASE_URL}/usernorms/addresses`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(editingId ? 'Address updated successfully!' : 'Address added successfully!');
        
        // Refresh addresses list
        await fetchAddresses();
        
        // Reset form after successful save
        setTimeout(() => {
          resetForm();
          setSuccess('');
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to save address');
      }
    } catch (err) {
      console.error('Error saving address:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Address Book</h3>
                  <p className="text-sm text-gray-600">Manage your delivery addresses</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {/* Status Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Address List */}
            {!showForm ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Saved Addresses {addresses.length > 0 && `(${addresses.length})`}
                  </h4>
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Address
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                      <MapPin className="w-8 h-8 text-amber-600" />
                    </div>
                    <h5 className="text-lg font-semibold text-gray-900 mb-2">No addresses saved</h5>
                    <p className="text-gray-600 mb-6">Add your first address to get started</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {addresses.map((address) => {
                      const TypeIcon = addressTypes.find(t => t.value === address.type)?.icon || Home;
                      const typeColor = addressTypes.find(t => t.value === address.type)?.color || 'text-blue-600';
                      
                      return (
                        <div
                          key={address._id}
                          className={`border rounded-xl p-4 hover:shadow-md transition-shadow ${
                            address.isDefault ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg ${typeColor.replace('text', 'bg')} bg-opacity-20`}>
                                <TypeIcon className={`w-4 h-4 ${typeColor}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">{address.name}</span>
                                  {address.isDefault && (
                                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{address.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {!address.isDefault && (
                                <button
                                  onClick={() => handleSetDefault(address._id)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="Set as default"
                                >
                                  <Check className="w-4 h-4 text-gray-500" />
                                </button>
                              )}
                              <button
                                onClick={() => handleEdit(address)}
                                className="p-1 hover:bg-blue-50 rounded"
                                title="Edit address"
                              >
                                <Edit2 className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => handleDelete(address._id)}
                                className="p-1 hover:bg-red-50 rounded"
                                title="Delete address"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-700 space-y-1">
                            <p>{address.addressLine1}</p>
                            {address.addressLine2 && <p>{address.addressLine2}</p>}
                            <p>{address.city}, {address.state} - {address.pincode}</p>
                            <p>{address.country}</p>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              {addressTypes.find(t => t.value === address.type)?.label || 'Home'} Address
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {addresses.length > 0 && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Address
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Address Form */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {editingId ? 'Edit Address' : 'Add New Address'}
                  </h4>
                  <button
                    onClick={resetForm}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>

                    {/* Address Line 1 */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="House no., Building, Street, Area"
                        required
                      />
                    </div>

                    {/* Address Line 2 */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Landmark, Nearby location"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Enter city"
                        required
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Enter state"
                        required
                      />
                    </div>

                    {/* Pincode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        placeholder="6-digit pincode"
                        required
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        disabled
                      />
                    </div>
                  </div>

                  {/* Address Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Address Type
                    </label>
                    <div className="flex gap-3">
                      {addressTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            type="button"
                            key={type.value}
                            onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-lg transition-all ${
                              formData.type === type.value
                                ? 'border-amber-300 bg-amber-50 text-amber-700'
                                : 'border-gray-300 hover:border-amber-200 hover:bg-amber-50'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${type.color}`} />
                            <span>{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Default Address Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                      Set as default shipping address
                    </label>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {editingId ? 'Updating...' : 'Saving...'}
                        </span>
                      ) : editingId ? 'Update Address' : 'Save Address'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{addresses.length} saved {addresses.length === 1 ? 'address' : 'addresses'}</span>
              </div>
              <div>
                * Required fields
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};