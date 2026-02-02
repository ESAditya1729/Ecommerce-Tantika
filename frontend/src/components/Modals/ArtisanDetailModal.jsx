import React from 'react';
import { 
  X, Info, Mail, Phone, MapPin, Briefcase, FileText, 
  Calendar, Award, Package, TrendingUp, DollarSign, Star,
  CheckCircle, XCircle, User, Building, Globe, CreditCard,
  Clock, UserCheck, UserX, Ban
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../services/artisanService';

const ArtisanDetailModal = ({ artisan, isOpen, onClose }) => {
  if (!isOpen || !artisan) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved': return <UserCheck className="w-5 h-5 text-green-500" />;
      case 'rejected': return <UserX className="w-5 h-5 text-red-500" />;
      case 'suspended': return <Ban className="w-5 h-5 text-gray-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'suspended': return 'Suspended';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                {artisan.businessName?.charAt(0) || artisan.fullName?.charAt(0) || 'A'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{artisan.businessName || 'No Business Name'}</h3>
                <p className="text-gray-600">{artisan.fullName || 'N/A'}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(artisan.status)}`}>
                    {getStatusIcon(artisan.status)}
                    <span className="ml-2">{getStatusText(artisan.status)}</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Personal & Business Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <User className="w-5 h-5" /> Personal Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <User className="w-4 h-4 mt-1 text-gray-400 mr-3" />
                  <div>
                    <label className="text-sm text-gray-500">Full Name</label>
                    <p className="font-medium">{artisan.fullName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="w-4 h-4 mt-1 text-gray-400 mr-3" />
                  <div>
                    <label className="text-sm text-gray-500">Email Address</label>
                    <p className="font-medium">{artisan.email || artisan.user?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-4 h-4 mt-1 text-gray-400 mr-3" />
                  <div>
                    <label className="text-sm text-gray-500">Phone Number</label>
                    <p className="font-medium">{artisan.phone || artisan.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Building className="w-5 h-5" /> Business Details
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Business Name</label>
                  <p className="font-medium">{artisan.businessName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Specialization</label>
                  <p className="font-medium">{artisan.specialization || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Years of Experience</label>
                  <p className="font-medium">{artisan.yearsOfExperience || '0'} years</p>
                </div>
                {artisan.description && (
                  <div>
                    <label className="text-sm text-gray-500">Description</label>
                    <p className="text-gray-700 mt-1">{artisan.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Address
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              {artisan.address ? (
                typeof artisan.address === 'string' ? (
                  <p className="text-gray-700">{artisan.address}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {artisan.address.street && (
                      <div>
                        <label className="text-sm text-gray-500">Street</label>
                        <p className="font-medium">{artisan.address.street}</p>
                      </div>
                    )}
                    {artisan.address.city && (
                      <div>
                        <label className="text-sm text-gray-500">City</label>
                        <p className="font-medium">{artisan.address.city}</p>
                      </div>
                    )}
                    {artisan.address.state && (
                      <div>
                        <label className="text-sm text-gray-500">State</label>
                        <p className="font-medium">{artisan.address.state}</p>
                      </div>
                    )}
                    {artisan.address.postalCode && (
                      <div>
                        <label className="text-sm text-gray-500">Postal Code</label>
                        <p className="font-medium">{artisan.address.postalCode}</p>
                      </div>
                    )}
                    {artisan.address.country && (
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-500">Country</label>
                        <p className="font-medium">{artisan.address.country}</p>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <p className="text-gray-500">No address provided</p>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" /> Documents & Verification
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ID Proof */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span className="font-medium">ID Proof</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                    artisan.idProof?.verified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {artisan.idProof?.verified ? 
                      <CheckCircle className="w-3 h-3 mr-1" /> : 
                      <Clock className="w-3 h-3 mr-1" />
                    }
                    {artisan.idProof?.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                {artisan.idProof ? (
                  <div className="space-y-2 text-sm">
                    {artisan.idProof.type && (
                      <div>
                        <label className="text-gray-500">Type:</label>
                        <p className="font-medium">{artisan.idProof.type}</p>
                      </div>
                    )}
                    {artisan.idProof.number && (
                      <div>
                        <label className="text-gray-500">Number:</label>
                        <p className="font-medium">{artisan.idProof.number}</p>
                      </div>
                    )}
                    {artisan.idProof.verifiedAt && (
                      <div>
                        <label className="text-gray-500">Verified On:</label>
                        <p className="font-medium">{formatDate(artisan.idProof.verifiedAt)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No ID proof uploaded</p>
                )}
              </div>

              {/* Bank Details */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-medium">Bank Details</span>
                  </div>
                  {artisan.bankDetails ? (
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                      artisan.bankDetails.verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {artisan.bankDetails.verified ? 
                        <CheckCircle className="w-3 h-3 mr-1" /> : 
                        <Clock className="w-3 h-3 mr-1" />
                      }
                      {artisan.bankDetails.verified ? 'Verified' : 'Pending'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                      Not Provided
                    </span>
                  )}
                </div>
                {artisan.bankDetails ? (
                  <div className="space-y-2 text-sm">
                    {artisan.bankDetails.accountName && (
                      <div>
                        <label className="text-gray-500">Account Name:</label>
                        <p className="font-medium">{artisan.bankDetails.accountName}</p>
                      </div>
                    )}
                    {artisan.bankDetails.bankName && (
                      <div>
                        <label className="text-gray-500">Bank:</label>
                        <p className="font-medium">{artisan.bankDetails.bankName}</p>
                      </div>
                    )}
                    {artisan.bankDetails.accountNumber && (
                      <div>
                        <label className="text-gray-500">Account Number:</label>
                        <p className="font-medium">•••• {artisan.bankDetails.accountNumber.slice(-4)}</p>
                      </div>
                    )}
                    {artisan.bankDetails.verifiedAt && (
                      <div>
                        <label className="text-gray-500">Verified On:</label>
                        <p className="font-medium">{formatDate(artisan.bankDetails.verifiedAt)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No bank details provided</p>
                )}
              </div>
            </div>
          </div>

          {/* Performance Stats (if approved) */}
          {artisan.status === 'approved' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Performance Stats
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Products</span>
                  </div>
                  <p className="text-2xl font-bold">{artisan.totalProducts || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Sales</span>
                  </div>
                  <p className="text-2xl font-bold">{artisan.totalSales || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Revenue</span>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(artisan.totalRevenue)}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">Rating</span>
                  </div>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold">{artisan.rating?.toFixed(1) || '0.0'}</p>
                    <Star className="w-4 h-4 ml-2 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Timeline
            </h4>
            <div className="relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="relative mb-4">
                <div className="absolute -left-6 top-0 w-3 h-3 rounded-full bg-blue-500"></div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Account Created</p>
                  <p className="text-sm text-gray-500">{formatDate(artisan.createdAt)}</p>
                </div>
              </div>

              {artisan.submittedAt && (
                <div className="relative mb-4">
                  <div className="absolute -left-6 top-0 w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium">Application Submitted</p>
                    <p className="text-sm text-gray-500">{formatDate(artisan.submittedAt)}</p>
                  </div>
                </div>
              )}

              {artisan.approvedAt && (
                <div className="relative mb-4">
                  <div className="absolute -left-6 top-0 w-3 h-3 rounded-full bg-purple-500"></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium">Approved</p>
                    <p className="text-sm text-gray-500">{formatDate(artisan.approvedAt)}</p>
                    {artisan.approvedBy && (
                      <p className="text-xs text-gray-400">By Admin</p>
                    )}
                  </div>
                </div>
              )}

              {artisan.rejectedAt && (
                <div className="relative mb-4">
                  <div className="absolute -left-6 top-0 w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium">Rejected</p>
                    <p className="text-sm text-gray-500">{formatDate(artisan.rejectedAt)}</p>
                    {artisan.rejectionReason && (
                      <p className="text-sm text-gray-600 mt-1">{artisan.rejectionReason}</p>
                    )}
                  </div>
                </div>
              )}

              {artisan.suspendedAt && (
                <div className="relative">
                  <div className="absolute -left-6 top-0 w-3 h-3 rounded-full bg-gray-500"></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium">Suspended</p>
                    <p className="text-sm text-gray-500">{formatDate(artisan.suspendedAt)}</p>
                    {artisan.suspensionReason && (
                      <p className="text-sm text-gray-600 mt-1">{artisan.suspensionReason}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {(artisan.adminNotes || artisan.rejectionReason || artisan.suspensionReason) && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Admin Notes</h4>
              <div className="space-y-3">
                {artisan.adminNotes && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">{artisan.adminNotes}</p>
                  </div>
                )}
                {artisan.rejectionReason && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-800">{artisan.rejectionReason}</p>
                  </div>
                )}
                {artisan.suspensionReason && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-800">{artisan.suspensionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanDetailModal;