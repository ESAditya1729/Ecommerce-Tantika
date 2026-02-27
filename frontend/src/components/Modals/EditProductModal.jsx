// src/components/Modals/EditProductModal.jsx
import React, { useState, useEffect } from "react";
import { X, Star, User, Info, AlertCircle, Loader2 } from "lucide-react";
import ImageUpload from "../Common/ImageUpload";

const EditProductModal = ({
  showEditModal,
  setShowEditModal,
  editingProduct,
  setEditingProduct,
  categories,
  actionLoading,
  handleUpdateProduct,
  artisans = [],
  loadingArtisans = false,
  currentUser,
}) => {
  const [productImages, setProductImages] = useState([]);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [ratingError, setRatingError] = useState("");
  const [selectedArtisan, setSelectedArtisan] = useState("");
  const [isArtisan, setIsArtisan] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Default artisan data
  const DEFAULT_ARTISAN = {
    _id: "6980ec0e019484c9645856c4",
    businessName: "Default Artisan",
    fullName: "Default Artisan",
    name: "Default Artisan",
    status: "approved"
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

  // Initialize images and ensure rating has proper value when product loads
  useEffect(() => {
    if (editingProduct) {
      setProductImages(editingProduct.images || []);
      
      // Ensure rating is properly set and is a number
      const currentRating = parseFloat(editingProduct.rating);
      if (isNaN(currentRating)) {
        setEditingProduct(prev => ({
          ...prev,
          rating: 4.0
        }));
      }

      // Set selected artisan
      if (editingProduct.artisan) {
        setSelectedArtisan(
          typeof editingProduct.artisan === 'object' 
            ? editingProduct.artisan._id 
            : editingProduct.artisan
        );
      }

      // Check if current user is artisan
      const userIsArtisan = currentUser?.role === 'artisan' || currentUser?.role === 'pending_artisan';
      setIsArtisan(userIsArtisan);
    }
  }, [editingProduct, setEditingProduct, currentUser]);

  const validateForm = () => {
    const newErrors = {};

    if (!editingProduct?.name?.trim()) newErrors.name = "Product name is required";
    if (!editingProduct?.category) newErrors.category = "Category is required";
    if (!editingProduct?.price || Number(editingProduct?.price) <= 0) {
      newErrors.price = "Valid price is required";
    }
    if (!editingProduct?.image) newErrors.image = "Main image is required";
    
    // Rating validation
    const ratingValue = Number(editingProduct?.rating);
    if (editingProduct?.rating === undefined || editingProduct?.rating === null || editingProduct?.rating === "") {
      newErrors.rating = "Rating is required";
    } else if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
      newErrors.rating = "Rating must be between 0 and 5";
    }

    // Artisan validation (only for admin)
    if (!isArtisan && !editingProduct?.artisan) {
      newErrors.artisan = "Artisan is required";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Mark all fields as touched to show errors
      const touchedObj = {};
      Object.keys(validationErrors).forEach(field => touchedObj[field] = true);
      setTouched(touchedObj);
      
      alert("Please fill in all required fields correctly");
      return;
    }

    // Validate rating is within range
    const rating = parseFloat(editingProduct.rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      setRatingError("Rating must be between 0 and 5");
      return;
    }
    setRatingError("");

    // Prepare product data with explicit fields
    const productData = {
      ...editingProduct,
      // Explicitly set rating as a number
      rating: parseFloat(editingProduct.rating) || 4.0,
      // Ensure price is number
      price: parseFloat(editingProduct.price) || 0,
      // Ensure stock is number
      stock: parseInt(editingProduct.stock) || 0,
      // Ensure sales is number
      sales: parseInt(editingProduct.sales) || 0,
      // Ensure artisan is properly set (handle both object and string cases)
      artisan: selectedArtisan || editingProduct.artisan || DEFAULT_ARTISAN._id
    };

    // Ensure rating is between 0-5 and rounded to 1 decimal
    if (productData.rating !== undefined) {
      productData.rating = Math.min(5, Math.max(0, Number(productData.rating)));
      productData.rating = Math.round(productData.rating * 10) / 10;
    }

    console.log('Submitting product with rating and artisan:', {
      originalRating: editingProduct.rating,
      parsedRating: productData.rating,
      artisan: productData.artisan,
      productData
    });

    // Call the update function with prepared data
    handleUpdateProduct(productData);
  };

  const isFormValid = () => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setEditingProduct(null);
    setProductImages([]);
    setHoveredRating(0);
    setRatingError("");
    setSelectedArtisan("");
    setErrors({});
    setTouched({});
    setShowEditModal(false);
  };

  const handleNumberChange = (field, value) => {
    if (value === "" || value === null || value === undefined) {
      setEditingProduct({ ...editingProduct, [field]: "" });
    } else {
      let numValue;
      
      if (field === 'rating') {
        // For rating, parse as float and clamp between 0 and 5
        numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          numValue = Math.min(Math.max(numValue, 0), 5);
          // Round to 1 decimal place for cleaner display
          numValue = Math.round(numValue * 10) / 10;
        }
        // Clear rating error when user makes a change
        setRatingError("");
        if (errors.rating) setErrors({ ...errors, rating: undefined });
      } else if (field === 'price') {
        numValue = parseFloat(value);
      } else {
        numValue = parseInt(value, 10);
      }
      
      if (!isNaN(numValue)) {
        setEditingProduct({ ...editingProduct, [field]: numValue });
      }
    }
  };

  const handleRatingChange = (rating) => {
    setEditingProduct({ ...editingProduct, rating });
    setRatingError("");
    if (errors.rating) setErrors({ ...errors, rating: undefined });
  };

  const handleArtisanChange = (artisanId) => {
    console.log("Artisan selected:", artisanId);
    const filteredArtisans = getFilteredArtisans();
    const selected = filteredArtisans.find(a => a._id === artisanId);
    
    setSelectedArtisan(artisanId);
    
    // Update editingProduct with the artisan ID
    setEditingProduct(prev => ({
      ...prev,
      artisan: artisanId,
      artisanName: selected?.businessName || selected?.fullName || selected?.name || 'Artisan'
    }));
    
    if (errors.artisan) {
      setErrors({ ...errors, artisan: undefined });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const validationErrors = validateForm();
    setErrors(validationErrors);
  };

  // Render star rating component for better UX
  const renderRatingStars = () => {
    const currentRating = hoveredRating || parseFloat(editingProduct?.rating) || 4.0;
    
    return (
      <div className="flex items-center gap-1 mt-2">
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
              className={`w-5 h-5 ${
                star <= currentRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              } transition-colors`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          ({currentRating.toFixed(1)}/5)
        </span>
      </div>
    );
  };

  // Handle adding new image
  const handleAddImage = (url) => {
    if (url) {
      const updatedImages = [...productImages, url];
      setProductImages(updatedImages);
      setEditingProduct({
        ...editingProduct,
        images: updatedImages,
        // Set first image as primary image
        image: updatedImages[0],
      });
    }
  };

  // Handle removing an image
  const handleRemoveImage = (index) => {
    const updatedImages = productImages.filter((_, i) => i !== index);
    setProductImages(updatedImages);
    setEditingProduct({
      ...editingProduct,
      images: updatedImages,
      // Update primary image if removing the first one
      image: updatedImages.length > 0 ? updatedImages[0] : "",
    });
  };

  // Set as primary image
  const handleSetPrimaryImage = (index) => {
    const newPrimary = productImages[index];
    // Move the selected image to first position
    const updatedImages = [
      newPrimary,
      ...productImages.filter((_, i) => i !== index),
    ];
    
    setProductImages(updatedImages);
    setEditingProduct({
      ...editingProduct,
      images: updatedImages,
      image: newPrimary,
    });
  };

  const getArtisanDisplayName = () => {
    if (!editingProduct?.artisan) return "No artisan assigned";
    
    const artisanId = typeof editingProduct.artisan === 'object' 
      ? editingProduct.artisan._id 
      : editingProduct.artisan;
    
    const filteredArtisans = getFilteredArtisans();
    const artisan = filteredArtisans.find(a => a._id === artisanId);
    
    return artisan?.businessName || artisan?.fullName || artisan?.name || "Unknown Artisan";
  };

  if (!showEditModal || !editingProduct) return null;

  const isButtonDisabled = actionLoading || !isFormValid();
  const currentRating = parseFloat(editingProduct.rating) || 4.0;
  const filteredArtisans = getFilteredArtisans();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              disabled={actionLoading}
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Artisan Information Section - Only show for admin */}
            {!isArtisan && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-blue-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Artisan Information</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      Select Artisan <span className="text-red-500">*</span>
                      {touched.artisan && errors.artisan && (
                        <Info className="w-4 h-4 text-red-500" />
                      )}
                    </label>
                    
                    {loadingArtisans ? (
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin mr-2" />
                        <span className="text-gray-500">Loading artisans...</span>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <select
                            value={selectedArtisan || (typeof editingProduct.artisan === 'object' 
                              ? editingProduct.artisan._id 
                              : editingProduct.artisan || '')}
                            onChange={(e) => handleArtisanChange(e.target.value)}
                            onBlur={() => handleBlur('artisan')}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none ${
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
                                  {getArtisanDisplayName().charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{getArtisanDisplayName()}</p>
                                <p className="text-xs text-gray-600">
                                  This artisan owns and manages this product
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Show current artisan info for artisans */}
            {isArtisan && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {currentUser?.artisanProfile?.businessName || currentUser?.name || 'Artisan'}
                    </p>
                    <p className="text-sm text-gray-600">
                      You are editing this product as an artisan
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    Product Name <span className="text-red-500">*</span>
                    {touched.name && errors.name && (
                      <Info className="w-4 h-4 text-red-500" />
                    )}
                  </label>
                  <input
                    type="text"
                    value={editingProduct.name || ""}
                    onChange={(e) => {
                      setEditingProduct({ ...editingProduct, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    onBlur={() => handleBlur('name')}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      touched.name && errors.name
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Enter product name"
                    disabled={actionLoading}
                  />
                  {touched.name && errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingProduct.category || ""}
                    onChange={(e) => {
                      setEditingProduct({ ...editingProduct, category: e.target.value });
                      if (errors.category) setErrors({ ...errors, category: undefined });
                    }}
                    onBlur={() => handleBlur('category')}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      touched.category && errors.category
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    disabled={actionLoading}
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter((cat) => cat !== "all")
                      .map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                  </select>
                  {touched.category && errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={editingProduct.price || ""}
                      onChange={(e) => {
                        handleNumberChange("price", e.target.value);
                        if (errors.price) setErrors({ ...errors, price: undefined });
                      }}
                      onBlur={() => handleBlur('price')}
                      className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
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
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock || ""}
                    onChange={(e) =>
                      handleNumberChange("stock", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter stock quantity"
                    min="0"
                    disabled={actionLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editingProduct.status || "active"}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={actionLoading}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Right Column - Images and Rating */}
              <div className="space-y-4">
                {/* Primary Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    Product Image <span className="text-red-500">*</span>
                    {touched.image && errors.image && (
                      <Info className="w-4 h-4 text-red-500" />
                    )}
                  </label>
                  <ImageUpload
                    onImageUpload={(url) => {
                      if (url) {
                        const updatedImages = [url, ...productImages.filter(img => img !== url)];
                        setProductImages(updatedImages);
                        setEditingProduct({
                          ...editingProduct,
                          image: url,
                          images: updatedImages,
                        });
                        if (errors.image) setErrors({ ...errors, image: undefined });
                      }
                    }}
                    existingImage={editingProduct.image || ""}
                    disabled={actionLoading}
                  />
                  {touched.image && errors.image && (
                    <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                  )}
                </div>

                {/* Additional Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Images
                  </label>
                  <ImageUpload
                    onImageUpload={handleAddImage}
                    existingImage=""
                    disabled={actionLoading}
                    label="Add more images"
                    multiple={true}
                  />
                  
                  {/* Display existing images */}
                  {productImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Product Images ({productImages.length})
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {productImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-1">
                              {index === 0 ? (
                                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                                  Primary
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(index)}
                                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                  disabled={actionLoading}
                                >
                                  Set Primary
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                disabled={actionLoading}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    Product Rating <span className="text-red-500">*</span>
                    {touched.rating && errors.rating && (
                      <Info className="w-4 h-4 text-red-500" />
                    )}
                  </label>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        value={currentRating}
                        onChange={(e) => {
                          handleNumberChange("rating", e.target.value);
                          if (errors.rating) setErrors({ ...errors, rating: undefined });
                        }}
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
                        Rating from 0 to 5
                      </span>
                    </div>
                    {renderRatingStars()}
                    {(ratingError || (touched.rating && errors.rating)) && (
                      <p className="text-red-500 text-sm mt-2">
                        {ratingError || errors.rating}
                      </p>
                    )}
                  </div>
                </div>

                {/* Initial Sales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Sales
                  </label>
                  <input
                    type="number"
                    value={editingProduct.sales || ""}
                    onChange={(e) =>
                      handleNumberChange("sales", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="0"
                    min="0"
                    disabled={actionLoading}
                  />
                </div>
              </div>
            </div>

            {/* Description (Full width) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editingProduct.description || ""}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, description: e.target.value })
                }
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter product description"
                disabled={actionLoading}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isButtonDisabled}
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;