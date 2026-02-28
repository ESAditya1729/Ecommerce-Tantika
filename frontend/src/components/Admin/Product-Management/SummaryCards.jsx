// SummaryCards.jsx (Modern Circular Design)
import React from 'react';
import { 
  Package, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  ShoppingBag,
  DollarSign,
  FileText,
  XCircle,
  TrendingDown,
  Award,
  Zap,
  Shield,
  Sparkles
} from 'lucide-react';

const SummaryCards = ({
  totalProducts = 0,        
  totalSales = 0,
  avgRating = 0,
  activeProducts = 0,
  outOfStockProducts = 0,
  pendingApprovalProducts = 0,
  lowStockProducts = 0,
  totalValue = 0,
  totalStock = 0,
  avgPrice = 0,
  minPrice = 0,
  maxPrice = 0,
  draftProducts = 0,
  rejectedProducts = 0
}) => {
  // Helper function to safely convert to number
  const toNumber = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Convert all values to numbers safely
  const safeTotalProducts = toNumber(totalProducts);
  const safeTotalSales = toNumber(totalSales);
  const safeAvgRating = toNumber(avgRating);
  const safeActiveProducts = toNumber(activeProducts);
  const safeOutOfStockProducts = toNumber(outOfStockProducts);
  const safePendingApprovalProducts = toNumber(pendingApprovalProducts);
  const safeLowStockProducts = toNumber(lowStockProducts);
  const safeTotalValue = toNumber(totalValue);
  const safeTotalStock = toNumber(totalStock);
  const safeAvgPrice = toNumber(avgPrice);
  const safeMinPrice = toNumber(minPrice);
  const safeMaxPrice = toNumber(maxPrice);
  const safeDraftProducts = toNumber(draftProducts);
  const safeRejectedProducts = toNumber(rejectedProducts);

  // Calculate percentages with safe values
  const activePercentage = safeTotalProducts > 0 
    ? Math.round((safeActiveProducts / safeTotalProducts) * 100) 
    : 0;
  
  const outOfStockPercentage = safeTotalProducts > 0 
    ? Math.round((safeOutOfStockProducts / safeTotalProducts) * 100) 
    : 0;
  
  const pendingPercentage = safeTotalProducts > 0 
    ? Math.round((safePendingApprovalProducts / safeTotalProducts) * 100) 
    : 0;

  const draftPercentage = safeTotalProducts > 0 
    ? Math.round((safeDraftProducts / safeTotalProducts) * 100) 
    : 0;

  const rejectedPercentage = safeTotalProducts > 0 
    ? Math.round((safeRejectedProducts / safeTotalProducts) * 100) 
    : 0;

  const lowStockPercentage = safeTotalProducts > 0 
    ? Math.round((safeLowStockProducts / safeTotalProducts) * 100) 
    : 0;

  // Get rating label
  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Great';
    if (rating >= 3.0) return 'Good';
    if (rating >= 2.0) return 'Fair';
    return 'Poor';
  };

  // Format currency safely
  const formatCurrency = (amount) => {
    const safeAmount = toNumber(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(safeAmount);
  };

  // Format number with commas safely
  const formatNumber = (num) => {
    const safeNum = toNumber(num);
    return new Intl.NumberFormat('en-IN').format(safeNum);
  };

  // Circular progress component
  const CircularProgress = ({ percentage, color, size = 40 }) => {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          <circle
            cx={size/2}
            cy={size/2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
          {percentage}%
        </div>
      </div>
    );
  };

  // Card component with circular design
  const Card = ({ title, value, icon: Icon, color, gradient, children, percentage, percentageColor }) => (
    <div className="group relative">
      {/* Main circular card */}
      <div className={`relative w-48 h-48 mx-auto rounded-full ${gradient} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer`}>
        
        {/* Inner content */}
        <div className="absolute inset-2 rounded-full bg-white bg-opacity-90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full ${color} bg-opacity-20 flex items-center justify-center mb-2 transition-transform group-hover:scale-110`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          
          {/* Value */}
          <h3 className="text-xl font-bold text-gray-800">
            {value}
          </h3>
          
          {/* Title */}
          <p className="text-xs font-medium text-gray-600 text-center mt-1">
            {title}
          </p>
          
          {/* Optional percentage indicator */}
          {percentage !== undefined && (
            <div className="mt-2">
              <CircularProgress percentage={percentage} color={percentageColor} />
            </div>
          )}
        </div>
        
        {/* Decorative rings */}
        <div className="absolute inset-0 rounded-full border-2 border-white border-opacity-30"></div>
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity blur-sm"></div>
      </div>
      
      {/* Floating label for additional info */}
      {children && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className="bg-white px-3 py-1 rounded-full shadow-md text-xs font-medium text-gray-600 border border-gray-200">
            {children}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative py-8 px-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Cards grid - Responsive layout */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center">
        
        {/* Total Products */}
        <Card
          title="Total Products"
          value={formatNumber(safeTotalProducts)}
          icon={Package}
          color="bg-blue-500"
          gradient="bg-gradient-to-br from-blue-400 to-blue-600"
          percentage={activePercentage}
          percentageColor="#3b82f6"
        >
          📦 {formatNumber(safeActiveProducts)} Active
        </Card>

        {/* Total Sales */}
        <Card
          title="Total Sales"
          value={formatNumber(safeTotalSales)}
          icon={TrendingUp}
          color="bg-green-500"
          gradient="bg-gradient-to-br from-green-400 to-green-600"
        >
          💰 {formatCurrency(safeAvgPrice)} avg
        </Card>

        {/* Average Rating */}
        <Card
          title="Avg. Rating"
          value={safeAvgRating.toFixed(1)}
          icon={Star}
          color="bg-amber-500"
          gradient="bg-gradient-to-br from-amber-400 to-amber-600"
        >
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            safeAvgRating >= 4.0 ? 'bg-green-100 text-green-700' :
            safeAvgRating >= 3.0 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {getRatingLabel(safeAvgRating)}
          </span>
        </Card>

        {/* Inventory Value */}
        <Card
          title="Inventory Value"
          value={formatCurrency(safeTotalValue)}
          icon={DollarSign}
          color="bg-indigo-500"
          gradient="bg-gradient-to-br from-indigo-400 to-indigo-600"
        >
          📊 {formatNumber(safeTotalStock)} units
        </Card>

        {/* Active Products */}
        <Card
          title="Active Products"
          value={formatNumber(safeActiveProducts)}
          icon={CheckCircle}
          color="bg-emerald-500"
          gradient="bg-gradient-to-br from-emerald-400 to-emerald-600"
          percentage={activePercentage}
          percentageColor="#10b981"
        >
          ✨ {activePercentage}% of total
        </Card>

        {/* Out of Stock */}
        <Card
          title="Out of Stock"
          value={formatNumber(safeOutOfStockProducts)}
          icon={AlertTriangle}
          color="bg-red-500"
          gradient="bg-gradient-to-br from-red-400 to-red-600"
          percentage={outOfStockPercentage}
          percentageColor="#ef4444"
        >
          ⚠️ {outOfStockPercentage}% of total
        </Card>

        {/* Low Stock */}
        <Card
          title="Low Stock"
          value={formatNumber(safeLowStockProducts)}
          icon={ShoppingBag}
          color="bg-orange-500"
          gradient="bg-gradient-to-br from-orange-400 to-orange-600"
          percentage={lowStockPercentage}
          percentageColor="#f97316"
        >
          🔔 Needs restock
        </Card>

        {/* Pending Approval */}
        <Card
          title="Pending Approval"
          value={formatNumber(safePendingApprovalProducts)}
          icon={Clock}
          color="bg-purple-500"
          gradient="bg-gradient-to-br from-purple-400 to-purple-600"
          percentage={pendingPercentage}
          percentageColor="#8b5cf6"
        >
          ⏳ {pendingPercentage}% pending
        </Card>

        {/* Draft Products */}
        <Card
          title="Draft Products"
          value={formatNumber(safeDraftProducts)}
          icon={FileText}
          color="bg-gray-500"
          gradient="bg-gradient-to-br from-gray-400 to-gray-600"
          percentage={draftPercentage}
          percentageColor="#6b7280"
        >
          📝 {draftPercentage}% in draft
        </Card>

        {/* Rejected Products */}
        <Card
          title="Rejected Products"
          value={formatNumber(safeRejectedProducts)}
          icon={XCircle}
          color="bg-rose-500"
          gradient="bg-gradient-to-br from-rose-400 to-rose-600"
          percentage={rejectedPercentage}
          percentageColor="#f43f5e"
        >
          ❌ {rejectedPercentage}% rejected
        </Card>

        {/* Price Range Card - Special design */}
        <div className="group relative">
          <div className="relative w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-violet-400 to-violet-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="absolute inset-2 rounded-full bg-white bg-opacity-90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 rounded-full bg-violet-500 bg-opacity-20 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
                <TrendingDown className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 text-center">
                {formatCurrency(safeMinPrice)}
              </h3>
              <p className="text-xs text-gray-500">Min Price</p>
              <div className="w-8 h-px bg-gray-300 my-1"></div>
              <h3 className="text-sm font-bold text-gray-800 text-center">
                {formatCurrency(safeMaxPrice)}
              </h3>
              <p className="text-xs text-gray-500">Max Price</p>
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-white border-opacity-30"></div>
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <div className="bg-white px-3 py-1 rounded-full shadow-md text-xs font-medium text-gray-600 border border-gray-200">
              💎 Price Range
            </div>
          </div>
        </div>

        {/* Achievement Card - Special design for high stats */}
        {safeAvgRating >= 4.5 && (
          <div className="group relative animate-pulse">
            <div className="relative w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <div className="absolute inset-2 rounded-full bg-white bg-opacity-90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500 bg-opacity-20 flex items-center justify-center mb-2 transition-transform group-hover:scale-110">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">🏆</h3>
                <p className="text-xs font-medium text-gray-600 text-center mt-1">
                  Top Rated
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {safeAvgRating.toFixed(1)} ★ Avg
                </p>
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-white border-opacity-30"></div>
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className="bg-yellow-100 px-3 py-1 rounded-full shadow-md text-xs font-medium text-yellow-700 border border-yellow-200">
                ⭐ Excellence Award
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary footer */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-600">
            Total Stock: {formatNumber(safeTotalStock)} units • 
            Avg Price: {formatCurrency(safeAvgPrice)}
          </span>
          <Sparkles className="w-4 h-4 text-yellow-500" />
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;