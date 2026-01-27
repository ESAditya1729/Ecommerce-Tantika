import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Sparkles,
  Store,
  Briefcase,
  MapPin,
  Globe,
  FileText,
  UserCheck,
  Shield,
} from "lucide-react";
import authServices from "../services/authServices";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const Register = () => {
  const navigate = useNavigate();

  // State for registration type
  const [registrationType, setRegistrationType] = useState("user"); // 'user' or 'artisan'

  // Basic form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Artisan-specific form data
  const [artisanData, setArtisanData] = useState({
    businessName: "",
    fullName: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    },
    idProofType: "aadhaar",
    idProofNumber: "",
    specialization: [],
    yearsOfExperience: "",
    description: "",
    portfolioLink: "",
    website: "",
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Specialization options
  const specializationOptions = [
    "Sarees Weaving",
    "Pottery",
    "Jewelry Making",
    "Wood Carving",
    "Textile Printing",
    "Metal Crafts",
    "Bamboo Crafts",
    "Embroidery",
    "Terracotta",
    "Painting",
    "Sculpture",
    "Leather Work",
  ];

  // Password validation rules
  const passwordRequirements = [
    { label: "At least 8 characters", regex: /.{8,}/ },
    { label: "Uppercase letter (A-Z)", regex: /[A-Z]/ },
    { label: "Lowercase letter (a-z)", regex: /[a-z]/ },
    { label: "Number (0-9)", regex: /\d/ },
    { label: "Special character (!@#$%^&*)", regex: /[!@#$%^&*]/ },
  ];

  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    let passwordError = "";
    passwordRequirements.forEach((req) => {
      if (!req.regex.test(formData.password)) {
        passwordError = "Password must meet all requirements";
      }
    });
    if (!formData.password) {
      passwordError = "Password is required";
    }
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Artisan-specific validations
    if (registrationType === "artisan") {
      if (!artisanData.businessName.trim()) {
        newErrors.businessName = "Business name is required";
      }

      if (!artisanData.fullName.trim()) {
        newErrors.fullName = "Full legal name is required";
      }

      if (!artisanData.address.street.trim()) {
        newErrors["address.street"] = "Street address is required";
      }

      if (!artisanData.address.city.trim()) {
        newErrors["address.city"] = "City is required";
      }

      if (!artisanData.idProofNumber.trim()) {
        newErrors.idProofNumber = "ID Proof number is required";
      }

      if (artisanData.specialization.length === 0) {
        newErrors.specialization = "Please select at least one specialization";
      }

      if (!artisanData.description.trim()) {
        newErrors.description = "Business description is required";
      } else if (artisanData.description.length < 50) {
        newErrors.description = "Description must be at least 50 characters";
      }

      if (!artisanData.acceptTerms) {
        newErrors.artisanTerms = "You must accept artisan terms and conditions";
      }
    }

    // Common terms agreement
    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleArtisanChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes("address.")) {
      const field = name.split(".")[1];
      setArtisanData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else if (name === "acceptTerms") {
      setArtisanData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setArtisanData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSpecializationChange = (specialization) => {
    setArtisanData((prev) => {
      const newSpecializations = prev.specialization.includes(specialization)
        ? prev.specialization.filter((s) => s !== specialization)
        : [...prev.specialization, specialization];

      return { ...prev, specialization: newSpecializations };
    });

    if (errors.specialization) {
      setErrors((prev) => ({
        ...prev,
        specialization: "",
      }));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);
  setSuccessMessage(""); // Clear any previous success message

  try {
    const endpoint =
      registrationType === "artisan"
        ? "/auth/register/artisan"
        : "/auth/register";

    const payload = {
      username: formData.username.trim(),
      email: formData.email.toLowerCase().trim(),
      phone: formData.phone.trim() || "",
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    // Add artisan data if needed
    if (registrationType === "artisan") {
      payload.businessName = artisanData.businessName || "";
      payload.fullName = artisanData.fullName || "";
      payload.address = {
        street: artisanData.address?.street || "",
        city: artisanData.address?.city || "",
        state: artisanData.address?.state || "",
        postalCode: artisanData.address?.postalCode || "",
        country: artisanData.address?.country || "India",
      };
      payload.idProof = {
        type: artisanData.idProofType || "aadhaar",
        number: artisanData.idProofNumber || "",
        documentUrl: "", // Optional
        verified: false
      };
      payload.specialization = artisanData.specialization || [];
      
      // ✅ FIXED: Parse years of experience
      let yearsExp = 0;
      if (artisanData.yearsOfExperience) {
        if (artisanData.yearsOfExperience.includes('-')) {
          const parts = artisanData.yearsOfExperience.split('-');
          yearsExp = parseInt(parts[0]) || 0;
        } else if (artisanData.yearsOfExperience.includes('+')) {
          yearsExp = parseInt(artisanData.yearsOfExperience.replace('+', '')) || 10;
        } else {
          yearsExp = parseInt(artisanData.yearsOfExperience) || 0;
        }
      }
      payload.yearsOfExperience = yearsExp;
      
      payload.description = artisanData.description || "";
      payload.portfolioLink = artisanData.portfolioLink || "";
      payload.website = artisanData.website || "";
      payload.socialLinks = {}; // Optional
      
      // ✅ FIXED: Add bankDetails with empty defaults (optional)
      payload.bankDetails = {
        accountName: "",
        accountNumber: "",
        bankName: "",
        ifscCode: "",
        accountType: "savings",
        verified: false
      };
      
      payload.documents = []; // Optional
    }

    console.log("Sending to:", endpoint, "with payload:", payload);

    // ✅ Use the axios instance with correct base URL
    const response = await api.post(endpoint, payload);

    if (response.data.success) {
      const message =
        registrationType === "artisan"
          ? "🎉 Artisan application submitted successfully! Our team will review your application within 3-5 business days."
          : "🎉 Account created successfully!";

      setSuccessMessage(message);

      setTimeout(() => {
        navigate(
          registrationType === "artisan"
            ? "/artisan/pending-approval"
            : "/dashboard",
        );
      }, 2000);
    }
  } catch (error) {
    console.error("Full error response:", error.response?.data || error);
    
    // Better error handling
    const errorResponse = error.response?.data;
    if (errorResponse) {
      if (errorResponse.errors) {
        setErrors(errorResponse.errors);
      } else if (errorResponse.message) {
        setErrors({
          submit: errorResponse.message
        });
      } else {
        setErrors({
          submit: "Registration failed. Please try again."
        });
      }
    } else {
      setErrors({
        submit: "Registration failed. Please check your connection and try again."
      });
    }
  } finally {
    setIsSubmitting(false);
  }
};
  // Calculate password strength
  const calculatePasswordStrength = () => {
    let strength = 0;
    passwordRequirements.forEach((req) => {
      if (req.regex.test(formData.password)) strength++;
    });
    return Math.round((strength / passwordRequirements.length) * 100);
  };

  const passwordStrength = calculatePasswordStrength();
  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl w-full">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="relative">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Join{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                তন্তিকা
              </span>
            </h1>
            <p className="text-gray-600 text-lg">
              {registrationType === "artisan"
                ? "Register as an Artisan and showcase your crafts to the world"
                : "Create your account and start exploring authentic Bengali crafts"}
            </p>
          </div>

          {/* Registration Type Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-2 flex gap-2 border border-white/50 shadow-lg">
              <button
                type="button"
                onClick={() => setRegistrationType("user")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  registrationType === "user"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/50"
                }`}
              >
                <User className="w-4 h-4" />
                Regular User
              </button>
              <button
                type="button"
                onClick={() => setRegistrationType("artisan")}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  registrationType === "artisan"
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/50"
                }`}
              >
                <Store className="w-4 h-4" />
                Artisan Seller
              </button>
            </div>
          </div>

          {/* Artisan Benefits Card */}
          {registrationType === "artisan" && (
            <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-800 text-lg mb-2">
                    Artisan Benefits
                  </h3>
                  <ul className="text-amber-700 text-sm space-y-1">
                    <li className="flex items-center">
                      <Check className="w-4 h-4 mr-2" /> Showcase your crafts to
                      thousands of customers
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 mr-2" /> Dedicated artisan
                      dashboard to manage your products
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 mr-2" /> Secure payment system
                      with regular payouts
                    </li>
                    <li className="flex items-center">
                      <Check className="w-4 h-4 mr-2" /> Marketing support and
                      promotional opportunities
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              className={`mb-8 p-6 border rounded-2xl ${
                registrationType === "artisan"
                  ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
                  : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    registrationType === "artisan"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h3
                    className={`font-bold text-lg ${
                      registrationType === "artisan"
                        ? "text-amber-800"
                        : "text-green-800"
                    }`}
                  >
                    {successMessage}
                  </h3>
                  <p
                    className={
                      registrationType === "artisan"
                        ? "text-amber-600"
                        : "text-green-600"
                    }
                  >
                    {registrationType === "artisan"
                      ? "You will receive an email once your application is reviewed."
                      : "Redirecting to dashboard..."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-white/50">
            <form onSubmit={handleSubmit}>
              {/* Error Message */}
              {errors.submit && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Common Registration Fields */}
              <div className="mb-10">
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center">
                  <UserCheck className="w-6 h-6 mr-3 text-blue-500" />
                  Account Information
                </h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-2 text-blue-500" />
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${
                        errors.username
                          ? "border-red-500 shadow-red-100"
                          : "border-gray-300 hover:border-blue-300"
                      }`}
                      placeholder="e.g., bengali_art_lover"
                    />
                    {errors.username && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.username}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline w-4 h-4 mr-2 text-purple-500" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${
                        errors.email
                          ? "border-red-500 shadow-red-100"
                          : "border-gray-300 hover:border-blue-300"
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-2 text-green-500" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${
                      errors.phone
                        ? "border-red-500 shadow-red-100"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                    placeholder="98XXXXXXXX"
                    maxLength="10"
                    required={registrationType === "artisan"}
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Password */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="inline w-4 h-4 mr-2 text-blue-500" />
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${
                        errors.password
                          ? "border-red-500 shadow-red-100"
                          : "border-gray-300 hover:border-blue-300"
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {formData.password && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Password strength
                        </span>
                        <span
                          className="text-sm font-bold"
                          style={{
                            color:
                              passwordStrength < 40
                                ? "#EF4444"
                                : passwordStrength < 70
                                  ? "#F59E0B"
                                  : "#10B981",
                          }}
                        >
                          {passwordStrength}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${getStrengthColor()}`}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Password Requirements */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                            req.regex.test(formData.password)
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                        <span
                          className={`text-sm ${
                            req.regex.test(formData.password)
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {errors.password && (
                    <p className="mt-3 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="inline w-4 h-4 mr-2 text-purple-500" />
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${
                        errors.confirmPassword
                          ? "border-red-500 shadow-red-100"
                          : "border-gray-300 hover:border-blue-300"
                      }`}
                      placeholder="Re-enter your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Artisan-Specific Fields */}
              {registrationType === "artisan" && (
                <div className="mb-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center">
                    <Briefcase className="w-6 h-6 mr-3 text-amber-500" />
                    Business Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Business Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Store className="inline w-4 h-4 mr-2 text-amber-500" />
                        Business/Studio Name *
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={artisanData.businessName}
                        onChange={handleArtisanChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 ${
                          errors.businessName
                            ? "border-red-500 shadow-red-100"
                            : "border-gray-300 hover:border-amber-300"
                        }`}
                        placeholder="e.g., Traditional Bengal Crafts"
                      />
                      {errors.businessName && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.businessName}
                        </p>
                      )}
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="inline w-4 h-4 mr-2 text-amber-500" />
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={artisanData.fullName}
                        onChange={handleArtisanChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 ${
                          errors.fullName
                            ? "border-red-500 shadow-red-100"
                            : "border-gray-300 hover:border-amber-300"
                        }`}
                        placeholder="Your full name as per ID"
                      />
                      {errors.fullName && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.fullName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="inline w-4 h-4 mr-2 text-amber-500" />
                      Business Address *
                    </label>
                    <div className="space-y-4">
                      <input
                        type="text"
                        name="address.street"
                        value={artisanData.address.street}
                        onChange={handleArtisanChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                          errors["address.street"]
                            ? "border-red-500 shadow-red-100"
                            : "border-gray-300"
                        }`}
                        placeholder="Street address"
                      />
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="address.city"
                          value={artisanData.address.city}
                          onChange={handleArtisanChange}
                          className={`px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                            errors["address.city"]
                              ? "border-red-500 shadow-red-100"
                              : "border-gray-300"
                          }`}
                          placeholder="City"
                        />
                        <input
                          type="text"
                          name="address.state"
                          value={artisanData.address.state}
                          onChange={handleArtisanChange}
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                          placeholder="State"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="address.postalCode"
                          value={artisanData.address.postalCode}
                          onChange={handleArtisanChange}
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                          placeholder="Postal Code"
                        />
                        <input
                          type="text"
                          name="address.country"
                          value={artisanData.address.country}
                          onChange={handleArtisanChange}
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                          placeholder="Country"
                        />
                      </div>
                    </div>
                    {errors["address.street"] && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors["address.street"]}
                      </p>
                    )}
                    {errors["address.city"] && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors["address.city"]}
                      </p>
                    )}
                  </div>

                  {/* ID Proof */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="inline w-4 h-4 mr-2 text-amber-500" />
                      ID Proof Verification *
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <select
                        name="idProofType"
                        value={artisanData.idProofType}
                        onChange={handleArtisanChange}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                      >
                        <option value="aadhaar">Aadhaar Card</option>
                        <option value="pan">PAN Card</option>
                        <option value="passport">Passport</option>
                        <option value="driver_license">Driver's License</option>
                      </select>
                      <input
                        type="text"
                        name="idProofNumber"
                        value={artisanData.idProofNumber}
                        onChange={handleArtisanChange}
                        className={`px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                          errors.idProofNumber
                            ? "border-red-500 shadow-red-100"
                            : "border-gray-300"
                        }`}
                        placeholder="ID Proof Number"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Your ID information is secure and will only be used for
                      verification purposes.
                    </p>
                    {errors.idProofNumber && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.idProofNumber}
                      </p>
                    )}
                  </div>

                  {/* Specialization */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Craft Specialization *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {specializationOptions.map((spec) => (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => handleSpecializationChange(spec)}
                          className={`px-4 py-2 rounded-full border transition-all duration-300 ${
                            artisanData.specialization.includes(spec)
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-md"
                              : "bg-white border-gray-300 text-gray-700 hover:border-amber-300 hover:bg-amber-50"
                          }`}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                    {errors.specialization && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.specialization}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      {artisanData.specialization.length} selected
                    </p>
                  </div>

                  {/* Years of Experience */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <select
                      name="yearsOfExperience"
                      value={artisanData.yearsOfExperience}
                      onChange={handleArtisanChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select years</option>
                      <option value="1-2">1-2 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Description *
                    </label>
                    <textarea
                      name="description"
                      value={artisanData.description}
                      onChange={handleArtisanChange}
                      rows="4"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 ${
                        errors.description
                          ? "border-red-500 shadow-red-100"
                          : "border-gray-300 hover:border-amber-300"
                      }`}
                      placeholder="Tell us about your craft, techniques, materials, and what makes your work special..."
                    />
                    <div className="flex justify-between mt-2">
                      <p className="text-sm text-gray-500">
                        {artisanData.description.length}/1000 characters
                      </p>
                      {artisanData.description.length < 50 && (
                        <p className="text-sm text-amber-600">
                          Minimum 50 characters required
                        </p>
                      )}
                    </div>
                    {errors.description && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Portfolio Links */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe className="inline w-4 h-4 mr-2 text-amber-500" />
                        Portfolio/Website
                      </label>
                      <input
                        type="url"
                        name="portfolioLink"
                        value={artisanData.portfolioLink}
                        onChange={handleArtisanChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe className="inline w-4 h-4 mr-2 text-amber-500" />
                        Social Media/Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={artisanData.website}
                        onChange={handleArtisanChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        placeholder="https://instagram.com/yourprofile"
                      />
                    </div>
                  </div>

                  {/* Artisan Terms */}
                  <div className="mb-8">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="artisanTerms"
                        name="acceptTerms"
                        checked={artisanData.acceptTerms}
                        onChange={handleArtisanChange}
                        className="mt-1 mr-3 w-5 h-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="artisanTerms" className="text-gray-700">
                        I agree to the{" "}
                        <Link
                          to="/artisan-terms"
                          className="text-amber-600 hover:text-amber-500 font-medium"
                        >
                          Artisan Terms & Conditions
                        </Link>{" "}
                        and understand that my application will be reviewed
                        within 3-5 business days.
                      </label>
                    </div>
                    {errors.artisanTerms && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.artisanTerms}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="mb-8">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 mr-3 w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="text-gray-700">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.terms && (
                  <p className="mt-2 text-sm text-red-600">{errors.terms}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group w-full text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden ${
                  registrationType === "artisan"
                    ? "bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:shadow-orange-500/30"
                    : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-purple-500/30"
                }`}
              >
                {/* Animated background */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    registrationType === "artisan"
                      ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"
                      : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                  }`}
                ></div>

                {isSubmitting ? (
                  <span className="relative flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {registrationType === "artisan"
                      ? "Submitting Application..."
                      : "Creating Account..."}
                  </span>
                ) : (
                  <span className="relative flex items-center">
                    {registrationType === "artisan"
                      ? "Submit Artisan Application"
                      : "Create Account"}
                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className="my-8 flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <div className="mx-4 text-gray-500 text-sm">
                  Already have an account?
                </div>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <Link
                  to="/login"
                  className={`inline-flex items-center px-8 py-3 rounded-xl font-semibold hover:bg-opacity-10 transition-all duration-300 ${
                    registrationType === "artisan"
                      ? "border-2 border-amber-600 text-amber-600 hover:bg-amber-50"
                      : "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Sign In Instead
                </Link>
              </div>
            </form>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {registrationType === "artisan"
                ? "Artisan applications are reviewed manually. You will receive an email with the status of your application."
                : "By signing up, you agree to receive communications from তন্তিকা. You can unsubscribe at any time."}
            </p>
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
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
      `}</style>
    </div>
  );
};

export default Register;
