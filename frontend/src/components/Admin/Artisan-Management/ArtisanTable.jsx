import React from 'react';
import { 
  Eye, Check, X, Shield, CreditCard, UserCheck, Edit, 
  Package, TrendingUp, DollarSign, Star, Clock, UserX, Ban,
  AlertCircle
} from 'lucide-react';
import { 
  formatDate, 
  formatCurrency, 
  formatAddress, 
  getArtisanEmail, 
  getArtisanPhone 
} from '../../../services/artisanService';

const ArtisanTable = ({ 
  artisans, 
  loading, 
  statusFilter, 
  selectedArtisans, 
  setSelectedArtisans,
  onViewDetails,
  onApprove,
  onReject,
  onSuspend,
  onVerifyBank,
  onReactivate,
  onEdit,
  pagination,
  onPageChange
}) => {
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

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading {statusFilter} artisans...</p>
      </div>
    );
  }

  if (artisans.length === 0) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No artisans found</h3>
        <p className="text-gray-600">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={artisans.length > 0 && selectedArtisans.length === artisans.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedArtisans(artisans.map(a => a._id));
                    } else {
                      setSelectedArtisans([]);
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                        ID: {artisan.idProof.verified ? 'Verified' : 'Unverified'}
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
                      onClick={() => onViewDetails(artisan)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {artisan.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onApprove(artisan)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onReject(artisan)}
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
                          onClick={() => onSuspend(artisan)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                          title="Suspend"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        {artisan.bankDetails && !artisan.bankDetails.verified && (
                          <button
                            onClick={() => onVerifyBank(artisan)}
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
                        onClick={() => onReactivate(artisan._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Reactivate"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => onEdit(artisan)}
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
      
      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
            <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
            <span className="font-medium">{pagination.total}</span> artisans
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
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
                  onClick={() => onPageChange(pageNum)}
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
                onClick={() => onPageChange(pagination.pages)}
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
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArtisanTable;