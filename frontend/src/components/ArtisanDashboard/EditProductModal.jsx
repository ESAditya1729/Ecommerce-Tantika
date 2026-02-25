// frontend\src\components\ArtisanDashboard\EditProductModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Star,
  AlertCircle,
  Info,
  Camera,
  Trash2,
  Loader2,
} from "lucide-react";
import ImageUpload from "../Common/ImageUpload";

const EditProductModal = ({
  showEditModal,
  setShowEditModal,
  editingProduct,
  setEditingProduct,
  categories,
  actionLoading,
  handleUpdateProduct,
}) => {
  const [productImages, setProductImages] = useState([]);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [originalProduct, setOriginalProduct] = useState(null);

  // Safely process categories to ensure they are strings
  const safeCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    
    return categories
      .map(cat => {
        // If it's already a string, return it
        if (typeof cat === 'string') return cat;
        
        // If it's an object with a name property (like from your API), return the name
        if (cat && typeof cat === 'object') {
          if (cat.name) return cat.name;
          // If it has other properties but no name, stringify it (though this should be rare)
          return JSON.stringify(cat);
        }
        
        // For any other type, convert to string
        return String(cat);
      })
      .filter(cat => {
        // Filter out empty strings and "All" if you don't want it
        return cat && cat !== "" && cat !== "All";
      });
  }, [categories]);

  // Helper function to extract primitive values from MongoDB-style objects
  const extractValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    // Handle MongoDB ObjectId format
    if (value && typeof value === "object" && value.$oid) {
      return value.$oid;
    }

    // Handle MongoDB Date format
    if (value && typeof value === "object" && value.$date) {
      return value.$date;
    }

    // Handle any other object with a name property (like category breakdown)
    if (value && typeof value === "object" && value.name) {
      return value.name;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((item) => extractValue(item));
    }

    // If it's an object but not a recognized format, stringify it
    if (typeof value === "object") {
      console.warn("Converting object to string:", value);
      return JSON.stringify(value);
    }

    // Return primitive values as-is
    return value;
  };

  // Flatten MongoDB-style nested objects
  const flattenProduct = (product) => {
    if (!product) return null;

    try {
      // Extract _id properly
      let id = product._id;
      if (id && typeof id === "object") {
        id = id.$oid || id._id || JSON.stringify(id);
      }

      // Extract artisan ID if needed
      let artisanId = product.artisan;
      if (artisanId && typeof artisanId === "object") {
        artisanId = artisanId.$oid || artisanId._id || null;
      }

      // Extract dates
      let createdAt = product.createdAt;
      if (createdAt && typeof createdAt === "object") {
        createdAt = createdAt.$date || new Date().toISOString();
      }

      let updatedAt = product.updatedAt;
      if (updatedAt && typeof updatedAt === "object") {
        updatedAt = updatedAt.$date || new Date().toISOString();
      }

      let submittedAt = product.submittedAt;
      if (submittedAt && typeof submittedAt === "object") {
        submittedAt = submittedAt.$date || new Date().toISOString();
      }

      // Extract specifications if they exist
      let specifications = product.specifications || [];
      if (Array.isArray(specifications)) {
        specifications = specifications.map((spec) => ({
          key: extractValue(spec.key),
          value: extractValue(spec.value),
        }));
      }

      // Create flattened product object with only primitive values
      const flattened = {
        _id: id,
        name: extractValue(product.name) || "",
        description: extractValue(product.description) || "",
        category: extractValue(product.category) || "",
        price:
          typeof product.price === "number"
            ? product.price
            : parseFloat(product.price) || 0,
        stock:
          typeof product.stock === "number"
            ? product.stock
            : parseInt(product.stock) || 0,
        status: extractValue(product.status) || "draft",
        approvalStatus: extractValue(product.approvalStatus) || "draft",
        sales:
          typeof product.sales === "number"
            ? product.sales
            : parseInt(product.sales) || 0,
        rating:
          typeof product.rating === "number"
            ? product.rating
            : parseFloat(product.rating) || 4.0,
        reviewCount:
          typeof product.reviewCount === "number"
            ? product.reviewCount
            : parseInt(product.reviewCount) || 0,
        image: extractValue(product.image) || "",
        images: Array.isArray(product.images)
          ? product.images
              .map((img) => extractValue(img))
              .filter((img) => img && typeof img === "string")
          : [],
        galleryImages: Array.isArray(product.galleryImages)
          ? product.galleryImages
              .map((img) => extractValue(img))
              .filter((img) => img && typeof img === "string")
          : [],
        specifications: specifications,
        variants: product.variants || [],
        features: product.features || [],
        tags: Array.isArray(product.tags)
          ? product.tags.map((tag) => extractValue(tag))
          : [],
        colors: Array.isArray(product.colors)
          ? product.colors.map((color) => extractValue(color))
          : [],
        sizes: Array.isArray(product.sizes)
          ? product.sizes.map((size) => extractValue(size))
          : [],
        materials: Array.isArray(product.materials)
          ? product.materials.map((mat) => extractValue(mat))
          : [],
        isFeatured: !!product.isFeatured,
        isBestSeller: !!product.isBestSeller,
        isNewArrival: !!product.isNewArrival,
        sku: extractValue(product.sku) || "",
        artisanSku: extractValue(product.artisanSku) || "",
        views:
          typeof product.views === "number"
            ? product.views
            : parseInt(product.views) || 0,
        wishlistCount:
          typeof product.wishlistCount === "number"
            ? product.wishlistCount
            : parseInt(product.wishlistCount) || 0,
        artisanViews:
          typeof product.artisanViews === "number"
            ? product.artisanViews
            : parseInt(product.artisanViews) || 0,
        rejectionReason: extractValue(product.rejectionReason) || "",
        createdAt: createdAt,
        updatedAt: updatedAt,
        submittedAt: submittedAt,
        artisan: artisanId,
        __v:
          typeof product.__v === "number"
            ? product.__v
            : parseInt(product.__v) || 0,
      };

      return flattened;
    } catch (error) {
      console.error("Error flattening product:", error, product);
      return null;
    }
  };

  // Initialize when product loads
  useEffect(() => {
    if (editingProduct) {
      console.log("Raw editingProduct:", editingProduct);

      // Flatten the product
      const flattenedProduct = flattenProduct(editingProduct);
      console.log("Flattened product:", flattenedProduct);

      if (flattenedProduct) {
        // Set images from either images array or galleryImages
        const allImages = [
          ...(flattenedProduct.images || []),
          ...(flattenedProduct.galleryImages || []),
        ].filter(
          (img, index, self) =>
            img && typeof img === "string" && self.indexOf(img) === index,
        );

        setProductImages(allImages);
        setOriginalProduct(flattenedProduct);

        // Update editing product with flattened version
        if (
          JSON.stringify(editingProduct) !== JSON.stringify(flattenedProduct)
        ) {
          setEditingProduct(flattenedProduct);
        }
      }

      // Reset errors and touched
      setErrors({});
      setTouched({});
    }
  }, [editingProduct, setEditingProduct]);

  // Check if product was approved and has changes
  const wasApproved = originalProduct?.approvalStatus === "approved";
  const hasChanges = () => {
    if (!originalProduct || !editingProduct) return false;

    // Compare relevant fields
    const fieldsToCompare = [
      "name",
      "description",
      "category",
      "price",
      "stock",
      "rating",
      "image",
    ];
    return fieldsToCompare.some(
      (field) => originalProduct[field] !== editingProduct[field],
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editingProduct.name?.trim())
      newErrors.name = "Product name is required";
    if (!editingProduct.category?.trim())
      newErrors.category = "Category is required";
    if (!editingProduct.price || Number(editingProduct.price) <= 0) {
      newErrors.price = "Valid price is required";
    }
    if (!editingProduct.image?.trim())
      newErrors.image = "Product image is required";

    const rating = parseFloat(editingProduct.rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      newErrors.rating = "Rating must be between 0 and 5";
    }

    return newErrors;
  };

  const isFormValid = () => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields = ["name", "category", "price", "image", "rating"];
    const touchedObj = {};
    allFields.forEach((field) => (touchedObj[field] = true));
    setTouched(touchedObj);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Prepare product data with flattened values
    const productData = {
      ...editingProduct,
      name: editingProduct.name?.trim() || "",
      description: editingProduct.description?.trim() || "",
      category: editingProduct.category || "",
      price: parseFloat(editingProduct.price) || 0,
      stock: parseInt(editingProduct.stock) || 0,
      rating: parseFloat(editingProduct.rating) || 4.0,
      images: productImages.filter((img) => img && typeof img === "string"),
      image: productImages[0] || editingProduct.image || "",
      sales: parseInt(editingProduct.sales) || 0,
    };

    // If product was approved and has changes, reset approval status to pending
    if (wasApproved && hasChanges()) {
      productData.approvalStatus = "pending";
      productData.status = "draft";
      productData.submittedAt = new Date().toISOString();
    }

    console.log("Submitting updated product:", productData);
    handleUpdateProduct(productData);
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const validationErrors = validateForm();
    setErrors(validationErrors);
  };

  const handleNumberChange = (field, value) => {
    if (value === "" || value === null || value === undefined) {
      setEditingProduct({ ...editingProduct, [field]: "" });
    } else {
      let numValue;

      if (field === "rating") {
        numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          numValue = Math.min(Math.max(numValue, 0), 5);
          numValue = Math.round(numValue * 10) / 10;
        }
      } else if (field === "price") {
        numValue = parseFloat(value);
      } else {
        numValue = parseInt(value, 10);
      }

      if (!isNaN(numValue)) {
        setEditingProduct({ ...editingProduct, [field]: numValue });
        // Clear error for this field
        if (errors[field]) {
          setErrors({ ...errors, [field]: undefined });
        }
      }
    }
  };

  const handleRatingChange = (rating) => {
    setEditingProduct({ ...editingProduct, rating });
    if (errors.rating) {
      setErrors({ ...errors, rating: undefined });
    }
  };

  const handleAddImage = (url) => {
    if (url && typeof url === "string") {
      const updatedImages = [...productImages, url];
      setProductImages(updatedImages);
      setEditingProduct({
        ...editingProduct,
        images: updatedImages,
        image: updatedImages[0] || editingProduct.image,
      });
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = productImages.filter((_, i) => i !== index);
    setProductImages(updatedImages);
    setEditingProduct({
      ...editingProduct,
      images: updatedImages,
      image: updatedImages.length > 0 ? updatedImages[0] : "",
    });
  };

  const handleSetPrimaryImage = (index) => {
    const newPrimary = productImages[index];
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

  const resetForm = () => {
    setEditingProduct(null);
    setProductImages([]);
    setHoveredRating(0);
    setErrors({});
    setTouched({});
    setOriginalProduct(null);
    setShowEditModal(false);
  };

  const renderRatingStars = () => {
    const currentRating =
      hoveredRating || parseFloat(editingProduct?.rating) || 0;

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

  if (!showEditModal || !editingProduct) return null;

  const isButtonDisabled = actionLoading || !isFormValid();
  const currentRating = parseFloat(editingProduct.rating) || 4.0;
  const willRequireReapproval = wasApproved && hasChanges();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Edit Product</h3>
              <p className="text-sm text-gray-600 mt-1">
                Update your product details
              </p>
            </div>
            <button
              onClick={resetForm}
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
            {/* Re-approval Warning Banner */}
            {willRequireReapproval && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800 mb-1">
                      Changes Detected
                    </h4>
                    <p className="text-sm text-amber-700">
                      This product was previously approved. Any changes you make
                      will require
                      <span className="font-semibold">
                        {" "}
                        re-approval from admin
                      </span>{" "}
                      and will be marked as "Pending Review" until then.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                    value={editingProduct.name || ""}
                    onChange={(e) => {
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      });
                      if (errors.name)
                        setErrors({ ...errors, name: undefined });
                    }}
                    onBlur={() => handleBlur("name")}
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

                {/* Category - FIXED with safeCategories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingProduct.category || ""}
                    onChange={(e) => {
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value,
                      });
                      if (errors.category)
                        setErrors({ ...errors, category: undefined });
                    }}
                    onBlur={() => handleBlur("category")}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all ${
                      touched.category && errors.category
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    disabled={actionLoading}
                  >
                    <option value="">Select Category</option>
                    {safeCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {touched.category && errors.category && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.category}
                    </p>
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
                      value={editingProduct.price || ""}
                      onChange={(e) =>
                        handleNumberChange("price", e.target.value)
                      }
                      onBlur={() => handleBlur("price")}
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
                    value={editingProduct.stock || ""}
                    onChange={(e) =>
                      handleNumberChange("stock", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Enter stock quantity"
                    min="0"
                    disabled={actionLoading}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Primary Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`border-2 ${editingProduct.image ? "border-green-500" : "border-dashed border-gray-300"} rounded-xl p-4 transition-all`}
                  >
                    {editingProduct.image ? (
                      <div className="relative group">
                        <img
                          src={editingProduct.image}
                          alt="Product"
                          className="w-full h-40 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({ ...editingProduct, image: "" })
                          }
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <ImageUpload
                        onImageUpload={(url) => {
                          if (url) {
                            const updatedImages = [
                              url,
                              ...productImages.filter((img) => img !== url),
                            ];
                            setProductImages(updatedImages);
                            setEditingProduct({
                              ...editingProduct,
                              image: url,
                              images: updatedImages,
                            });
                          }
                        }}
                        existingImage=""
                        disabled={actionLoading}
                        className="h-40"
                      />
                    )}
                  </div>
                  {touched.image && errors.image && (
                    <p className="text-red-500 text-sm mt-2">{errors.image}</p>
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
                              className="w-full h-20 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/300";
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                              {index === 0 ? (
                                <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded">
                                  Primary
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(index)}
                                  className="text-xs bg-amber-500 text-white px-2 py-1 rounded hover:bg-amber-600"
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
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        value={currentRating}
                        onChange={(e) =>
                          handleNumberChange("rating", e.target.value)
                        }
                        onBlur={() => handleBlur("rating")}
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
                        Rating from 0 to 5
                      </span>
                    </div>
                    {renderRatingStars()}
                    {touched.rating && errors.rating && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.rating}
                      </p>
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
                value={editingProduct.description || ""}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    description: e.target.value,
                  })
                }
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="Describe your product, materials used, craftsmanship details..."
                disabled={actionLoading}
              />
            </div>

            {/* Status Information */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    Product Status
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Current Status</p>
                      <p className="text-sm font-medium text-gray-800">
                        {editingProduct.status || "draft"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Approval Status</p>
                      <p className="text-sm font-medium text-gray-800">
                        {willRequireReapproval
                          ? "Pending (will change)"
                          : editingProduct.approvalStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
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
                    : willRequireReapproval
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:from-amber-600 hover:to-orange-600"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-600"
                }`}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    Updating...
                  </>
                ) : willRequireReapproval ? (
                  "Submit Changes for Approval"
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