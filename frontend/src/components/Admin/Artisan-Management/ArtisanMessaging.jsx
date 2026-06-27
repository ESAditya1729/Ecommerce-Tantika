// components/Admin/Artisan-Management/ArtisanMessaging.jsx
import React, { useState, useEffect } from 'react';
import { 
  Send, 
  MessageSquare, 
  Users, 
  Search, 
  X, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Bell,
  User,
  Loader,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Info,
  FileText,
  Eye
} from 'lucide-react';
import {
  TEMPLATE_CONFIGS,
  getTemplateOptions,
  getTemplateConfig,
  getTemplateFields,
  validateTemplateData,
  generatePreview,
  getTemplateExampleData
} from '../../../data/notificationTemplates';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const ArtisanMessaging = ({ artisans = [], loading: artisansLoading = false, onRefresh }) => {
  const [selectedArtisans, setSelectedArtisans] = useState([]);
  const [messageType, setMessageType] = useState('notification');
  const [templateId, setTemplateId] = useState('system_announcement');
  const [customMessage, setCustomMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('medium');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showNotificationHistory, setShowNotificationHistory] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [templateData, setTemplateData] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  // Get current template config
  const currentTemplate = getTemplateConfig(templateId);
  const templateFields = getTemplateFields(templateId);
  const templateOptions = getTemplateOptions();

  // Initialize template data when template changes
  useEffect(() => {
    const initialData = {};
    templateFields.forEach(field => {
      initialData[field.id] = '';
    });
    setTemplateData(initialData);
  }, [templateId]);

  // ========== FIXED: Safe filter with proper null checks ==========
  const filteredArtisans = artisans.filter(artisan => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    // Safe helper to convert any value to lowercase string
    const safeString = (value) => {
      if (!value) return '';
      if (typeof value === 'string') return value.toLowerCase();
      if (Array.isArray(value)) return value.join(' ').toLowerCase();
      return String(value).toLowerCase();
    };
    
    return (
      safeString(artisan.businessName).includes(searchLower) ||
      safeString(artisan.fullName).includes(searchLower) ||
      safeString(artisan.email).includes(searchLower) ||
      safeString(artisan.phone).includes(searchLower) ||
      safeString(artisan.specialization).includes(searchLower) ||
      safeString(artisan.category).includes(searchLower)
    );
  });

  const getSelectedArtisansData = () => {
    return artisans.filter(a => selectedArtisans.includes(a._id));
  };

  // Fetch notification history
  useEffect(() => {
    if (showNotificationHistory) {
      fetchSentNotifications();
    }
  }, [showNotificationHistory]);

  const fetchSentNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const token = localStorage.getItem('tantika_token');
      
      const response = await fetch(`${API_BASE_URL}/notifications/admin?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedArtisans([]);
    } else {
      setSelectedArtisans(filteredArtisans.map(a => a._id));
    }
    setSelectAll(!selectAll);
  };

  // Handle individual selection
  const handleSelectArtisan = (artisanId) => {
    setSelectedArtisans(prev => {
      if (prev.includes(artisanId)) {
        return prev.filter(id => id !== artisanId);
      } else {
        return [...prev, artisanId];
      }
    });
    if (selectAll) {
      setSelectAll(false);
    }
  };

  // Handle template data change
  const handleTemplateDataChange = (fieldId, value) => {
    const field = templateFields.find(f => f.id === fieldId);
    
    if (field && field.type === 'number') {
      if (value === '' || value === null || value === undefined) {
        setTemplateData(prev => ({ ...prev, [fieldId]: '' }));
      } else {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          setTemplateData(prev => ({ ...prev, [fieldId]: numValue }));
        } else {
          setTemplateData(prev => ({ ...prev, [fieldId]: value }));
        }
      }
    } else {
      setTemplateData(prev => ({ ...prev, [fieldId]: value }));
    }
  };

  // Load example data for the template
  const loadExampleData = () => {
    const exampleData = getTemplateExampleData(templateId);
    setTemplateData(exampleData);
  };

  // Get preview message
  const getPreviewMessage = () => {
    return generatePreview(templateId, templateData);
  };

  // Validate form
 const isFormValid = () => {
  if (selectedArtisans.length === 0) return false;
  
  if (messageType === 'notification') {
    const validation = validateTemplateData(templateId, templateData);
    return validation.valid;
  }
  
  if (messageType === 'custom') {
    return customMessage.trim().length > 0;
  }
  
  return false;
};

  // Send notification
  const handleSendNotification = async () => {
    if (selectedArtisans.length === 0) {
      setError('Please select at least one artisan');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (messageType === 'notification') {
      const validation = validateTemplateData(templateId, templateData);
      if (!validation.valid) {
        setError(`Please fill in required fields: ${validation.errors.join(', ')}`);
        setTimeout(() => setError(null), 3000);
        return;
      }
    }

    if (messageType === 'custom' && !customMessage.trim()) {
      setError('Please enter a message');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('tantika_token');
      
      let payload = {
        artisanIds: selectedArtisans,
        priority,
        source: 'admin'
      };

      if (messageType === 'notification') {
        payload.templateId = templateId;
        
        const processedData = {};
        const fields = getTemplateFields(templateId);
        
        fields.forEach(field => {
          const value = templateData[field.id];
          
          if (field.type === 'number') {
            if (value === '' || value === null || value === undefined) {
              processedData[field.id] = 0;
            } else {
              const numValue = parseFloat(value);
              processedData[field.id] = isNaN(numValue) ? 0 : numValue;
            }
          } else {
            processedData[field.id] = value || '';
          }
        });
        
        payload.data = processedData;
        
        if (subject) {
          payload.data.subject = subject;
        }
        
        console.log('📤 Processed payload:', JSON.stringify(payload, null, 2));
        
      } else {
        payload.templateId = 'system_announcement';
        payload.data = {
          message: customMessage,
          subject: subject || 'Important Update'
        };
      }

      const response = await fetch(`${API_BASE_URL}/notifications/admin/broadcast`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`✅ Message sent successfully to ${data.data?.sentCount || selectedArtisans.length} artisan(s)`);
        setSelectedArtisans([]);
        setSelectAll(false);
        setTemplateData({});
        setCustomMessage('');
        setSubject('');
        if (showNotificationHistory) {
          fetchSentNotifications();
        }
        if (onRefresh) onRefresh();
        setTimeout(() => setSuccess(null), 5000);
      } else {
        throw new Error(data.message || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setError(`❌ ${error.message || 'Failed to send notification'}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setSending(false);
    }
  };

  // Render template fields
  const renderTemplateFields = () => {
    if (!templateFields || templateFields.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-medium text-gray-700">Template Data</p>
            <span className="text-xs text-red-500">* Required fields</span>
          </div>
          <button
            type="button"
            onClick={loadExampleData}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <span>📝</span> Load Example
          </button>
        </div>
        
        {templateFields.map((field) => {
          const value = templateData[field.id] || '';
          
          if (field.type === 'select') {
            return (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <select
                  value={value}
                  onChange={(e) => handleTemplateDataChange(field.id, e.target.value)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    field.required && !value ? 'border-red-300' : ''
                  }`}
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
                {field.required && !value && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>
            );
          }
          
          if (field.type === 'textarea') {
            return (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  value={value}
                  onChange={(e) => handleTemplateDataChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  rows={field.id === 'reason' || field.id === 'message' ? 3 : 2}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                    field.required && !value.trim() ? 'border-red-300' : ''
                  }`}
                />
                {field.required && !value.trim() && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>
            );
          }
          
          if (field.type === 'number') {
            return (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="number"
                  value={value === '' ? '' : value}
                  onChange={(e) => handleTemplateDataChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  step={field.id === 'amount' ? '0.01' : '1'}
                  min="0"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    field.required && (value === '' || value === null) ? 'border-red-300' : ''
                  }`}
                />
                {field.required && (value === '' || value === null) && (
                  <p className="text-xs text-red-500 mt-1">This field is required</p>
                )}
              </div>
            );
          }
          
          return (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type={field.type}
                value={value}
                onChange={(e) => handleTemplateDataChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  field.required && !value.trim() ? 'border-red-300' : ''
                }`}
              />
              {field.required && !value.trim() && (
                <p className="text-xs text-red-500 mt-1">This field is required</p>
              )}
            </div>
          );
        })}

        {/* Preview */}
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          
          {showPreview && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <p className="text-sm text-gray-700">{getPreviewMessage()}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const colors = {
      'approved': 'bg-green-100 text-green-700 border-green-200',
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'suspended': 'bg-red-100 text-red-700 border-red-200',
      'rejected': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusText = (status) => {
    const texts = {
      'approved': 'Active',
      'pending': 'Pending',
      'suspended': 'Suspended',
      'rejected': 'Rejected'
    };
    return texts[status] || status;
  };

  // Notification detail modal
  const renderNotificationDetail = () => {
    if (!selectedNotification) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedNotification(null)}>
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Notification Details
            </h3>
            <button
              onClick={() => setSelectedNotification(null)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-sm rounded-full ${
                selectedNotification.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                selectedNotification.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                selectedNotification.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {selectedNotification.priority.charAt(0).toUpperCase() + selectedNotification.priority.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(selectedNotification.createdAt).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium">Title</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{selectedNotification.title}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 font-medium">Message</p>
              <div className="mt-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap">{selectedNotification.message}</p>
              </div>
            </div>

            {selectedNotification.data && Object.keys(selectedNotification.data).length > 0 && (
              <div>
                <p className="text-sm text-gray-500 font-medium">Data</p>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(selectedNotification.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 font-medium">Sent To</p>
                <p className="text-gray-900 capitalize mt-1">{selectedNotification.recipientType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Status</p>
                <p className="text-gray-900 mt-1">
                  {selectedNotification.read ? 'Read' : 'Unread'}
                </p>
              </div>
            </div>

            {selectedNotification.reply?.status === 'replied' && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Artisan Reply
                </p>
                <p className="text-green-700 mt-2">{selectedNotification.reply.content}</p>
                <p className="text-xs text-green-600 mt-1">
                  {new Date(selectedNotification.reply.at).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => setSelectedNotification(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Messaging Interface */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Send Message to Artisans
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Select artisans and send notifications with dynamic content
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {selectedArtisans.length} selected
              </span>
              {selectedArtisans.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedArtisans([]);
                    setSelectAll(false);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Artisan Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Artisans <span className="text-red-500">*</span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search artisans by name, email, phone, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={handleSelectAll}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Users className="w-4 h-4" />
                {selectAll ? 'Deselect All' : 'Select All'}
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                  {filteredArtisans.length}
                </span>
              </button>
            </div>

            <div className="mt-3 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
              {artisansLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Loading artisans...</span>
                </div>
              ) : filteredArtisans.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>
                    {artisans.length === 0 
                      ? 'No artisans available. Please refresh the page.' 
                      : 'No artisans found matching your search'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredArtisans.map((artisan) => (
                    <div
                      key={artisan._id}
                      onClick={() => handleSelectArtisan(artisan._id)}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedArtisans.includes(artisan._id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedArtisans.includes(artisan._id)}
                        onChange={() => handleSelectArtisan(artisan._id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {artisan.businessName || artisan.fullName || artisan.name || 'Unnamed Artisan'}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusBadge(artisan.status)}`}>
                            {getStatusText(artisan.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5 flex-wrap">
                          <span>{artisan.email || 'No email'}</span>
                          {artisan.specialization && (
                            <>
                              <span>•</span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs truncate max-w-[150px]">
                                {typeof artisan.specialization === 'string' 
                                  ? artisan.specialization 
                                  : Array.isArray(artisan.specialization) 
                                    ? artisan.specialization.join(', ') 
                                    : String(artisan.specialization)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {selectedArtisans.includes(artisan._id) && (
                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedArtisans.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {selectedArtisans.length} artisan(s) selected
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedArtisans([]);
                      setSelectAll(false);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear selection
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {getSelectedArtisansData().slice(0, 5).map((artisan) => (
                    <span 
                      key={artisan._id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded-md text-xs text-gray-700"
                    >
                      {artisan.businessName || artisan.fullName || 'Artisan'}
                    </span>
                  ))}
                  {selectedArtisans.length > 5 && (
                    <span className="text-xs text-blue-600 font-medium ml-1">
                      +{selectedArtisans.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Message Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Message Type
              </label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="notification">📋 Pre-defined Template</option>
                <option value="custom">✏️ Custom Message</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
          </div>

          {/* Template Selector */}
          {messageType === 'notification' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notification Template
              </label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {templateOptions.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label} - {template.description}
                  </option>
                ))}
              </select>
              
              {/* Dynamic Data Fields */}
              {renderTemplateFields()}
            </div>
          )}

          {/* Custom Message */}
          {messageType === 'custom' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Custom Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Type your custom message here..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                rows="4"
              />
              <p className="text-xs text-gray-400 mt-1">
                This message will be sent to all selected artisans.
              </p>
            </div>
          )}

          {/* Subject */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Subject <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter a subject line for your message..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSendNotification}
            disabled={sending || !isFormValid()}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
              sending || !isFormValid()
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            {sending ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Message to {selectedArtisans.length} Artisan{selectedArtisans.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtisanMessaging;