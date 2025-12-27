import { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../Hooks/useAuth';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.addresses?.[0] || {}
  });

  const handleSave = () => {
    // Update profile logic here
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/dashboard" className="inline-flex items-center text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>
          {/* Profile form here */}
        </div>
      </div>
    </div>
  );
};

export default Profile;