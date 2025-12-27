const DashboardHeader = ({ user }) => (
  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div className="mb-6 md:mb-0">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          তন্তিকাতে স্বাগতম, <span className="text-yellow-300">{user.username}!</span> 👋
        </h1>
        <p className="text-blue-100 text-lg">
          Your personalized Bengali craft journey awaits
        </p>
        <div className="flex items-center space-x-4 mt-4">
          <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full">
            <Mail className="w-4 h-4 mr-2" />
            {user.email}
          </span>
          {user.phone && (
            <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full">
              <Phone className="w-4 h-4 mr-2" />
              {user.phone}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-r from-white/20 to-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
            <span className="text-white text-3xl font-bold">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {user.role === 'premium' ? '⭐ Premium' : 'Member'}
          </div>
        </div>
      </div>
    </div>
  </div>
);