import { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, X, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { ModalContainer } from './ModalContainer';
import { Link } from 'react-router-dom';

export const WishlistModal = ({ 
  isOpen, 
  onClose, 
  userId,
  onRefreshDashboard 
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch wishlist items when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchWishlistItems();
    }
  }, [isOpen, userId]);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('tantika_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/usernorms/wishlist`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          return;
        }
        throw new Error(`Failed to fetch wishlist: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setItems(data.data.items || []);
      } else {
        throw new Error(data.message || 'Failed to load wishlist');
      }
      
    } catch (err) {
      console.error('Wishlist fetch error:', err);
      setError(err.message || 'Failed to load wishlist items');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setRemovingId(productId);
      setError(null);
      
      const token = localStorage.getItem('tantika_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/usernorms/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove item from local state
        setItems(prev => prev.filter(item => item.productId !== productId));
        
        // Refresh dashboard stats
        if (onRefreshDashboard) {
          onRefreshDashboard();
        }
      } else {
        throw new Error(data.message || 'Failed to remove item');
      }
      
    } catch (err) {
      console.error('Remove item error:', err);
      setError(err.message || 'Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  const handleMoveToCart = async (item) => {
    try {
      setAddingToCartId(item.productId);
      setError(null);
      
      // First, add to cart (implement your cart API)
      const token = localStorage.getItem('tantika_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      // TODO: Replace with your actual add to cart API
      const cartResponse = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          productPrice: item.productPrice,
          quantity: 1,
          artisan: item.artisan
        })
      });

      const cartData = await cartResponse.json();
      
      if (!cartData.success) {
        throw new Error(cartData.message || 'Failed to add to cart');
      }

      // Then, remove from wishlist
      await handleRemoveItem(item.productId);
      
    } catch (err) {
      console.error('Move to cart error:', err);
      setError(err.message || 'Failed to move to cart');
    } finally {
      setAddingToCartId(null);
    }
  };

  const handleClearWishlist = async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('tantika_token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/usernorms/wishlist`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setItems([]);
        
        // Refresh dashboard stats
        if (onRefreshDashboard) {
          onRefreshDashboard();
        }
      } else {
        throw new Error(data.message || 'Failed to clear wishlist');
      }
      
    } catch (err) {
      console.error('Clear wishlist error:', err);
      setError(err.message || 'Failed to clear wishlist');
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (item) => {
    if (item.productImage) {
      return (
        <img 
          src={item.productImage} 
          alt={item.productName}
          className="w-20 h-20 object-cover rounded-lg"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://via.placeholder.com/80?text=${encodeURIComponent(item.productName.charAt(0))}`;
          }}
        />
      );
    }
    
    // Fallback colored placeholder
    const colors = ['bg-blue-100', 'bg-purple-100', 'bg-pink-100', 'bg-amber-100'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    return (
      <div className={`w-20 h-20 ${randomColor} rounded-lg flex items-center justify-center`}>
        <span className="text-2xl">
          {item.productName?.charAt(0) || '🎁'}
        </span>
      </div>
    );
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="My Wishlist"
      size="xl"
    >
      <div className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your wishlist...</p>
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Start adding items you love!</p>
            <Link
              to="/shop"
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              <span>Browse Shop</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ) : (
          <>
            {/* Wishlist Items */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.productId || item._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    {getProductImage(item)}
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 truncate">{item.productName}</h4>
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            by {item.artisan || 'Unknown Artisan'}
                          </p>
                          {item.category && (
                            <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {item.category}
                            </span>
                          )}
                          
                          {/* Availability */}
                          {item.isAvailable === false && (
                            <div className="inline-flex items-center mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Currently Unavailable
                            </div>
                          )}
                        </div>
                        
                        {/* Price */}
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            ₹{item.productPrice?.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Added: {new Date(item.addedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <Link
                          to={`/product/${item.productId}`}
                          onClick={onClose}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                        >
                          View Details
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                        
                        <div className="flex space-x-2">
                          {/* <button
                            onClick={() => handleMoveToCart(item)}
                            disabled={addingToCartId === item.productId}
                            className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Move to Cart"
                          >
                            {addingToCartId === item.productId ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <ShoppingCart className="w-3 h-3 mr-1" />
                            )}
                            Cart
                          </button> */}
                          
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            disabled={removingId === item.productId}
                            className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remove from Wishlist"
                          >
                            {removingId === item.productId ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3 mr-1" />
                            )}
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{items.length}</span> item{items.length !== 1 ? 's' : ''} in wishlist
                {items.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Total value: ₹{items.reduce((sum, item) => sum + item.productPrice, 0).toLocaleString()}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                {items.length > 0 && (
                  <button
                    onClick={handleClearWishlist}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                  >
                    Clear All
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center text-sm"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </ModalContainer>
  );
};