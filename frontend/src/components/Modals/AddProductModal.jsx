// AddProductModal.jsx - Fixed rating submission
import React, { useState, useEffect } from "react";
import { X, AlertCircle, Check, Info, Plus, Trash2, User, Camera, Loader2, Star } from "lucide-react";
import ImageUpload from "../Common/ImageUpload";

const AddProductModal = ({
  showAddModal,
  setShowAddModal,
  newProduct: externalNewProduct,
  setNewProduct: externalSetNewProduct,
  categories,
  actionLoading,
  handleAddProduct,
  currentUser,
  artisans = [],
  loadingArtisans = false,
}) => {
  // Default artisan data
  const DEFAULT_ARTISAN = {
    _id: "6980ec0e019484c9645856c4",
    businessName: "Default Artisan",
    fullName: "Default Artisan",
    name: "Default Artisan",
    status: "approved"
  };

  // Initialize internal state with safe defaults including rating
  const [internalNewProduct, setInternalNewProduct] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    image: "",
    rating: 4.0, // Changed to number explicitly
    status: currentUser?.role === 'artisan' ? "draft" : "active",
    approvalStatus: currentUser?.role === 'artisan' ? "pending" : "approved",
    artisan: "",
    artisanName: "",
    shortDescription: "",
    subcategory: "",
    costPrice: "",
    materials: [],
    tags: [],
    colors: [],
    sizes: [],
    weight: "",
    features: [],
    specifications: [],
    variants: [],
  });

  // Use either external prop or internal state
  const newProduct = externalNewProduct || internalNewProduct;
  const setNewProduct = externalSetNewProduct || setInternalNewProduct;

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [variants, setVariants] = useState([{ name: "", price: "", stock: "" }]);
  const [isArtisan, setIsArtisan] = useState(false);
  const [selectedArtisan, setSelectedArtisan] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  // Define available status options
  const getApprovalStatusOptions = (isArtisanUser) => {
    if (isArtisanUser) {
      return [
        { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
        { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800" },
      ];
    }
    return [
      { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
      { value: "approved", label: "Approved", color: "bg-green-100 text-green-800" },
      { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
      { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800" },
    ];
  };

  // Get filtered artisans (with default fallback)
  const getFilteredArtisans = () => {
    if (!artisans || !Array.isArray(artisans) || artisans.length === 0) {
      console.log("Using default artisan");
      return [DEFAULT_ARTISAN];
    }
    
    const filtered = artisans.filter(artisan => 
      artisan && 
      typeof artisan === 'object' && 
      artisan._id && 
      (artisan.status === 'approved' || !artisan.status || artisan.status === 'active')
    );
    
    return filtered.length > 0 ? filtered : [DEFAULT_ARTISAN];
  };

  useEffect(() => {
    if (showAddModal) {
      console.log("Modal opened with artisans data:", {
        rawArtisans: artisans,
        filteredArtisans: getFilteredArtisans(),
        artisanCount: artisans?.length || 0,
        loadingArtisans
      });
      
      const userIsArtisan = currentUser?.role === 'artisan' || currentUser?.role === 'pending_artisan';
      setIsArtisan(userIsArtisan);
      
      const resetFormData = {
        name: "",
        description: "",
        category: "",
        price: "",
        stock: "",
        image: "",
        rating: 4.0, // Ensure rating is a number
        status: userIsArtisan ? "draft" : "active",
        approvalStatus: userIsArtisan ? "pending" : "approved",
        artisan: "",
        artisanName: "",
        shortDescription: "",
        subcategory: "",
        costPrice: "",
        materials: [],
        tags: [],
        colors: [],
        sizes: [],
        weight: "",
        features: [],
        specifications: [],
        variants: [],
      };

      setNewProduct(resetFormData);
      setSpecifications([{ key: "", value: "" }]);
      setVariants([{ name: "", price: "", stock: "" }]);
      setErrors({});
      setTouched({});
      
      if (userIsArtisan && currentUser?.artisanProfile?._id) {
        setSelectedArtisan(currentUser.artisanProfile._id);
        setNewProduct(prev => ({
          ...prev,
          artisan: currentUser.artisanProfile._id,
          artisanName: currentUser.artisanProfile.businessName || currentUser.name || 'Artisan'
        }));
      }
      
      if (!userIsArtisan) {
        const filteredArtisans = getFilteredArtisans();
        if (filteredArtisans.length > 0) {
          const defaultArtisan = filteredArtisans[0];
          console.log("Default artisan selected:", defaultArtisan);
          setSelectedArtisan(defaultArtisan._id);
          setNewProduct(prev => ({
            ...prev,
            artisan: defaultArtisan._id,
            artisanName: defaultArtisan.businessName || defaultArtisan.fullName || defaultArtisan.name || 'Artisan'
          }));
        }
      }
    }
  }, [showAddModal, currentUser, artisans, loadingArtisans]);

  const validateForm = () => {
    const newErrors = {};

    if (!newProduct?.name?.trim()) newErrors.name = "Product name is required";
    if (!newProduct?.category) newErrors.category = "Category is required";
    if (!newProduct?.price || Number(newProduct?.price) <= 0) {
      newErrors.price = "Valid price is required";
    }
    if (!newProduct?.image) newErrors.image = "Main image is required";
    
    // FIXED: Better rating validation
    const ratingValue = Number(newProduct?.rating);
    if (newProduct?.rating === undefined || newProduct?.rating === null || newProduct?.rating === "") {
      newErrors.rating = "Rating is required";
    } else if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
      newErrors.rating = "Rating must be between 0 and 5";
    }
    
    if (!newProduct?.approvalStatus) {
      newErrors.approvalStatus = "Approval status is required";
    }

    if (!newProduct?.artisan) {
      newErrors.artisan = "Artisan is required";
    }

    if (newProduct?.name && newProduct.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }

    if (newProduct?.price && Number(newProduct.price) > 1000000) {
      newErrors.price = "Price is too high";
    }

    if (newProduct?.stock && Number(newProduct.stock) < 0) {
      newErrors.stock = "Stock cannot be negative";
    }

    return newErrors;
  };

  const isFormValid = () => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Current newProduct state:", newProduct);
    console.log("Current rating value:", newProduct?.rating, "Type:", typeof newProduct?.rating);
    
    const allFields = ['name', 'category', 'price', 'image', 'rating', 'approvalStatus', 'artisan'];
    const touchedObj = {};
    allFields.forEach(field => touchedObj[field] = true);
    setTouched(touchedObj);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // FIXED: Ensure rating is properly parsed and validated
    let ratingValue = 4.0; // Default
    
    if (newProduct?.rating !== undefined && newProduct?.rating !== null && newProduct?.rating !== "") {
      const parsedRating = parseFloat(newProduct.rating);
      if (!isNaN(parsedRating)) {
        // Ensure rating is between 0 and 5 and rounded to 1 decimal place
        ratingValue = Math.min(5, Math.max(0, Math.round(parsedRating * 10) / 10));
      }
    }

    // Prepare product data with explicit rating handling
    const productData = {
      name: newProduct?.name || "",
      description: newProduct?.description || "",
      category: newProduct?.category || "",
      price: parseFloat(newProduct?.price || 0),
      stock: newProduct?.stock ? parseInt(newProduct.stock) : 0,
      image: newProduct?.image || "",
      // FIXED: Use the validated rating value
      rating: ratingValue,
      approvalStatus: isArtisan ? "pending" : (newProduct?.approvalStatus || "approved"),
      status: isArtisan ? "draft" : (newProduct?.status || "active"),
      artisan: newProduct?.artisan || DEFAULT_ARTISAN._id,
      shortDescription: newProduct?.shortDescription || "",
      subcategory: newProduct?.subcategory || "",
      costPrice: newProduct?.costPrice || null,
      materials: Array.isArray(newProduct?.materials) ? newProduct.materials : [],
      tags: Array.isArray(newProduct?.tags) ? newProduct.tags : [],
      colors: Array.isArray(newProduct?.colors) ? newProduct.colors : [],
      sizes: Array.isArray(newProduct?.sizes) ? newProduct.sizes : [],
      weight: newProduct?.weight || null,
      features: Array.isArray(newProduct?.features) ? newProduct.features : [],
      specifications: specifications.filter(spec => spec.key && spec.value),
      variants: variants.filter(variant => variant.name && variant.price && variant.stock),
      sku: generateSKU(),
      submittedAt: isArtisan ? new Date().toISOString() : null
    };

    console.log('Final payload being sent:', JSON.stringify(productData, null, 2));
    console.log('Rating in payload:', productData.rating, 'Type:', typeof productData.rating);
    
    await handleAddProduct(productData);
  };

  const generateSKU = () => {
    const prefix = newProduct?.category?.substring(0, 3).toUpperCase() || 'PRO';
    const random = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-${random}`;
  };

  const resetForm = () => {
    const userIsArtisan = currentUser?.role === 'artisan' || currentUser?.role === 'pending_artisan';
    
    setNewProduct({
      name: "",
      description: "",
      category: "",
      price: "",
      stock: "",
      image: "",
      rating: 4.0, // Ensure rating is a number
      status: userIsArtisan ? "draft" : "active",
      approvalStatus: userIsArtisan ? "pending" : "approved",
      artisan: userIsArtisan ? (currentUser?.artisanProfile?._id || "") : "",
      artisanName: "",
      shortDescription: "",
      subcategory: "",
      costPrice: "",
      materials: [],
      tags: [],
      colors: [],
      sizes: [],
      weight: "",
      features: [],
      specifications: [],
      variants: [],
    });
    setSpecifications([{ key: "", value: "" }]);
    setVariants([{ name: "", price: "", stock: "" }]);
    setErrors({});
    setTouched({});
    setShowAddModal(false);
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const validationErrors = validateForm();
    setErrors(validationErrors);
  };

  const handleNumberChange = (field, value) => {
    if (value === "") {
      setNewProduct({ ...newProduct, [field]: "" });
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setNewProduct({ ...newProduct, [field]: numValue });
      }
    }
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  // FIXED: Improved rating change handler
  const handleRatingChange = (rating) => {
    let validRating = rating;
    
    // Handle both direct star clicks and input changes
    if (typeof rating === 'number') {
      validRating = Math.min(5, Math.max(0, rating));
    } else if (typeof rating === 'string') {
      const parsed = parseFloat(rating);
      if (!isNaN(parsed)) {
        validRating = Math.min(5, Math.max(0, parsed));
      } else {
        validRating = 4.0; // Default if invalid
      }
    }
    
    // Round to 1 decimal place for consistency
    validRating = Math.round(validRating * 10) / 10;
    
    setNewProduct({ ...newProduct, rating: validRating });
    
    console.log("Rating changed to:", validRating, "Type:", typeof validRating);
    
    if (errors.rating) {
      setErrors({ ...errors, rating: undefined });
    }
    if (touched.rating) {
      setTouched({ ...touched, rating: false });
    }
  };

  const handleArtisanChange = (artisanId) => {
    console.log("Artisan selected:", artisanId);
    const filteredArtisans = getFilteredArtisans();
    const selected = filteredArtisans.find(a => a._id === artisanId);
    console.log("Selected artisan data:", selected);
    setSelectedArtisan(artisanId);
    setNewProduct(prev => ({
      ...prev,
      artisan: artisanId,
      artisanName: selected?.businessName || selected?.fullName || selected?.name || 'Artisan'
    }));
    
    if (errors.artisan) {
      setErrors({ ...errors, artisan: undefined });
    }
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const updateSpecification = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const removeSpecification = (index) => {
    if (specifications.length > 1) {
      const updated = specifications.filter((_, i) => i !== index);
      setSpecifications(updated);
    }
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", price: "", stock: "" }]);
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      const updated = variants.filter((_, i) => i !== index);
      setVariants(updated);
    }
  };

  const handleImageUpload = (url) => {
    setNewProduct((prev) => ({
      ...prev,
      image: url,
    }));
    if (errors.image) {
      setErrors({ ...errors, image: undefined });
    }
  };

  if (!showAddModal) return null;

  const isButtonDisabled = actionLoading || !isFormValid();
  const approvalStatusOptions = getApprovalStatusOptions(isArtisan);
  const filteredArtisans = getFilteredArtisans();

  const getStatusBadge = (status) => {
    const option = approvalStatusOptions.find(opt => opt.value === status);
    return option ? option.color : "bg-gray-100 text-gray-800";
  };

  const getCurrentArtisanName = () => {
    if (isArtisan) {
      return currentUser?.artisanProfile?.businessName || currentUser?.name || 'You (Artisan)';
    }
    
    const selected = filteredArtisans.find(a => a._id === selectedArtisan);
    return selected?.businessName || selected?.fullName || selected?.name || 'Select Artisan';
  };

  // FIXED: Render rating stars with proper value handling
  const renderRatingStars = () => {
    const currentRating = hoveredRating || newProduct?.rating || 4.0;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
            disabled={actionLoading}
          >
            <Star
              className={`w-6 h-6 ${
                star <= currentRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              } transition-colors`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          ({typeof newProduct?.rating === 'number' ? newProduct.rating.toFixed(1) : '4.0'}/5)
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {isArtisan ? 'Add New Artisan Product' : 'Add New Product'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {isArtisan 
                  ? 'Add your product. It will be reviewed by admin before going live.' 
                  : 'Add product for artisan'}
              </p>
            </div>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:rotate-90 disabled:opacity-50"
              disabled={actionLoading}
              type="button"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Artisan Information Section */}
            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h4 className="text-lg font-semibold text-gray-900">Artisan Information</h4>
              </div>
              
              <div className="space-y-4">
                {isArtisan ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {currentUser?.name?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {currentUser?.artisanProfile?.businessName || currentUser?.name || 'Artisan'}
                        </p>
                        <p className="text-sm text-gray-500">You are adding this product</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                      Artisan
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      Select Artisan <span className="text-red-500">*</span>
                      {touched.artisan && errors.artisan && (
                        <Info className="w-4 h-4 text-red-500" />
                      )}
                    </label>
                    
                    {loadingArtisans ? (
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin mr-2" />
                        <span className="text-gray-500">Loading artisans...</span>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <select
                            value={selectedArtisan}
                            onChange={(e) => handleArtisanChange(e.target.value)}
                            onBlur={() => handleBlur('artisan')}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none ${
                              touched.artisan && errors.artisan
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            disabled={actionLoading}
                          >
                            {filteredArtisans.length === 0 ? (
                              <option value="" disabled>No artisans available</option>
                            ) : (
                              filteredArtisans.map((artisan) => (
                                <option key={artisan._id} value={artisan._id}>
                                  {artisan.businessName || artisan.fullName || artisan.name || 'Artisan'} 
                                  {artisan.status && artisan.status !== 'approved' && ` (${artisan.status})`}
                                </option>
                              ))
                            )}
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        {touched.artisan && errors.artisan && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> {errors.artisan}
                          </p>
                        )}
                        
                        {selectedArtisan && filteredArtisans.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">
                                  {getCurrentArtisanName().charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{getCurrentArtisanName()}</p>
                                <p className="text-xs text-gray-600">
                                  This artisan will own and manage this product
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs text-gray-500">
                          <p>Available artisans: {filteredArtisans.length}</p>
                          <p>Selected artisan ID: {selectedArtisan}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                <div className={`p-3 rounded-lg ${isArtisan ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}`}>
                  <p className={`text-sm ${isArtisan ? 'text-yellow-700' : 'text-blue-700'}`}>
                    {isArtisan ? (
                      <>This product will be submitted for admin approval. It will only be visible to customers once approved.</>
                    ) : (
                      <>The selected artisan will be able to manage this product from their artisan dashboard.</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      Product Name <span className="text-red-500">*</span>
                      {touched.name && errors.name && (
                        <Info className="w-4 h-4 text-red-500" />
                      )}
                    </label>
                    <input
                      type="text"
                      value={newProduct?.name || ""}
                      onChange={(e) => {
                        setNewProduct({ ...newProduct, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: undefined });
                      }}
                      onBlur={() => handleBlur('name')}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        touched.name && errors.name
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="Enter product name"
                      disabled={actionLoading}
                    />
                    {touched.name && errors.name && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newProduct?.category || ""}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, category: e.target.value })
                      }
                      onBlur={() => handleBlur('category')}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        touched.category && errors.category
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      disabled={actionLoading}
                    >
                      <option value="">Select Category</option>
                      {categories
                        ?.filter((cat) => cat !== "all")
                        .map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={newProduct?.price || ""}
                        onChange={(e) => handleNumberChange("price", e.target.value)}
                        onBlur={() => handleBlur('price')}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          touched.price && errors.price
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={actionLoading}
                      />
                    </div>
                    {touched.price && errors.price && (
                      <p className="text-red-500 text-sm mt-2">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={newProduct?.stock || ""}
                      onChange={(e) => handleNumberChange("stock", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                      placeholder="Enter stock quantity"
                      min="0"
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                {/* Right Column - Image Upload and Rating */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-4">
                      <div className={`border-2 ${newProduct?.image ? 'border-green-500' : 'border-dashed border-gray-300'} rounded-xl p-4 transition-all duration-200`}>
                        {newProduct?.image ? (
                          <div className="relative group">
                            <img
                              src={newProduct.image}
                              alt="Product"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => setNewProduct({ ...newProduct, image: "" })}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                              Main Image
                            </div>
                          </div>
                        ) : (
                          <ImageUpload
                            onImageUpload={handleImageUpload}
                            existingImage=""
                            disabled={actionLoading}
                            className="h-48"
                          />
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <p className="flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          Only one image is required for artisan products
                        </p>
                        <p>• Image will be displayed in your shop</p>
                        <p>• Recommended size: 800x800px</p>
                        <p>• Max file size: 5MB</p>
                      </div>
                    </div>
                    {touched.image && errors.image && (
                      <p className="text-red-500 text-sm mt-2">{errors.image}</p>
                    )}
                  </div>

                  {/* Product Rating - FIXED */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      Product Rating <span className="text-red-500">*</span>
                      {touched.rating && errors.rating && (
                        <Info className="w-4 h-4 text-red-500" />
                      )}
                    </label>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        {renderRatingStars()}
                      </div>
                      <div className="mt-3 flex items-center gap-4">
                        <input
                          type="number"
                          value={newProduct?.rating !== undefined ? newProduct.rating : 4.0}
                          onChange={(e) => handleRatingChange(e.target.value)}
                          onBlur={() => handleBlur('rating')}
                          className={`w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            touched.rating && errors.rating
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="4.0"
                          step="0.1"
                          min="0"
                          max="5"
                          disabled={actionLoading}
                        />
                        <span className="text-sm text-gray-500">
                          Enter rating from 0 to 5
                        </span>
                      </div>
                      {/* Debug info - remove in production */}
                      <div className="mt-2 p-2 bg-blue-50 text-blue-700 text-xs rounded">
                        Debug: Current rating value = {newProduct?.rating} (type: {typeof newProduct?.rating})
                      </div>
                      {touched.rating && errors.rating && (
                        <p className="text-red-500 text-sm mt-2">{errors.rating}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Default rating is 4.0 for new products. Ratings are typically updated based on customer reviews.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newProduct?.description || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                placeholder="Enter detailed product description..."
                disabled={actionLoading}
              />
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Specifications</h4>
                <button
                  type="button"
                  onClick={addSpecification}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Specification
                </button>
              </div>
              <div className="space-y-3">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                      placeholder="Specification (e.g., Material)"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                      placeholder="Value (e.g., Cotton)"
                    />
                    {specifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="px-3 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Status
                </label>
                <div className="relative">
                  {isArtisan ? (
                    <div className={`w-full px-4 py-3 border rounded-xl ${getStatusBadge(newProduct?.approvalStatus || 'pending')} border-transparent`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {approvalStatusOptions.find(opt => opt.value === (newProduct?.approvalStatus || 'pending'))?.label || 'Pending'}
                        </span>
                        <Info className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    <select
                      value={newProduct?.approvalStatus || "approved"}
                      onChange={(e) => {
                        setNewProduct({ ...newProduct, approvalStatus: e.target.value });
                        if (errors.approvalStatus) {
                          setErrors({ ...errors, approvalStatus: undefined });
                        }
                      }}
                      onBlur={() => handleBlur('approvalStatus')}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none ${
                        touched.approvalStatus && errors.approvalStatus
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      disabled={actionLoading}
                    >
                      {approvalStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {!isArtisan && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  )}
                </div>
                {touched.approvalStatus && errors.approvalStatus && (
                  <p className="text-red-500 text-sm mt-2">{errors.approvalStatus}</p>
                )}
                
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    {isArtisan 
                      ? 'Your product will be reviewed by admin before going live.' 
                      : 'Set the approval status for this product.'}
                  </p>
                </div>
              </div>

              {!isArtisan && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Status
                  </label>
                  <select
                    value={newProduct?.status || "active"}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, status: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                    disabled={actionLoading}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              )}
            </div>

            <div className={`mb-8 p-4 rounded-xl border ${isArtisan ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`text-sm font-semibold ${isArtisan ? 'text-yellow-800' : 'text-blue-800'} mb-2 flex items-center gap-1`}>
                <Info className="w-4 h-4" /> Important Information
              </h4>
              <ul className={`text-sm ${isArtisan ? 'text-yellow-700' : 'text-blue-700'} space-y-1`}>
                {isArtisan ? (
                  <>
                    <li>• Your product will be submitted for <strong>admin approval</strong></li>
                    <li>• It will appear in your artisan dashboard as <strong>"Pending"</strong></li>
                    <li>• You'll be notified when it's approved or rejected</li>
                    <li>• Only approved products will be visible to customers</li>
                  </>
                ) : (
                  <>
                    <li><span className="font-medium">Product Status:</span> Controls product availability and visibility to customers</li>
                    <li><span className="font-medium">Approval Status:</span> Internal workflow status for admin review process</li>
                    <li><span className="font-medium">Only "Approved" products</span> will be visible to customers on the frontend</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isButtonDisabled}
                className={`px-8 py-3 font-medium rounded-xl transition-all duration-200 flex items-center justify-center min-w-[140px] ${
                  isButtonDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : `${isArtisan 
                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'} text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`
                }`}
              >
                {actionLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    {isArtisan ? 'Submitting...' : 'Adding Product...'}
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    {isArtisan ? 'Submit for Approval' : 'Add Product'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;