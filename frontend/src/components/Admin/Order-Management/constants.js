// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Status configuration
export const STATUS_CONFIG = {
  pending: { 
    color: 'yellow', 
    bgColor: 'bg-yellow-100', 
    textColor: 'text-yellow-800',
    icon: '⏳', 
    label: 'Pending'
  },
  contacted: { 
    color: 'blue', 
    bgColor: 'bg-blue-100', 
    textColor: 'text-blue-800',
    icon: '📞', 
    label: 'Contacted'
  },
  confirmed: { 
    color: 'green', 
    bgColor: 'bg-green-100', 
    textColor: 'text-green-800',
    icon: '✓', 
    label: 'Confirmed'
  },
  processing: { 
    color: 'purple', 
    bgColor: 'bg-purple-100', 
    textColor: 'text-purple-800',
    icon: '🔄', 
    label: 'Processing'
  },
  shipped: { 
    color: 'indigo', 
    bgColor: 'bg-indigo-100', 
    textColor: 'text-indigo-800',
    icon: '🚚', 
    label: 'Shipped'
  },
  delivered: { 
    color: 'green', 
    bgColor: 'bg-green-100', 
    textColor: 'text-green-800',
    icon: '🎁', 
    label: 'Delivered'
  },
  cancelled: { 
    color: 'red', 
    bgColor: 'bg-red-100', 
    textColor: 'text-red-800',
    icon: '✗', 
    label: 'Cancelled'
  },
};

// Status flow
export const STATUS_FLOW = {
  pending: ['contacted', 'cancelled'],
  contacted: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

// Payment method configuration
export const PAYMENT_CONFIG = {
  cod: { color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800', label: 'COD' },
  card: { color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800', label: 'Card' },
  upi: { color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800', label: 'UPI' },
  netbanking: { color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-800', label: 'Net Banking' },
};

// Date range options
export const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
];

// Sort options
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'priceHigh', label: 'Price: High to Low' },
  { value: 'priceLow', label: 'Price: Low to High' },
];