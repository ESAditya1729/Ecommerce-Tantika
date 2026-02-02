import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  return localStorage.getItem('tantika_token');
};

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Artisan Data Fetching
export const fetchArtisans = async (status, params = {}) => {
  try {
    let endpoint = '';
    let queryParams = { ...params };
    
    // Remove status from params if it exists
    if (queryParams.status) {
      delete queryParams.status;
    }
    
    switch (status) {
      case 'pending':
        endpoint = `${API_URL}/admin/artisans/pending`;
        break;
      case 'approved':
        endpoint = `${API_URL}/admin/artisans/approved`;
        break;
      case 'rejected':
        endpoint = `${API_URL}/admin/artisans`;
        // Add status to query params
        queryParams.status = 'rejected';
        break;
      case 'suspended':
        endpoint = `${API_URL}/admin/artisans`;
        queryParams.status = 'suspended';
        break;
      case 'all':
      default:
        endpoint = `${API_URL}/admin/artisans`;
        queryParams.status = 'all';
        break;
    }

    const response = await axios.get(endpoint, {
      params: queryParams,
      headers: getHeaders()
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching artisans:', error);
    throw error;
  }
};

export const fetchArtisanStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/artisans/stats`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

export const fetchArtisanById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/admin/artisans/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching artisan details:', error);
    throw error;
  }
};

// Artisan Actions
export const approveArtisan = async (artisanId, data = {}) => {
  try {
    // Default adminNotes if not provided
    const payload = {
      adminNotes: data.adminNotes || 'Approved by admin via dashboard',
      ...data
    };
    
    const response = await axios.put(
      `${API_URL}/admin/artisans/${artisanId}/approve`,
      payload,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error approving artisan:', error);
    throw error;
  }
};

export const rejectArtisan = async (artisanId, data = {}) => {
  try {
    // Ensure rejectionReason is provided
    if (!data.rejectionReason) {
      throw new Error('Rejection reason is required');
    }
    
    const response = await axios.put(
      `${API_URL}/admin/artisans/${artisanId}/reject`,
      data,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error rejecting artisan:', error);
    throw error;
  }
};

export const suspendArtisan = async (artisanId, data = {}) => {
  try {
    // Ensure suspensionReason is provided
    if (!data.suspensionReason) {
      throw new Error('Suspension reason is required');
    }
    
    const response = await axios.put(
      `${API_URL}/admin/artisans/${artisanId}/suspend`,
      data,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error suspending artisan:', error);
    throw error;
  }
};

export const reactivateArtisan = async (artisanId) => {
  try {
    const response = await axios.put(
      `${API_URL}/admin/artisans/${artisanId}/reactivate`,
      {},
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error reactivating artisan:', error);
    throw error;
  }
};

export const verifyBankDetails = async (artisanId, data = {}) => {
  try {
    const response = await axios.put(
      `${API_URL}/admin/artisans/${artisanId}/verify-bank`,
      data,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error verifying bank details:', error);
    throw error;
  }
};

export const updateArtisan = async (artisanId, data) => {
  try {
    const response = await axios.put(
      `${API_URL}/admin/artisans/${artisanId}`,
      data,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating artisan:', error);
    throw error;
  }
};

export const bulkAction = async (action, artisanIds) => {
  try {
    // Check if it's a bulk action that should use POST
    if (['approve', 'reject', 'suspend', 'reactivate'].includes(action)) {
      const response = await axios.post(
        `${API_URL}/admin/artisans/bulk-${action}`,
        { artisanIds },
        { headers: getHeaders() }
      );
      return response.data;
    } else {
      throw new Error(`Bulk action "${action}" is not supported`);
    }
  } catch (error) {
    console.error(`Error performing bulk ${action}:`, error);
    
    // If bulk endpoint doesn't exist, fall back to individual actions
    if (error.response?.status === 404) {
      console.warn(`Bulk ${action} endpoint not found, falling back to individual actions`);
      const results = [];
      for (const artisanId of artisanIds) {
        try {
          let endpoint = '';
          switch (action) {
            case 'approve':
              endpoint = `${API_URL}/admin/artisans/${artisanId}/approve`;
              break;
            case 'reject':
              endpoint = `${API_URL}/admin/artisans/${artisanId}/reject`;
              break;
            case 'suspend':
              endpoint = `${API_URL}/admin/artisans/${artisanId}/suspend`;
              break;
            case 'reactivate':
              endpoint = `${API_URL}/admin/artisans/${artisanId}/reactivate`;
              break;
          }
          
          if (endpoint) {
            const response = await axios.put(
              endpoint,
              {},
              { headers: getHeaders() }
            );
            results.push({ id: artisanId, success: true, data: response.data });
          }
        } catch (individualError) {
          results.push({ id: artisanId, success: false, error: individualError.message });
        }
      }
      
      return {
        success: results.every(r => r.success),
        message: 'Processed individually',
        results
      };
    }
    
    throw error;
  }
};

// Helper functions
export const formatAddress = (addressObj) => {
  if (!addressObj) return 'N/A';
  
  if (typeof addressObj === 'string') return addressObj;
  
  if (typeof addressObj === 'object') {
    const parts = [];
    if (addressObj.street) parts.push(addressObj.street);
    if (addressObj.city) parts.push(addressObj.city);
    if (addressObj.state) parts.push(addressObj.state);
    if (addressObj.postalCode) parts.push(addressObj.postalCode);
    if (addressObj.country) parts.push(addressObj.country);
    
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  }
  
  return 'N/A';
};

export const getArtisanEmail = (artisan) => {
  if (artisan.email) return artisan.email;
  if (artisan.user?.email) return artisan.user.email;
  return 'N/A';
};

export const getArtisanPhone = (artisan) => {
  return artisan.phone || artisan.phoneNumber || artisan.mobile || artisan.contactNumber || artisan.user?.phone || 'N/A';
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// Status utility functions
export const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'suspended':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'pending':
      return 'Pending Review';
    case 'rejected':
      return 'Rejected';
    case 'suspended':
      return 'Suspended';
    default:
      return status || 'Unknown';
  }
};

// Validation helper
export const validateArtisanData = (artisan) => {
  const errors = [];
  
  if (!artisan.businessName) errors.push('Business name is required');
  if (!artisan.category) errors.push('Category is required');
  if (!artisan.serviceArea) errors.push('Service area is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};