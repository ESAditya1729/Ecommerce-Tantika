import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { 
  fetchArtisans, 
  fetchArtisanStats, 
  approveArtisan, 
  rejectArtisan,
  suspendArtisan,
  reactivateArtisan,
  verifyBankDetails,
  updateArtisan,
  bulkAction,
  getStatusColor,
  getStatusText
} from '../../services/artisanService';

import ArtisanStatsCards from './Artisan-Management/ArtisanStatsCards';
import ArtisanFilters from './Artisan-Management/ArtisanFilters';
import BulkActions from './Artisan-Management/BulkActions';
import ArtisanTable from './Artisan-Management/ArtisanTable';
import ArtisanDetailModal from '../Modals/ArtisanDetailModal';
import ActionModal from '../Modals/ArtisanActionModal';
import EditModal from '../Modals/ArtisanEditModal';

const ArtisansManagement = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
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
  
  // Modal states
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState({
    open: false,
    type: null,
    artisan: null
  });
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Add refresh state for manual refreshes
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadArtisans();
    loadStats();
  }, [statusFilter, searchTerm, pagination.page, refreshTrigger]);

  const loadArtisans = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm })
      };

      const response = await fetchArtisans(statusFilter, params);

      if (response.success) {
        const data = response.data;
        setArtisans(data.artisans || []);
        setPagination(data.pagination || pagination);
      } else {
        console.error('Failed to load artisans:', response.message);
      }
    } catch (error) {
      console.error('Error loading artisans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetchArtisanStats();

      if (response.success) {
        const data = response.data;
        
        // Create status map from backend response
        const statusMap = {
          pending: 0,
          approved: 0,
          rejected: 0,
          suspended: 0
        };
        
        // Handle different response formats
        if (data.statusCounts) {
          data.statusCounts.forEach(item => {
            statusMap[item._id] = item.count;
          });
        } else if (data.counts) {
          // Alternative format
          statusMap.pending = data.counts.pending || 0;
          statusMap.approved = data.counts.approved || 0;
          statusMap.rejected = data.counts.rejected || 0;
          statusMap.suspended = data.counts.suspended || 0;
        }

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
      console.error('Error loading stats:', error);
    }
  };

  const handleActionClick = (type, artisan) => {
    setActionModal({
      open: true,
      type,
      artisan
    });
  };

  const handleActionConfirm = async ({ reason, notes }) => {
    const { type, artisan } = actionModal;
    
    try {
      let response;
      
      switch (type) {
        case 'approve':
          response = await approveArtisan(artisan._id, { 
            adminNotes: notes || 'Approved by admin via dashboard' 
          });
          break;
        case 'reject':
          if (!reason) {
            alert('Please provide a rejection reason');
            return;
          }
          response = await rejectArtisan(artisan._id, { 
            rejectionReason: reason 
          });
          break;
        case 'suspend':
          if (!reason) {
            alert('Please provide a suspension reason');
            return;
          }
          response = await suspendArtisan(artisan._id, { 
            suspensionReason: reason 
          });
          break;
        case 'verifyBank':
          response = await verifyBankDetails(artisan._id, { 
            verificationNotes: notes 
          });
          break;
        default:
          return;
      }

      if (response.success) {
        // Close modal first
        setActionModal({ open: false, type: null, artisan: null });
        
        // Refresh data
        await Promise.all([loadArtisans(), loadStats()]);
        
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} successful!`);
      } else {
        alert(response.message || `Failed to ${type} artisan`);
      }
    } catch (error) {
      console.error(`Error ${type}ing artisan:`, error);
      const errorMessage = error.message || `Failed to ${type} artisan. Please try again.`;
      alert(errorMessage);
    }
  };

  const handleReactivate = async (artisanId) => {
    try {
      const response = await reactivateArtisan(artisanId);

      if (response.success) {
        await Promise.all([loadArtisans(), loadStats()]);
        alert('Artisan reactivated successfully!');
      } else {
        alert(response.message || 'Failed to reactivate artisan');
      }
    } catch (error) {
      console.error('Error reactivating artisan:', error);
      alert('Failed to reactivate artisan.');
    }
  };

  const handleSaveEdit = async (formData) => {
    try {
      const response = await updateArtisan(selectedArtisan._id, formData);

      if (response.success) {
        // Close modal and refresh
        setEditModalOpen(false);
        setSelectedArtisan(null);
        await loadArtisans();
        alert('Artisan updated successfully!');
      } else {
        alert(response.message || 'Failed to update artisan');
      }
    } catch (error) {
      console.error('Error updating artisan:', error);
      alert('Failed to update artisan.');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedArtisans.length === 0) {
      alert('Please select at least one artisan');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${selectedArtisans.length} artisan(s)?`
    );

    if (!confirmed) return;

    try {
      const response = await bulkAction(action, selectedArtisans);

      if (response.success) {
        await Promise.all([loadArtisans(), loadStats()]);
        setSelectedArtisans([]);
        alert(`Bulk ${action} successful!`);
      } else {
        alert(response.message || `Failed to ${action} artisans`);
      }
    } catch (error) {
      console.error(`Error bulk ${action}ing:`, error);
      const errorMessage = error.message || `Failed to ${action} artisans. Please try again.`;
      alert(errorMessage);
    }
  };

  const handleExport = () => {
    // Implement export functionality
    alert('Export functionality to be implemented');
  };

  const handleRefresh = () => {
    // Reset pagination to first page and trigger refresh
    setPagination(prev => ({ ...prev, page: 1 }));
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Filter artisans by search term
  const filteredArtisans = artisans.filter(artisan => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (artisan.businessName?.toLowerCase().includes(searchLower)) ||
      (artisan.ownerName?.toLowerCase().includes(searchLower)) ||
      (artisan.email?.toLowerCase().includes(searchLower)) ||
      (artisan.phone?.toLowerCase().includes(searchLower)) ||
      (artisan.category?.toLowerCase().includes(searchLower))
    );
  });

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
            onClick={handleRefresh}
            disabled={loading}
            className={`px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <ArtisanStatsCards 
        stats={stats} 
        loading={loading}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedArtisans.length}
        onBulkApprove={() => handleBulkAction('approve')}
        onBulkReject={() => handleBulkAction('reject')}
        onBulkSuspend={() => handleBulkAction('suspend')}
        onBulkReactivate={() => handleBulkAction('reactivate')}
        onClearSelection={() => setSelectedArtisans([])}
      />

      {/* Top Performing Artisans */}
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
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(artisan.status)}`}>
                        {getStatusText(artisan.status)}
                      </span>
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
                    <span className="font-medium">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        minimumFractionDigits: 0
                      }).format(artisan.totalRevenue || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <ArtisanFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={(value) => {
          setStatusFilter(value);
          setPagination(prev => ({ ...prev, page: 1 }));
          setSelectedArtisans([]);
        }}
        onExport={handleExport}
        onRefresh={handleRefresh}
      />

      {/* Artisans Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <ArtisanTable
          artisans={filteredArtisans}
          loading={loading}
          statusFilter={statusFilter}
          selectedArtisans={selectedArtisans}
          setSelectedArtisans={setSelectedArtisans}
          onViewDetails={(artisan) => {
            setSelectedArtisan(artisan);
            setDetailModalOpen(true);
          }}
          onApprove={(artisan) => handleActionClick('approve', artisan)}
          onReject={(artisan) => handleActionClick('reject', artisan)}
          onSuspend={(artisan) => handleActionClick('suspend', artisan)}
          onVerifyBank={(artisan) => handleActionClick('verifyBank', artisan)}
          onReactivate={handleReactivate}
          onEdit={(artisan) => {
            setSelectedArtisan(artisan);
            setEditModalOpen(true);
          }}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Modals */}
      <ArtisanDetailModal
        artisan={selectedArtisan}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedArtisan(null);
        }}
      />

      <ActionModal
        type={actionModal.type}
        artisan={actionModal.artisan}
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, type: null, artisan: null })}
        onConfirm={handleActionConfirm}
      />

      <EditModal
        artisan={selectedArtisan}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedArtisan(null);
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default ArtisansManagement;