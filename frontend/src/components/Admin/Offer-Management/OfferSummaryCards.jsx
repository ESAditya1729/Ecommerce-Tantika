// src/components/Admin/Offer-Management/OfferSummaryCards.jsx
import React from 'react';
import { Gift, Tag, TrendingUp, Clock, AlertCircle, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';

const OfferSummaryCards = ({ stats }) => {
  const cards = [
    {
      title: 'Discounted Products',
      value: stats?.totalProducts || 0,
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Avg Discount',
      value: stats?.avgDiscountValue ? `${stats.avgDiscountValue.toFixed(1)}%` : '0%',
      icon: Tag,
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-200',
    },
    {
      title: 'Max Discount',
      value: stats?.maxDiscountValue ? `${stats.maxDiscountValue}%` : '0%',
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-200',
    },
    {
      title: 'Total Value Saved',
      value: stats?.totalDiscountedValue ? `₹${stats.totalDiscountedValue.toLocaleString()}` : '₹0',
      icon: Gift,
      color: 'bg-red-50 text-red-600',
      borderColor: 'border-red-200',
    },
  ];

  // Add more stats from the response if available
  // Note: The stats from the API are derived from products with discounts

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-white rounded-xl border ${card.borderColor} p-4 shadow-sm hover:shadow-md transition-all duration-200`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            <div className={`p-2 rounded-lg ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OfferSummaryCards;