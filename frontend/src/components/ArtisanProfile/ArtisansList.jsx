import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaMapMarkerAlt,
  FaSearch,
  FaFilter
} from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const ArtisansList = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    city: '',
    minRating: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchArtisans();
  }, [filters.page, filters.specialization, filters.city, filters.minRating]);

  const fetchArtisans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/artisan-profiles?${params.toString()}`
      );

      if (response.data.success) {
        setArtisans(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError('Failed to load artisans');
      console.error('Error fetching artisans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchArtisans();
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  if (loading && artisans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Our Artisans</h1>
          <p className="text-gray-600">
            Discover talented artisans and their unique handcrafted products
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search artisans by name, business, or specialty..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </form>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <FaFilter />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={filters.specialization}
                onChange={(e) => setFilters({ ...filters, specialization: e.target.value, page: 1 })}
              >
                <option value="">All Specializations</option>
                <option value="Sarees Weaving">Sarees Weaving</option>
                <option value="Pottery">Pottery</option>
                <option value="Jewelry Making">Jewelry Making</option>
                <option value="Wood Carving">Wood Carving</option>
                <option value="Textile Printing">Textile Printing</option>
                <option value="Embroidery">Embroidery</option>
              </select>

              <input
                type="text"
                placeholder="City"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value, page: 1 })}
              />

              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value, page: 1 })}
              >
                <option value="">Minimum Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Artisans Grid */}
        {artisans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No artisans found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artisans.map((artisan) => (
                <Link
                  key={artisan.id}
                  to={`/artisan/${artisan.id}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    {/* Artisan DP */}
                    <div className="flex justify-center mb-4">
                      {artisan.profilePicture ? (
                        <img
                          src={artisan.profilePicture}
                          alt={artisan.displayName}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                          <span className="text-3xl font-bold text-white">
                            {artisan.displayInitials}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Artisan Info */}
                    <h3 className="text-lg font-semibold text-gray-800 text-center mb-1">
                      {artisan.businessName || artisan.fullName}
                    </h3>
                    
                    {artisan.fullName && artisan.businessName && (
                      <p className="text-sm text-gray-500 text-center mb-2">
                        {artisan.fullName}
                      </p>
                    )}

                    {/* Rating */}
                    <div className="flex justify-center items-center gap-2 mb-2">
                      <div className="flex">
                        {renderRatingStars(artisan.rating)}
                      </div>
                      <span className="text-sm text-gray-500">
                        ({artisan.totalSales} sales)
                      </span>
                    </div>

                    {/* Location */}
                    {artisan.location?.city && (
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-3">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span>
                          {artisan.location.city}
                          {artisan.location.state && `, ${artisan.location.state}`}
                        </span>
                      </div>
                    )}

                    {/* Specializations */}
                    {artisan.specialization && artisan.specialization.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1 mb-3">
                        {artisan.specialization.slice(0, 2).map((spec, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-xs"
                          >
                            {spec}
                          </span>
                        ))}
                        {artisan.specialization.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{artisan.specialization.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex justify-between text-center pt-3 border-t">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {artisan.totalProducts}
                        </p>
                        <p className="text-xs text-gray-500">Products</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {artisan.yearsOfExperience}+
                        </p>
                        <p className="text-xs text-gray-500">Years</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {artisan.totalSales}
                        </p>
                        <p className="text-xs text-gray-500">Sales</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className={`px-4 py-2 rounded-lg ${
                    filters.page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {filters.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.pages}
                  className={`px-4 py-2 rounded-lg ${
                    filters.page === pagination.pages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ArtisansList;