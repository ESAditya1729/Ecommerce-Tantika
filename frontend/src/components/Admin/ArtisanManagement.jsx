import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Check, 
  X, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck,
  UserX,
  AlertCircle,
  Download,
  RefreshCw,
  Users,
  Clock,
  Shield,
  Ban,
  DollarSign,
  TrendingUp,
  Star,
  Package,
  CreditCard
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ArtisansManagement = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // Default to pending
  const [selectedArtisans, setSelectedArtisans] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
    newApplications: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [topArtisans, setTopArtisans] = useState([]);

  // Helper functions
  const formatAddress = (addressObj) => {
    if (!addressObj) return 'N/A';
    
    // Check if it's already a string
    if (typeof addressObj === 'string') return addressObj;
    
    // If it's an object, format it
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

  const getArtisanEmail = (artisan) => {
    // Extract email from artisan or user object
    if (artisan.email) return artisan.email;
    if (artisan.user?.email) return artisan.user.email;
    return 'N/A';
  };

  const getArtisanPhone = (artisan) => {
    if (!artisan) return 'N/A';
    
    // Check multiple possible phone field names
    return artisan.phone || artisan.phoneNumber || artisan.mobile || artisan.contactNumber || artisan.user?.phone || 'N/A';
  };

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('tantika_token');
  };

  // API headers
  const getHeaders = () => {
    return {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    fetchArtisans();
    fetchStats();
  }, [statusFilter, searchTerm, pagination.page]);

  const fetchArtisans = async () => {
    try {
      setLoading(true);
      
      let endpoint = '';
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm })
      };

      if (statusFilter === 'pending') {
        endpoint = `${API_URL}/admin/artisans/pending`;
      } else if (statusFilter === 'approved') {
        endpoint = `${API_URL}/admin/artisans/approved`;
      }

      const response = await axios.get(endpoint, {
        params,
        headers: getHeaders()
      });

      if (response.data.success) {
        const data = response.data.data;
        setArtisans(data.artisans || []);
        setPagination(data.pagination || pagination);
      }
    } catch (error) {
      console.error('Error fetching artisans:', error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/artisans/stats`, {
        headers: getHeaders()
      });

      if (response.data.success) {
        const data = response.data.data;
        
        // Transform status counts
        const statusMap = {
          pending: 0,
          approved: 0,
          rejected: 0,
          suspended: 0
        };
        
        data.statusCounts?.forEach(item => {
          statusMap[item._id] = item.count;
        });

        setStats({
          total: data.total || 0,
          pending: statusMap.pending,
          approved: statusMap.approved,
          rejected: statusMap.rejected,
          suspended: statusMap.suspended,
          newApplications: data.newApplications || 0
        });

        setTopArtisans(data.topArtisans || []);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (artisanId) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/artisans/${artisanId}/approve`,
        { adminNotes: 'Approved by admin via dashboard' },
        { headers: getHeaders() }
      );

      if (response.data.success) {
        // Refresh data
        await fetchArtisans();
        await fetchStats();
      }
    } catch (error) {
      console.error('Error approving artisan:', error);
    }
  };

  const handleReject = async (artisanId) => {
    const rejectionReason = prompt('Please enter rejection reason:');
    if (!rejectionReason || rejectionReason.trim() === '') {
      alert('Rejection reason is required');
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/admin/artisans/${artisanId}/reject`,
        { rejectionReason },
        { headers: getHeaders() }
      );

      if (response.data.success) {
        await fetchArtisans();
        await fetchStats();
      }
    } catch (error) {
      console.error('Error rejecting artisan:', error);
    }
  };

  const handleSuspend = async (artisanId) => {
    const suspensionReason = prompt('Please enter suspension reason:');
    if (!suspensionReason || suspensionReason.trim() === '') {
      alert('Suspension reason is required');
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/admin/artisans/${artisanId}/suspend`,
        { suspensionReason },
        { headers: getHeaders() }
      );

      if (response.data.success) {
        await fetchArtisans();
        await fetchStats();
      }
    } catch (error) {
      console.error('Error suspending artisan:', error);
    }
  };

  const handleReactivate = async (artisanId) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/artisans/${artisanId}/reactivate`,
        {},
        { headers: getHeaders() }
      );

      if (response.data.success) {
        await fetchArtisans();
        await fetchStats();
      }
    } catch (error) {
      console.error('Error reactivating artisan:', error);
    }
  };

  const handleVerifyBank = async (artisanId) => {
    try {
      const response = await axios.put(
        `${API_URL}/admin/artisans/${artisanId}/verify-bank`,
        {},
        { headers: getHeaders() }
      );

      if (response.data.success) {
        alert('Bank details verified successfully');
        fetchArtisans(); // Refresh to show updated status
      }
    } catch (error) {
      console.error('Error verifying bank details:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: <Clock className="w-4 h-4" />, 
        text: 'Pending' 
      },
      approved: { 
        color: 'bg-green-100 text-green-800', 
        icon: <UserCheck className="w-4 h-4" />, 
        text: 'Approved' 
      },
      rejected: { 
        color: 'bg-red-100 text-red-800', 
        icon: <UserX className="w-4 h-4" />, 
        text: 'Rejected' 
      },
      suspended: { 
        color: 'bg-gray-100 text-gray-800', 
        icon: <Ban className="w-4 h-4" />, 
        text: 'Suspended' 
      }
    };
    
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.icon}
        <span className="ml-1">{badge.text}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Artisans Management</h2>
          <p className="text-gray-600">Manage and review artisan applications and accounts</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchArtisans}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Artisans</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
              {stats.newApplications > 0 && (
                <p className="text-xs text-green-600">+{stats.newApplications} new</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg mr-4">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-bold">{stats.rejected}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-lg mr-4">
              <Ban className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Suspended</p>
              <p className="text-2xl font-bold">{stats.suspended}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">New (7 days)</p>
              <p className="text-2xl font-bold">{stats.newApplications}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Artisans (for approved artisans view) */}
      {statusFilter === 'approved' && topArtisans.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Artisans</h3>
            <span className="text-sm text-gray-500">By Total Sales</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topArtisans.map((artisan, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold mr-3">
                    {artisan.businessName?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 truncate">{artisan.businessName}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="w-3 h-3 mr-1 text-yellow-500" />
                      {artisan.rating?.toFixed(1) || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sales:</span>
                    <span className="font-medium">{artisan.totalSales || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Revenue:</span>
                    <span className="font-medium">{formatCurrency(artisan.totalRevenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by business name, full name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination({...pagination, page: 1}); // Reset to page 1
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pending Applications</option>
              <option value="approved">Approved Artisans</option>
            </select>
            
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Artisans Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading {statusFilter} artisans...</p>
          </div>
        ) : artisans.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No artisans found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedArtisans(artisans.map(a => a._id));
                        } else {
                          setSelectedArtisans([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artisan Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Details
                  </th>
                  {statusFilter === 'approved' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {artisans.map((artisan) => (
                  <tr key={artisan._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedArtisans.includes(artisan._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedArtisans([...selectedArtisans, artisan._id]);
                          } else {
                            setSelectedArtisans(selectedArtisans.filter(id => id !== artisan._id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                            {artisan.businessName?.charAt(0) || artisan.fullName?.charAt(0) || 'A'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {artisan.businessName || 'No Business Name'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {artisan.fullName || 'N/A'}
                          </div>
                          {artisan.specialization && (
                            <div className="text-xs text-blue-600 mt-1">
                              {artisan.specialization}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{getArtisanEmail(artisan)}</div>
                      <div className="text-sm text-gray-500">{getArtisanPhone(artisan)}</div>
                      {artisan.address && (
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                          {formatAddress(artisan.address)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        Applied: {formatDate(artisan.submittedAt || artisan.createdAt)}
                      </div>
                      {artisan.yearsOfExperience && (
                        <div className="text-sm text-gray-500">
                          Experience: {artisan.yearsOfExperience} years
                        </div>
                      )}
                      {artisan.idProof && (
                        <div className="text-xs mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded ${artisan.idProof.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {artisan.idProof.verified ? '✓ Verified' : 'Unverified'}
                          </span>
                        </div>
                      )}
                    </td>
                    {statusFilter === 'approved' && (
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Package className="w-3 h-3 mr-2 text-gray-500" />
                            Products: {artisan.totalProducts || 0}
                          </div>
                          <div className="flex items-center text-sm">
                            <TrendingUp className="w-3 h-3 mr-2 text-gray-500" />
                            Sales: {artisan.totalSales || 0}
                          </div>
                          <div className="flex items-center text-sm">
                            <DollarSign className="w-3 h-3 mr-2 text-gray-500" />
                            Revenue: {formatCurrency(artisan.totalRevenue)}
                          </div>
                          {artisan.rating && (
                            <div className="flex items-center text-sm">
                              <Star className="w-3 h-3 mr-2 text-yellow-500" />
                              Rating: {artisan.rating.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(artisan.status)}
                      {artisan.approvedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          Approved: {formatDate(artisan.approvedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            // View details - you can implement a modal or redirect
                            console.log('View artisan:', artisan._id);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {artisan.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(artisan._id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(artisan._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {artisan.status === 'approved' && (
                          <>
                            <button
                              onClick={() => handleSuspend(artisan._id)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                              title="Suspend"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                            {artisan.bankDetails && !artisan.bankDetails.verified && (
                              <button
                                onClick={() => handleVerifyBank(artisan._id)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                                title="Verify Bank"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                        
                        {artisan.status === 'suspended' && (
                          <button
                            onClick={() => handleReactivate(artisan._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Reactivate"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {artisans.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> artisans
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination({...pagination, page: pageNum})}
                      className={`px-3 py-1 rounded-lg ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {pagination.pages > 5 && pagination.page < pagination.pages - 2 && (
                  <span className="px-2">...</span>
                )}
                {pagination.pages > 5 && pagination.page < pagination.pages - 1 && (
                  <button
                    onClick={() => setPagination({...pagination, page: pagination.pages})}
                    className={`px-3 py-1 rounded-lg ${
                      pagination.page === pagination.pages
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pagination.pages}
                  </button>
                )}
                <button
                  onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisansManagement;