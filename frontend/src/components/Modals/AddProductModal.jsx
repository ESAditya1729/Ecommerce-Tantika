// src/components/Modals/AddProductModal.jsx
import React from "react";
import { X } from "lucide-react";
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
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!isFormValid()) {
      alert("Please fill in all required fields (*) with valid values");
      return;
    }

    // Call the handleAddProduct function
    handleAddProduct();
  };

  // Determine if form is valid for button enable/disable
  const isFormValid = () => {
    // Check all required fields
    const hasName = newProduct.name?.trim() !== "";
    const hasCategory = newProduct.category?.trim() !== "";
    const hasValidPrice = newProduct.price !== "" && 
                         Number(newProduct.price) > 0;
    const hasImage = newProduct.image?.trim() !== "";

    // Debug logging - remove in production
    console.log("Form validation:", {
      hasName, hasCategory, hasValidPrice, hasImage,
      name: newProduct.name,
      category: newProduct.category,
      price: newProduct.price,
      image: newProduct.image
    });

    return hasName && hasCategory && hasValidPrice && hasImage;
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
    });
    setShowAddModal(false);
  };

  // Handle number input changes
  const handleNumberChange = (field, value) => {
    // Allow empty string or valid numbers
    if (value === "") {
      setNewProduct({ ...newProduct, [field]: "" });
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setNewProduct({ ...newProduct, [field]: numValue });
      }
    }
  };

  if (!showAddModal) return null;

  // Calculate button state
  const isButtonDisabled = actionLoading || !isFormValid();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Add New Product</h3>
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
                    value={newProduct.name || ""}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
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
                    value={newProduct.category || ""}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
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
                      value={newProduct.price || ""}
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
                  {newProduct.price !== "" && Number(newProduct.price) <= 0 && (
                    <p className="text-red-500 text-sm mt-1">Price must be greater than 0</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock || ""}
                    onChange={(e) =>
                      handleNumberChange("stock", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter stock quantity"
                    min="0"
                    disabled={actionLoading}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Image Upload Component */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                  </label>
                  <ImageUpload
                    onImageUpload={(url) => {
                      console.log("Setting image URL:", url);
                      setNewProduct((prev) => ({
                        ...prev,
                        image: url,
                        images: url ? [url] : [],
                      }));
                    }}
                    existingImage={
                      newProduct.image || newProduct.images?.[0] || ""
                    }
                    disabled={actionLoading}
                  />
                  {!newProduct.image && (
                    <p className="text-red-500 text-sm mt-1">Product image is required</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newProduct.status || "active"}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled={actionLoading}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Rating
                  </label>
                  <input
                    type="number"
                    value={newProduct.rating || ""}
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
                    value={newProduct.sales || ""}
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
                value={newProduct.description || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isButtonDisabled}
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                    Adding...
                  </>
                ) : (
                  "Add Product"
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