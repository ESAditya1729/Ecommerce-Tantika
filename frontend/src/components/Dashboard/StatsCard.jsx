import { ChevronRight } from 'lucide-react';

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  link, 
  onClick,  // NEW: Add onClick prop
  trend, 
  subtitle 
}) => {
  const colorClasses = {
    blue: 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600',
    purple: 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600',
    pink: 'border-pink-500 bg-gradient-to-br from-pink-50 to-pink-100 text-pink-600',
    amber: 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600'
  };

  const content = (
    <div className={`rounded-2xl shadow-lg p-6 border-l-4 hover:shadow-xl transition-all duration-300 ${colorClasses[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          color === 'blue' ? 'bg-blue-100' :
          color === 'purple' ? 'bg-purple-100' :
          color === 'pink' ? 'bg-pink-100' :
          'bg-amber-100'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <div className="flex items-baseline">
        <p className="text-2xl font-bold text-gray-900 mr-2">{value}</p>
        {subtitle && <span className="text-gray-600 text-sm">{subtitle}</span>}
      </div>
      {(link || onClick) && (
        <div className="mt-4 flex items-center text-sm text-gray-600">
          <button 
            onClick={onClick}
            className="hover:text-gray-900 flex items-center"
          >
            View {title.toLowerCase().split(' ')[0]}
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );

  // If onClick is provided, use button instead of Link
  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className="block w-full text-left hover:scale-[1.02] transition-transform duration-300"
      >
        {content}
      </button>
    );
  }

  // Otherwise, use Link if link is provided
  return link ? (
    <a href={link} className="block hover:scale-[1.02] transition-transform duration-300">
      {content}
    </a>
  ) : (
    <div className="hover:scale-[1.02] transition-transform duration-300">
      {content}
    </div>
  );
};