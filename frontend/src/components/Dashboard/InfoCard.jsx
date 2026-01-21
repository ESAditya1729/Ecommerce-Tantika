import { Clock, TrendingUp } from 'lucide-react';

export const InfoCard = ({ title, value, subtitle, icon: Icon, color, children }) => {
  const colorClasses = {
    green: 'from-green-50 to-emerald-100 border-green-200 text-green-600',
    blue: 'from-blue-50 to-indigo-100 border-blue-200 text-blue-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color] || colorClasses.blue} rounded-2xl shadow-lg p-6 border`}>
      <div className="flex items-center mb-4">
        <Icon className={`w-6 h-6 mr-3 ${
          color === 'green' ? 'text-green-600' : 'text-blue-600'
        }`} />
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      <p className="text-gray-600 text-sm">{subtitle}</p>
      {children}
    </div>
  );
};