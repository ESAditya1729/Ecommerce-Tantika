// src/components/Modals/EditProductModal.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
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

  // Initialize images when product loads
  useEffect(() => {
    if (editingProduct) {
      setProductImages(editingProduct.images || []);
    }
  }, [editingProduct]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !editingProduct.name?.trim() ||
      !editingProduct.category?.trim() ||
      !editingProduct.price ||
      editingProduct.price <= 0 ||
      !editingProduct.image?.trim()
    ) {
      alert("Please fill in all required fields (*) with valid values");
      return;
    }

    // Call the update function
    handleUpdateProduct();
  };

  const isFormValid = () => {
    const hasName = editingProduct.name?.trim() !== "";
    const hasCategory = editingProduct.category?.trim() !== "";
    const hasValidPrice = editingProduct.price !== "" && 
                         Number(editingProduct.price) > 0;
    const hasImage = editingProduct.image?.trim() !== "";

    return hasName && hasCategory && hasValidPrice && hasImage;
  };

  const resetForm = () => {
    setEditingProduct(null);
    setProductImages([]);
    setShowEditModal(false);
  };

  const handleNumberChange = (field, value) => {
    if (value === "") {
      setEditingProduct({ ...editingProduct, [field]: "" });
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setEditingProduct({ ...editingProduct, [field]: numValue });
      }
    }
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

  if (!showEditModal || !editingProduct) return null;

  const isButtonDisabled = actionLoading || !isFormValid();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={editingProduct.name || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter product name"
                    disabled={actionLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={editingProduct.category || ""}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={editingProduct.price || ""}
                      onChange={(e) =>
                        handleNumberChange("price", e.target.value)
                      }
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={actionLoading}
                    />
                  </div>
                  {editingProduct.price !== "" && Number(editingProduct.price) <= 0 && (
                    <p className="text-red-500 text-sm mt-1">Price must be greater than 0</p>
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

              {/* Right Column - Images */}
              <div className="space-y-4">
                {/* Primary Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image *
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
                      }
                    }}
                    existingImage={editingProduct.image || ""}
                    disabled={actionLoading}
                  />
                  {!editingProduct.image && (
                    <p className="text-red-500 text-sm mt-1">Product image is required</p>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Rating
                  </label>
                  <input
                    type="number"
                    value={editingProduct.rating || ""}
                    onChange={(e) =>
                      handleNumberChange("rating", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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