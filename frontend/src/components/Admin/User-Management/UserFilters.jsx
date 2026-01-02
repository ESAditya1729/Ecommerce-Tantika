// components/users/UserFilters.jsx
import React, { useState, useRef } from 'react';
import { Search } from 'lucide-react';

const UserFilters = ({
  onSearch,
  onRoleFilter,
  onStatusFilter,
  onLocationFilter,
  currentFilters = {}
}) => {
  const [searchTerm, setSearchTerm] = useState(currentFilters.search || '');
  const [role, setRole] = useState(currentFilters.role || 'all');
  const [status, setStatus] = useState(currentFilters.status || 'all');
  const [location, setLocation] = useState(currentFilters.location || 'all');

  const searchTimeoutRef = useRef(null);

  /* =========================
     SEARCH (DEBOUNCED, SAFE)
     ========================= */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!onSearch) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  };

  /* =========================
     DROPDOWN HANDLERS
     ========================= */
  const handleRoleChange = (e) => {
    const value = e.target.value;
    setRole(value);
    onRoleFilter?.(value);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatus(value);
    onStatusFilter?.(value);
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    onLocationFilter?.(value);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* SEARCH */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Users
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by name, email or phone..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ROLE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={handleRoleChange}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* STATUS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={handleStatusChange}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* LOCATION */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            value={location}
            onChange={handleLocationChange}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="all">All Locations</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Chennai">Chennai</option>
          </select>
        </div>

      </div>
    </div>
  );
};

export default React.memo(UserFilters);
