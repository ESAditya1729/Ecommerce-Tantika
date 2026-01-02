// pages/UserManagement.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  UserPlus, 
  Users, 
  RefreshCw, 
  AlertCircle
} from "lucide-react";

import UserStats from "../Admin/User-Management/UserStats";
import UserFilters from "../Admin/User-Management/UserFilters";
import UserAvatar from "../Admin/User-Management/UserAvatar";
import RoleBadge from "../Admin/User-Management/RoleBadge";
import StatusBadge from "../Admin/User-Management/StatusBadge";
import UserActions from "../Admin/User-Management/UserAction";
import UserSegmentation from "../Admin/User-Management/UserSegmentation";
import ViewProfileModal from "../Modals/ViewProfileModal";
import EditProfileModal from "../Modals/EditProfileModal";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [segments, setSegments] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: "all",
    status: "all",
    location: "all",
    search: "",
  });
  
  // Modal states
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refs to prevent multiple calls
  const isFetching = useRef(false);
  const abortControllerRef = useRef(null);

  // Single fetch function for users
  const fetchUsers = useCallback(async () => {
    if (isFetching.current) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    isFetching.current = true;
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/users?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.data || data || []);
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }

      setError(err.message);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [filters]);

  // Fetch stats - runs once
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      setStats(data.data || data);
    } catch (err) {
      // Silent fail for stats
    }
  }, []);

  // Fetch segments - runs once
  const fetchSegments = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/segments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch segments");

      const data = await response.json();
      setSegments(data.data || data);
    } catch (err) {
      // Silent fail for segments
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadAllData = async () => {
      await fetchStats();
      await fetchSegments();
      await fetchUsers();
    };

    loadAllData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Effect to fetch users when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [filters, fetchUsers]);

  // Handler functions
  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleRoleFilter = (role) => {
    setFilters((prev) => ({ ...prev, role, page: 1 }));
  };

  const handleStatusFilter = (status) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handleLocationFilter = (location) => {
    setFilters((prev) => ({ ...prev, location, page: 1 }));
  };

  const handleSendEmail = async (user) => {
    window.location.href = `mailto:${user.email}`;
  };

  const handleMakeAdmin = async (user) => {
    if (!window.confirm(`Make ${user.name} an admin?`)) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "admin" }),
      });

      if (!response.ok) throw new Error("Failed to update role");

      alert("User role updated successfully");
      fetchUsers();
    } catch (err) {
      alert("Failed to update user role: " + err.message);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activate" : "deactivate";

    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.name}?`)) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      alert(`User ${action}d successfully`);
      fetchUsers();
    } catch (err) {
      alert(`Failed to ${action} user: ${err.message}`);
    }
  };

  // View Profile Handler
  const handleViewProfile = (user) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  // Edit Profile Handlers
  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = async (updatedUser) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/${updatedUser.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) throw new Error("Failed to update user");

      alert("User updated successfully");
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert("Failed to update user: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name} permanently?`)) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete user");

      alert("User deleted successfully");
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    }
  };

  const handleAddUser = () => {
    alert("Add new user functionality would open here.");
  };

  const handleRefresh = () => {
    Promise.all([fetchStats(), fetchSegments(), fetchUsers()]);
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Close modals
  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingUser(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">
            Manage registered users and their accounts
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="Refresh All Data"
            disabled={loading}
          >
            <RefreshCw
              className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={handleAddUser}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add New User
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Error: {error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Modals */}
      <ViewProfileModal
        user={viewingUser}
        isOpen={showViewModal}
        onClose={closeViewModal}
      />

      <EditProfileModal
        user={editingUser}
        isOpen={showEditModal}
        onClose={closeEditModal}
        onSave={handleSaveUser}
        isLoading={isSaving}
      />

      {/* Stats Cards */}
      <UserStats stats={stats} loading={loading || !stats} />

      {/* Filters */}
      <UserFilters
        onSearch={handleSearch}
        onRoleFilter={handleRoleFilter}
        onStatusFilter={handleStatusFilter}
        onLocationFilter={handleLocationFilter}
        currentFilters={filters}
      />

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="ml-4">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-gray-200 rounded"
                        ></div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserAvatar user={user} />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || user.username || "Unknown User"}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID:{" "}
                          {user.id
                            ? user.id.toString().slice(-4).padStart(4, "0")
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.email || "No email"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.phone || "No phone"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.location || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.orders || 0} orders
                    </div>
                    <div className="text-sm text-gray-500">
                      Joined:{" "}
                      {user.createdAt || user.joined
                        ? new Date(
                            user.createdAt || user.joined
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>
                    {user.lastActive && (
                      <div className="text-xs text-gray-500">
                        Last active:{" "}
                        {new Date(user.lastActive).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <UserActions
                      user={user}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                      onView={handleViewProfile}
                      onSendEmail={handleSendEmail}
                      onToggleStatus={handleToggleStatus}
                      onMakeAdmin={handleMakeAdmin}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Users className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No users found
                    </h3>
                    <p className="text-gray-500">
                      No users match your current filters
                    </p>
                    <button
                      onClick={() => {
                        setFilters({
                          page: 1,
                          limit: 10,
                          role: "all",
                          status: "all",
                          location: "all",
                          search: "",
                        });
                      }}
                      className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                      Reset filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {users.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page <= 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(filters.page + 1)}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(filters.page * filters.limit, users.length)}
                </span>{" "}
                of <span className="font-medium">{users.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  &larr;
                </button>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0">
                  Page {filters.page}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* User Segmentation */}
      <UserSegmentation segments={segments} loading={loading || !segments} />
    </div>
  );
};

export default UserManagement;