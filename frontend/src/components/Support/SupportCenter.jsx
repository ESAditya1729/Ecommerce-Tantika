// frontend/src/components/Support/SupportCenter.jsx
import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MessageCircle,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import axios from 'axios';
import CreateTicket from './CreateTicket';
import TicketDetails from './TicketDetails';

const SupportCenter = () => {
  const [activeTab, setActiveTab] = useState('my-tickets');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTickets: 0
  });

  useEffect(() => {
    if (activeTab === 'my-tickets') {
      fetchTickets();
    }
  }, [activeTab, filters.page]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/support/my-tickets`,
        {
          params: {
            status: filters.status,
            page: filters.page,
            limit: filters.limit
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setTickets(response.data.data.tickets);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'open': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed': return <CheckCircle className="h-4 w-4 text-gray-500" />;
      case 'reopened': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <MessageCircle className="h-4 w-4 text-gray-500" />;
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LifeBuoy className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Help & Support Center</h1>
                <p className="text-amber-100">Get assistance with your queries and issues</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('create')}
              className="flex items-center px-4 py-2 bg-white text-amber-600 rounded-lg hover:bg-amber-50 transition"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'create' ? (
          <CreateTicket onBack={() => setActiveTab('my-tickets')} />
        ) : selectedTicket ? (
          <TicketDetails 
            ticket={selectedTicket} 
            onBack={() => setSelectedTicket(null)}
            onUpdate={fetchTickets}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 hover:bg-amber-50 rounded">
                    <span className="text-sm text-gray-600">Open Tickets</span>
                    <span className="font-semibold text-amber-600">
                      {tickets.filter(t => t.status === 'open').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-amber-50 rounded">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="font-semibold text-blue-600">
                      {tickets.filter(t => t.status === 'in_progress').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-amber-50 rounded">
                    <span className="text-sm text-gray-600">Resolved</span>
                    <span className="font-semibold text-green-600">
                      {tickets.filter(t => t.status === 'resolved').length}
                    </span>
                  </div>
                </div>

                <div className="border-t border-amber-100 my-4"></div>

                <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
                <div className="space-y-1">
                  {[
                    'product_issue',
                    'order_issue',
                    'payment_issue',
                    'technical_issue',
                    'account_issue',
                    'shipping_delivery',
                    'customization_request',
                    'artisan_application'
                  ].map(category => (
                    <button
                      key={category}
                      className="w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:bg-amber-50 rounded capitalize"
                    >
                      {category.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tickets List */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-amber-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">My Tickets</h2>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search tickets..."
                          className="pl-9 pr-4 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        className="px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">All Status</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tickets */}
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No tickets yet</h3>
                    <p className="text-gray-500 mb-4">Create your first support ticket to get help</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create New Ticket
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-amber-100">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.ticketId}
                        onClick={() => setSelectedTicket(ticket)}
                        className="p-4 hover:bg-amber-50 cursor-pointer transition"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                {ticket.ticketId}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadge(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(ticket.status)}`}>
                                {ticket.status.replace('_', ' ')}
                              </span>
                            </div>
                            <h3 className="font-medium text-gray-800 mb-1">{ticket.subject}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1">{ticket.category.replace(/_/g, ' ')}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="text-xs text-gray-400">{formatDate(ticket.createdAt)}</div>
                              {ticket.lastActivityAt && (
                                <div className="text-xs text-gray-400">
                                  Activity: {formatDate(ticket.lastActivityAt)}
                                </div>
                              )}
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {tickets.length > 0 && (
                  <div className="p-4 border-t border-amber-100 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {' '}
                      {Math.min(pagination.currentPage * pagination.limit, pagination.totalTickets)} of {' '}
                      {pagination.totalTickets} tickets
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                        disabled={filters.page === 1}
                        className="px-3 py-1 border border-amber-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                        disabled={filters.page === pagination.totalPages}
                        className="px-3 py-1 border border-amber-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportCenter;