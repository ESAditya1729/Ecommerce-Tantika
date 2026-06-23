// src/controllers/offerController.js
const Product = require('../models/Product');
const Artisan = require('../models/Artisan');

// ==================== UTILITY FUNCTIONS ====================
const handleValidationError = (error, res) => {
  const messages = Object.values(error.errors).map(err => err.message);
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: messages
  });
};

const handleMongoError = (error, res) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      field
    });
  }
  return res.status(500).json({
    success: false,
    message: 'Database error occurred',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// ==================== OFFER/DISCOUNT CONTROLLERS ====================

/**
 * @desc    Get all products with active discounts
 * @route   GET /api/offers
 * @access  Public/Admin
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Array} List of products with discounts
 */
exports.getOffers = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      sort = '-createdAt',
      page = 1,
      limit = 20,
      search,
      discountType,
      isActive,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo
    } = req.query;

    // Build query based on user role
    let query = {};

    // Check if user is authenticated and get role
    const isAuthenticated = req.user && (req.user._id || req.user.id);
    const userRole = req.user?.role;

    // ADMIN USERS - Can see ALL products with discounts
    if (isAuthenticated && (userRole === 'admin' || userRole === 'superadmin')) {
      // Only apply status filters if explicitly provided
      if (req.query.status && req.query.status !== 'all') {
        query.status = req.query.status;
      }
      if (req.query.approvalStatus && req.query.approvalStatus !== 'all') {
        query.approvalStatus = req.query.approvalStatus;
      }
    } else {
      // REGULAR USERS - Only see approved, active products with discounts
      query.status = 'active';
      query.approvalStatus = 'approved';
    }

    // Only get products that have a discount
    query['discount.isActive'] = true;
    query['discount.value'] = { $gt: 0 };

    // Filter by discount type
    if (discountType && discountType !== 'all' && discountType !== 'undefined' && discountType !== 'null' && discountType !== '') {
      query['discount.type'] = discountType;
    }

    // Filter by active status
    if (isActive !== undefined && isActive !== '' && isActive !== 'all') {
      query['discount.isActive'] = isActive === 'true';
    }

    // Date range filters for discounts
    if (startDateFrom && startDateFrom !== 'undefined' && startDateFrom !== 'null' && startDateFrom !== '') {
      query['discount.startDate'] = { $gte: new Date(startDateFrom) };
    }
    if (startDateTo && startDateTo !== 'undefined' && startDateTo !== 'null' && startDateTo !== '') {
      if (query['discount.startDate']) {
        query['discount.startDate'].$lte = new Date(startDateTo);
      } else {
        query['discount.startDate'] = { $lte: new Date(startDateTo) };
      }
    }
    if (endDateFrom && endDateFrom !== 'undefined' && endDateFrom !== 'null' && endDateFrom !== '') {
      query['discount.endDate'] = { $gte: new Date(endDateFrom) };
    }
    if (endDateTo && endDateTo !== 'undefined' && endDateTo !== 'null' && endDateTo !== '') {
      if (query['discount.endDate']) {
        query['discount.endDate'].$lte = new Date(endDateTo);
      } else {
        query['discount.endDate'] = { $lte: new Date(endDateTo) };
      }
    }

    // Filter by category
    if (category && category !== 'all' && category !== 'undefined' && category !== 'null' && category !== '') {
      query.category = category;
    }

    // Price range filter
    if (minPrice && minPrice !== 'undefined' && minPrice !== 'null' && minPrice !== '') {
      if (!query.price) query.price = {};
      query.price.$gte = parseFloat(minPrice);
    }
    if (maxPrice && maxPrice !== 'undefined' && maxPrice !== 'null' && maxPrice !== '') {
      if (!query.price) query.price = {};
      query.price.$lte = parseFloat(maxPrice);
    }

    // Search
    if (search && search.trim() && search !== 'undefined' && search !== 'null' && search !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { shortDescription: searchRegex },
        { brand: searchRegex },
        { tags: searchRegex }
      ];
    }

    // Parse sort options
    let sortOptions = {};
    if (sort && sort !== 'undefined' && sort !== 'null' && sort !== '') {
      const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      sortOptions[sortField] = sortOrder;
    }

    // Pagination
    const currentPage = parseInt(page) || 1;
    const itemsPerPage = parseInt(limit) || 20;
    const skip = (currentPage - 1) * itemsPerPage;

    // Execute query with population
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('artisan', 'businessName fullName displayName profileImage')
        .populate('createdBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(itemsPerPage)
        .lean(),
      Product.countDocuments(query)
    ]);

    // Calculate discount stats
    let stats = {};
    if (total > 0) {
      const statsResult = await Product.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            avgDiscountValue: { $avg: '$discount.value' },
            maxDiscountValue: { $max: '$discount.value' },
            minDiscountValue: { $min: '$discount.value' },
            totalDiscountedValue: { 
              $sum: { 
                $multiply: [
                  '$price',
                  { $divide: ['$discount.value', 100] }
                ]
              } 
            }
          }
        }
      ]);
      stats = statsResult[0] || {};
    }

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / itemsPerPage),
      currentPage,
      itemsPerPage,
      stats,
      data: products
    });

  } catch (error) {
    console.error('Error in getOffers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching discounted products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get single product discount details
 * @route   GET /api/offers/:id
 * @access  Public/Admin
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} Product with discount details
 */
exports.getOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Build query based on user role
    let query = { _id: id };
    
    // Public users can only see approved, active products with discounts
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      query.status = 'active';
      query.approvalStatus = 'approved';
      query['discount.isActive'] = true;
      query['discount.value'] = { $gt: 0 };
    }

    const product = await Product.findOne(query)
      .populate({
        path: 'artisan',
        select: 'businessName fullName email phone profileImage bio rating totalSales'
      })
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product with discount not found'
      });
    }

    // Calculate discounted price
    let discountedPrice = product.price;
    if (product.discount && product.discount.isActive) {
      if (product.discount.type === 'percentage') {
        discountedPrice = product.price - (product.price * product.discount.value / 100);
      } else if (product.discount.type === 'fixed') {
        discountedPrice = product.price - product.discount.value;
      }
      // Ensure price doesn't go negative
      discountedPrice = Math.max(0, discountedPrice);
    }

    res.json({
      success: true,
      data: {
        ...product,
        discount: {
          ...product.discount,
          originalPrice: product.price,
          discountedPrice,
          savings: product.price - discountedPrice,
          savingsPercentage: product.price > 0 ? ((product.price - discountedPrice) / product.price) * 100 : 0
        }
      }
    });

  } catch (error) {
    console.error('Get offer error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching product discount',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Create a new discount for a product
 * @route   POST /api/offers
 * @access  Private (Admin only)
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} Updated product with discount
 */
exports.createOffer = async (req, res) => {
  try {
    console.log('CREATE OFFER REQUEST BODY:', req.body);

    // Verify admin access
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // We only support product-specific discounts
    // The request must contain productId and discount data
    const { productId, discount } = req.body;

    // Validate productId
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Validate discount data
    if (!discount || typeof discount !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Discount data is required'
      });
    }

    // Validate discount type
    if (discount.type && !['percentage', 'fixed', 'none'].includes(discount.type)) {
      return res.status(400).json({
        success: false,
        message: 'Discount type must be percentage, fixed, or none'
      });
    }

    // Validate discount value
    if (discount.value !== undefined && discount.value < 0) {
      return res.status(400).json({
        success: false,
        message: 'Discount value cannot be negative'
      });
    }

    if (discount.type === 'percentage' && discount.value > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%'
      });
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Store original price before discount
    const originalPrice = product.price;

    // Prepare discount data
    const discountData = {
      type: discount.type || 'percentage',
      value: discount.value || 0,
      originalPrice: originalPrice,
      isActive: discount.isActive !== undefined ? discount.isActive : true
    };

    // Add dates if provided
    if (discount.startDate) {
      discountData.startDate = new Date(discount.startDate);
    }
    if (discount.endDate) {
      discountData.endDate = new Date(discount.endDate);
    }

    // Validate dates
    if (discountData.startDate && discountData.endDate) {
      if (discountData.startDate >= discountData.endDate) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    // Update product with discount
    product.discount = discountData;
    product.lastModifiedBy = req.user._id;

    // Auto-activate discount if dates are valid
    if (discountData.isActive && discountData.value > 0) {
      const now = new Date();
      if ((!discountData.startDate || discountData.startDate <= now) && 
          (!discountData.endDate || discountData.endDate >= now)) {
        product.discount.isActive = true;
      }
    }

    await product.save();

    // Calculate discounted price for response
    let discountedPrice = product.price;
    if (product.discount && product.discount.isActive) {
      if (product.discount.type === 'percentage') {
        discountedPrice = product.price - (product.price * product.discount.value / 100);
      } else if (product.discount.type === 'fixed') {
        discountedPrice = product.price - product.discount.value;
      }
      discountedPrice = Math.max(0, discountedPrice);
    }

    res.status(201).json({
      success: true,
      message: 'Discount created successfully',
      data: {
        product: product,
        discount: {
          ...product.discount.toObject(),
          originalPrice: originalPrice,
          discountedPrice,
          savings: originalPrice - discountedPrice,
          savingsPercentage: originalPrice > 0 ? ((originalPrice - discountedPrice) / originalPrice) * 100 : 0
        }
      }
    });

  } catch (error) {
    console.error('CREATE OFFER ERROR:', error);
    
    if (error.name === 'ValidationError') {
      return handleValidationError(error, res);
    }
    
    if (error.code === 11000) {
      return handleMongoError(error, res);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating discount',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update an existing discount for a product
 * @route   PUT /api/offers/:id
 * @access  Private (Admin only)
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} Updated product with discount
 */
exports.updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Verify admin access
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product has a discount
    if (!product.discount || product.discount.type === 'none' || product.discount.value === 0) {
      return res.status(400).json({
        success: false,
        message: 'This product does not have a valid discount to update'
      });
    }

    // Store original price
    const originalPrice = product.price;

    // If the request has a discount object, use it (from EditOfferModal)
    if (updateData.discount) {
      const discountData = updateData.discount;
      
      // Update all discount fields
      if (discountData.type !== undefined) {
        if (!['percentage', 'fixed', 'none'].includes(discountData.type)) {
          return res.status(400).json({
            success: false,
            message: 'Discount type must be percentage, fixed, or none'
          });
        }
        product.discount.type = discountData.type;
      }

      if (discountData.value !== undefined) {
        if (discountData.value < 0) {
          return res.status(400).json({
            success: false,
            message: 'Discount value cannot be negative'
          });
        }
        if (product.discount.type === 'percentage' && discountData.value > 100) {
          return res.status(400).json({
            success: false,
            message: 'Percentage discount cannot exceed 100%'
          });
        }
        product.discount.value = discountData.value;
      }

      if (discountData.isActive !== undefined) {
        product.discount.isActive = discountData.isActive;
      }

      if (discountData.startDate !== undefined) {
        product.discount.startDate = discountData.startDate ? new Date(discountData.startDate) : undefined;
      }

      if (discountData.endDate !== undefined) {
        product.discount.endDate = discountData.endDate ? new Date(discountData.endDate) : undefined;
      }

      // Keep original price
      product.discount.originalPrice = originalPrice;

    } else {
      // Legacy: Direct field updates (if not using nested discount object)
      if (updateData.type !== undefined) {
        if (!['percentage', 'fixed', 'none'].includes(updateData.type)) {
          return res.status(400).json({
            success: false,
            message: 'Discount type must be percentage, fixed, or none'
          });
        }
        product.discount.type = updateData.type;
      }

      if (updateData.value !== undefined) {
        if (updateData.value < 0) {
          return res.status(400).json({
            success: false,
            message: 'Discount value cannot be negative'
          });
        }
        if (product.discount.type === 'percentage' && updateData.value > 100) {
          return res.status(400).json({
            success: false,
            message: 'Percentage discount cannot exceed 100%'
          });
        }
        product.discount.value = updateData.value;
      }

      if (updateData.isActive !== undefined) {
        product.discount.isActive = updateData.isActive;
      }

      if (updateData.startDate !== undefined) {
        product.discount.startDate = updateData.startDate ? new Date(updateData.startDate) : undefined;
      }

      if (updateData.endDate !== undefined) {
        product.discount.endDate = updateData.endDate ? new Date(updateData.endDate) : undefined;
      }

      // Keep original price
      product.discount.originalPrice = originalPrice;
    }

    // Validate dates
    if (product.discount.startDate && product.discount.endDate) {
      if (product.discount.startDate >= product.discount.endDate) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    // Auto-update active status based on dates if the discount is supposed to be active
    if (product.discount.isActive && product.discount.value > 0) {
      const now = new Date();
      if ((!product.discount.startDate || product.discount.startDate <= now) && 
          (!product.discount.endDate || product.discount.endDate >= now)) {
        product.discount.isActive = true;
      } else {
        product.discount.isActive = false;
      }
    }

    product.lastModifiedBy = req.user._id;
    await product.save();

    // Calculate discounted price
    let discountedPrice = product.price;
    if (product.discount && product.discount.isActive) {
      if (product.discount.type === 'percentage') {
        discountedPrice = product.price - (product.price * product.discount.value / 100);
      } else if (product.discount.type === 'fixed') {
        discountedPrice = Math.max(0, product.price - product.discount.value);
      }
      discountedPrice = Math.max(0, discountedPrice);
    }

    // Get populated product for response
    const updatedProduct = await Product.findById(id)
      .populate('artisan', 'businessName fullName displayName profileImage')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Discount updated successfully',
      data: {
        product: updatedProduct,
        discount: {
          ...product.discount.toObject(),
          originalPrice: originalPrice,
          discountedPrice,
          savings: Math.max(0, originalPrice - discountedPrice),
          savingsPercentage: originalPrice > 0 ? ((originalPrice - discountedPrice) / originalPrice) * 100 : 0
        }
      }
    });

  } catch (error) {
    console.error('Update offer error:', error);
    
    if (error.name === 'ValidationError') {
      return handleValidationError(error, res);
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating discount',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete (remove) a discount from a product
 * @route   DELETE /api/offers/:id
 * @access  Private (Admin only)
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} Success message
 */
exports.deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify admin access
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Remove discount by setting to none
    product.discount = {
      type: 'none',
      value: 0,
      originalPrice: product.price,
      isActive: false
    };
    product.lastModifiedBy = req.user._id;
    await product.save();

    res.json({
      success: true,
      message: 'Discount removed successfully',
      data: {
        productId: product._id,
        name: product.name
      }
    });

  } catch (error) {
    console.error('Delete offer error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error removing discount',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get discount statistics for admin dashboard
 * @route   GET /api/offers/stats
 * @access  Private (Admin only)
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} Discount statistics
 */
exports.getOfferStats = async (req, res) => {
  try {
    // Verify admin access
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const now = new Date();

    const [summary, byCategory, byDiscountType, topDiscounts, expiringSoon] = await Promise.all([
      // Overall summary
      Product.aggregate([
        {
          $match: {
            'discount.isActive': true,
            'discount.value': { $gt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            avgDiscount: { $avg: '$discount.value' },
            maxDiscount: { $max: '$discount.value' },
            minDiscount: { $min: '$discount.value' },
            avgPrice: { $avg: '$price' },
            totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
          }
        }
      ]),

      // Discounts by category
      Product.aggregate([
        {
          $match: {
            'discount.isActive': true,
            'discount.value': { $gt: 0 }
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgDiscount: { $avg: '$discount.value' },
            totalStock: { $sum: '$stock' }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Discounts by type
      Product.aggregate([
        {
          $match: {
            'discount.isActive': true,
            'discount.value': { $gt: 0 }
          }
        },
        {
          $group: {
            _id: '$discount.type',
            count: { $sum: 1 },
            avgValue: { $avg: '$discount.value' },
            maxValue: { $max: '$discount.value' }
          }
        }
      ]),

      // Top discounts
      Product.find({
        'discount.isActive': true,
        'discount.value': { $gt: 0 }
      })
      .sort({ 'discount.value': -1 })
      .limit(10)
      .select('name price discount category stock sales')
      .populate('artisan', 'businessName fullName')
      .lean(),

      // Expiring soon (within 7 days)
      Product.find({
        'discount.isActive': true,
        'discount.endDate': { 
          $gte: now,
          $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      })
      .sort({ 'discount.endDate': 1 })
      .select('name price discount category')
      .populate('artisan', 'businessName fullName')
      .limit(10)
      .lean()
    ]);

    // Calculate total discount value
    const totalDiscountValue = await Product.aggregate([
      {
        $match: {
          'discount.isActive': true,
          'discount.value': { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          total: { 
            $sum: { 
              $multiply: [
                '$price',
                { $divide: ['$discount.value', 100] },
                '$stock'
              ]
            } 
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: summary[0] || {},
        byCategory,
        byDiscountType,
        topDiscounts,
        expiringSoon,
        totalDiscountValue: totalDiscountValue[0]?.total || 0,
        timestamp: now
      }
    });

  } catch (error) {
    console.error('Get offer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching discount statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Toggle discount status (activate/deactivate)
 * @route   PUT /api/offers/:id/toggle
 * @access  Private (Admin only)
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} Updated product with discount
 */
exports.toggleOfferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Verify admin access
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isActive field is required'
      });
    }

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product has a discount
    if (!product.discount || product.discount.type === 'none' || product.discount.value === 0) {
      return res.status(400).json({
        success: false,
        message: 'This product does not have a valid discount to toggle'
      });
    }

    // Toggle status
    product.discount.isActive = isActive;
    product.lastModifiedBy = req.user._id;
    await product.save();

    res.json({
      success: true,
      message: `Discount ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        productId: product._id,
        name: product.name,
        discount: product.discount
      }
    });

  } catch (error) {
    console.error('Toggle offer error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error toggling discount status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get products by discount type
 * @route   GET /api/offers/type/:type
 * @access  Public
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Array} Products with specified discount type
 */
exports.getOffersByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 20 } = req.query;

    if (!['percentage', 'fixed', 'none'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount type. Must be percentage, fixed, or none'
      });
    }

    const query = {
      status: 'active',
      approvalStatus: 'approved',
      'discount.type': type,
      'discount.isActive': true,
      'discount.value': { $gt: 0 }
    };

    const products = await Product.find(query)
      .populate('artisan', 'businessName fullName displayName')
      .select('name price discount image category stock sales rating')
      .sort({ 'discount.value': -1 })
      .limit(parseInt(limit))
      .lean();

    // Calculate discounted prices
    const productsWithDiscount = products.map(product => {
      let discountedPrice = product.price;
      if (product.discount && product.discount.isActive) {
        if (product.discount.type === 'percentage') {
          discountedPrice = product.price - (product.price * product.discount.value / 100);
        } else if (product.discount.type === 'fixed') {
          discountedPrice = product.price - product.discount.value;
        }
        discountedPrice = Math.max(0, discountedPrice);
      }

      return {
        ...product,
        discountedPrice,
        savings: product.price - discountedPrice,
        savingsPercentage: product.price > 0 ? ((product.price - discountedPrice) / product.price) * 100 : 0
      };
    });

    res.json({
      success: true,
      count: productsWithDiscount.length,
      data: productsWithDiscount
    });

  } catch (error) {
    console.error('Get offers by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by discount type',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Bulk create discounts for multiple products
 * @route   POST /api/offers/bulk
 * @access  Private (Admin only)
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Array} Updated products with discounts
 */
exports.bulkCreateOffers = async (req, res) => {
  try {
    const { productIds, discount } = req.body;

    // Verify admin access
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs are required as an array'
      });
    }

    if (!discount || typeof discount !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Discount data is required'
      });
    }

    // Validate discount type
    if (discount.type && !['percentage', 'fixed', 'none'].includes(discount.type)) {
      return res.status(400).json({
        success: false,
        message: 'Discount type must be percentage, fixed, or none'
      });
    }

    // Validate discount value
    if (discount.value !== undefined && discount.value < 0) {
      return res.status(400).json({
        success: false,
        message: 'Discount value cannot be negative'
      });
    }

    if (discount.type === 'percentage' && discount.value > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%'
      });
    }

    // Prepare discount data
    const discountData = {
      type: discount.type || 'percentage',
      value: discount.value || 0,
      isActive: discount.isActive !== undefined ? discount.isActive : true
    };

    if (discount.startDate) {
      discountData.startDate = new Date(discount.startDate);
    }
    if (discount.endDate) {
      discountData.endDate = new Date(discount.endDate);
    }

    // Validate dates
    if (discountData.startDate && discountData.endDate) {
      if (discountData.startDate >= discountData.endDate) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    // Update all products
    const products = await Product.find({ _id: { $in: productIds } });
    
    const updatedProducts = [];
    for (const product of products) {
      product.discount = {
        ...discountData,
        originalPrice: product.price
      };
      product.lastModifiedBy = req.user._id;
      await product.save();
      updatedProducts.push(product);
    }

    res.json({
      success: true,
      message: `Successfully applied discount to ${updatedProducts.length} products`,
      count: updatedProducts.length,
      data: updatedProducts
    });

  } catch (error) {
    console.error('Bulk create offers error:', error);
    
    if (error.name === 'ValidationError') {
      return handleValidationError(error, res);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error applying bulk discounts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};