// components/Admin/Order-Management/OrderPackingSlip.jsx
import React, { useState, useEffect, useRef } from 'react';
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
  QrCode
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// ========== Import the logo ==========
import TantikaLogo from '../../../Assets/TantikaLogo.png';

const OrderPackingSlip = ({ order, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [qrError, setQrError] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const printRef = useRef(null);

  // ========== FIXED: Move useEffect before any conditional returns ==========
  useEffect(() => {
    if (order) {
      generateQRCode();
    }
  }, [order]);

  // ========== FIXED: Return after hooks are called ==========
  if (!order) return null;

  // Helper functions
  const getOrderNumber = () => order.orderNumber || 'N/A';
  const getCustomerName = () => order.customerName || order.customerDetails?.name || 'N/A';
  const getCustomerEmail = () => order.customerEmail || order.customerDetails?.email || 'N/A';
  const getCustomerPhone = () => order.customerPhone || order.customerDetails?.phone || 'N/A';
  
  const getCustomerAddress = () => {
    const address = order.customerAddress || order.customerDetails?.shippingAddress || order.customer?.shippingAddress;
    if (!address) return 'No address provided';
    if (typeof address === 'string') return address;
    const parts = [
      address.street || '',
      address.city || '',
      address.state || '',
      address.postalCode || '',
      address.country || 'India'
    ].filter(Boolean);
    return parts.join(', ') || 'No address provided';
  };

  const getArtisanName = () => {
    if (order.items && order.items.length > 0) {
      return order.items[0].artisanName || 'Unknown';
    }
    return order.artisanName || order.artisan || 'Unknown';
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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

  // ========== Using QuickChart for QR code generation ==========
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
      pdf.save(`packing-slip-${order.orderNumber}.pdf`);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Packing Slip
            </h3>
            <p className="text-gray-600 text-sm">Order #{getOrderNumber()}</p>
          </div>
          <div className="flex items-center gap-2">
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
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div 
            ref={printRef}
            className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto print:shadow-none print:p-6"
            style={{ width: '210mm', minHeight: '148mm' }}
          >
            <div className="space-y-6">
              {/* ========== Header with Logo ========== */}
              <div className="flex justify-between items-start border-b-2 border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                  {/* Logo */}
                  <img 
                    src={TantikaLogo} 
                    alt="তন্তিকা" 
                    className="h-16 w-auto object-contain"
                    onError={(e) => {
                      // Fallback if logo fails to load
                      e.target.style.display = 'none';
                    }}
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-amber-700">তন্তিকা</h1>
                    <p className="text-sm text-gray-500">Handcrafted with ❤️</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-600">PACKING SLIP</div>
                  <div className="text-xs text-gray-400 mt-1">Date: {formatDate(new Date())}</div>
                  <div className="text-xs text-gray-400">Order: #{getOrderNumber()}</div>
                </div>
              </div>

              {/* Status
              <div className="flex justify-center">
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  Status: {getStatusLabel(order.status)}
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
                    <p className="font-medium">{getCustomerName()}</p>
                    <p className="text-gray-600 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {getCustomerPhone()}
                    </p>
                    <p className="text-gray-600 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {getCustomerEmail()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    Shipping Address
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p className="font-medium">{getCustomerName()}</p>
                    <p className="text-gray-600 mt-1">{getCustomerAddress()}</p>
                    <p className="text-gray-600 mt-1">{getCustomerPhone()}</p>
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
                    <p><span className="font-medium">Order Date:</span> {formatDate(order.createdAt)}</p>
                    <p><span className="font-medium">Artisan:</span> {getArtisanName()}</p>
                    <p><span className="font-medium">Payment:</span> {order.paymentMethod || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    Payment Summary
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                    <p><span className="font-medium">Subtotal:</span> {formatCurrency(order.subtotal || 0)}</p>
                    <p><span className="font-medium">Tax:</span> {formatCurrency(order.tax || 0)}</p>
                    <p><span className="font-medium">Shipping:</span> {formatCurrency(order.shippingCost || 0)}</p>
                    <p className="font-bold text-amber-700 border-t pt-1">
                      Total: {formatCurrency(order.total || 0)}
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
                      {(order.items || []).map((item, index) => (
                        <tr key={index} className="border-t">
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
                            {formatCurrency((item.price || 0) * (item.quantity || 1))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t">
                      <tr>
                        <td colSpan="4" className="px-3 py-2 text-right font-medium">Subtotal</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(order.subtotal || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="px-3 py-2 text-right text-sm text-gray-600">Shipping</td>
                        <td className="px-3 py-2 text-right text-sm">{formatCurrency(order.shippingCost || 0)}</td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="px-3 py-2 text-right text-sm text-gray-600">Tax</td>
                        <td className="px-3 py-2 text-right text-sm">{formatCurrency(order.tax || 0)}</td>
                      </tr>
                      <tr className="border-t-2 border-amber-600">
                        <td colSpan="4" className="px-3 py-2 text-right font-bold text-amber-700">Total</td>
                        <td className="px-3 py-2 text-right font-bold text-amber-700">{formatCurrency(order.total || 0)}</td>
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
                <p className="mt-1">This is a system generated packing slip for order #{getOrderNumber()}</p>
                <p className="mt-1">Thank you for supporting handcrafted products! 🙏</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPackingSlip;