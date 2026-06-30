// components/Admin/Order-Management/AdHocPackingSlip.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Printer,
  Download,
  X,
  Package,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Loader,
  AlertCircle,
  QrCode,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import TantikaLogo from '../../../Assets/TantikaLogo.png';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const AdHocPackingSlip = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [qrError, setQrError] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const printRef = useRef(null);

  // ========== State for API data ==========
  const [artisans, setArtisans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingArtisans, setLoadingArtisans] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [artisanSearchTerm, setArtisanSearchTerm] = useState('');
  const [showArtisanDropdown, setShowArtisanDropdown] = useState(false);
  const [productSearchTerms, setProductSearchTerms] = useState({});
  const [productSearchResults, setProductSearchResults] = useState({});
  const [activeItemId, setActiveItemId] = useState(null);

  // ========== Refs for dropdowns ==========
  const artisanDropdownRef = useRef(null);
  const productDropdownRefs = useRef({});

  // Form state
  const [formData, setFormData] = useState({
    orderNumber: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    },
    orderDate: new Date().toISOString().split('T')[0],
    artisanName: '',
    paymentMethod: 'offline',
    subtotal: '',
    tax: '',
    shippingCost: '',
    total: '',
    items: [
      { id: 1, name: '', quantity: 1, price: '', sku: '', productId: '' }
    ],
    status: 'confirmed',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // ========== Close dropdowns when clicking outside ==========
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close artisan dropdown
      if (artisanDropdownRef.current && !artisanDropdownRef.current.contains(event.target)) {
        setShowArtisanDropdown(false);
      }
      
      // Close product dropdowns
      Object.keys(productDropdownRefs.current).forEach((key) => {
        if (productDropdownRefs.current[key] && 
            !productDropdownRefs.current[key].contains(event.target)) {
          setActiveItemId(null);
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ========== Fetch Artisans ==========
  const fetchArtisans = async () => {
    try {
      setLoadingArtisans(true);
      const token = localStorage.getItem('tantika_token');
      
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/artisans?page=1&limit=100&status=all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && data.data) {
        const artisanList = data.data.artisans || [];
        setArtisans(artisanList);
        
        if (artisanList.length > 0 && !formData.artisanName) {
          const defaultArtisan = artisanList[0];
          setFormData(prev => ({
            ...prev,
            artisanName: defaultArtisan.businessName || defaultArtisan.fullName || ''
          }));
          setArtisanSearchTerm(defaultArtisan.businessName || defaultArtisan.fullName || '');
        }
      }
    } catch (error) {
      console.error('Error fetching artisans:', error);
    } finally {
      setLoadingArtisans(false);
    }
  };

  // ========== Fetch Products ==========
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem('tantika_token');
      
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/products?page=1&limit=200&status=active&approvalStatus=approved`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        const productList = data.data || [];
        setProducts(productList);
        
        const initialResults = {};
        formData.items.forEach(item => {
          initialResults[item.id] = productList.slice(0, 5);
        });
        setProductSearchResults(initialResults);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // ========== Search Products ==========
  const searchProducts = (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return products.slice(0, 5);
    }
    const term = searchTerm.toLowerCase().trim();
    return products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      (product.sku && product.sku.toLowerCase().includes(term)) ||
      (product.category && product.category.toLowerCase().includes(term))
    ).slice(0, 10);
  };

  // ========== Load data on mount ==========
  useEffect(() => {
    fetchArtisans();
    fetchProducts();
    generateQRCode();
  }, []);

  // ========== Update product search results ==========
  useEffect(() => {
    if (products.length > 0) {
      const initialResults = {};
      formData.items.forEach(item => {
        initialResults[item.id] = products.slice(0, 5);
      });
      setProductSearchResults(initialResults);
    }
  }, [products]);

  // Generate QR Code
  const generateQRCode = async () => {
    setLoading(true);
    setQrError(false);
    
    try {
      const qrText = `https://tantikacrafts.netlify.app`;
      const qrApiUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrText)}&size=200&margin=4&dark=1a1a2e&light=ffffff&format=png`;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = qrApiUrl;
      });
      
      setQrCodeUrl(qrApiUrl);
    } catch (error) {
      console.error('QR Code generation error:', error);
      setQrError(true);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // ========== Filtered artisans based on search ==========
  const filteredArtisans = artisans.filter(artisan => {
    const searchLower = artisanSearchTerm.toLowerCase();
    const name = (artisan.businessName || artisan.fullName || '').toLowerCase();
    return name.includes(searchLower);
  });

  // ========== Handle artisan selection ==========
  const handleArtisanSelect = (artisan) => {
    const displayName = artisan.businessName || artisan.fullName || '';
    setFormData({
      ...formData,
      artisanName: displayName
    });
    setArtisanSearchTerm(displayName);
    setShowArtisanDropdown(false);
  };

  // ========== Handle artisan input focus ==========
  const handleArtisanFocus = () => {
    setShowArtisanDropdown(true);
    // If search term is empty, show all artisans
    if (!artisanSearchTerm) {
      const allArtisans = artisans.map(a => a.businessName || a.fullName || '');
      // Keep the dropdown open with all artisans
    }
  };

  // ========== Handle product selection ==========
  const handleProductSelect = (itemId, product) => {
    const updatedItems = formData.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          name: product.name,
          price: product.price.toString(),
          sku: product.sku || '',
          productId: product._id
        };
      }
      return item;
    });
    
    setFormData({
      ...formData,
      items: updatedItems
    });
    
    setProductSearchTerms(prev => ({
      ...prev,
      [itemId]: product.name
    }));
    
    setProductSearchResults(prev => ({
      ...prev,
      [itemId]: [product]
    }));
    
    setActiveItemId(null);
  };

  // ========== Handle product search term change ==========
  const handleProductSearchChange = (itemId, value) => {
    setProductSearchTerms(prev => ({
      ...prev,
      [itemId]: value
    }));
    
    const updatedItems = formData.items.map(item => {
      if (item.id === itemId) {
        return { ...item, name: value, productId: '' };
      }
      return item;
    });
    
    setFormData({
      ...formData,
      items: updatedItems
    });
    
    // Only search if there's a search term
    if (value && value.trim()) {
      const results = searchProducts(value);
      setProductSearchResults(prev => ({
        ...prev,
        [itemId]: results
      }));
    } else {
      setProductSearchResults(prev => ({
        ...prev,
        [itemId]: products.slice(0, 5)
      }));
    }
  };

  // ========== Handle product input focus ==========
  const handleProductFocus = (itemId) => {
    setActiveItemId(itemId);
    // Show results if there's a search term
    const searchTerm = productSearchTerms[itemId] || '';
    if (searchTerm.trim()) {
      const results = searchProducts(searchTerm);
      setProductSearchResults(prev => ({
        ...prev,
        [itemId]: results
      }));
    } else {
      setProductSearchResults(prev => ({
        ...prev,
        [itemId]: products.slice(0, 5)
      }));
    }
  };

  // Add item row
  const addItem = () => {
    const newId = formData.items.length > 0 
      ? Math.max(...formData.items.map(i => i.id)) + 1 
      : 1;
    setFormData({
      ...formData,
      items: [...formData.items, { id: newId, name: '', quantity: 1, price: '', sku: '', productId: '' }]
    });
    setProductSearchResults(prev => ({
      ...prev,
      [newId]: products.slice(0, 5)
    }));
    // Register ref for new item
    productDropdownRefs.current[newId] = React.createRef();
  };

  // Remove item row
  const removeItem = (id) => {
    if (formData.items.length <= 1) {
      alert('At least one item is required');
      return;
    }
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id)
    });
    setProductSearchTerms(prev => {
      const newTerms = { ...prev };
      delete newTerms[id];
      return newTerms;
    });
    setProductSearchResults(prev => {
      const newResults = { ...prev };
      delete newResults[id];
      return newResults;
    });
    delete productDropdownRefs.current[id];
  };

  // Update item field
  const updateItem = (id, field, value) => {
    setFormData({
      ...formData,
      items: formData.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  // Update form field
  const updateField = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Update address field
  const updateAddress = (field, value) => {
    setFormData({
      ...formData,
      shippingAddress: {
        ...formData.shippingAddress,
        [field]: value
      }
    });
  };

  // Auto-calculate total
  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.quantity) || 0;
      return sum + (price * qty);
    }, 0);
    
    const tax = parseFloat(formData.tax) || 0;
    const shipping = parseFloat(formData.shippingCost) || 0;
    const total = subtotal + tax + shipping;
    
    setFormData({
      ...formData,
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2)
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.orderNumber.trim()) newErrors.orderNumber = 'Order number is required';
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Customer phone is required';
    if (!formData.shippingAddress.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!formData.shippingAddress.state.trim()) newErrors.state = 'State is required';
    if (!formData.shippingAddress.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (parseFloat(formData.total) <= 0) newErrors.total = 'Total amount must be greater than 0';
    
    formData.items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`item_${index}_name`] = 'Item name is required';
      }
      if (parseFloat(item.price) <= 0) {
        newErrors[`item_${index}_price`] = 'Valid price is required';
      }
      if (parseInt(item.quantity) <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be at least 1';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate packing slip
  const handleGenerate = () => {
    if (!validateForm()) {
      alert('Please fix all errors before generating the packing slip.');
      return;
    }
    setShowForm(false);
  };

  // Go back to form
  const handleEdit = () => {
    setShowForm(true);
  };

  // Generate PDF
  const handleGeneratePDF = async () => {
    if (!printRef.current) return;
    
    try {
      setGeneratingPDF(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a5');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`packing-slip-${formData.orderNumber}.pdf`);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-indigo-100 text-indigo-800',
      'processing': 'bg-purple-100 text-purple-800',
      'ready_to_ship': 'bg-cyan-100 text-cyan-800',
      'shipped': 'bg-blue-100 text-blue-800',
      'out_for_delivery': 'bg-teal-100 text-teal-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'ready_to_ship': 'Ready to Ship',
      'shipped': 'Shipped',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status || 'Unknown';
  };

  const getArtisanDisplayName = (artisan) => {
    return artisan.businessName || artisan.fullName || '';
  };

  // Render form
  const renderForm = () => (
    <div className="p-6 overflow-y-auto max-h-[80vh]">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 rounded-xl">
            <Edit3 className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Create Offline Packing Slip</h3>
            <p className="text-sm text-gray-600">Enter the order details manually</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.orderNumber}
              onChange={(e) => updateField('orderNumber', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                errors.orderNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., OFFLINE-001"
            />
            {errors.orderNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.orderNumber}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Date
            </label>
            <input
              type="date"
              value={formData.orderDate}
              onChange={(e) => updateField('orderDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-600" />
            Customer Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => updateField('customerName', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.customerName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Customer name"
              />
              {errors.customerName && (
                <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerPhone}
                onChange={(e) => updateField('customerPhone', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.customerPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Phone number"
              />
              {errors.customerPhone && (
                <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => updateField('customerEmail', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Email address"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-600" />
            Shipping Address
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.shippingAddress.street}
                onChange={(e) => updateAddress('street', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.street ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Street address"
              />
              {errors.street && (
                <p className="text-red-500 text-xs mt-1">{errors.street}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.shippingAddress.city}
                onChange={(e) => updateAddress('city', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="City"
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.shippingAddress.state}
                onChange={(e) => updateAddress('state', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="State"
              />
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.shippingAddress.postalCode}
                onChange={(e) => updateAddress('postalCode', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.postalCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Postal code"
              />
              {errors.postalCode && (
                <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.shippingAddress.country}
                onChange={(e) => updateAddress('country', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Country"
              />
            </div>
          </div>
        </div>

        {/* ========== Artisan Dropdown ========== */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-600" />
            Artisan Details
          </h4>
          <div ref={artisanDropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Artisan Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={artisanSearchTerm}
                onChange={(e) => {
                  setArtisanSearchTerm(e.target.value);
                  if (e.target.value === '') {
                    setFormData({ ...formData, artisanName: '' });
                    // Show all artisans when search is cleared
                    setShowArtisanDropdown(true);
                  }
                }}
                onFocus={handleArtisanFocus}
                placeholder="Search for an artisan..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {loadingArtisans && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            
            {showArtisanDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {loadingArtisans ? (
                  <div className="px-4 py-2 text-gray-500 text-sm">Loading artisans...</div>
                ) : filteredArtisans.length === 0 ? (
                  <div className="px-4 py-2 text-gray-500 text-sm">No artisans found</div>
                ) : (
                  filteredArtisans.map((artisan) => (
                    <div
                      key={artisan._id}
                      className="px-4 py-2 hover:bg-amber-50 cursor-pointer transition-colors flex items-center justify-between"
                      onClick={() => handleArtisanSelect(artisan)}
                    >
                      <span className="text-sm">{getArtisanDisplayName(artisan)}</span>
                      {artisan.businessName && artisan.fullName && artisan.businessName !== artisan.fullName && (
                        <span className="text-xs text-gray-400">({artisan.fullName})</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {formData.artisanName && (
            <p className="text-xs text-green-600 mt-1">Selected: {formData.artisanName}</p>
          )}
        </div>

        {/* ========== Items with Product Dropdown ========== */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-600" />
            Items <span className="text-red-500">*</span>
          </h4>
          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div 
                key={item.id} 
                ref={el => {
                  if (el) {
                    productDropdownRefs.current[item.id] = el;
                  }
                }}
                className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2 relative">
                    <input
                      type="text"
                      value={productSearchTerms[item.id] || item.name || ''}
                      onChange={(e) => handleProductSearchChange(item.id, e.target.value)}
                      onFocus={() => handleProductFocus(item.id)}
                      placeholder="Search or type product name..."
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        errors[`item_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                    />
                    {loadingProducts && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader className="w-3 h-3 animate-spin text-gray-400" />
                      </div>
                    )}
                    {/* Product dropdown - only show when this item is active */}
                    {activeItemId === item.id && productSearchResults[item.id] && productSearchResults[item.id].length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {productSearchResults[item.id].map((product) => (
                          <div
                            key={product._id}
                            className="px-3 py-2 hover:bg-amber-50 cursor-pointer transition-colors"
                            onClick={() => handleProductSelect(item.id, product)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{product.name}</span>
                              <span className="text-xs text-gray-500">₹{product.price}</span>
                            </div>
                            {product.sku && (
                              <div className="text-xs text-gray-400">SKU: {product.sku}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {errors[`item_${index}_name`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_name`]}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                      placeholder="Qty"
                      min="1"
                    />
                    {errors[`item_${index}_quantity`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_quantity`]}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        errors[`item_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                      placeholder="Price"
                      min="0"
                      step="0.01"
                    />
                    {errors[`item_${index}_price`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_price`]}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addItem}
            className="mt-3 flex items-center gap-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => updateField('paymentMethod', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="offline">Offline</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => updateField('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="ready_to_ship">Ready to Ship</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shipping Cost
            </label>
            <input
              type="number"
              value={formData.shippingCost}
              onChange={(e) => updateField('shippingCost', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtotal
            </label>
            <input
              type="number"
              value={formData.subtotal}
              onChange={(e) => updateField('subtotal', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax
            </label>
            <input
              type="number"
              value={formData.tax}
              onChange={(e) => updateField('tax', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={formData.total}
                onChange={(e) => updateField('total', e.target.value)}
                className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.total ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                step="0.01"
              />
              <button
                onClick={calculateTotal}
                className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors whitespace-nowrap"
              >
                Calculate
              </button>
            </div>
            {errors.total && (
              <p className="text-red-500 text-xs mt-1">{errors.total}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Any special instructions or notes..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Generate Packing Slip
          </button>
        </div>
      </div>
    </div>
  );

  // Render packing slip
  const renderPackingSlip = () => (
    <>
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div 
          ref={printRef}
          className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto print:shadow-none print:p-6"
          style={{ width: '210mm', minHeight: '148mm' }}
        >
          <div className="space-y-6">
            {/* Header with Logo */}
            <div className="flex justify-between items-start border-b-2 border-gray-200 pb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={TantikaLogo} 
                  alt="তন্তিকা" 
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div>
                  <h1 className="text-2xl font-bold text-amber-700">তন্তিকা</h1>
                  <p className="text-sm text-gray-500">Handcrafted with ❤️</p>
                  <p className="text-sm text-gray-500">https://tantikacrafts.netlify.app</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-600">PACKING SLIP</div>
                <div className="text-xs text-gray-400 mt-1">Date: {formatDate(new Date())}</div>
                <div className="text-xs text-gray-400">Order: #{formData.orderNumber}</div>
              </div>
            </div>

            {/* Status
            <div className="flex justify-center">
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(formData.status)}`}>
                Status: {getStatusLabel(formData.status)}
              </span>
            </div> */}

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-600" />
                  Customer Details
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                  <p className="font-medium">{formData.customerName}</p>
                  <p className="text-gray-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {formData.customerPhone}
                  </p>
                  {formData.customerEmail && (
                    <p className="text-gray-600 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {formData.customerEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  Shipping Address
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p className="font-medium">{formData.customerName}</p>
                  <p className="text-gray-600 mt-1">
                    {formData.shippingAddress.street}
                  </p>
                  <p className="text-gray-600">
                    {formData.shippingAddress.city}, {formData.shippingAddress.state} - {formData.shippingAddress.postalCode}
                  </p>
                  <p className="text-gray-600">{formData.shippingAddress.country}</p>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  Order Information
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                  <p><span className="font-medium">Order Date:</span> {formatDate(formData.orderDate)}</p>
                  <p><span className="font-medium">Artisan:</span> {formData.artisanName || 'Not specified'}</p>
                  <p><span className="font-medium">Payment:</span> {formData.paymentMethod}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  Payment Summary
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                  <p><span className="font-medium">Subtotal:</span> {formatCurrency(formData.subtotal)}</p>
                  <p><span className="font-medium">Tax:</span> {formatCurrency(formData.tax)}</p>
                  <p><span className="font-medium">Shipping:</span> {formatCurrency(formData.shippingCost)}</p>
                  <p className="font-bold text-amber-700 border-t pt-1">
                    Total: {formatCurrency(formData.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                Items
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">#</th>
                      <th className="text-left px-3 py-2 font-semibold text-gray-600">Item</th>
                      <th className="text-center px-3 py-2 font-semibold text-gray-600">Qty</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-600">Price</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                        <td className="px-3 py-2">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.sku && <div className="text-xs text-gray-400">SKU: {item.sku}</div>}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.price)}</td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatCurrency((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t">
                    <tr>
                      <td colSpan="4" className="px-3 py-2 text-right font-medium">Subtotal</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(formData.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan="4" className="px-3 py-2 text-right text-sm text-gray-600">Shipping</td>
                      <td className="px-3 py-2 text-right text-sm">{formatCurrency(formData.shippingCost)}</td>
                    </tr>
                    <tr>
                      <td colSpan="4" className="px-3 py-2 text-right text-sm text-gray-600">Tax</td>
                      <td className="px-3 py-2 text-right text-sm">{formatCurrency(formData.tax)}</td>
                    </tr>
                    <tr className="border-t-2 border-amber-600">
                      <td colSpan="4" className="px-3 py-2 text-right font-bold text-amber-700">Total</td>
                      <td className="px-3 py-2 text-right font-bold text-amber-700">{formatCurrency(formData.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-between items-center border-t-2 border-gray-200 pt-4">
              <div className="text-xs text-gray-400">
                <p>Thank you for shopping with তন্তিকা!</p>
                <p className="mt-1">Scan the QR code to visit our website</p>
              </div>
              <div className="flex items-center gap-4">
                {loading ? (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Loader className="w-6 h-6 animate-spin text-amber-600" />
                  </div>
                ) : qrError ? (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-col">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                    <span className="text-xs text-red-500">QR Error</span>
                  </div>
                ) : qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="Visit তন্তিকা Website" 
                    className="w-20 h-20 border-2 border-gray-200 rounded-lg"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  <p className="font-medium">Scan to Visit Us!</p>
                  <p className="text-gray-400">তন্তিকা Crafts</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-400 border-t pt-4">
              <p>Generated on {formatDate(new Date())}</p>
              <p className="mt-1">This is a system generated packing slip for order #{formData.orderNumber}</p>
              {formData.notes && (
                <p className="mt-1 text-amber-600">📝 {formData.notes}</p>
              )}
              <p className="mt-1">Thank you for supporting handcrafted products! 🙏</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              {showForm ? 'Create Offline Packing Slip' : `Packing Slip - ${formData.orderNumber}`}
            </h3>
            <p className="text-gray-600 text-sm">
              {showForm ? 'Enter order details manually' : 'Review and print the packing slip'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!showForm && (
              <>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={handleGeneratePDF}
                  disabled={generatingPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {generatingPDF ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download PDF
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {showForm ? renderForm() : renderPackingSlip()}
      </div>
    </div>
  );
};

export default AdHocPackingSlip;