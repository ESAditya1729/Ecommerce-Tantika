// src/components/Modals/AddProductModal.jsx
import React, { useState, useEffect } from "react";
import { X, Upload, AlertCircle, Check, Info, Plus, Trash2 } from "lucide-react";
import ImageUpload from "../Common/ImageUpload";

const AddProductModal = ({
  showAddModal,
  setShowAddModal,
  newProduct,
  setNewProduct,
  categories,
  actionLoading,
  handleAddProduct,
}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [featuredImages, setFeaturedImages] = useState([]);
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [variants, setVariants] = useState([{ name: "", price: "", stock: "" }]);

  useEffect(() => {
    if (showAddModal) {
      // Initialize with existing data or defaults
      setFeaturedImages(newProduct.images || []);
      setSpecifications(newProduct.specifications || [{ key: "", value: "" }]);
      setVariants(newProduct.variants || [{ name: "", price: "", stock: "" }]);
    }
  }, [showAddModal, newProduct]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!newProduct.name?.trim()) newErrors.name = "Product name is required";
    if (!newProduct.category) newErrors.category = "Category is required";
    if (!newProduct.price || Number(newProduct.price) <= 0) {
      newErrors.price = "Valid price is required";
    }
    if (!newProduct.image) newErrors.image = "Main image is required";

    // Validation rules
    if (newProduct.name && newProduct.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }

    if (newProduct.price && Number(newProduct.price) > 1000000) {
      newErrors.price = "Price is too high";
    }

    if (newProduct.stock && Number(newProduct.stock) < 0) {
      newErrors.stock = "Stock cannot be negative";
    }

    if (newProduct.rating && (Number(newProduct.rating) < 0 || Number(newProduct.rating) > 5)) {
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
  const allFields = ['name', 'category', 'price', 'image', 'description'];
  const touchedObj = {};
  allFields.forEach(field => touchedObj[field] = true);
  setTouched(touchedObj);

  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  // Prepare product data with additional fields
  const productData = {
    ...newProduct,
    images: featuredImages,
    specifications: specifications.filter(spec => spec.key && spec.value),
    variants: variants.filter(variant => variant.name),
    sku: generateSKU(),
    tags: [] // Add tags if you have them
  };

  console.log('Product data prepared:', productData); // Debug log
  
  // Call the handleAddProduct function WITH the prepared data
  await handleAddProduct(productData);
  
  // Remove this line: setNewProduct(productData);
  // Remove this line: if (!actionLoading) { resetForm(); }
};

  const generateSKU = () => {
    const prefix = newProduct.category?.substring(0, 3).toUpperCase() || 'PRO';
    const random = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-${random}`;
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      description: "",
      category: "",
      price: "",
      stock: "",
      image: "",
      status: "active",
      rating: "",
      sales: "",
      images: [],
      specifications: [],
      variants: [],
      tags: [],
    });
    setFeaturedImages([]);
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
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
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
    if (url && !featuredImages.includes(url)) {
      setFeaturedImages([url, ...featuredImages.slice(0, 4)]);
    }
  };

  const removeFeaturedImage = (index) => {
    const updated = featuredImages.filter((_, i) => i !== index);
    setFeaturedImages(updated);
  };

  if (!showAddModal) return null;

  const isButtonDisabled = actionLoading || !isFormValid();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Add New Product</h3>
              <p className="text-sm text-gray-600 mt-1">Fill in the product details below</p>
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
            {/* Basic Information Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      Product Name <span className="text-red-500">*</span>
                      {touched.name && errors.name && (
                        <Info className="w-4 h-4 text-red-500" />
                      )}
                    </label>
                    <input
                      type="text"
                      value={newProduct.name || ""}
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

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newProduct.category || ""}
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
                        .filter((cat) => cat !== "all")
                        .map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Price */}
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
                        value={newProduct.price || ""}
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

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={newProduct.stock || ""}
                      onChange={(e) => handleNumberChange("stock", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                      placeholder="Enter stock quantity"
                      min="0"
                      disabled={actionLoading}
                    />
                  </div>
                </div>

                {/* Right Column - Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Product Image <span className="text-red-500">*</span>
                  </label>
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    existingImage={newProduct.image || ""}
                    disabled={actionLoading}
                    className="h-64"
                  />
                  {touched.image && errors.image && (
                    <p className="text-red-500 text-sm mt-2">{errors.image}</p>
                  )}

                  {/* Featured Images */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Images (Max 5)
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {featuredImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Featured ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeaturedImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {featuredImages.length < 5 && (
                        <button
                          type="button"
                          onClick={() => document.getElementById('additional-upload')?.click()}
                          className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-20 hover:border-blue-500 transition-colors"
                        >
                          <Plus className="w-6 h-6 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-1">Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newProduct.description || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                placeholder="Enter detailed product description..."
                disabled={actionLoading}
              />
            </div>

            {/* Specifications */}
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

            {/* Variants */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Product Variants</h4>
                <button
                  type="button"
                  onClick={addVariant}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Variant
                </button>
              </div>
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                      placeholder="Variant name (e.g., Size, Color)"
                    />
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                      placeholder="Price"
                      min="0"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                        placeholder="Stock"
                        min="0"
                      />
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="px-3 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={newProduct.status || "active"}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Rating
                </label>
                <input
                  type="number"
                  value={newProduct.rating || ""}
                  onChange={(e) => handleNumberChange("rating", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                  placeholder="0.0"
                  step="0.1"
                  min="0"
                  max="5"
                  disabled={actionLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Sales
                </label>
                <input
                  type="number"
                  value={newProduct.sales || ""}
                  onChange={(e) => handleNumberChange("sales", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                  placeholder="0"
                  min="0"
                  disabled={actionLoading}
                />
              </div>
            </div>

            {/* Action Buttons */}
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
                    : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {actionLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Adding Product...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Add Product
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