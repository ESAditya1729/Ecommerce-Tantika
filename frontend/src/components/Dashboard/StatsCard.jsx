import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const StatsCard = ({ title, value, icon, color, trend, link, suffix }) => {
  const colorClasses = {
    blue: 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100',
    purple: 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100',
    pink: 'border-pink-500 bg-gradient-to-br from-pink-50 to-pink-100',
    amber: 'border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100',
    green: 'border-green-500 bg-gradient-to-br from-green-50 to-green-100',
  };

  const iconColors = {
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    pink: 'text-pink-600 bg-pink-100',
    amber: 'text-amber-600 bg-amber-100',
    green: 'text-green-600 bg-green-100',
  };

  const content = (
    <div className={`rounded-2xl shadow-lg p-6 border-l-4 ${colorClasses[color] || colorClasses.blue} hover:shadow-xl transition-all duration-300`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColors[color] || iconColors.blue}`}>
          {icon}
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
        {suffix && <span className="text-gray-600">{suffix}</span>}
      </div>
      {link && (
        <div className="mt-4 flex items-center text-sm text-gray-600">
          <Link to={link} className="hover:text-gray-900 flex items-center">
            View details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );

  return link ? (
    <Link to={link} className="block hover:scale-[1.02] transition-transform duration-300">
      {content}
    </Link>
  ) : (
    <div>{content}</div>
  );
};