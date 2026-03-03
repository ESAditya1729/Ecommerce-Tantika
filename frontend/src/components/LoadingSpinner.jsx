export const LoadingSpinner = ({ size = 'medium', message = 'Loading...', subMessage = null }) => {
  // Size mappings
  const sizeClasses = {
    small: {
      container: 'w-16 h-16',
      inner: 'w-12 h-12',
      icon: 'w-8 h-8',
      text: 'text-sm',
      subText: 'text-xs'
    },
    medium: {
      container: 'w-24 h-24',
      inner: 'w-20 h-20',
      icon: 'w-12 h-12',
      text: 'text-base',
      subText: 'text-sm'
    },
    large: {
      container: 'w-32 h-32',
      inner: 'w-28 h-28',
      icon: 'w-16 h-16',
      text: 'text-lg',
      subText: 'text-base'
    },
    xlarge: {
      container: 'w-40 h-40',
      inner: 'w-36 h-36',
      icon: 'w-20 h-20',
      text: 'text-xl',
      subText: 'text-lg'
    }
  };

  const selectedSize = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
        </div>

        {/* Main spinner with gradient - using size classes */}
        <div className="relative mb-8">
          {/* Outer ring with pulse */}
          <div className={`${selectedSize.container} rounded-full bg-gradient-to-r from-blue-400 to-purple-400 p-1 animate-pulse mx-auto`}>
            <div className="w-full h-full rounded-full bg-white"></div>
          </div>
          
          {/* Inner spinning gradient ring */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`${selectedSize.inner} rounded-full border-4 border-gray-200 border-t-blue-600 border-r-purple-600 border-b-pink-600 border-l-transparent animate-spin`}></div>
          </div>

          {/* Center logo/brand icon */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`${selectedSize.icon} bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg animate-bounce`}>
              <svg className="w-1/2 h-1/2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Animated text */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            তন্তিকা
          </h2>
          
          <div className="flex items-center justify-center gap-2">
            <p className={`text-gray-700 font-medium ${selectedSize.text}`}>{message}</p>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </span>
          </div>

          {/* Sub message if provided */}
          {subMessage && (
            <p className={`text-gray-500 ${selectedSize.subText}`}>{subMessage}</p>
          )}

          {/* Progress bar */}
          <div className="w-64 mx-auto mt-6">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full animate-progress"></div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          @keyframes progress {
            0% { width: 0%; }
            25% { width: 50%; }
            50% { width: 75%; }
            75% { width: 90%; }
            100% { width: 100%; }
          }
          .animate-progress {
            animation: progress 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
};