// Mock service for frontend development - will be replaced with real API calls later
const authService = {
  // Mock register function
  register: async (userData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful response
    return {
      success: true,
      message: 'Registration successful!',
      token: 'mock-jwt-token-12345',
      user: {
        id: 'user_123',
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        createdAt: new Date().toISOString()
      }
    };
  },

  // Mock login function
  login: async (credentials) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful response
    return {
      success: true,
      message: 'Login successful!',
      token: 'mock-jwt-token-12345',
      user: {
        id: 'user_123',
        username: credentials.email.includes('admin') ? 'admin' : 'demo_user',
        email: credentials.email,
        role: credentials.email.includes('admin') ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      }
    };
  },

  // Mock current user function
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    // Return mock user data
    return {
      id: 'user_123',
      username: 'demo_user',
      email: 'demo@tantika.com',
      role: 'user'
    };
  }
};

export default authService;