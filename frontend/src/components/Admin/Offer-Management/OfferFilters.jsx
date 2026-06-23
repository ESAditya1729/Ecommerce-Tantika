// src/components/Admin/Offer-Management/OfferFilters.jsx
import React from 'react';
import { Search, Filter, X, Calendar, Tag, ChevronDown } from 'lucide-react';

const OfferFilters = ({
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  offerTypes,
  filters,
  onFilterChange,
  filteredOffersCount,
  loading,
  onResetFilters,
}) => {
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const hasActiveFilters = () => {
    return (
      searchTerm ||
      selectedType !== 'all' ||
      filters.status !== 'all' ||
      filters.offerType !== 'all' ||
      filters.isActive !== 'all' ||
      filters.dateRange !== 'all'
    );
  };

  const getStatusOptions = () => {
    const options = [
      { value: 'all', label: 'All Statuses' },
      { value: 'draft', label: 'Draft' },
      { value: 'active', label: 'Active' },
      { value: 'paused', label: 'Paused' },
      { value: 'expired', label: 'Expired' },
      { value: 'cancelled', label: 'Cancelled' },
    ];
    return options;
  };

  const getActiveOptions = () => {
    return [
      { value: 'all', label: 'All' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ];
  };

  const getDateRangeOptions = () => {
    return [
      { value: 'all', label: 'All Time' },
      { value: 'today', label: 'Today' },
      { value: 'this_week', label: 'This Week' },
      { value: 'this_month', label: 'This Month' },
      { value: 'next_7_days', label: 'Next 7 Days' },
      { value: 'next_30_days', label: 'Next 30 Days' },
    ];
  };

  const renderSelect = (value, options, onChange, placeholder, icon) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <select
          value={value}
          onChange={onChange}
          className={`pl-${icon ? '9' : '4'} pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search offers by name, code, or description..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="lg:w-48">
          {renderSelect(
            selectedType,
            [{ value: 'all', label: 'All Types' }, ...offerTypes.map(type => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) }))],
            handleTypeChange,
            'All Types',
            <Tag className="w-4 h-4" />
          )}
        </div>

        {/* Status Filter */}
        <div className="lg:w-48">
          {renderSelect(
            filters.status,
            getStatusOptions(),
            (e) => handleFilterChange('status', e.target.value),
            'Status',
            <Filter className="w-4 h-4" />
          )}
        </div>

        {/* Active Status Filter */}
        <div className="lg:w-40">
          {renderSelect(
            filters.isActive,
            getActiveOptions(),
            (e) => handleFilterChange('isActive', e.target.value),
            'Active',
            null
          )}
        </div>

        {/* Date Range Filter */}
        <div className="lg:w-44">
          {renderSelect(
            filters.dateRange,
            getDateRangeOptions(),
            (e) => handleFilterChange('dateRange', e.target.value),
            'Date Range',
            <Calendar className="w-4 h-4" />
          )}
        </div>

        {/* Reset Button */}
        {hasActiveFilters() && (
          <button
            onClick={onResetFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
        <div>
          <span className="font-medium text-gray-700">{filteredOffersCount}</span>
          {loading && <span className="ml-2 text-gray-400">(Loading...)</span>}
        </div>
        <div className="flex items-center gap-4">
          {hasActiveFilters() && (
            <span className="text-xs text-blue-600">
              Active filters applied
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferFilters;