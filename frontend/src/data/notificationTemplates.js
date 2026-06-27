// utils/notificationTemplates.js

/**
 * Notification Template Configurations
 * Each template defines what data fields are required and how to display them
 */

export const TEMPLATE_CONFIGS = {
  'order_placed': {
    label: '📦 New Order',
    description: 'Notify artisans about new orders',
    fields: [
      { id: 'orderNumber', label: 'Order Number', type: 'text', required: true, placeholder: 'e.g., ORD-12345' },
      { id: 'amount', label: 'Order Amount (₹)', type: 'number', required: true, placeholder: 'e.g., 1499' },
      { id: 'customerName', label: 'Customer Name', type: 'text', required: false, placeholder: 'e.g., John Doe' },
      { id: 'productName', label: 'Product Name', type: 'text', required: false, placeholder: 'e.g., Handmade Necklace' }
    ]
  },
  
  'order_status_update': {
    label: '📦 Order Status Update',
    description: 'Update artisans about order status changes',
    fields: [
      { id: 'orderNumber', label: 'Order Number', type: 'text', required: true, placeholder: 'e.g., ORD-12345' },
      { 
        id: 'status', 
        label: 'New Status', 
        type: 'select', 
        required: true, 
        options: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] 
      },
      { id: 'notes', label: 'Additional Notes', type: 'textarea', required: false, placeholder: 'Add any notes...' }
    ]
  },
  
  'order_cancelled': {
    label: '❌ Order Cancelled',
    description: 'Notify artisans about cancelled orders',
    fields: [
      { id: 'orderNumber', label: 'Order Number', type: 'text', required: true, placeholder: 'e.g., ORD-12345' },
      { 
        id: 'cancelledBy', 
        label: 'Cancelled By', 
        type: 'select', 
        required: false, 
        options: ['customer', 'admin', 'artisan', 'system'] 
      },
      { id: 'reason', label: 'Cancellation Reason', type: 'textarea', required: false, placeholder: 'Why was the order cancelled?' }
    ]
  },
  
  'product_approved': {
    label: '✅ Product Approved',
    description: 'Notify artisans when their product is approved',
    fields: [
      { id: 'productName', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g., Handmade Necklace' },
      { id: 'productPrice', label: 'Product Price (₹)', type: 'number', required: false, placeholder: 'e.g., 1499' },
      { id: 'message', label: 'Additional Message', type: 'textarea', required: false, placeholder: 'Add a congratulatory message...' }
    ]
  },
  
  'product_rejected': {
    label: '⚠️ Product Rejected',
    description: 'Notify artisans when their product is rejected',
    fields: [
      { id: 'productName', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g., Handmade Necklace' },
      { id: 'reason', label: 'Rejection Reason', type: 'textarea', required: true, placeholder: 'Why was the product rejected?' },
      { id: 'feedback', label: 'Improvement Suggestions', type: 'textarea', required: false, placeholder: 'Suggestions for improvement...' }
    ]
  },
  
  'product_submitted': {
    label: '📤 Product Submitted',
    description: 'Confirm product submission to artisans',
    fields: [
      { id: 'productName', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g., Handmade Necklace' },
      { id: 'message', label: 'Additional Message', type: 'textarea', required: false, placeholder: 'Add any instructions...' }
    ]
  },
  
  'low_stock_alert': {
    label: '⚠️ Low Stock Alert',
    description: 'Alert artisans about low stock',
    fields: [
      { id: 'productName', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g., Handmade Necklace' },
      { id: 'stock', label: 'Current Stock', type: 'number', required: true, placeholder: 'e.g., 5' },
      { id: 'message', label: 'Additional Message', type: 'textarea', required: false, placeholder: 'Add any instructions...' }
    ]
  },
  
  'payout_processed': {
    label: '💰 Payout Processed',
    description: 'Notify artisans about successful payouts',
    fields: [
      { id: 'amount', label: 'Payout Amount (₹)', type: 'number', required: true, placeholder: 'e.g., 5000' },
      { id: 'transactionId', label: 'Transaction ID', type: 'text', required: false, placeholder: 'e.g., TXN-123456' },
      { id: 'message', label: 'Additional Message', type: 'textarea', required: false, placeholder: 'Add any message...' }
    ]
  },
  
  'payout_failed': {
    label: '❌ Payout Failed',
    description: 'Notify artisans about failed payouts',
    fields: [
      { id: 'amount', label: 'Payout Amount (₹)', type: 'number', required: true, placeholder: 'e.g., 5000' },
      { id: 'reason', label: 'Failure Reason', type: 'textarea', required: true, placeholder: 'Why did the payout fail?' },
      { id: 'nextSteps', label: 'Next Steps', type: 'textarea', required: false, placeholder: 'What should the artisan do?' }
    ]
  },
  
  'account_approved': {
    label: '🎉 Account Approved',
    description: 'Welcome new artisans',
    fields: [
      { id: 'artisanName', label: 'Artisan Name', type: 'text', required: true, placeholder: 'e.g., John Doe' },
      { id: 'businessName', label: 'Business Name', type: 'text', required: true, placeholder: "e.g., John's Crafts" },
      { id: 'message', label: 'Welcome Message', type: 'textarea', required: false, placeholder: 'Add a welcome message...' }
    ]
  },
  
  'account_rejected': {
    label: '⚠️ Account Rejected',
    description: 'Notify artisans about account rejection',
    fields: [
      { id: 'artisanName', label: 'Artisan Name', type: 'text', required: true, placeholder: 'e.g., John Doe' },
      { id: 'reason', label: 'Rejection Reason', type: 'textarea', required: true, placeholder: 'Why was the account rejected?' },
      { id: 'nextSteps', label: 'Next Steps', type: 'textarea', required: false, placeholder: 'What should the artisan do?' }
    ]
  },
  
  'system_announcement': {
    label: '📢 General Announcement',
    description: 'Broadcast message to artisans',
    fields: [
      { id: 'message', label: 'Announcement Message', type: 'textarea', required: true, placeholder: 'Type your announcement here...' },
      { id: 'subject', label: 'Subject Line', type: 'text', required: false, placeholder: 'e.g., Important Update' }
    ]
  }
};

/**
 * Get template labels for dropdown
 */
export const getTemplateOptions = () => {
  return Object.entries(TEMPLATE_CONFIGS).map(([id, config]) => ({
    id,
    label: config.label,
    description: config.description
  }));
};

/**
 * Get template fields
 */
export const getTemplateFields = (templateId) => {
  return TEMPLATE_CONFIGS[templateId]?.fields || [];
};

/**
 * Get template config
 */
export const getTemplateConfig = (templateId) => {
  return TEMPLATE_CONFIGS[templateId] || null;
};

/**
 * Validate template data
 */
export const validateTemplateData = (templateId, data) => {
  const config = getTemplateConfig(templateId);
  if (!config) return { valid: false, errors: ['Template not found'] };

  const errors = [];
  config.fields.forEach(field => {
    const value = data[field.id];
    
    // ========== FIXED: Handle different data types ==========
    // Skip validation if value is undefined or null and field is not required
    if (value === undefined || value === null) {
      if (field.required) {
        errors.push(`${field.label} is required`);
      }
      return;
    }
    
    // For required fields, check if the value is empty based on its type
    if (field.required) {
      let isEmpty = false;
      
      if (typeof value === 'string') {
        isEmpty = value.trim() === '';
      } else if (typeof value === 'number') {
        // For number fields, check if it's 0 or NaN
        isEmpty = isNaN(value) || value === 0;
      } else if (Array.isArray(value)) {
        isEmpty = value.length === 0;
      } else if (typeof value === 'object') {
        isEmpty = Object.keys(value).length === 0;
      } else {
        // For other types (boolean, etc.), check if falsy
        isEmpty = !value;
      }
      
      if (isEmpty) {
        errors.push(`${field.label} is required`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Get example data for a template (useful for testing)
 */
export const getTemplateExampleData = (templateId) => {
  const examples = {
    'order_placed': {
      orderNumber: 'ORD-12345',
      amount: 1499,
      customerName: 'John Doe',
      productName: 'Handmade Necklace'
    },
    'order_status_update': {
      orderNumber: 'ORD-12345',
      status: 'shipped',
      notes: 'Order has been shipped via courier'
    },
    'order_cancelled': {
      orderNumber: 'ORD-12345',
      cancelledBy: 'customer',
      reason: 'Changed mind'
    },
    'product_approved': {
      productName: 'Handmade Necklace',
      productPrice: 1499,
      message: 'Great work!'
    },
    'product_rejected': {
      productName: 'Handmade Necklace',
      reason: 'Poor image quality',
      feedback: 'Please upload clearer images'
    },
    'product_submitted': {
      productName: 'Handmade Necklace',
      message: 'Your product is under review'
    },
    'low_stock_alert': {
      productName: 'Handmade Necklace',
      stock: 5,
      message: 'Please restock soon'
    },
    'payout_processed': {
      amount: 5000,
      transactionId: 'TXN-123456',
      message: 'Payout processed successfully'
    },
    'payout_failed': {
      amount: 5000,
      reason: 'Insufficient balance',
      nextSteps: 'Please update bank details'
    },
    'account_approved': {
      artisanName: 'John Doe',
      businessName: "John's Crafts",
      message: 'Welcome to Tantika!'
    },
    'account_rejected': {
      artisanName: 'John Doe',
      reason: 'Incomplete documentation',
      nextSteps: 'Please submit all required documents'
    },
    'system_announcement': {
      message: 'Important announcement for all artisans',
      subject: 'System Update'
    }
  };

  return examples[templateId] || {};
};

/**
 * Generate a preview message from template data
 */
export const generatePreview = (templateId, data) => {
  const previews = {
    'order_placed': (d) => `📦 New order #${d.orderNumber || '...'} for ₹${d.amount || '0'}${d.customerName ? ` from ${d.customerName}` : ''}`,
    'order_status_update': (d) => `📦 Order #${d.orderNumber || '...'} status updated to: ${d.status || '...'}`,
    'order_cancelled': (d) => `❌ Order #${d.orderNumber || '...'} has been cancelled${d.reason ? `: ${d.reason}` : ''}`,
    'product_approved': (d) => `✅ "${d.productName || 'Your product'}" has been approved and is now live!${d.productPrice ? ` Price: ₹${d.productPrice}` : ''}`,
    'product_rejected': (d) => `⚠️ "${d.productName || 'Your product'}" needs revisions. Reason: ${d.reason || '...'}`,
    'product_submitted': (d) => `📤 "${d.productName || 'Your product'}" has been submitted for review.`,
    'low_stock_alert': (d) => `⚠️ "${d.productName || 'Your product'}" has only ${d.stock || '0'} units remaining!`,
    'payout_processed': (d) => `💰 ₹${d.amount || '0'} has been credited to your account.${d.transactionId ? ` Transaction ID: ${d.transactionId}` : ''}`,
    'payout_failed': (d) => `❌ ₹${d.amount || '0'} payout failed. Reason: ${d.reason || '...'}`,
    'account_approved': (d) => `🎉 Welcome ${d.artisanName || 'Artisan'}! Your account "${d.businessName || ''}" has been approved.`,
    'account_rejected': (d) => `⚠️ ${d.artisanName || 'Your'} account application was rejected. Reason: ${d.reason || '...'}`,
    'system_announcement': (d) => `📢 ${d.message || 'Your announcement here'}`
  };

  const previewFn = previews[templateId];
  if (!previewFn) return 'Select a template to preview';

  try {
    return previewFn(data);
  } catch (error) {
    return 'Invalid data for preview';
  }
};