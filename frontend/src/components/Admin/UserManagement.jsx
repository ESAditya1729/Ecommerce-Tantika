import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Star, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle,
  Users,
  ShoppingBag
} from 'lucide-react';

const UserManagement = () => {
  const [users] = useState([
    {
      id: 1,
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '+91 9876543210',
      role: 'customer',
      status: 'active',
      orders: 5,
      joined: '2023-11-15',
      lastActive: '2024-01-15',
      location: 'Kolkata'
    },
    {
      id: 2,
      name: 'Priya Patel',
      email: 'priya@example.com',
      phone: '+91 9876543211',
      role: 'premium',
      status: 'active',
      orders: 12,
      joined: '2023-10-20',
      lastActive: '2024-01-14',
      location: 'Mumbai'
    },
    {
      id: 3,
      name: 'Amit Kumar',
      email: 'amit@example.com',
      phone: '+91 9876543212',
      role: 'customer',
      status: 'inactive',
      orders: 2,
      joined: '2023-12-01',
      lastActive: '2023-12-28',
      location: 'Delhi'
    },
    {
      id: 4,
      name: 'Sneha Roy',
      email: 'sneha@example.com',
      phone: '+91 9876543213',
      role: 'customer',
      status: 'active',
      orders: 8,
      joined: '2023-09-10',
      lastActive: '2024-01-13',
      location: 'Kolkata'
    },
    {
      id: 5,
      name: 'Rajesh Mehta',
      email: 'rajesh@example.com',
      phone: '+91 9876543214',
      role: 'vip',
      status: 'active',
      orders: 25,
      joined: '2023-08-05',
      lastActive: '2024-01-12',
      location: 'Chennai'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role) => {
    const roleConfig = {
      customer: { color: 'blue', label: 'Customer' },
      premium: { color: 'purple', label: 'Premium' },
      vip: { color: 'amber', label: 'VIP' },
      admin: { color: 'red', label: 'Admin' }
    };

    const config = roleConfig[role] || roleConfig.customer;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${config.color}-100 text-${config.color}-800`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        Inactive
      </span>
    );
  };

  const handleSendEmail = (email) => {
    window.location.href = `mailto:${email}`;
  };

  const handleMakeVIP = (userId) => {
    console.log(`Making user ${userId} VIP`);
    // API call would go here
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage registered users and their accounts</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <UserPlus className="w-5 h-5 mr-2" />
          Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Total Users</h3>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{users.length}</p>
          <p className="text-sm text-gray-600 mt-2">Registered users</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Active Users</h3>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {users.filter(u => u.status === 'active').length}
          </p>
          <p className="text-sm text-gray-600 mt-2">Currently active</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Premium Users</h3>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {users.filter(u => u.role === 'premium' || u.role === 'vip').length}
          </p>
          <p className="text-sm text-gray-600 mt-2">VIP & Premium</p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Avg. Orders</h3>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {Math.round(users.reduce((sum, u) => sum + u.orders, 0) / users.length)}
          </p>
          <p className="text-sm text-gray-600 mt-2">Per user</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Locations</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Chennai">Chennai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">ID: U{user.id.toString().padStart(4, '0')}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  <div className="text-sm text-gray-500">{user.phone}</div>
                  <div className="text-xs text-gray-500">{user.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.orders} orders</div>
                  <div className="text-sm text-gray-500">Last active: {new Date(user.lastActive).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500">Joined: {new Date(user.joined).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSendEmail(user.email)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                      title="Send Email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => console.log('View profile:', user.id)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMakeVIP(user.id)}
                      className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg"
                      title="Make VIP"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => console.log('Edit user:', user.id)}
                      className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg"
                      title="Edit User"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            {/* Using User icon from lucide-react */}
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">No users match your current filters</p>
          </div>
        )}
      </div>

      {/* User Segmentation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
          <h3 className="font-bold text-gray-900 mb-4">User Segments</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-sm font-medium">New Customers</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {users.filter(u => new Date(u.joined) > new Date('2024-01-01')).length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-sm font-medium">Loyal Customers</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                {users.filter(u => u.orders > 5).length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-sm font-medium">Inactive Users</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                {users.filter(u => u.status === 'inactive').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
          <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
              Send Newsletter
            </button>
            <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              Export User Data
            </button>
            <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
              Create User Segment
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
          <h3 className="font-bold text-gray-900 mb-4">Top Customers</h3>
          <div className="space-y-3">
            {users
              .sort((a, b) => b.orders - a.orders)
              .slice(0, 3)
              .map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.orders} orders</p>
                    </div>
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-800">
                    View
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;