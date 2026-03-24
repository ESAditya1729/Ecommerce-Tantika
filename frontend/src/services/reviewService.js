// src/services/reviewService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: `${API_URL}/myreviews`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const reviewService = {
  // Get reviews for a specific target (product or artisan)
  getTargetReviews: (targetType, targetId, params = {}) => {
    return api.get(`/target/${targetType}/${targetId}`, { params });
  },

  // Get a single review
  getReview: (id) => {
    return api.get(`/${id}`);
  },

  // Create a new review
  createReview: (data) => {
    return api.post('/', data);
  },

  // Update a review
  updateReview: (id, data) => {
    return api.put(`/${id}`, data);
  },

  // Delete a review
  deleteReview: (id) => {
    return api.delete(`/${id}`);
  },

  // Mark review as helpful
  markHelpful: (id) => {
    return api.post(`/${id}/helpful`);
  },

  // Report a review
  reportReview: (id, data) => {
    return api.post(`/${id}/report`, data);
  },

  // Get current user's reviews
  getUserReviews: (params = {}) => {
    return api.get('/user/me', { params });
  },
};