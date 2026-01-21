import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

export const RecentActivityCard = ({ activities }) => (
  <div className="bg-white rounded-2xl shadow-xl p-8">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
        <Clock className="w-6 h-6 mr-3 text-blue-600" />
        Recent Activity
      </h2>
      <Link to="/activity" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
        View all
      </Link>
    </div>
    
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <span className="text-lg">{activity.icon}</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{activity.message}</p>
            <p className="text-sm text-gray-500">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
    
    {activities.length === 0 && (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No recent activity</p>
        <p className="text-sm text-gray-400 mt-1">Your activity will appear here</p>
      </div>
    )}
  </div>
);