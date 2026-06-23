// src/components/Admin/OfferManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  AlertCircle,
  Tag,
  RefreshCw,
  Gift,
  Layers,
} from "lucide-react";
import axios from "axios";
import OfferCard from "./Offer-Management/OfferCard";
import OfferFilters from "./Offer-Management/OfferFilters";
import OfferSummaryCards from "./Offer-Management/OfferSummaryCards";
import CreateOfferModal from "./Offer-Management/CreateOfferModal";
import EditOfferModal from "./Offer-Management/EditOfferModal";
import DeleteConfirmationModal from "./Offer-Management/DeleteConfirmationModal";
import ViewOfferModal from "./Offer-Management/ViewOfferModal";
import CategoryDiscountModal from "./Offer-Management/CategoryDiscountModal";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("tantika_token") ||
    sessionStorage.getItem("tantika_token");

  if (!token) return { "Content-Type": "application/json" };

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const OfferManagement = () => {
  // State management
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [offerTypes, setOfferTypes] = useState(["all"]);

  // Summary stats - Updated for product-based discounts
  const [summaryStats, setSummaryStats] = useState({
    totalProducts: 0,
    avgDiscountValue: 0,
    maxDiscountValue: 0,
    minDiscountValue: 0,
    totalDiscountedValue: 0,
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCategoryDiscountModal, setShowCategoryDiscountModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [editingOffer, setEditingOffer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    count: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    offerType: "all",
    isActive: "all",
    dateRange: "all",
  });

  // ==================== DATA FETCHING ====================

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      // Add pagination
      params.append("page", pagination.currentPage);
      params.append("limit", pagination.itemsPerPage);

      // Add search filter
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      // Add category filter
      if (selectedType !== "all") {
        params.append("category", selectedType);
      }

      // Add status filters
      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status);
      }

      // Add discount type filter
      if (filters.offerType && filters.offerType !== "all") {
        params.append("discountType", filters.offerType);
      }

      if (filters.isActive && filters.isActive !== "all") {
        params.append("isActive", filters.isActive === "active");
      }

      console.log("Fetching offers with params:", params.toString());

      const response = await axios.get(`${API_BASE_URL}/offers?${params}`, {
        headers: getAuthHeaders(),
      });

      console.log("Offers response:", response.data);

      if (response.data.success) {
        const offersData = response.data.data || [];

        // The data is products with discount fields
        setOffers(offersData);

        // Update pagination
        setPagination((prev) => ({
          ...prev,
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1,
          totalItems: response.data.total || 0,
          count: offersData.length,
        }));

        // Update summary stats - Using the stats from the API response
        if (response.data.stats) {
          setSummaryStats({
            totalProducts: response.data.stats.totalProducts || 0,
            avgDiscountValue: response.data.stats.avgDiscountValue || 0,
            maxDiscountValue: response.data.stats.maxDiscountValue || 0,
            minDiscountValue: response.data.stats.minDiscountValue || 0,
            totalDiscountedValue: response.data.stats.totalDiscountedValue || 0,
          });
        }
      } else {
        throw new Error(response.data.message || "Failed to fetch offers");
      }
    } catch (err) {
      console.error("Error fetching offers:", err);

      let errorMessage = "Failed to load offers. Please try again.";
      if (err.response?.status === 401) {
        errorMessage = "Session expired. Please log in again.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.currentPage,
    pagination.itemsPerPage,
    searchTerm,
    selectedType,
    filters,
  ]);

  // Fetch categories for filter dropdown
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/categories`, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        const categoriesData = response.data.data || response.data.categories || [];
        const uniqueCategories = [...new Set(categoriesData.map((cat) =>
          typeof cat === "string" ? cat : cat.name || "Unknown"
        ))];
        setOfferTypes(["all", ...uniqueCategories]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setOfferTypes(["all"]);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchOffers();
    fetchCategories();
  }, [fetchOffers, fetchCategories]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOffers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedType, filters, pagination.currentPage, fetchOffers]);

  // ==================== FILTER & PAGINATION HANDLERS ====================

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleClearAll = () => {
    setSearchTerm("");
    setSelectedType("all");
    setFilters({
      status: "all",
      offerType: "all",
      isActive: "all",
      dateRange: "all",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // ==================== OFFER CRUD OPERATIONS ====================

  const handleCreateOffer = async (offerData) => {
    try {
      setActionLoading(true);

      console.log("Creating offer with data:", offerData);

      const response = await axios.post(`${API_BASE_URL}/offers`, offerData, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        fetchOffers();
        setShowCreateModal(false);
        alert(response.data.message || "Offer created successfully!");
      }
    } catch (err) {
      console.error("Error creating offer:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create offer",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateOffer = async (offerData) => {
    try {
      setActionLoading(true);

      if (!editingOffer?._id) {
        alert("No offer selected for update");
        return;
      }

      console.log("Updating offer:", editingOffer._id, offerData);

      const response = await axios.put(
        `${API_BASE_URL}/offers/${editingOffer._id}`,
        offerData,
        { headers: getAuthHeaders() },
      );

      if (response.data.success) {
        fetchOffers();
        setEditingOffer(null);
        setShowEditModal(false);
        alert(response.data.message || "Offer updated successfully!");
      }
    } catch (err) {
      console.error("Error updating offer:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update offer",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOffer = async () => {
    try {
      setActionLoading(true);

      if (!selectedOffer?._id) {
        alert("No offer selected for deletion");
        return;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/offers/${selectedOffer._id}`,
        { headers: getAuthHeaders() },
      );

      if (response.data.success) {
        fetchOffers();
        setSelectedOffer(null);
        setShowDeleteModal(false);
        alert(response.data.message || "Offer deleted successfully!");
      }
    } catch (err) {
      console.error("Error deleting offer:", err);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete offer",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleOffer = async (productId, currentStatus) => {
    try {
      setActionLoading(true);

      const response = await axios.put(
        `${API_BASE_URL}/offers/${productId}/toggle`,
        { isActive: !currentStatus },
        { headers: getAuthHeaders() },
      );

      if (response.data.success) {
        fetchOffers();
        alert(
          `Discount ${!currentStatus ? "activated" : "deactivated"} successfully!`,
        );
      }
    } catch (err) {
      console.error("Error toggling offer:", err);
      alert(err.response?.data?.message || "Failed to toggle discount status");
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== CATEGORY DISCOUNT HANDLERS ====================

  const handleApplyCategoryDiscount = async (discountData) => {
    try {
      setActionLoading(true);
      
      console.log("Applying category discount with data:", discountData);

      const response = await axios.post(
        `${API_BASE_URL}/offers/category`,
        discountData,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        fetchOffers();
        setShowCategoryDiscountModal(false);
        alert(response.data.message || "Category discount applied successfully!");
      }
    } catch (err) {
      console.error("Error applying category discount:", err);
      alert(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to apply category discount"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveCategoryDiscount = async (category) => {
    if (!category) {
      alert("Please select a category to remove discounts from");
      return;
    }

    if (!window.confirm(`Are you sure you want to remove all discounts from the "${category}" category?`)) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await axios.delete(
        `${API_BASE_URL}/offers/category/${encodeURIComponent(category)}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        fetchOffers();
        alert(response.data.message || "Category discounts removed successfully!");
      }
    } catch (err) {
      console.error("Error removing category discount:", err);
      alert(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to remove category discounts"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== MODAL HANDLERS ====================

  const handleEditClick = (product) => {
    // The product should have a discount field
    if (!product.discount || product.discount.type === "none") {
      alert("This product does not have a discount to edit.");
      return;
    }
    setEditingOffer(product);
    setShowEditModal(true);
  };

  const handleDeleteClick = (offer) => {
    setSelectedOffer(offer);
    setShowDeleteModal(true);
  };

  const handleViewClick = (offer) => {
    setSelectedOffer(offer);
    setShowViewModal(true);
  };

  const handleRefresh = () => {
    fetchOffers();
    fetchCategories();
  };

  // Quick filter handlers
  const handleQuickFilter = (filterType) => {
    const newFilters = { ...filters };

    switch (filterType) {
      case "active":
        newFilters.isActive = "active";
        newFilters.status = "all";
        break;
      case "scheduled":
        newFilters.status = "scheduled";
        newFilters.isActive = "inactive";
        break;
      case "expired":
        newFilters.status = "expired";
        newFilters.isActive = "all";
        break;
      default:
        break;
    }

    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fadeIn">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-2 p-1 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-red-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
              <Tag className="w-8 h-8 mr-3 text-blue-600" />
              Discount Management
            </h1>
            <button
              onClick={handleRefresh}
              disabled={loading || actionLoading}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <p className="text-gray-600 mt-1">
            Manage product discounts and promotions
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              Showing {pagination.count} of {pagination.totalItems} discounted products
            </span>
            {pagination.totalPages > 1 && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Discount Button */}
          <button
            onClick={() => setShowCategoryDiscountModal(true)}
            className="flex items-center px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
            disabled={actionLoading}
          >
            <Layers className="w-5 h-5 mr-2" />
            Category Discount
          </button>

          {/* Product Discount Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
            disabled={actionLoading}
          >
            <Plus className="w-5 h-5 mr-2" />
            Product Discount
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8">
        <OfferSummaryCards stats={summaryStats} />
      </div>

      {/* Quick Filter Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleQuickFilter("active")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            filters.isActive === "active"
              ? "bg-green-600 text-white"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          Active Discounts
        </button>
        <button
          onClick={() => handleQuickFilter("scheduled")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            filters.status === "scheduled"
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          Scheduled
        </button>
        <button
          onClick={() => handleQuickFilter("expired")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            filters.status === "expired"
              ? "bg-red-600 text-white"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          }`}
        >
          Expired
        </button>
      </div>

      {/* Filters Section */}
      <div className="mb-8">
        <OfferFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          offerTypes={offerTypes}
          filters={filters}
          onFilterChange={handleFilterChange}
          filteredOffersCount={offers.length}
          loading={loading}
          onResetFilters={handleClearAll}
          onRemoveCategoryDiscount={handleRemoveCategoryDiscount}
        />
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-500">Loading discounts...</p>
        </div>
      ) : !offers || offers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No discounts found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm ||
            selectedType !== "all" ||
            Object.values(filters).some((f) => f !== "all")
              ? "No products match your current filters. Try adjusting your search criteria."
              : "You haven't created any discounts yet. Start by adding a discount to a product or category!"}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Product Discount
            </button>
            <button
              onClick={() => setShowCategoryDiscountModal(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Layers className="w-5 h-5 mr-2" />
              Category Discount
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {offers.map((offer) => (
              <OfferCard
                key={offer._id}
                offer={offer}
                onEdit={() => handleEditClick(offer)}
                onDelete={() => handleDeleteClick(offer)}
                onView={() => handleViewClick(offer)}
                onToggle={() => handleToggleOffer(offer._id, offer.discount?.isActive)}
                actionLoading={actionLoading}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-4 mt-8">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center flex-wrap gap-2">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (
                      pagination.currentPage >=
                      pagination.totalPages - 2
                    ) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          pagination.currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
              </div>

              <span className="text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <CreateOfferModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateOffer}
        loading={actionLoading}
      />

      <EditOfferModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingOffer(null);
        }}
        offer={editingOffer}
        onSubmit={handleUpdateOffer}
        loading={actionLoading}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedOffer(null);
        }}
        onConfirm={handleDeleteOffer}
        offer={selectedOffer}
        loading={actionLoading}
      />

      <ViewOfferModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedOffer(null);
        }}
        offer={selectedOffer}
      />

      <CategoryDiscountModal
        isOpen={showCategoryDiscountModal}
        onClose={() => setShowCategoryDiscountModal(false)}
        onSubmit={handleApplyCategoryDiscount}
        loading={actionLoading}
      />
    </div>
  );
};

export default OfferManagement;