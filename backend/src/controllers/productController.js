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

// ==================== PRODUCT CONTROLLERS ====================

// @desc    Get all products with advanced filtering
// @route   GET /api/products
// @access  Public/Admin/Artisan
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      sort = '-createdAt',
      page = 1,
      limit = 12,
      search,
      status,
      approvalStatus,
      artisan,
      tags,
      featured,
      bestSeller,
      newArrival,
      inStock,
      materials,
      colors,
      sizes,
      priceSort
    } = req.query;

    // Build query based on user role
    let query = {};

    // Public users see only approved, active products
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      query.status = 'active';
      query.approvalStatus = 'approved';
    }

    // Admins/Artisans can filter by status and approval
    if (req.user) {
      if (req.user.role === 'admin' || req.user.role === 'superadmin') {
        if (status && status !== 'all') query.status = status;
        if (approvalStatus && approvalStatus !== 'all') query.approvalStatus = approvalStatus;
      }
      
      // Artisans can only see their own products
      if (req.user.role === 'artisan') {
        query.artisan = req.user.artisanId || req.user._id;
        if (status && status !== 'all') query.status = status;
      }
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by artisan
    if (artisan && (req.user?.role === 'admin' || req.user?.role === 'superadmin')) {
      query.artisan = artisan;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    } else if (inStock === 'false') {
      query.stock = 0;
    }

    // Boolean filters
    if (featured === 'true') query.isFeatured = true;
    if (bestSeller === 'true') query.isBestSeller = true;
    if (newArrival === 'true') query.isNewArrival = true;

    // Array filters
    if (tags) {
      query.tags = { $in: tags.split(',').map(tag => tag.trim().toLowerCase()) };
    }
    if (materials) {
      query.materials = { $in: materials.split(',').map(m => m.trim()) };
    }
    if (colors) {
      query.colors = { $in: colors.split(',').map(c => c.trim()) };
    }
    if (sizes) {
      query.sizes = { $in: sizes.split(',').map(s => s.trim()) };
    }

    // Search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { shortDescription: searchRegex },
        { brand: searchRegex },
        { 'specifications.value': searchRegex },
        { tags: searchRegex }
      ];
    }

    // Parse sort options
    let sortOptions = {};
    if (sort) {
      const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      sortOptions[sortField] = sortOrder;
    }

    // Price-specific sort
    if (priceSort) {
      sortOptions.price = priceSort === 'asc' ? 1 : -1;
    }

    // Pagination
    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (currentPage - 1) * itemsPerPage;

    // Execute query with population
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('artisan', 'name username profileImage')
        .populate('createdBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(itemsPerPage)
        .lean(),
      Product.countDocuments(query)
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / itemsPerPage);

    // Get aggregation stats
    const stats = await Product.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$stock' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      }
    ]);

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages,
      currentPage,
      itemsPerPage,
      stats: stats[0] || {},
      data: products
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single product with full details
// @route   GET /api/products/:id
// @access  Public/Admin/Artisan
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Build query based on user role
    let query = { _id: id };
    
    // Public users can only see approved, active products
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'artisan')) {
      query.status = 'active';
      query.approvalStatus = 'approved';
    }
    
    // Artisans can only see their own products
    if (req.user?.role === 'artisan') {
      query.artisan = req.user.artisanId || req.user._id;
    }

    const product = await Product.findOne(query)
      .populate('artisan', 'name username profileImage bio rating totalSales')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .populate('relatedProducts', 'name price image rating status');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment views for public access
    if (!req.user || req.user.role === 'customer') {
      await Product.findByIdAndUpdate(id, { 
        $inc: { views: 1 },
        lastViewed: new Date()
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Admin/Artisan)
exports.createProduct = async (req, res) => {
  try {
    console.log('CREATE PRODUCT REQUEST BODY:', req.body);
    
    // Determine if user is creating for themselves or as admin
    let productData = { ...req.body };
    let isAdmin = false;
    let isArtisan = false;

    // Check user role and set appropriate fields
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      isAdmin = true;
      productData.createdBy = req.user._id;
      productData.lastModifiedBy = req.user._id;
      
      // Admin-created products are auto-approved
      if (!productData.approvalStatus) {
        productData.approvalStatus = 'approved';
      }
      
      // Admin can set status directly
      if (!productData.status) {
        productData.status = 'active';
      }
    } else if (req.user.role === 'artisan') {
      isArtisan = true;
      
      // Artisans can only create products for themselves
      if (productData.artisan && productData.artisan.toString() !== (req.user.artisanId || req.user._id).toString()) {
        return res.status(403).json({
          success: false,
          message: 'Artisans can only create products for their own account'
        });
      }
      
      // Set artisan reference
      productData.artisan = req.user.artisanId || req.user._id;
      productData.createdBy = req.user._id;
      productData.lastModifiedBy = req.user._id;
      
      // Artisan submissions default to pending approval
      productData.approvalStatus = 'pending';
      productData.status = 'draft';
      productData.submittedAt = new Date();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Artisan role required.'
      });
    }

    // Validate required fields
    const requiredFields = ['name', 'price', 'category', 'stock'];
    const missingFields = requiredFields.filter(field => !productData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate category
    const validCategories = [
      'Sarees', 'Home Decor', 'Bags', 'Sculptures', 'Clothing', 'Jewelry',
      'Accessories', 'Pottery', 'Textiles', 'Art', 'Furniture', 'Stationery'
    ];
    
    if (!validCategories.includes(productData.category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // Validate price
    if (productData.price < 0 || productData.price > 1000000) {
      return res.status(400).json({
        success: false,
        message: 'Price must be between 0 and 1,000,000'
      });
    }

    // Validate stock
    if (productData.stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative'
      });
    }

    // Process images
    if (productData.image && !Array.isArray(productData.images)) {
      productData.images = [productData.image];
    }

    // Set gallery images from images if not provided
    if (!productData.galleryImages && productData.images) {
      productData.galleryImages = productData.images.map((url, index) => ({
        url,
        caption: `Product image ${index + 1}`,
        isPrimary: index === 0
      }));
    }

    // Process specifications
    if (productData.specifications && !Array.isArray(productData.specifications)) {
      try {
        productData.specifications = JSON.parse(productData.specifications);
      } catch (e) {
        productData.specifications = [];
      }
    }

    // Process variants
    if (productData.variants && !Array.isArray(productData.variants)) {
      try {
        productData.variants = JSON.parse(productData.variants);
      } catch (e) {
        productData.variants = [];
      }
    }

    // Process tags
    if (productData.tags && !Array.isArray(productData.tags)) {
      productData.tags = productData.tags.split(',').map(tag => tag.trim().toLowerCase());
    }

    // Generate SKU if not provided
    if (!productData.sku) {
      const prefix = productData.category.substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(100 + Math.random() * 900);
      productData.sku = `${prefix}-${timestamp}-${random}`;
    }

    console.log('Creating product with data:', productData);

    // Create product
    const product = await Product.create(productData);

    // Update artisan's product count if artisan field exists
    if (product.artisan) {
      await Artisan.findByIdAndUpdate(product.artisan, {
        $inc: { totalProducts: 1 }
      });
    }

    res.status(201).json({
      success: true,
      message: isArtisan ? 'Product submitted for approval' : 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('CREATE PRODUCT ERROR:', error);
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      return handleValidationError(error, res);
    }
    
    if (error.code === 11000) {
      return handleMongoError(error, res);
    }
    
    // Generic error
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin/Artisan)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, find the product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check permissions
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isProductArtisan = existingProduct.artisan.toString() === (req.user.artisanId || req.user._id).toString();
    
    if (!isAdmin && !(req.user.role === 'artisan' && isProductArtisan)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this product'
      });
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // Artisans cannot change certain fields
    if (!isAdmin) {
      delete updateData.approvalStatus;
      delete updateData.status;
      delete updateData.isFeatured;
      delete updateData.isBestSeller;
      delete updateData.artisan;
      delete updateData.sku;
      
      // If artisan is making significant changes, set back to pending approval
      const significantFields = ['name', 'description', 'price', 'category', 'images', 'specifications'];
      const hasSignificantChanges = significantFields.some(field => 
        updateData[field] && JSON.stringify(updateData[field]) !== JSON.stringify(existingProduct[field])
      );
      
      if (hasSignificantChanges) {
        updateData.approvalStatus = 'pending';
        updateData.status = 'draft';
        updateData.submittedAt = new Date();
      }
    }

    // Prevent SKU updates
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      return res.status(400).json({
        success: false,
        message: 'SKU cannot be changed once set'
      });
    }

    // Process images if provided
    if (updateData.image && !Array.isArray(updateData.images)) {
      updateData.images = [updateData.image];
    }

    // Update last modified by
    updateData.lastModifiedBy = req.user._id;

    // Validate discount if provided
    if (updateData.discount) {
      if (updateData.discount.type === 'percentage' && updateData.discount.value > 100) {
        return res.status(400).json({
          success: false,
          message: 'Discount percentage cannot exceed 100%'
        });
      }
    }

    // Update the product
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('artisan', 'name username');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    console.error('Update product error:', error);
    
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
      message: 'Error updating product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin/Artisan)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the product first
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check permissions
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isProductArtisan = product.artisan.toString() === (req.user.artisanId || req.user._id).toString();
    
    if (!isAdmin && !(req.user.role === 'artisan' && isProductArtisan)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this product'
      });
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    // Update artisan's product count
    if (product.artisan) {
      await Artisan.findByIdAndUpdate(product.artisan, {
        $inc: { totalProducts: -1 }
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Bulk update products
// @route   PUT /api/products/bulk/update
// @access  Private (Admin only)
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const { ids, updateData } = req.body;

    // Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs are required as an array'
      });
    }

    if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data is required'
      });
    }

    // Restrict certain fields in bulk updates
    const restrictedFields = ['sku', 'artisan', 'createdBy'];
    restrictedFields.forEach(field => {
      if (updateData[field]) {
        return res.status(400).json({
          success: false,
          message: `Cannot update ${field} in bulk operation`
        });
      }
    });

    // Update last modified by
    updateData.lastModifiedBy = req.user._id;

    // Perform bulk update
    const result = await Product.updateMany(
      { _id: { $in: ids } },
      updateData,
      { runValidators: true }
    );

    // If updating stock, also update status
    if (updateData.stock !== undefined) {
      const statusUpdate = updateData.stock === 0 ? 'out_of_stock' : 
                          (updateData.stock < 5 ? 'low_stock' : 'active');
      await Product.updateMany(
        { _id: { $in: ids } },
        { status: statusUpdate }
      );
    }

    res.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} products`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    
    if (error.name === 'ValidationError') {
      return handleValidationError(error, res);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error performing bulk update',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Bulk delete products
// @route   DELETE /api/products/bulk/delete
// @access  Private (Admin only)
exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;

    // Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs are required as an array'
      });
    }

    // Get products to update artisan counts
    const products = await Product.find({ _id: { $in: ids } }, 'artisan');
    
    // Group by artisan for efficient updates
    const artisanUpdates = {};
    products.forEach(product => {
      if (product.artisan) {
        const artisanId = product.artisan.toString();
        artisanUpdates[artisanId] = (artisanUpdates[artisanId] || 0) + 1;
      }
    });

    // Perform bulk delete
    const result = await Product.deleteMany({ _id: { $in: ids } });

    // Update artisan product counts
    for (const [artisanId, count] of Object.entries(artisanUpdates)) {
      await Artisan.findByIdAndUpdate(artisanId, {
        $inc: { totalProducts: -count }
      });
    }

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} products`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing bulk delete',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private (Admin/Artisan)
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, variantId, operation } = req.body;

    // Validate input
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid stock quantity is required'
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

    // Check permissions
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    const isProductArtisan = product.artisan.toString() === (req.user.artisanId || req.user._id).toString();
    
    if (!isAdmin && !(req.user.role === 'artisan' && isProductArtisan)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update stock for this product'
      });
    }

    // Handle variant stock update
    if (variantId && product.variants && product.variants.length > 0) {
      const variantIndex = product.variants.findIndex(v => v._id.toString() === variantId);
      if (variantIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Variant not found'
        });
      }

      // Apply operation if specified
      let newStock = stock;
      if (operation === 'increment') {
        newStock = product.variants[variantIndex].stock + stock;
      } else if (operation === 'decrement') {
        newStock = product.variants[variantIndex].stock - stock;
        if (newStock < 0) newStock = 0;
      }

      product.variants[variantIndex].stock = newStock;
      
      // Update overall stock if this is the only variant
      if (product.variants.length === 1) {
        product.stock = newStock;
      }

    } else {
      // Update main product stock
      let newStock = stock;
      if (operation === 'increment') {
        newStock = product.stock + stock;
      } else if (operation === 'decrement') {
        newStock = product.stock - stock;
        if (newStock < 0) newStock = 0;
      }

      product.stock = newStock;
    }

    // Update status based on stock
    if (product.stock === 0) {
      product.status = 'out_of_stock';
    } else if (product.stock < 5) {
      product.status = 'low_stock';
    } else if (product.approvalStatus === 'approved') {
      product.status = 'active';
    }

    product.lastModifiedBy = req.user._id;
    await product.save();

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        stock: product.stock,
        status: product.status,
        variants: product.variants
      }
    });

  } catch (error) {
    console.error('Update stock error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID or variant ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating stock',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get product statistics and analytics
// @route   GET /api/products/stats
// @access  Private (Admin only)
exports.getProductStats = async (req, res) => {
  try {
    // Verify admin access
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const [summary, byCategory, byStatus, topProducts, recentProducts, artisanStats] = await Promise.all([
      // Overall summary
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
            totalStock: { $sum: '$stock' },
            totalSales: { $sum: '$sales' },
            totalRevenue: { $sum: { $multiply: ['$price', '$sales'] } },
            avgPrice: { $avg: '$price' },
            avgRating: { $avg: '$rating' },
            avgStock: { $avg: '$stock' }
          }
        }
      ]),

      // Products by category
      Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalSales: { $sum: '$sales' },
            totalStock: { $sum: '$stock' },
            avgPrice: { $avg: '$price' }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Products by status
      Product.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalStock: { $sum: '$stock' },
            pendingApproval: {
              $sum: { $cond: [{ $eq: ['$approvalStatus', 'pending'] }, 1, 0] }
            }
          }
        }
      ]),

      // Top selling products
      Product.find()
        .sort({ sales: -1 })
        .limit(10)
        .select('name price sales stock rating image category')
        .populate('artisan', 'name')
        .lean(),

      // Recently added products
      Product.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name price createdAt approvalStatus status')
        .populate('artisan', 'name')
        .lean(),

      // Products by artisan
      Product.aggregate([
        {
          $lookup: {
            from: 'artisans',
            localField: 'artisan',
            foreignField: '_id',
            as: 'artisanInfo'
          }
        },
        { $unwind: '$artisanInfo' },
        {
          $group: {
            _id: '$artisan',
            artisanName: { $first: '$artisanInfo.name' },
            productCount: { $sum: 1 },
            totalSales: { $sum: '$sales' },
            avgRating: { $avg: '$rating' }
          }
        },
        { $sort: { productCount: -1 } },
        { $limit: 10 }
      ])
    ]);

    // Monthly sales trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Product.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          productsAdded: { $sum: 1 },
          totalSales: { $sum: '$sales' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      data: {
        summary: summary[0] || {},
        byCategory,
        byStatus,
        topProducts,
        recentProducts,
        artisanStats,
        monthlyTrend,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get product categories with counts
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    // Get categories with product counts
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Format response
    const formattedCategories = categories.map(cat => ({
      name: cat._id,
      count: cat.count,
      avgPrice: Math.round(cat.avgPrice || 0),
      totalStock: cat.totalStock
    }));

    // Add "All" category
    const totalProducts = await Product.countDocuments();
    formattedCategories.unshift({
      name: 'All',
      count: totalProducts,
      avgPrice: 0,
      totalStock: 0
    });

    res.json({
      success: true,
      data: formattedCategories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Export products to CSV
// @route   GET /api/products/export
// @access  Private (Admin only)
exports.exportProducts = async (req, res) => {
  try {
    // Verify admin access
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { format = 'csv', fields } = req.query;
    
    // Build query
    let query = {};
    if (req.query.status && req.query.status !== 'all') query.status = req.query.status;
    if (req.query.approvalStatus && req.query.approvalStatus !== 'all') query.approvalStatus = req.query.approvalStatus;
    if (req.query.category && req.query.category !== 'all') query.category = req.query.category;
    if (req.query.artisan) query.artisan = req.query.artisan;

    // Get products with selected fields
    const selectFields = fields ? fields.split(',') : [
      'name', 'category', 'price', 'stock', 'status', 
      'approvalStatus', 'sales', 'rating', 'sku', 'artisanSku',
      'createdAt', 'views', 'wishlistCount'
    ];

    const products = await Product.find(query)
      .select(selectFields.join(' '))
      .populate('artisan', 'name email')
      .lean();

    // Prepare data based on format
    let exportData;
    let contentType;
    let filename;

    if (format === 'json') {
      exportData = JSON.stringify(products, null, 2);
      contentType = 'application/json';
      filename = `products_export_${Date.now()}.json`;
    } else {
      // Default to CSV
      const csvRows = [];
      
      // Headers
      const headers = Object.keys(products[0] || {});
      csvRows.push(headers.join(','));
      
      // Data rows
      products.forEach(product => {
        const row = headers.map(header => {
          let value = product[header];
          
          // Handle nested objects
          if (typeof value === 'object') {
            value = value ? JSON.stringify(value).replace(/,/g, ';') : '';
          }
          
          // Escape commas and quotes
          if (typeof value === 'string') {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          
          return value || '';
        });
        csvRows.push(row.join(','));
      });
      
      exportData = csvRows.join('\n');
      contentType = 'text/csv';
      filename = `products_export_${Date.now()}.csv`;
    }

    // Set response headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(exportData);

  } catch (error) {
    console.error('Export products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Search products with advanced filtering
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { shortDescription: searchRegex },
        { 'specifications.value': searchRegex },
        { tags: searchRegex },
        { materials: searchRegex },
        { brand: searchRegex }
      ],
      status: 'active',
      approvalStatus: 'approved'
    })
    .select('name price image rating sales category artisanSku')
    .populate('artisan', 'name')
    .limit(parseInt(limit))
    .lean();

    res.json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    // Get the main product
    const mainProduct = await Product.findById(id);
    if (!mainProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find related products based on category, tags, or artisan
    const relatedProducts = await Product.find({
      _id: { $ne: id },
      $or: [
        { category: mainProduct.category },
        { tags: { $in: mainProduct.tags || [] } },
        { artisan: mainProduct.artisan },
        { materials: { $in: mainProduct.materials || [] } }
      ],
      status: 'active',
      approvalStatus: 'approved'
    })
    .select('name price image rating category sales stock')
    .populate('artisan', 'name')
    .limit(parseInt(limit))
    .lean();

    // If not enough related products, get random products from same category
    if (relatedProducts.length < limit) {
      const additionalProducts = await Product.find({
        _id: { $ne: id, $nin: relatedProducts.map(p => p._id) },
        category: mainProduct.category,
        status: 'active',
        approvalStatus: 'approved'
      })
      .select('name price image rating category sales stock')
      .limit(parseInt(limit) - relatedProducts.length)
      .lean();

      relatedProducts.push(...additionalProducts);
    }

    res.json({
      success: true,
      count: relatedProducts.length,
      data: relatedProducts
    });

  } catch (error) {
    console.error('Get related products error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching related products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};