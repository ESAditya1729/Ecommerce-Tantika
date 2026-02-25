import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Download,
  Printer,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
  X,
  ChevronDown,
  Edit,
} from "lucide-react";
import axios from "axios";
import OrderDetailsModal from "../Modals/OrderDetailsModal";
import QuickStats from "./Order-Management/QuickStats";
import OrderFilters from "./Order-Management/OrderFilters";
import OrderTable from "./Order-Management/OrderTable";

// API Base URL - Make it configurable
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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
  const fetchInProgress = useRef(false);
  // const initialFetchDone = useRef(false);
  const loadingTimeoutRef = useRef(null);

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
    return user?.role === "admin" || user?.role === "superAdmin";
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
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    if (loading && initialLoad) {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      loadingTimeoutRef.current = setTimeout(() => {
        if (isMounted.current && loading) {
          console.warn('Loading timeout - forcing reset');
          setLoading(false);
          setInitialLoad(false);
          setError('Loading timeout. Please refresh the page.');
          fetchInProgress.current = false;
        }
      }, 15000);
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [loading, initialLoad]);

  // Verify admin access
  useEffect(() => {
    const token = getAuthToken();
    const user = getCurrentUser();

    if (!token || !user || !isCurrentUserAdmin()) {
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
        `${API_BASE_URL}/orders/admin/summary/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000
        }
      );

      if (isMounted.current && response.data?.success) {
        setDashboardStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
    }
  }, []);

  // Transform backend order to frontend format
  const transformOrder = (backendOrder) => {
    if (!backendOrder) return null;

    const firstItem = backendOrder.items && backendOrder.items.length > 0 
      ? backendOrder.items[0] 
      : null;

    const totalItems = backendOrder.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

    const artisanName = firstItem?.artisanName || 
                       firstItem?.artisan?.businessName || 
                       'Unknown';

    return {
      _id: backendOrder._id,
      id: backendOrder.id || backendOrder._id,
      orderNumber: backendOrder.orderNumber || 'N/A',
      status: backendOrder.status || 'pending',
      createdAt: backendOrder.createdAt,
      updatedAt: backendOrder.updatedAt,
      
      customerDetails: {
        name: backendOrder.customer?.name || 'N/A',
        email: backendOrder.customer?.email || '',
        phone: backendOrder.customer?.phone || '',
        address: backendOrder.customer?.shippingAddress || {},
        shippingAddress: backendOrder.customer?.shippingAddress || {},
        billingAddress: backendOrder.customer?.billingAddress || {},
        message: backendOrder.customer?.message || ''
      },
      
      customerName: backendOrder.customer?.name || 'N/A',
      customerEmail: backendOrder.customer?.email || '',
      customerPhone: backendOrder.customer?.phone || '',
      
      productName: firstItem?.name || (backendOrder.items?.length > 1 ? 'Multiple Items' : 'No items'),
      productPrice: firstItem?.price || 0,
      productImage: firstItem?.image || '',
      quantity: firstItem?.quantity || 0,
      itemsCount: backendOrder.items?.length || 0,
      totalQuantity: totalItems,
      
      artisan: artisanName,
      artisanName: artisanName,
      artisanId: firstItem?.artisan?._id || null,
      
      paymentMethod: backendOrder.payment?.method || 'cod',
      paymentStatus: backendOrder.payment?.status || 'pending',
      payment: backendOrder.payment || {},
      isPaid: backendOrder.isPaid || false,
      
      shippingMethod: backendOrder.shipping?.method || 'standard',
      shippingCost: backendOrder.shippingCost || 0,
      shipping: backendOrder.shipping || {},
      
      total: backendOrder.total || 0,
      subtotal: backendOrder.subtotal || 0,
      tax: backendOrder.tax || 0,
      discount: backendOrder.discount || 0,
      currency: backendOrder.currency || 'INR',
      
      items: backendOrder.items || [],
      
      isDelivered: backendOrder.isDelivered || false,
      isCancelled: backendOrder.isCancelled || false,
      
      statusHistory: backendOrder.statusHistory || [],
      contactHistory: backendOrder.contactHistory || [],
      
      commission: backendOrder.commission || {},
      communicationPrefs: backendOrder.communicationPrefs || {},
      
      source: backendOrder.source || 'website',
      priority: backendOrder.priority || 'normal',
      tags: backendOrder.tags || [],
      notes: backendOrder.notes || [],
      
      customerAddress: backendOrder.customer?.shippingAddress || {},
      customerFullAddress: backendOrder.customerFullAddress || '',
      
      formattedDate: backendOrder.formattedDate || 
        (backendOrder.createdAt ? new Date(backendOrder.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) : 'N/A'),
      estimatedDeliveryDate: backendOrder.estimatedDeliveryDate || 'Not available'
    };
  };

  // Fetch orders - FIXED VERSION
  const fetchOrders = useCallback(async (skipLoadingState = false) => {
    // Prevent concurrent fetches
    if (fetchInProgress.current) return;
fetchInProgress.current = true;

    if (!isCurrentUserAdmin()) {
      setError("Admin access required. Please log in with an admin account.");
      setLoading(false);
      setInitialLoad(false);
      return;
    }

    // Set loading only if not skipped AND not already loading
    if (!skipLoadingState && !loading) {
      setLoading(true);
    }
    
    setError(null);
    fetchInProgress.current = true;

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication required. Please log in.");
        return;
      }

      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (filterStatusRef.current !== "all") {
        params.status = filterStatusRef.current;
      }
      if (searchTermRef.current) {
        params.search = searchTermRef.current;
      }

      const response = await axios.get(`${API_BASE_URL}/orders/admin/all`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15000
      });

      if (!isMounted.current) return;

      if (response.data?.success) {
        const responseData = response.data.data || {};
        const ordersData = responseData.orders || [];
        const pagination = responseData.pagination;

        const transformedOrders = ordersData.map(transformOrder).filter(Boolean);
        
        setOrders(transformedOrders);
        setFilteredOrders(transformedOrders);

        if (pagination) {
          setTotalPages(pagination.pages || 1);
          setTotalOrders(pagination.total || transformedOrders.length);
        } else {
          setTotalPages(1);
          setTotalOrders(transformedOrders.length);
        }

        // Don't await this - let it run in background
        fetchDashboardSummary().catch(console.error);
      } else {
        setError(response.data?.error || 'Failed to fetch orders');
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);

      if (!isMounted.current) return;

      let errorMessage = "Failed to connect to server. Please try again.";

      if (error.code === "ECONNABORTED") {
        errorMessage = "Connection timeout. Server took too long to respond.";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check if the backend server is running.";
      } else if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Session expired. Please log in again.";
        } else if (error.response.status === 403) {
          errorMessage = "You do not have permission to view orders.";
        } else if (error.response.status === 404) {
          errorMessage = "API endpoint not found. Please check server configuration.";
        } else {
          errorMessage = error.response.data?.error || "Failed to fetch orders";
        }
      }

      setError(errorMessage);
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setInitialLoad(false);
      }
      fetchInProgress.current = false;
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
  }, [currentPage, itemsPerPage, fetchDashboardSummary]);

  // Initial fetch - run only once
useEffect(() => {
  if (!isCurrentUserAdmin()) {
    setLoading(false);
    setInitialLoad(false);
    return;
  }

  fetchOrders(false);
}, [currentPage, fetchOrders]);

  // // Separate effect for page changes - ONLY trigger when currentPage changes
  // useEffect(() => {
  //   if (initialFetchDone.current && isCurrentUserAdmin() && !fetchInProgress.current) {
  //     fetchOrders(true);
  //   }
  // }, [currentPage, fetchOrders]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!isCurrentUserAdmin() || error) return;

    const interval = setInterval(() => {
      if (isMounted.current && !fetchInProgress.current && !loading) {
        fetchOrders(true);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchOrders, error, loading]);

  // Filter orders locally
  useEffect(() => {
    if (!orders.length) {
      setFilteredOrders([]);
      return;
    }

    let result = [...orders];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(term) ||
          order.customerName?.toLowerCase().includes(term) ||
          order.customerEmail?.toLowerCase().includes(term) ||
          order.customerPhone?.includes(term) ||
          order.productName?.toLowerCase().includes(term) ||
          order.artisanName?.toLowerCase().includes(term)
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((order) => order.status === filterStatus);
    }

    if (dateRange !== "all") {
      const now = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(now.getMonth() - 3);
          break;
        default:
          break;
      }
      
      result = result.filter(order => new Date(order.createdAt) >= startDate);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "priceHigh":
          return (b.total || 0) - (a.total || 0);
        case "priceLow":
          return (a.total || 0) - (b.total || 0);
        case "status":
          return (a.status || "").localeCompare(b.status || "");
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredOrders(result);
  }, [orders, searchTerm, filterStatus, dateRange, sortBy]);

  // Handlers - FIXED: Only update state, don't call fetchOrders directly
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetry = () => {
    setCurrentPage(1);
    setError(null);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
  };

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleUpdateStatus = async (orderId, newStatus, notes = "") => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await axios.put(
        `${API_BASE_URL}/orders/admin/${orderId}/status`,
        { status: newStatus, reason: notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? { ...order, status: newStatus }
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
        `${API_BASE_URL}/orders/admin/${orderId}/contact`,
        contactData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        alert("Contact history added successfully");
        fetchOrders(true);
      }
    } catch (error) {
      console.error("Error adding contact:", error);
      alert(`Failed to add contact: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleCancelOrder = async (orderId, reason = "Cancelled by admin") => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required");

      const response = await axios.put(
        `${API_BASE_URL}/orders/${orderId}/cancel`,
        { cancellationReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? { ...order, status: "cancelled" }
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
        `${API_BASE_URL}/orders/admin/bulk/update`,
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
        fetchOrders(true);
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
        `${API_BASE_URL}/orders/admin/export/all?${params.toString()}`,
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
    const phone = order.customerPhone || order.customerDetails?.phone;
    const name = order.customerName || order.customerDetails?.name;
    
    if (!phone) {
      alert("Customer phone number not available");
      return;
    }

    const message = `Hello ${name}, this is তন্তিকা regarding your order ${order.orderNumber}. How can we help you today?`;
    const phoneNumber = phone.replace(/\D/g, "");
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
                    ${order.customerName || ""}<br>
                    <small>${order.customerPhone || ""}</small>
                  </td>
                  <td>${order.productName || ""}</td>
                  <td>₹${(order.total || 0).toLocaleString('en-IN')}</td>
                  <td><span class="status status-${order.status || "pending"}">${order.status || "pending"}</span></td>
                  <td>${order.paymentStatus || "pending"}</td>
                  <td>${order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : ""}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="total">
            <p><strong>Summary:</strong></p>
            <p>Total Orders: ${filteredOrders.length}</p>
            <p>Total Value: ₹${filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0).toLocaleString('en-IN')}</p>
            <p>Pending Orders: ${filteredOrders.filter((o) => o.status === "pending").length}</p>
            <p>Delivered Orders: ${filteredOrders.filter((o) => o.status === "delivered").length}</p>
          </div>
          <div class="footer">
            <p>This is a system generated report from তন্তিকা Admin Panel</p>
          </div>
        </html>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
    if (orderId === 'all') {
      if (selectedOrders.length === filteredOrders.length) {
        setSelectedOrders([]);
      } else {
        setSelectedOrders(filteredOrders.map((order) => order._id));
      }
    } else {
      setSelectedOrders((prev) =>
        prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
      );
    }
  };

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
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
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  // Error state without loading
  if (error && !loading) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-red-800 mb-2">Error Loading Orders</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
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
      {error && !loading && (
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
          onSearchChange={handleFilterChange(setSearchTerm)}
          filterStatus={filterStatus}
          onStatusFilter={handleFilterChange(setFilterStatus)}
          dateRange={dateRange}
          onDateRangeChange={handleFilterChange(setDateRange)}
          sortBy={sortBy}
          onSortChange={handleFilterChange(setSortBy)}
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
            totalOrders: orders.length,
            pending: pendingOrders,
            contacted: contactedOrders,
            confirmed: confirmedOrders,
            processing: processingOrders,
            shipped: shippedOrders,
            delivered: deliveredOrders,
            cancelled: cancelledOrders,
            totalRevenue,
            avgOrderValue,
            todayOrders: dashboardStats?.todayOrders || 0
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
              There are no orders to display at the moment. New orders will appear here when customers place orders.
            </p>
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