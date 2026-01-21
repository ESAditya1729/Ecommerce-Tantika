import { Package, Heart, ShoppingCart, Clock, Settings, MapPin, MessageSquare, Users } from 'lucide-react';
import { ModalContainer } from './ModalContainer';

export const QuickActionModal = ({ isOpen, onClose, actionType, onAction }) => {
  const actionConfigs = {
    orders: {
      title: 'Order History',
      icon: <Package className="w-8 h-8 text-blue-600" />,
      description: 'View and manage your orders',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Recent Orders</h4>
            <p className="text-blue-700 text-sm">You have 3 orders in progress</p>
          </div>
        </div>
      ),
      actions: [
        { label: 'View All Orders', color: 'blue', onClick: () => onAction?.('viewOrders') },
        { label: 'Track Orders', color: 'purple', onClick: () => onAction?.('trackOrders') },
      ]
    },
    wishlist: {
      title: 'Wishlist',
      icon: <Heart className="w-8 h-8 text-pink-600" />,
      description: 'Manage your saved items',
      content: (
        <div className="space-y-4">
          <div className="bg-pink-50 rounded-xl p-4">
            <h4 className="font-semibold text-pink-900 mb-2">Saved Items</h4>
            <p className="text-pink-700 text-sm">You have 5 items in your wishlist</p>
          </div>
        </div>
      ),
      actions: [
        { label: 'View Wishlist', color: 'pink', onClick: () => onAction?.('viewWishlist') },
        { label: 'Share Wishlist', color: 'purple', onClick: () => onAction?.('shareWishlist') },
      ]
    },
    settings: {
      title: 'Settings',
      icon: <Settings className="w-8 h-8 text-gray-600" />,
      description: 'Customize your experience',
      content: (
        <div className="grid grid-cols-2 gap-3">
          <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-left">
            <div className="font-medium text-gray-900">Notifications</div>
            <div className="text-sm text-gray-600">Manage alerts</div>
          </button>
          <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-left">
            <div className="font-medium text-gray-900">Privacy</div>
            <div className="text-sm text-gray-600">Data settings</div>
          </button>
        </div>
      ),
      actions: [
        { label: 'Save Settings', color: 'gray', onClick: () => onAction?.('saveSettings') },
      ]
    }
  };

  const config = actionConfigs[actionType] || {};

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      size="md"
    >
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
            {config.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{config.title}</h3>
            <p className="text-gray-600">{config.description}</p>
          </div>
        </div>

        {config.content}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {config.actions?.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className={`px-4 py-2 bg-gradient-to-r ${getColorClass(action.color)} text-white rounded-lg hover:shadow-lg transition-all duration-300`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </ModalContainer>
  );
};

const getColorClass = (color) => {
  const colors = {
    blue: 'from-blue-600 to-blue-700',
    purple: 'from-purple-600 to-purple-700',
    pink: 'from-pink-600 to-pink-700',
    gray: 'from-gray-600 to-gray-700',
  };
  return colors[color] || colors.blue;
};