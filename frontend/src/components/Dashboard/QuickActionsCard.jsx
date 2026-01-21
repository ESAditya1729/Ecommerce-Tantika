import { Link } from 'react-router-dom';

export const QuickActionsCard = ({ onQuickAction }) => {
  const quickActions = [
    { id: 1, title: 'Browse Shop', description: 'Discover crafts', icon: '🛍️', action: 'shop', color: 'blue' },
    { id: 2, title: 'Edit Profile', description: 'Update details', icon: '👤', action: 'editProfile', color: 'purple' },
    { id: 3, title: 'My Wishlist', description: 'Saved items', icon: '💝', action: 'wishlist', color: 'pink' },
    { id: 4, title: 'Order History', description: 'Past purchases', icon: '📋', action: 'orders', color: 'green' },
    { id: 5, title: 'Address Book', description: 'Manage addresses', icon: '📍', action: 'addresses', color: 'amber' },
    { id: 6, title: 'Contact Us', description: 'Get help', icon: '💬', action: 'contact', color: 'indigo' },
    { id: 7, title: 'Settings', description: 'Preferences', icon: '⚙️', action: 'settings', color: 'gray' },
    { id: 8, title: 'Support Artisans', description: 'Learn more', icon: '👨‍🎨', action: 'artisans', color: 'red' },
  ];

  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600',
    pink: 'from-pink-50 to-pink-100 border-pink-200 text-pink-600',
    green: 'from-green-50 to-green-100 border-green-200 text-green-600',
    amber: 'from-amber-50 to-amber-100 border-amber-200 text-amber-600',
    indigo: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-600',
    gray: 'from-gray-50 to-gray-100 border-gray-200 text-gray-600',
    red: 'from-red-50 to-red-100 border-red-200 text-red-600',
  };

  const handleClick = (action, e) => {
    e.preventDefault();
    onQuickAction(action);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={(e) => handleClick(action.action, e)}
            className={`bg-gradient-to-br ${colorClasses[action.color] || colorClasses.blue} rounded-xl p-4 text-center hover:shadow-md transition-all duration-300 hover:scale-105 border cursor-pointer`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
              colorClasses[action.color].split(' ')[0].replace('from-', 'bg-')
            }`}>
              <span className="text-2xl">{action.icon}</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">{action.title}</p>
            <p className="text-xs text-gray-500 mt-1">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};