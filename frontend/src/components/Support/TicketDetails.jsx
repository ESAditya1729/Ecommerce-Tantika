// frontend/src/components/Support/TicketDetails.jsx
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  User,
  Shield,
  Download
} from 'lucide-react';
import axios from 'axios';
import RatingModal from './RatingModal';

const TicketDetails = ({ ticket, onBack, onUpdate }) => {
  const [ticketData, setTicketData] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
  }, [ticket.ticketId]);

  const fetchTicketDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/support/${ticket.ticketId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setTicketData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/support/${ticket.ticketId}/message`,
        {
          message: newMessage,
          attachments: [] // Implement file upload separately
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNewMessage('');
        setAttachments([]);
        fetchTicketDetails();
        onUpdate();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/support/${ticket.ticketId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setShowCloseConfirm(false);
        fetchTicketDetails();
        onUpdate();
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
    }
  };

  const handleReopenTicket = async () => {
    const reason = window.prompt('Please provide a reason for reopening this ticket:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/support/${ticket.ticketId}/reopen`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        fetchTicketDetails();
        onUpdate();
      }
    } catch (error) {
      console.error('Error reopening ticket:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      reopened: 'bg-orange-100 text-orange-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return badges[priority] || 'bg-gray-100 text-gray-600';
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!ticketData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-100">
      {/* Header */}
      <div className="p-6 border-b border-amber-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-amber-50 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5 text-amber-600" />
            </button>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  {ticketData.ticketId}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadge(ticketData.priority)}`}>
                  {ticketData.priority}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(ticketData.status)}`}>
                  {ticketData.status.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">{ticketData.subject}</h2>
              <p className="text-sm text-gray-500">
                {ticketData.category.replace(/_/g, ' ')} • Created {formatDateTime(ticketData.createdAt)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {ticketData.status === 'closed' && (
              <button
                onClick={handleReopenTicket}
                className="px-4 py-2 border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50 transition"
              >
                Reopen Ticket
              </button>
            )}
            {['open', 'in_progress', 'reopened'].includes(ticketData.status) && (
              <button
                onClick={() => setShowCloseConfirm(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
              >
                Close Ticket
              </button>
            )}
            {ticketData.status === 'closed' && !ticketData.satisfaction && (
              <button
                onClick={() => setShowRatingModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Rate Support
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Close Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Close Ticket</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to close this ticket? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="px-4 py-2 border border-amber-200 rounded-lg text-gray-600 hover:bg-amber-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseTicket}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          ticketId={ticketData.ticketId}
          onClose={() => setShowRatingModal(false)}
          onSubmit={() => {
            setShowRatingModal(false);
            fetchTicketDetails();
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Conversation Thread */}
        <div className="lg:col-span-2 p-6 border-r border-amber-100">
          <h3 className="font-semibold text-gray-800 mb-4">Conversation</h3>
          
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {ticketData.conversations?.map((conv, index) => (
              <div
                key={index}
                className={`flex ${conv.senderRole === 'admin' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    conv.senderRole === 'admin'
                      ? 'bg-amber-50 text-gray-800'
                      : conv.isSystemMessage
                      ? 'bg-gray-100 text-gray-500 italic'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {!conv.isSystemMessage && (
                    <div className="flex items-center space-x-1 mb-1">
                      {conv.senderRole === 'admin' ? (
                        <Shield className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      <span className="text-xs font-medium">
                        {conv.senderName || (conv.senderRole === 'admin' ? 'Support Team' : 'You')}
                      </span>
                      {conv.isInternal && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-1 rounded">Internal</span>
                      )}
                    </div>
                  )}
                  <p className={`text-sm ${conv.isSystemMessage ? 'italic' : ''}`}>{conv.message}</p>
                  {conv.attachments?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {conv.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-xs bg-white bg-opacity-20 rounded p-1 hover:bg-opacity-30"
                        >
                          <Paperclip className="h-3 w-3 mr-1" />
                          {att.fileName}
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="text-xs mt-1 opacity-70">
                    {formatDateTime(conv.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          {['open', 'in_progress', 'reopened'].includes(ticketData.status) && (
            <div className="mt-4">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows="3"
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={loading || (!newMessage.trim() && attachments.length === 0)}
                  className="p-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="mt-2">
                <label className="cursor-pointer flex items-center text-sm text-amber-600 hover:text-amber-700">
                  <Paperclip className="h-4 w-4 mr-1" />
                  Attach files
                  <input type="file" multiple className="hidden" />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Ticket Details Sidebar */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Ticket Details</h3>
          
          <div className="space-y-4">
            {/* Contact Info */}
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-xs text-amber-600 mb-1">Contact Information</p>
              <p className="font-medium text-gray-800">{ticketData.contactInfo?.name}</p>
              <p className="text-sm text-gray-600">{ticketData.contactInfo?.email}</p>
              <p className="text-sm text-gray-600">{ticketData.contactInfo?.phone}</p>
            </div>

            {/* Timestamps */}
            <div>
              <p className="text-xs text-gray-400 mb-1">Created</p>
              <p className="text-sm text-gray-800">{formatDateTime(ticketData.createdAt)}</p>
            </div>

            {ticketData.resolvedAt && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Resolved</p>
                <p className="text-sm text-gray-800">{formatDateTime(ticketData.resolvedAt)}</p>
              </div>
            )}

            {ticketData.resolutionTime && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Resolution Time</p>
                <p className="text-sm text-gray-800">{ticketData.resolutionTime} hours</p>
              </div>
            )}

            {/* Assigned To */}
            {ticketData.assignedTo && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Assigned To</p>
                <p className="text-sm text-gray-800">{ticketData.assignedTo.username}</p>
              </div>
            )}

            {/* Resolution */}
            {ticketData.resolution && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Resolution</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {ticketData.resolution}
                </p>
              </div>
            )}

            {/* Satisfaction Rating */}
            {ticketData.satisfaction && (
              <div className="border-t border-amber-100 pt-4">
                <p className="text-xs text-gray-400 mb-2">Your Rating</p>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= ticketData.satisfaction.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                {ticketData.satisfaction.feedback && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    "{ticketData.satisfaction.feedback}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;