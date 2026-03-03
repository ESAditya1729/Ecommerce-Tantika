// frontend/src/components/Support/CreateTicket.jsx
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  X,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const CreateTicket = ({ onBack }) => {
  const [formData, setFormData] = useState({
    category: '',
    subCategory: '',
    subject: '',
    description: '',
    priority: 'medium',
    relatedTo: {
      orderId: '',
      productId: ''
    }
  });
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = [
    { value: 'product_issue', label: 'Product Issue' },
    { value: 'order_issue', label: 'Order Issue' },
    { value: 'payment_issue', label: 'Payment Issue' },
    { value: 'technical_issue', label: 'Technical Issue' },
    { value: 'account_issue', label: 'Account Issue' },
    { value: 'shipping_delivery', label: 'Shipping & Delivery' },
    { value: 'customization_request', label: 'Customization Request' },
    { value: 'artisan_application', label: 'Artisan Application' },
    { value: 'payout_issue', label: 'Payout Issue' },
    { value: 'verification_issue', label: 'Verification Issue' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'gray' },
    { value: 'medium', label: 'Medium', color: 'blue' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // For now, send as JSON (implement file upload separately)
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/support/create`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onBack();
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-100">
      {/* Header */}
      <div className="p-6 border-b border-amber-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-amber-50 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5 text-amber-600" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Create New Support Ticket</h2>
            <p className="text-sm text-gray-500">Fill in the details below and we'll get back to you soon</p>
          </div>
        </div>
      </div>

      {success ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Ticket Created Successfully!</h3>
          <p className="text-gray-500">Redirecting you back to your tickets...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {priorities.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sub Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub Category (Optional)
              </label>
              <input
                type="text"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                placeholder="e.g., Wrong size, Damaged product, etc."
                className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                maxLength="200"
                placeholder="Brief summary of your issue"
                className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                maxLength="5000"
                placeholder="Please provide detailed information about your issue..."
                className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.description.length}/5000 characters
              </p>
            </div>

            {/* Related Orders/Products (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Order ID (Optional)
                </label>
                <input
                  type="text"
                  name="relatedTo.orderId"
                  value={formData.relatedTo.orderId}
                  onChange={handleChange}
                  placeholder="e.g., ORD-12345"
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Product ID (Optional)
                </label>
                <input
                  type="text"
                  name="relatedTo.productId"
                  value={formData.relatedTo.productId}
                  onChange={handleChange}
                  placeholder="e.g., PRD-12345"
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (Optional)
              </label>
              <div className="border-2 border-dashed border-amber-200 rounded-lg p-4">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <Paperclip className="h-8 w-8 text-amber-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</span>
                </label>
              </div>

              {/* Attachment List */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-amber-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <Paperclip className="h-4 w-4 text-amber-500" />
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <span className="text-xs text-gray-400">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="p-1 hover:bg-amber-200 rounded"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 border border-amber-200 rounded-lg text-gray-600 hover:bg-amber-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Ticket
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateTicket;