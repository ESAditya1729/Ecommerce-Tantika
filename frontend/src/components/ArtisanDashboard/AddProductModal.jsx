// frontend\src\components\ArtisanDashboard\AddProductModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import { X, Upload, AlertCircle, Check, Info, Plus, Trash2, Camera, Loader2, Star } from "lucide-react";
import ImageUpload from "../Common/ImageUpload"; // Adjust path as needed

const AddProductModal = ({
  showAddModal,
  setShowAddModal,
  actionLoading,
  handleAddProduct,
  categories,
  currentUser,
}) => {
  // Initialize product state with defaults
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    image: "",
    rating: 4.0, // Default rating
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [hoveredRating, setHoveredRating] = useState(0);
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);

  // Process categories to ensure they're strings for rendering
  const processedCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    
    return categories
      .map(cat => {
        // If it's already a string, use it
        if (typeof cat === 'string') return cat;
        
        // If it's an object with a name property (like from your API), return the name
        if (cat && typeof cat === 'object') {
          if (cat.name) return cat.name;
          // If it has value/label structure
          if (cat.value) return cat.value;
          // If it has label but no value
          if (cat.label) return cat.label;
          // Last resort - stringify
          return JSON.stringify(cat);
        }
        
        return String(cat);
      })
      .filter(cat => cat && cat !== "" && cat !== "All"); // Filter out empty and "All"
  }, [categories]);

  // Log for debugging
  useEffect(() => {
    if (showAddModal) {
      console.log('Raw categories:', categories);
      console.log('Processed categories:', processedCategories);
    }
  }, [showAddModal, categories, processedCategories]);

  // Reset form when modal opens
  useEffect(() => {
    if (showAddModal) {
      setNewProduct({
        name: "",
        description: "",
        category: "",
        price: "",
        stock: "",
        image: "",
        rating: 4.0,
      });
      setSpecifications([{ key: "", value: "" }]);
      setErrors({});
      setTouched({});
    }
  }, [showAddModal]);

  const validateForm = () => {
    const newErrors = {};

    if (!newProduct.name?.trim()) newErrors.name = "Product name is required";
    if (!newProduct.category) newErrors.category = "Category is required";
    if (!newProduct.price || Number(newProduct.price) <= 0) {
      newErrors.price = "Valid price is required";
    }
    if (!newProduct.image) newErrors.image = "Product image is required";
    if (!newProduct.rating || newProduct.rating < 0 || newProduct.rating > 5) {
      newErrors.rating = "Rating must be between 0 and 5";
    }

    return newErrors;
  };

  const isFormValid = () => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = ['name', 'category', 'price', 'image', 'rating'];
    const touchedObj = {};
    allFields.forEach(field => touchedObj[field] = true);
    setTouched(touchedObj);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Prepare product data - status is automatically pending
    const productData = {
      name: newProduct.name,
      description: newProduct.description,
      category: newProduct.category, // This will be the selected category string
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock) || 0,
      image: newProduct.image,
      rating: parseFloat(newProduct.rating),
      specifications: specifications.filter(spec => spec.key && spec.value),
    };

    console.log('Submitting product data:', productData);
    await handleAddProduct(productData);
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const validationErrors = validateForm();
    setErrors(validationErrors);
  };

  const handleRatingChange = (rating) => {
    setNewProduct({ ...newProduct, rating });
    if (errors.rating) {
      setErrors({ ...errors, rating: undefined });
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

  const renderRatingStars = () => {
    const currentRating = hoveredRating || newProduct.rating || 0;
    
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
          ({newProduct.rating || 0}/5)
        </span>
      </div>
    );
  };

  if (!showAddModal) return null;

  const isButtonDisabled = actionLoading || !isFormValid();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Add New Product</h3>
              <p className="text-sm text-gray-600 mt-1">
                Add your handmade creation. It will be reviewed by admin before going live.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(false)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:rotate-90"
              disabled={actionLoading}
              type="button"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Artisan Info Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {currentUser?.username?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{currentUser?.username || 'Artisan'}</p>
                  <p className="text-sm text-amber-700">Adding product as artisan</p>
                </div>
                <div className="ml-auto">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                    Pending Approval
                  </span>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => {
                      setNewProduct({ ...newProduct, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    onBlur={() => handleBlur('name')}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                      touched.name && errors.name
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="e.g., Handwoven Macrame Wall Hanging"
                    disabled={actionLoading}
                  />
                  {touched.name && errors.name && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Category - FIXED with processedCategories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => {
                      console.log('Selected category value:', e.target.value);
                      setNewProduct({ ...newProduct, category: e.target.value });
                      if (errors.category) setErrors({ ...errors, category: undefined });
                    }}
                    onBlur={() => handleBlur('category')}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                      touched.category && errors.category
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    disabled={actionLoading}
                  >
                    <option value="">Select Category</option>
                    {processedCategories.map((category, index) => (
                      <option key={`${category}-${index}`} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {touched.category && errors.category && (
                    <p className="text-red-500 text-sm mt-2">{errors.category}</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => {
                        setNewProduct({ ...newProduct, price: e.target.value });
                        if (errors.price) setErrors({ ...errors, price: undefined });
                      }}
                      onBlur={() => handleBlur('price')}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
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

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stock: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Enter available quantity"
                    min="0"
                    disabled={actionLoading}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-4">
                    <div className={`border-2 ${newProduct.image ? 'border-green-500' : 'border-dashed border-gray-300'} rounded-xl p-4 transition-all`}>
                      {newProduct.image ? (
                        <div className="relative group">
                          <img
                            src={newProduct.image}
                            alt="Product"
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/300";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setNewProduct({ ...newProduct, image: "" })}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
                        Upload a clear image of your product
                      </p>
                      <p>• Recommended size: 800x800px</p>
                      <p>• Max file size: 5MB</p>
                    </div>
                  </div>
                  {touched.image && errors.image && (
                    <p className="text-red-500 text-sm mt-2">{errors.image}</p>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      {renderRatingStars()}
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <input
                        type="number"
                        value={newProduct.rating}
                        onChange={(e) => handleRatingChange(parseFloat(e.target.value))}
                        onBlur={() => handleBlur('rating')}
                        className={`w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 ${
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
                        Default rating is 4.0
                      </span>
                    </div>
                    {touched.rating && errors.rating && (
                      <p className="text-red-500 text-sm mt-2">{errors.rating}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="Describe your product, materials used, craftsmanship details..."
                disabled={actionLoading}
              />
            </div>

            {/* Specifications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Specifications</h4>
                <button
                  type="button"
                  onClick={addSpecification}
                  className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                      placeholder="e.g., Material"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-amber-500"
                      placeholder="e.g., Cotton"
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

            {/* Status Info Banner */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 mb-1">Important Information</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Your product will be submitted for <strong>admin approval</strong></li>
                    <li>• It will appear in your dashboard as <strong>"Pending Review"</strong></li>
                    <li>• You'll be notified when it's approved or rejected</li>
                    <li>• Only approved products will be visible to customers</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isButtonDisabled}
                className={`px-8 py-3 font-medium rounded-xl transition-all duration-200 flex items-center justify-center min-w-[180px] ${
                  isButtonDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:from-amber-600 hover:to-orange-600"
                }`}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Submit for Approval
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