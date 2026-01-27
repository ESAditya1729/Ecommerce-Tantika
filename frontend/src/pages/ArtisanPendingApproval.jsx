import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Clock, Mail, Shield, CheckCircle, AlertCircle, 
  Home, User, Store, FileText, ArrowLeft,
  RefreshCw, XCircle, Calendar, Info, ExternalLink
} from 'lucide-react';
import authServices from '../services/authServices';
import axios from 'axios';

const ArtisanPendingApproval = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusData, setStatusData] = useState(null);
  
  // ✅ Get backend URL from environment variable
  const BACKEND_URL = 'http://localhost:5000/api'; //process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('tantika_user') || '{}');
  const isPendingArtisan = user?.role === 'pending_artisan';
  const token = localStorage.getItem('tantika_token');

  // Redirect if not a pending artisan
  useEffect(() => {
    if (!isPendingArtisan) {
      navigate('/login');
    } else {
      fetchPendingStatus();
    }
  }, [isPendingArtisan, navigate]);

  // ✅ Direct API call function as fallback
  const fetchStatusDirectly = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/artisan/pending-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Direct API call error:', error);
      throw error;
    }
  };

  // Fetch pending status from backend
  const fetchPendingStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      // Try using authServices first
      try {
        response = await authServices.getPendingArtisanStatus();
      } catch (serviceError) {
        console.log('authServices failed, trying direct API call...', serviceError);
        // Fallback to direct API call
        response = await fetchStatusDirectly();
        response = { success: true, data: response.data }; // Format to match authServices response
      }
      
      if (response.success) {
        setStatusData(response.data);
        
        // If status changed to approved, redirect to dashboard
        if (response.data.status === 'approved') {
          // Update user role in localStorage
          const updatedUser = { ...user, role: 'artisan' };
          localStorage.setItem('tantika_user', JSON.stringify(updatedUser));
          
          // Store artisan data
          if (response.data.artisan) {
            localStorage.setItem('tantika_artisan', JSON.stringify(response.data.artisan));
          }
          
          // Redirect after a delay
          setTimeout(() => {
            navigate('/artisan/dashboard');
          }, 2000);
        }
        
        // If rejected, show rejection reason
        if (response.data.status === 'rejected') {
          setError(`Application rejected: ${response.data.rejectionReason}`);
        }
      }
    } catch (error) {
      console.error('Error fetching pending status:', error);
      setError('Failed to load application status. Please check your connection.');
      
      // Use mock data if API fails (for development)
      setStatusData({
        businessName: user?.businessName || 'Your Business',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        daysPending: 1,
        estimatedTimeline: {
          minDays: 3,
          maxDays: 5,
          typicalProcessing: '3-5 business days'
        },
        nextSteps: [
          'Initial review and verification',
          'Background check and document validation',
          'Final decision and notification'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      pending: { 
        color: 'amber', 
        bgColor: 'bg-amber-500',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        text: 'Under Review', 
        icon: <Clock className="w-4 h-4" /> 
      },
      approved: { 
        color: 'green', 
        bgColor: 'bg-green-500',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        text: 'Approved', 
        icon: <CheckCircle className="w-4 h-4" /> 
      },
      rejected: { 
        color: 'red', 
        bgColor: 'bg-red-500',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        text: 'Rejected', 
        icon: <XCircle className="w-4 h-4" /> 
      },
      suspended: { 
        color: 'gray', 
        bgColor: 'bg-gray-500',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200',
        text: 'Suspended', 
        icon: <AlertCircle className="w-4 h-4" /> 
      }
    };
    
    return badges[status] || badges.pending;
  };

  // Refresh status
  const handleRefresh = () => {
    fetchPendingStatus();
  };

  // Debug info
  const showDebugInfo = process.env.NODE_ENV === 'development';
  
  // If loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl mb-6 animate-pulse">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Application Status...</h2>
          <p className="text-gray-600">Please wait while we fetch your application details.</p>
        </div>
      </div>
    );
  }

  // If error
  if (error && !statusData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl mb-6">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Status</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border-2 border-gray-600 text-gray-600 rounded-xl font-semibold hover:bg-gray-50"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const badge = getStatusBadge(statusData?.status);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl mb-6 shadow-lg">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Application Status
          </h1>
          <p className="text-xl text-gray-600">
            Your artisan application on{" "}
            <span className="font-bold text-amber-600">তন্তিকা</span>
          </p>
          
          {/* Status Badge */}
          <div className="inline-flex items-center mt-4 px-6 py-2 rounded-full bg-white shadow">
            <div className={`w-3 h-3 rounded-full mr-2 ${badge.bgColor}`}></div>
            <span className={`font-semibold ${badge.textColor}`}>
              {badge.text}
            </span>
          </div>
        </div>

        {/* Error Alert if rejected */}
        {statusData?.status === 'rejected' && statusData?.rejectionReason && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-red-800 text-lg mb-2">
                  Application Rejected
                </h3>
                <p className="text-red-700">
                  <strong>Reason:</strong> {statusData.rejectionReason}
                </p>
                <p className="text-red-600 mt-2">
                  You can apply again with corrected information or contact support for clarification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert if approved */}
        {statusData?.status === 'approved' && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-green-800 text-lg mb-2">
                  Application Approved! 🎉
                </h3>
                <p className="text-green-700">
                  Congratulations! Your artisan account has been approved. You will be redirected to the artisan dashboard shortly.
                </p>
                <button
                  onClick={() => navigate('/artisan/dashboard')}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  Go to Dashboard Now
                  <ExternalLink className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="p-8 md:p-10">
            {/* Status Banner */}
            <div className={`mb-10 p-6 bg-gradient-to-r from-${badge.color}-100 to-${badge.color}-50 border ${badge.borderColor} rounded-2xl`}>
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className={`w-12 h-12 ${badge.bgColor} rounded-full flex items-center justify-center mr-4 flex-shrink-0`}>
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${badge.textColor} text-lg mb-2`}>
                      Application Status: {badge.text}
                    </h3>
                    <p className={`${badge.textColor}`}>
                      Your application for <span className="font-semibold">{statusData?.businessName || 'Your Business'}</span> is currently {statusData?.status === 'pending' ? 'under review' : statusData?.status}.
                    </p>
                    {statusData?.daysPending !== undefined && (
                      <p className={`${badge.textColor} mt-2`}>
                        <Clock className="inline w-4 h-4 mr-1" />
                        Pending for {statusData.daysPending} day{statusData.daysPending !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  className={`p-2 ${badge.textColor} hover:${badge.textColor.replace('700', '800')} hover:bg-${badge.color}-100 rounded-lg transition-colors`}
                  title="Refresh status"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Application Details */}
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-amber-500" />
                Application Details
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Store className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Business Name</h4>
                      <p className="text-gray-600">{statusData?.businessName || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Application ID</h4>
                      <p className="text-gray-600 font-mono">
                        {statusData?._id ? `ART-${statusData._id.toString().slice(-8)}` : 'Loading...'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Submitted On</h4>
                      <p className="text-gray-600">{formatDate(statusData?.submittedAt)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-2xl">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <Mail className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Contact Email</h4>
                      <p className="text-gray-600">{user?.email || 'your@email.com'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated Timeline */}
            {statusData?.status === 'pending' && statusData?.estimatedTimeline && (
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-amber-500" />
                  Estimated Timeline
                </h3>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <Info className="w-5 h-5 text-amber-600 mr-2" />
                    <p className="text-amber-700 font-semibold">
                      Typical processing time: {statusData.estimatedTimeline.typicalProcessing}
                    </p>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    {statusData.nextSteps?.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-4">
                            <span className="text-white font-bold">{index + 1}</span>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <p className="text-gray-700">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Important Information */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-8">
              <h4 className="font-bold text-blue-800 text-lg mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Important Information
              </h4>
              <ul className="space-y-3 text-blue-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
                  <span>You'll receive an email notification once your application status changes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
                  <span>Processing time is typically 3-5 business days</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
                  <span>If approved, you'll get access to the artisan dashboard to add products</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
                  <span>If we need additional information, we'll contact you via email</span>
                </li>
              </ul>
              
              {statusData?.status === 'pending' && (
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <p className="text-blue-600 text-sm">
                    <strong>Note:</strong> Status updates automatically every 30 seconds. 
                    You can also refresh manually using the refresh button above.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300"
          >
            <Home className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Back to Home
          </button>
          
          {statusData?.status === 'rejected' && (
            <button
              onClick={() => navigate('/register?type=artisan')}
              className="group flex items-center justify-center px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300"
            >
              <FileText className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Apply Again
            </button>
          )}
          
          <button
            onClick={() => navigate('/contact')}
            className="group flex items-center justify-center px-8 py-4 border-2 border-amber-600 text-amber-600 rounded-2xl font-bold text-lg hover:bg-amber-50 transition-all duration-300"
          >
            <Mail className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Contact Support
          </button>
          
          <Link
            to="/login"
            className="group flex items-center justify-center px-8 py-4 border-2 border-gray-600 text-gray-600 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Need help? Contact our artisan support team at{' '}
            <a href="mailto:artisan-support@tantika.com" className="text-amber-600 hover:text-amber-500 font-medium">
              artisan-support@tantika.com
            </a>
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Application ID: {statusData?._id ? `ART-${statusData._id.toString().slice(-8)}` : 'Loading...'} • 
            Submitted on {formatDate(statusData?.submittedAt)}
          </p>
        </div>
      </div>

      {/* Auto-refresh for pending status */}
      {statusData?.status === 'pending' && (
        <AutoRefresh onRefresh={fetchPendingStatus} />
      )}
    </div>
  );
};

// Auto-refresh component
const AutoRefresh = ({ onRefresh, interval = 30000 }) => {
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      onRefresh();
    }, interval);

    return () => clearInterval(refreshInterval);
  }, [onRefresh, interval]);

  return null;
};

export default ArtisanPendingApproval;