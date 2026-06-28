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
  Eye,
  Sparkles,
  Shield,
  Zap,
  Mail,
  Tag,
  Filter,
  Layers,
  Star,
  Award,
  Calendar,
  Phone,
  MapPin,
  Briefcase
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

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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
      <div className="mt-4 space-y-4 p-5 bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-pink-50/80 border-2 border-indigo-200 rounded-2xl shadow-inner">
        {/* Header with gradient border */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-indigo-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800">Template Data Fields</h4>
              <p className="text-xs text-gray-500">Fill in the required information below</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadExampleData}
            className="group px-4 py-2 bg-white border-2 border-indigo-300 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 hover:shadow-md transition-all duration-300 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            Load Example
          </button>
        </div>
        
        <div className="space-y-4">
          {templateFields.map((field, index) => {
            const value = templateData[field.id] || '';
            const isRequired = field.required;
            
            // Different colored borders for different field types
            let borderColor = 'border-gray-200';
            let focusColor = 'focus:ring-blue-500';
            let bgColor = 'bg-white';
            
            if (field.type === 'select') {
              borderColor = 'border-emerald-200';
              focusColor = 'focus:ring-emerald-500';
              bgColor = 'bg-emerald-50/30';
            } else if (field.type === 'textarea') {
              borderColor = 'border-purple-200';
              focusColor = 'focus:ring-purple-500';
              bgColor = 'bg-purple-50/30';
            } else if (field.type === 'number') {
              borderColor = 'border-blue-200';
              focusColor = 'focus:ring-blue-500';
              bgColor = 'bg-blue-50/30';
            }
            
            if (field.type === 'select') {
              return (
                <div key={field.id} className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${isRequired ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                    {field.label}
                    {isRequired && <span className="text-red-500 text-lg">*</span>}
                    {!isRequired && <span className="text-xs text-gray-400 font-normal">(optional)</span>}
                  </label>
                  <div className="relative">
                    <select
                      value={value}
                      onChange={(e) => handleTemplateDataChange(field.id, e.target.value)}
                      className={`w-full px-4 py-3 ${bgColor} border-2 ${borderColor} rounded-xl focus:${focusColor} focus:border-transparent transition-all duration-300 appearance-none font-medium`}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {isRequired && !value && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      This field is required
                    </p>
                  )}
                  {field.description && (
                    <p className="text-xs text-gray-500 mt-1 italic">💡 {field.description}</p>
                  )}
                </div>
              );
            }
            
            if (field.type === 'textarea') {
              return (
                <div key={field.id} className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${isRequired ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                    {field.label}
                    {isRequired && <span className="text-red-500 text-lg">*</span>}
                    {!isRequired && <span className="text-xs text-gray-400 font-normal">(optional)</span>}
                  </label>
                  <textarea
                    value={value}
                    onChange={(e) => handleTemplateDataChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={field.id === 'reason' || field.id === 'message' ? 4 : 3}
                    className={`w-full px-4 py-3 ${bgColor} border-2 ${borderColor} rounded-xl focus:${focusColor} focus:border-transparent transition-all duration-300 resize-y font-medium`}
                  />
                  {isRequired && !value.trim() && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      This field is required
                    </p>
                  )}
                  {field.description && (
                    <p className="text-xs text-gray-500 mt-1 italic">💡 {field.description}</p>
                  )}
                </div>
              );
            }
            
            if (field.type === 'number') {
              return (
                <div key={field.id} className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${isRequired ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                    {field.label}
                    {isRequired && <span className="text-red-500 text-lg">*</span>}
                    {!isRequired && <span className="text-xs text-gray-400 font-normal">(optional)</span>}
                  </label>
                  <input
                    type="number"
                    value={value === '' ? '' : value}
                    onChange={(e) => handleTemplateDataChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    step={field.id === 'amount' ? '0.01' : '1'}
                    min="0"
                    className={`w-full px-4 py-3 ${bgColor} border-2 ${borderColor} rounded-xl focus:${focusColor} focus:border-transparent transition-all duration-300 font-medium`}
                  />
                  {isRequired && (value === '' || value === null) && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      This field is required
                    </p>
                  )}
                  {field.description && (
                    <p className="text-xs text-gray-500 mt-1 italic">💡 {field.description}</p>
                  )}
                </div>
              );
            }
            
            return (
              <div key={field.id} className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${isRequired ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                  {field.label}
                  {isRequired && <span className="text-red-500 text-lg">*</span>}
                  {!isRequired && <span className="text-xs text-gray-400 font-normal">(optional)</span>}
                </label>
                <input
                  type={field.type}
                  value={value}
                  onChange={(e) => handleTemplateDataChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className={`w-full px-4 py-3 ${bgColor} border-2 ${borderColor} rounded-xl focus:${focusColor} focus:border-transparent transition-all duration-300 font-medium`}
                />
                {isRequired && !value.trim() && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    This field is required
                  </p>
                )}
                {field.description && (
                  <p className="text-xs text-gray-500 mt-1 italic">💡 {field.description}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Enhanced Preview Section */}
        <div className="mt-4 pt-4 border-t-2 border-dashed border-indigo-200">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="group flex items-center gap-3 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-all duration-300"
          >
            <div className={`p-1.5 rounded-lg ${showPreview ? 'bg-indigo-100' : 'bg-gray-100'} group-hover:bg-indigo-100 transition-colors duration-300`}>
              <Eye className={`w-4 h-4 transition-transform duration-300 ${showPreview ? 'scale-110' : ''}`} />
            </div>
            {showPreview ? 'Hide Message Preview' : 'Preview Message'}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showPreview ? 'rotate-180' : ''}`} />
          </button>
          
          {showPreview && (
            <div className="mt-3 p-5 bg-white border-2 border-indigo-300 rounded-2xl shadow-lg animate-fadeIn">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Live Preview</span>
                <div className="flex-1"></div>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-bold">PREVIEW</span>
              </div>
              <div className="p-4 bg-gradient-to-br from-gray-50 to-indigo-50/50 rounded-xl border-2 border-indigo-100">
                <p className="text-sm text-gray-800 leading-relaxed font-medium">{getPreviewMessage()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get status badge with enhanced styling
  const getStatusBadge = (status) => {
    const colors = {
      'approved': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'pending': 'bg-amber-100 text-amber-800 border-amber-300',
      'suspended': 'bg-rose-100 text-rose-800 border-rose-300',
      'rejected': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
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

  // Enhanced Status Icon
  const getStatusIcon = (status) => {
    const icons = {
      'approved': <CheckCircle className="w-3.5 h-3.5" />,
      'pending': <Clock className="w-3.5 h-3.5" />,
      'suspended': <AlertCircle className="w-3.5 h-3.5" />,
      'rejected': <X className="w-3.5 h-3.5" />
    };
    return icons[status] || null;
  };

  // Notification detail modal with enhanced design
  const renderNotificationDetail = () => {
    if (!selectedNotification) return null;

    const priorityColors = {
      'urgent': 'bg-rose-100 text-rose-800 border-rose-300',
      'high': 'bg-orange-100 text-orange-800 border-orange-300',
      'medium': 'bg-blue-100 text-blue-800 border-blue-300',
      'low': 'bg-gray-100 text-gray-800 border-gray-300'
    };

    const priorityEmojis = {
      'urgent': '🔴',
      'high': '🟠',
      'medium': '🟡',
      'low': '🟢'
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={() => setSelectedNotification(null)}>
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border-2 border-indigo-200" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header with Gradient */}
          <div className="px-6 py-5 border-b-2 border-indigo-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Notification Details</h3>
                <p className="text-xs text-gray-500 font-medium">Complete information about this notification</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedNotification(null)}
              className="p-2.5 bg-white/80 hover:bg-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5">
            {/* Priority and Time */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
              <span className={`px-4 py-1.5 text-sm font-bold rounded-full border-2 ${priorityColors[selectedNotification.priority] || priorityColors.medium} flex items-center gap-2`}>
                {priorityEmojis[selectedNotification.priority]} {selectedNotification.priority.charAt(0).toUpperCase() + selectedNotification.priority.slice(1)} Priority
              </span>
              <span className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                <Clock className="w-4 h-4" />
                {new Date(selectedNotification.createdAt).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            {/* Subject */}
            <div className="space-y-1.5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              <p className="text-xs font-extrabold text-blue-700 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />
                Subject
              </p>
              <p className="text-lg font-bold text-gray-900">{selectedNotification.title}</p>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <p className="text-xs font-extrabold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Message Content
              </p>
              <div className="p-5 bg-gradient-to-br from-gray-50 to-purple-50/50 rounded-xl border-2 border-purple-200">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed font-medium">{selectedNotification.message}</p>
              </div>
            </div>

            {/* Additional Data */}
            {selectedNotification.data && Object.keys(selectedNotification.data).length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-extrabold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  Additional Data
                </p>
                <div className="p-4 bg-gray-900 rounded-xl border-2 border-gray-700">
                  <pre className="text-xs text-green-400 overflow-x-auto font-mono">
                    {JSON.stringify(selectedNotification.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Meta Information with colored boxes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
                <p className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">Recipient Type</p>
                <p className="text-gray-900 capitalize mt-1 font-bold text-lg">{selectedNotification.recipientType}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                <p className="text-xs font-extrabold text-amber-700 uppercase tracking-wider">Status</p>
                <p className="mt-1">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border-2 ${
                    selectedNotification.read 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {selectedNotification.read ? '✅ Read' : '⏳ Unread'}
                  </span>
                </p>
              </div>
            </div>

            {/* Reply Section with colored border */}
            {selectedNotification.reply?.status === 'replied' && (
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-300 shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1.5 bg-emerald-500 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm font-extrabold text-emerald-800">Artisan Reply</p>
                </div>
                <p className="text-emerald-900 leading-relaxed font-medium">{selectedNotification.reply.content}</p>
                <p className="text-xs text-emerald-700 mt-2 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
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
          
          <div className="px-6 py-4 border-t-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-end">
            <button
              onClick={() => setSelectedNotification(null)}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-bold"
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
      {/* Main Messaging Interface */}
      <div className="bg-white rounded-3xl border-2 border-indigo-200 shadow-2xl overflow-hidden">
        {/* Enhanced Header with Gradient and Icons */}
        <div className="px-7 py-6 border-b-2 border-indigo-200 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Send Message to Artisans
                </h3>
                <p className="text-sm text-gray-600 font-medium mt-0.5 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Select artisans and send notifications with dynamic content
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md border-2 border-indigo-200">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-extrabold text-indigo-700">
                  {selectedArtisans.length} Selected
                </span>
              </div>
              {selectedArtisans.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedArtisans([]);
                    setSelectAll(false);
                  }}
                  className="text-sm font-extrabold text-rose-600 hover:text-rose-700 hover:underline decoration-2 underline-offset-4 transition-all duration-300"
                >
                  ✕ Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-7">
          {/* Artisan Selection with Enhanced UI */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <label className="text-base font-extrabold text-gray-800">
                Select Artisans <span className="text-red-500 text-xl">*</span>
              </label>
              <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2.5 py-1 rounded-full">
                {artisans.length} available
              </span>
            </div>

            {/* Search and Select All with enhanced styling */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="🔍 Search artisans by name, email, phone, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 placeholder:text-gray-400 font-medium"
                />
              </div>
              <button
                onClick={handleSelectAll}
                className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-2xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 flex items-center gap-2 whitespace-nowrap font-bold shadow-lg hover:shadow-xl"
              >
                <Users className="w-4 h-4" />
                {selectAll ? 'Deselect All' : 'Select All'}
                <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                  {filteredArtisans.length}
                </span>
              </button>
            </div>

            {/* Artisan List with Enhanced Cards */}
            <div className="mt-3 border-2 border-gray-200 rounded-2xl overflow-hidden shadow-inner">
              {artisansLoading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader className="w-8 h-8 animate-spin text-indigo-600" />
                  <span className="ml-3 text-gray-600 font-bold">Loading artisans...</span>
                </div>
              ) : filteredArtisans.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-extrabold text-lg">
                    {artisans.length === 0 
                      ? 'No artisans available. Please refresh the page.' 
                      : 'No artisans found matching your search'}
                  </p>
                </div>
              ) : (
                <div className="divide-y-2 divide-gray-100 max-h-72 overflow-y-auto">
                  {filteredArtisans.map((artisan) => (
                    <div
                      key={artisan._id}
                      onClick={() => handleSelectArtisan(artisan._id)}
                      className={`flex items-center gap-4 px-5 py-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer transition-all duration-300 ${
                        selectedArtisans.includes(artisan._id) 
                          ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-l-8 border-indigo-500' 
                          : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedArtisans.includes(artisan._id)}
                        onChange={() => handleSelectArtisan(artisan._id)}
                        className="w-5 h-5 text-indigo-600 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-extrabold text-gray-900 text-base">
                            {artisan.businessName || artisan.fullName || artisan.name || 'Unnamed Artisan'}
                          </span>
                          <span className={`px-3 py-1 text-xs font-extrabold rounded-full border-2 ${getStatusBadge(artisan.status)} flex items-center gap-1.5`}>
                            {getStatusIcon(artisan.status)}
                            {getStatusText(artisan.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1 flex-wrap">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {artisan.email || 'No email'}
                          </span>
                          {artisan.phone && (
                            <>
                              <span className="text-gray-300">|</span>
                              <span className="flex items-center gap-1.5 font-medium">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                {artisan.phone}
                              </span>
                            </>
                          )}
                          {artisan.specialization && (
                            <>
                              <span className="text-gray-300">|</span>
                              <span className="bg-gray-200 px-2.5 py-0.5 rounded-lg text-xs font-bold truncate max-w-[200px] flex items-center gap-1.5">
                                <Briefcase className="w-3 h-3" />
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
                        <div className="p-1.5 bg-indigo-500 rounded-xl shadow-lg">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Artisans Summary with Enhanced UI */}
            {selectedArtisans.length > 0 && (
              <div className="mt-4 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-300 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                      <UserCheck className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-extrabold text-indigo-800">
                      {selectedArtisans.length} Artisan{selectedArtisans.length !== 1 ? 's' : ''} Selected
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedArtisans([]);
                      setSelectAll(false);
                    }}
                    className="text-xs font-extrabold text-rose-600 hover:text-rose-700 hover:underline decoration-2 underline-offset-4 transition-all duration-300"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {getSelectedArtisansData().slice(0, 6).map((artisan) => (
                    <span 
                      key={artisan._id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-indigo-200 rounded-xl text-xs font-bold text-gray-700 shadow-sm"
                    >
                      <User className="w-3 h-3 text-indigo-500" />
                      {artisan.businessName || artisan.fullName || 'Artisan'}
                    </span>
                  ))}
                  {selectedArtisans.length > 6 && (
                    <span className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-xs font-extrabold text-white shadow-lg">
                      +{selectedArtisans.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Message Configuration with Enhanced Styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-extrabold text-gray-700 mb-2">
                <div className="p-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                Message Type
              </label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 font-bold"
              >
                <option value="notification">📋 Pre-defined Template</option>
                <option value="custom">✏️ Custom Message</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-extrabold text-gray-700 mb-2">
                <div className="p-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                Priority <span className="text-red-500 text-lg">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 font-bold"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
          </div>

          {/* Template Selector with Enhanced UI */}
          {messageType === 'notification' && (
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-extrabold text-gray-700 mb-2">
                <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Tag className="w-4 h-4 text-white" />
                </div>
                Notification Template
              </label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 font-bold"
              >
                {templateOptions.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label} - {template.description}
                  </option>
                ))}
              </select>
              
              {/* Dynamic Data Fields with Enhanced Colors */}
              {renderTemplateFields()}
            </div>
          )}

          {/* Custom Message with Enhanced Textarea */}
          {messageType === 'custom' && (
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-extrabold text-gray-700 mb-2">
                <div className="p-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                Custom Message <span className="text-red-500 text-lg">*</span>
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="✏️ Type your custom message here..."
                className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-blue-50/30 border-2 border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none font-medium text-gray-800 placeholder:text-gray-400"
                rows="5"
              />
              <p className="flex items-center gap-2 text-xs text-gray-500 mt-2 font-medium">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                This message will be sent to all selected artisans
              </p>
            </div>
          )}

          {/* Subject with Enhanced Input */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-extrabold text-gray-700 mb-2">
              <div className="p-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                <Mail className="w-4 h-4 text-white" />
              </div>
              Subject <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="📧 Enter a subject line for your message..."
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 placeholder:text-gray-400 font-medium"
            />
          </div>

          {/* Error/Success Messages with Enhanced Colors */}
          {error && (
            <div className="mb-4 p-5 bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3 shadow-md animate-slideDown">
              <div className="p-1.5 bg-rose-500 rounded-xl">
                <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-800">{error}</p>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-4 p-5 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-2xl flex items-start gap-3 shadow-md animate-slideDown">
              <div className="p-1.5 bg-emerald-500 rounded-xl">
                <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800">{success}</p>
              </div>
            </div>
          )}

          {/* Enhanced Send Button with Gradient and Animation */}
          <button
            onClick={handleSendNotification}
            disabled={sending || !isFormValid()}
            className={`w-full py-4 rounded-2xl font-extrabold flex items-center justify-center gap-3 transition-all duration-300 text-base ${
              sending || !isFormValid()
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 active:translate-y-0'
            }`}
          >
            {sending ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Message to {selectedArtisans.length} Artisan{selectedArtisans.length !== 1 ? 's' : ''}
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Footer Note */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" />
              All messages are securely delivered and tracked
            </p>
          </div>
        </div>
      </div>

      {/* Notification Detail Modal */}
      {renderNotificationDetail()}
    </div>
  );
};

export default ArtisanMessaging;