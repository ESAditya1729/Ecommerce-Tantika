const validator = require('validator');

const validateRegister = (data) => {
  const errors = {};
  
  // Username validation
  if (!data.username || data.username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters';
  } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    errors.username = 'Username can only contain letters, numbers, and underscores';
  }
  
  // Email validation
  if (!data.email || !validator.isEmail(data.email)) {
    errors.email = 'Please enter a valid email';
  }
  
  // Phone validation (optional)
  if (data.phone && !/^[0-9]{10}$/.test(data.phone)) {
    errors.phone = 'Please enter a valid 10-digit phone number';
  }
  
  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(data.password)) {
    errors.password = 'Password must contain uppercase, lowercase, number, and special character';
  }
  
  // Confirm password
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

const validateLogin = (data) => {
  const errors = {};
  
  // Can login with either username or email
  if (!data.email && !data.username) {
    errors.email = 'Email or username is required';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

const validateForgotPassword = (data) => {
  const errors = {};
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validator.isEmail(data.email)) {
    errors.email = 'Please enter a valid email';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

const validateResetPassword = (data) => {
  const errors = {};
  
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(data.password)) {
    errors.password = 'Password must contain uppercase, lowercase, number, and special character';
  }
  
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

module.exports = { 
  validateRegister, 
  validateLogin, 
  validateForgotPassword, 
  validateResetPassword 
};