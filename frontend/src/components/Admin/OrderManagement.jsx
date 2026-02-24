import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Download,
  Printer,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
  MessageSquare,
  Truck,
  Package,
  CheckCircle,
  X,
  ChevronDown,
  Edit,
} from "lucide-react";
import axios from "axios";
import OrderDetailsModal from "../Modals/OrderDetailsModal";
import QuickStats from "./Order-Management/QuickStats";
import OrderFilters from "./Order-Management/OrderFilters";
import OrderTable from "./Order-Management/OrderTable";

// API Base URL - Production endpoint
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://ecommerce-tantika.onrender.com/api";

const OrderManagement = () => {
  // State
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [exportFormat, setExportFormat] = useState("json");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [itemsPerPage] = useState(20);

  // Refs
  const filterStatusRef = useRef(filterStatus);
  const searchTermRef = useRef(searchTerm);
  const dateRangeRef = useRef(dateRange);
  const isMounted = useRef(true);

  // Auth helpers
  const getAuthToken = () => localStorage.getItem("tantika_token");

  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("tantika_user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const isCurrentUserAdmin = () => {
    const user = getCurrentUser();
    return user?.role === "admin";
  };

  // Update refs
  useEffect(() => {
    filterStatusRef.current = filterStatus;
    searchTermRef.current = searchTerm;
    dateRangeRef.current = dateRange;
  }, [filterStatus, searchTerm, dateRange]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Verify admin access
  useEffect(() => {
    const token = getAuthToken();
    const user = getCurrentUser();

    if (!token || !user || user.role !== "admin") {
      setError("Admin access required. Please log in with an admin account.");
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  // Fetch dashboard summary
  const fetchDashboardSummary = useCallback(async () => {
    if (!isCurrentUserAdmin()) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get(
        `${API_BASE_URL}/orders/summary/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (isMounted.current && response.data?.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
    }
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!isCurrentUserAdmin()) {
      setError("Admin access required. Please log in with an admin account.");
      setLoading(false);
      setInitialLoad(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      // Apply filters
      if (filterStatusRef.current !== "all") {
        params.status = filterStatusRef.current;
      }
      if (searchTermRef.current) {
        params.search = searchTermRef.current;
      }

      // Date range filtering
      if (dateRangeRef.current !== "all") {
        const today = new Date();
        const startDate = new Date();

        switch (dateRangeRef.current) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(today.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(today.getMonth() - 1);
            break;
          case "quarter":
            startDate.setMonth(today.getMonth() - 3);
            break;
          default:
            break;
        }

        if (startDate) {
          params.startDate = startDate.toISOString();
          params.endDate = today.toISOString();
        }
      }

      const response = await axios.get(`${API_BASE_URL}/orders`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (isMounted.current && response.data?.success) {
        const ordersData = response.data.data?.orders || [];
        const pagination = response.data.data?.pagination;

        setOrders(ordersData);
        setFilteredOrders(ordersData);

        if (pagination) {
          setTotalPages(pagination.pages || 1);
          setTotalOrders(pagination.total || ordersData.length);
        }

        await fetchDashboardSummary();
      }
    } catch (error) {
      console.error("Error fetching orders:", error);

      if (isMounted.current) {
        let errorMessage = "Failed to connect to server. Please try again.";

        if (error.code === "ERR_NETWORK") {
          errorMessage = "Network error: Cannot connect to the server.";
        } else if (error.response) {
          if (error.response.status === 401) {
            errorMessage = "Session expired. Please log in again.";
          } else if (error.response.status === 403) {
            errorMessage = "You do not have permission to view orders.";
          } else {
            errorMessage = error.response.data?.error || "Failed to fetch orders";
          }
        }

        setError(errorMessage);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  }, [currentPage, itemsPerPage, fetchDashboardSummary]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (isCurrentUserAdmin()) {
      fetchOrders();
    }

    const interval = setInterval(() => {
      if (isMounted.current && !error && isCurrentUserAdmin()) {
        fetchOrders();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchOrders, error]);

  // Filter orders locally
  useEffect(() => {
    if (!orders.length) {
      setFilteredOrders([]);
      return;
    }

    let result = [...orders];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(term) ||
          order.customerDetails?.name?.toLowerCase().includes(term) ||
          order.customerDetails?.email?.toLowerCase().includes(term) ||
          order.customerDetails?.phone?.includes(term) ||
          order.productName?.toLowerCase().includes(term) ||
          order.artisan?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter((order) => order.status === filterStatus);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "priceHigh":
          return (b.productPrice || 0) - (a.productPrice || 0);
        case "priceLow":
          return (a.productPrice || 0) - (b.productPrice || 0);
        case "status":
          return (a.status || "").localeCompare(b.status || "");
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredOrders(result);
  }, [orders, searchTerm, filterStatus, sortBy]);

  // Handlers
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetry = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId, newStatus, notes = "") => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await axios.put(
        `${API_BASE_URL}/orders/${orderId}/status`,
        { status: newStatus, adminNote: notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
              : order
          )
        );
        await fetchDashboardSummary();
        return response.data;
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(`Failed to update status: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleAddContact = async (orderId, contactData) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await axios.post(
        `${API_BASE_URL}/orders/${orderId}/contact`,
        contactData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        alert("Contact history added successfully");
        await fetchOrders();
      }
    } catch (error) {
      console.error("Error adding contact:", error);
      alert(`Failed to add contact: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleCancelOrder = async (orderId, reason = "Cancelled by admin", refundRequired = false) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await axios.put(
        `${API_BASE_URL}/orders/${orderId}/cancel`,
        { cancellationReason: reason, refundRequired },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? { ...order, status: "cancelled", paymentStatus: refundRequired ? "refunded" : order.paymentStatus }
              : order
          )
        );
        await fetchDashboardSummary();
        alert("Order cancelled successfully");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(`Failed to cancel order: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleBulkUpdate = async () => {
    if (!selectedOrders.length || !bulkAction) return;

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await axios.post(
        `${API_BASE_URL}/orders/bulk/update`,
        {
          orderIds: selectedOrders,
          action: "status",
          value: bulkAction,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        alert(`${selectedOrders.length} orders updated successfully`);
        setSelectedOrders([]);
        setShowBulkActions(false);
        await fetchOrders();
        await fetchDashboardSummary();
      }
    } catch (error) {
      console.error("Error in bulk update:", error);
      alert(`Failed to update orders: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleExportOrders = async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const params = new URLSearchParams({ format: exportFormat });
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (searchTerm) params.append("search", searchTerm);

      const response = await axios.get(
        `${API_BASE_URL}/orders/export/all?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: exportFormat === "csv" ? "blob" : "json",
        }
      );

      if (exportFormat === "csv") {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `orders_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
        const link = document.createElement("a");
        link.setAttribute("href", dataUri);
        link.setAttribute("download", `orders_${new Date().toISOString().split("T")[0]}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      alert("Orders exported successfully");
    } catch (error) {
      console.error("Error exporting orders:", error);
      alert("Failed to export orders");
    }
  };

  const handleContactCustomer = (order) => {
    if (!order.customerDetails?.phone) {
      alert("Customer phone number not available");
      return;
    }

    const message = `Hello ${order.customerDetails.name}, this is তন্তিকা regarding your order ${order.orderNumber}. How can we help you today?`;
    const phoneNumber = order.customerDetails.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");

    handleAddContact(order._id, {
      method: "whatsapp",
      notes: "Contacted via WhatsApp",
    }).catch(() => {});
  };

  const handlePrintOrders = () => {
    if (!filteredOrders.length) {
      alert("No orders to print");
      return;
    }

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Orders Report - তন্তিকা</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            .header { text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; }
            .status { padding: 4px 8px; border-radius: 12px; font-size: 12px; }
            .status-pending { background: #fff3cd; color: #856404; }
            .status-contacted { background: #d4edda; color: #155724; }
            .status-confirmed { background: #cce5ff; color: #004085; }
            .status-processing { background: #d1ecf1; color: #0c5460; }
            .status-shipped { background: #d6d8d9; color: #383d41; }
            .status-delivered { background: #d4edda; color: #155724; }
            .status-cancelled { background: #f8d7da; color: #721c24; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; padding: 10px; background: #f8f9fa; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>তন্তিকা - Orders Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Total Orders: ${filteredOrders.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders
                .map(
                  (order) => `
                <tr>
                  <td>${order.orderNumber || ""}</td>
                  <td>
                    ${order.customerDetails?.name || ""}<br>
                    <small>${order.customerDetails?.phone || ""}</small>
                  </td>
                  <td>${order.productName || ""}</td>
                  <td>₹${(order.productPrice || 0).toLocaleString()}</td>
                  <td><span class="status status-${order.status || "pending"}">${order.status || "pending"}</span></td>
                  <td>${order.paymentStatus || "pending"}</td>
                  <td>${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="total">
            <p><strong>Summary:</strong></p>
            <p>Total Orders: ${filteredOrders.length}</p>
            <p>Total Value: ₹${filteredOrders.reduce((sum, order) => sum + (order.productPrice || 0), 0).toLocaleString()}</p>
            <p>Pending Orders: ${filteredOrders.filter((o) => o.status === "pending").length}</p>
            <p>Delivered Orders: ${filteredOrders.filter((o) => o.status === "delivered").length}</p>
          </div>
          <div class="footer">
            <p>This is a system generated report from তন্তিকা Admin Panel</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setDateRange("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((order) => order._id));
    }
  };

  const handleToggleSelect = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + (order.productPrice || 0), 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const contactedOrders = orders.filter((o) => o.status === "contacted").length;
  const confirmedOrders = orders.filter((o) => o.status === "confirmed").length;
  const processingOrders = orders.filter((o) => o.status === "processing").length;
  const shippedOrders = orders.filter((o) => o.status === "shipped").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

  // Loading state
  if (initialLoad && loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
            {totalOrders > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Total: {totalOrders}
              </span>
            )}
          </div>
          <p className="text-gray-600">Manage customer orders and track status</p>
        </div>

        <div className="flex items-center space-x-3">
          {selectedOrders.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Edit className="w-5 h-5 mr-2" />
                Bulk Actions ({selectedOrders.length})
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {showBulkActions && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="p-3 border-b">
                    <p className="font-medium text-gray-700">Update Status</p>
                  </div>
                  <div className="p-2">
                    {[
                      "pending",
                      "contacted",
                      "confirmed",
                      "processing",
                      "shipped",
                      "delivered",
                      "cancelled",
                    ].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setBulkAction(status);
                          handleBulkUpdate();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        Mark as {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>

          <button
            onClick={handleExportOrders}
            disabled={loading || !filteredOrders.length}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Report
          </button>

          <button
            onClick={handlePrintOrders}
            disabled={loading || !filteredOrders.length}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <p className="font-medium text-red-800">Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-3 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4 inline mr-1" />
                Retry
              </button>
            </div>
            <button onClick={() => setError(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        <OrderFilters
          searchTerm={searchTerm}
          onSearchChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          filterStatus={filterStatus}
          onStatusFilter={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          dateRange={dateRange}
          onDateRangeChange={(e) => {
            setDateRange(e.target.value);
            setCurrentPage(1);
          }}
          sortBy={sortBy}
          onSortChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
          loading={loading}
          selectedCount={selectedOrders.length}
          onSelectAll={handleSelectAll}
          allSelected={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
        />

        <QuickStats
          orders={orders}
          onStatusFilter={setFilterStatus}
          loading={loading}
          stats={{
            pending: pendingOrders,
            contacted: contactedOrders,
            confirmed: confirmedOrders,
            processing: processingOrders,
            shipped: shippedOrders,
            delivered: deliveredOrders,
            cancelled: cancelledOrders,
            totalRevenue,
            avgOrderValue,
          }}
        />

        <OrderTable
          orders={filteredOrders}
          onViewDetails={setSelectedOrder}
          onContactCustomer={handleContactCustomer}
          onCancelOrder={handleCancelOrder}
          onUpdateStatus={handleUpdateStatus}
          loading={loading}
          selectedOrders={selectedOrders}
          onToggleSelect={handleToggleSelect}
        />

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {filteredOrders.length === 0 && orders.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No orders match your filters</p>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {orders.length === 0 && !error && !loading && (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              There are no orders to display at the moment. New orders will appear here when customers express interest in products.
            </p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Order Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2 text-blue-600" />
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-bold text-lg">{orders.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-bold text-yellow-600">{pendingOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Contacted</span>
                  <span className="font-bold text-blue-600">{contactedOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Confirmed</span>
                  <span className="font-bold text-green-600">{confirmedOrders}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-3 border-blue-200">
                  <span className="text-gray-600 font-medium">Total Revenue</span>
                  <span className="font-bold text-lg text-green-700">
                    ₹{totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg. Order Value</span>
                  <span className="font-bold">₹{avgOrderValue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const pending = orders.filter((o) => o.status === "pending");
                    if (pending.length) {
                      pending.forEach((order) => setTimeout(() => handleContactCustomer(order), 100));
                    } else {
                      alert("No pending orders to contact");
                    }
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center justify-center transition-colors"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Pending Customers
                </button>
                <button
                  onClick={() => {
                    const confirmed = orders.filter((o) => o.status === "confirmed");
                    alert(confirmed.length ? `Ready to process ${confirmed.length} confirmed orders.` : "No confirmed orders to process");
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center transition-colors"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Process Confirmed Orders
                </button>
                <button
                  onClick={() => {
                    const shipped = orders.filter((o) => o.status === "shipped");
                    alert(shipped.length ? `${shipped.length} orders in transit.` : "No orders in transit");
                  }}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center justify-center transition-colors"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Update Tracking
                </button>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-purple-600" />
                Status Distribution
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Delivered</span>
                    <span className="font-medium">{deliveredOrders}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${orders.length ? (deliveredOrders / orders.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Processing</span>
                    <span className="font-medium">{processingOrders + shippedOrders}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${orders.length ? ((processingOrders + shippedOrders) / orders.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pending/Contact</span>
                    <span className="font-medium">{pendingOrders + contactedOrders}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${orders.length ? ((pendingOrders + contactedOrders) / orders.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="pt-2 border-t border-purple-200">
                  <div className="flex justify-between text-sm">
                    <span>Today's Orders</span>
                    <span className="font-bold">{dashboardStats?.todayOrders || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleUpdateStatus}
          onAddContact={handleAddContact}
          onCancel={handleCancelOrder}
        />
      )}
    </div>
  );
};

export default OrderManagement;