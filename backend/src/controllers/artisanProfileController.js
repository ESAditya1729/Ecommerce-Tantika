const Artisan = require('../models/Artisan');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * Get artisan profile by artisan ID or user ID
 */
const getArtisanProfile = async (req, res) => {
  try {
    const { artisanId, userId } = req.params;
    let artisan;

    // Find artisan either by artisan ID or user ID
    if (artisanId && mongoose.Types.ObjectId.isValid(artisanId)) {
      artisan = await Artisan.findById(artisanId)
        .populate('userId', 'username email role isActive artisanId')
        .lean();
    } else if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      artisan = await Artisan.findOne({ userId })
        .populate('userId', 'username email role isActive artisanId')
        .lean();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Valid artisan ID or user ID is required'
      });
    }

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const { category, sort, minPrice, maxPrice } = req.query;

    // Build filter for products
    const productFilter = {
      artisan: artisan._id,
      approvalStatus: 'approved',
      status: { $in: ['active', 'low_stock'] }
    };
    
    if (category) {
      productFilter.category = category;
    }
    
    if (minPrice || maxPrice) {
      productFilter.price = {};
      if (minPrice) productFilter.price.$gte = parseFloat(minPrice);
      if (maxPrice) productFilter.price.$lte = parseFloat(maxPrice);
    }
    
    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { sales: -1, rating: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1, reviewCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Get total count of products for pagination
    const totalProducts = await Product.countDocuments(productFilter);

    // Get paginated products
    const products = await Product.find(productFilter)
      .select('name description shortDescription price discount images galleryImages category subcategory stock status rating reviewCount sales specifications features tags colors sizes materials brand sku artisanSku createdAt')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get all products for statistics (without pagination)
    const allProducts = await Product.find({
      artisan: artisan._id,
      approvalStatus: 'approved',
      status: { $in: ['active', 'low_stock'] }
    }).lean();

    // Calculate display name for DP
    let displayName = '';
    let displayInitials = '';
    let profilePicture = null;
    
    // Get profile picture from Artisan model directly
    if (artisan.profilePicture) {
      // Check if profilePicture is a string (URL) or an object with url property
      if (typeof artisan.profilePicture === 'string') {
        profilePicture = artisan.profilePicture;
      } else if (artisan.profilePicture.url) {
        profilePicture = artisan.profilePicture.url;
      }
    }
    
    if (artisan.fullName) {
      const nameParts = artisan.fullName.trim().split(' ');
      if (nameParts.length >= 2) {
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        const firstInitial = firstName.charAt(0).toUpperCase();
        const lastLetter = lastName.charAt(lastName.length - 1).toUpperCase();
        displayInitials = `${firstInitial}${lastLetter}`;
        displayName = artisan.fullName;
      } else {
        const singleName = nameParts[0];
        if (singleName && singleName.length >= 2) {
          displayInitials = `${singleName.charAt(0).toUpperCase()}${singleName.charAt(singleName.length - 1).toUpperCase()}`;
        } else if (singleName) {
          displayInitials = singleName.charAt(0).toUpperCase();
        }
        displayName = artisan.fullName;
      }
    } else if (artisan.businessName) {
      const businessParts = artisan.businessName.trim().split(' ');
      if (businessParts.length >= 2) {
        displayInitials = `${businessParts[0].charAt(0).toUpperCase()}${businessParts[businessParts.length - 1].charAt(0).toUpperCase()}`;
      } else {
        displayInitials = artisan.businessName.substring(0, 2).toUpperCase();
      }
      displayName = artisan.businessName;
    }

    // Calculate product statistics from all products (not just paginated)
    const totalSales = allProducts.reduce((sum, product) => sum + (product.sales || 0), 0);
    const averageRating = allProducts.length > 0 
      ? (allProducts.reduce((sum, product) => sum + (product.rating || 0), 0) / allProducts.length).toFixed(1)
      : 0;
    const totalReviews = allProducts.reduce((sum, product) => sum + (product.reviewCount || 0), 0);
    const uniqueCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];

    // Prepare response data
    const profileData = {
      artisan: {
        id: artisan._id,
        userId: artisan.userId?._id,
        username: artisan.userId?.username,
        fullName: artisan.fullName,
        businessName: artisan.businessName,
        displayName: displayName,
        displayInitials: displayInitials,
        profilePicture: profilePicture, // Now coming from Artisan model
        description: artisan.description,
        specialization: artisan.specialization,
        yearsOfExperience: artisan.yearsOfExperience,
        rating: artisan.rating || parseFloat(averageRating),
        totalProducts: totalProducts,
        totalSales: artisan.totalSales || totalSales,
        email: artisan.email,
        phone: artisan.phone ? artisan.phone.replace(/(\d{2})\d{5}(\d{3})/, '$1*****$2') : null,
        location: {
          city: artisan.address?.city,
          state: artisan.address?.state,
          country: artisan.address?.country
        },
        portfolioLink: artisan.portfolioLink,
        website: artisan.website,
        socialLinks: artisan.socialLinks,
        isVerified: artisan.status === 'approved' && artisan.idProof?.verified === true,
        status: artisan.status,
        joinedAt: artisan.submittedAt || artisan.createdAt,
        lastActive: artisan.lastActiveAt
      },
      products: products.map(product => {
        let primaryImage = null;
        if (product.galleryImages && product.galleryImages.length > 0) {
          const primary = product.galleryImages.find(img => img.isPrimary);
          primaryImage = primary ? primary.url : product.galleryImages[0].url;
        } else if (product.images && product.images.length > 0) {
          primaryImage = product.images[0];
        } else if (product.image) {
          primaryImage = product.image;
        }

        let finalPrice = product.price;
        let originalPrice = null;
        
        if (product.discount && product.discount.isActive) {
          const discount = product.discount;
          if (discount.type === 'percentage' && discount.value > 0) {
            finalPrice = product.price - (product.price * discount.value / 100);
            originalPrice = product.price;
          } else if (discount.type === 'fixed' && discount.value > 0) {
            finalPrice = Math.max(0, product.price - discount.value);
            originalPrice = product.price;
          }
        }

        return {
          id: product._id,
          name: product.name,
          description: product.shortDescription || 
            (product.description ? 
              (product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description) 
              : ''),
          price: finalPrice,
          originalPrice: originalPrice,
          discount: product.discount,
          image: primaryImage,
          galleryImages: product.galleryImages,
          images: product.images,
          category: product.category,
          subcategory: product.subcategory,
          stock: product.stock,
          status: product.status,
          rating: product.rating,
          reviewCount: product.reviewCount,
          sales: product.sales,
          inStock: product.stock > 0,
          tags: product.tags,
          colors: product.colors,
          sizes: product.sizes,
          materials: product.materials,
          brand: product.brand,
          sku: product.sku,
          artisanSku: product.artisanSku,
          createdAt: product.createdAt
        };
      }),
      stats: {
        totalProducts: totalProducts,
        averageRating: parseFloat(averageRating),
        totalSales: totalSales,
        yearsOfExperience: artisan.yearsOfExperience,
        completionRate: artisan.completionRate || 0,
        reviewCount: totalReviews,
        categories: uniqueCategories.length
      },
      pagination: {
        page,
        limit,
        total: totalProducts,
        pages: Math.ceil(totalProducts / limit),
        hasMore: page < Math.ceil(totalProducts / limit)
      }
    };

    // Increment total views
    try {
      await Artisan.findByIdAndUpdate(artisan._id, { 
        $inc: { totalViews: 1 },
        lastActiveAt: new Date()
      });
    } catch (viewError) {
      console.error('Error incrementing artisan views:', viewError);
    }

    res.status(200).json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Error fetching artisan profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artisan profile',
      error: error.message
    });
  }
};

/**
 * Get artisan profile by slug or business name
 */
const getArtisanProfileBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const businessName = slug.replace(/-/g, ' ');
    
    const artisan = await Artisan.findOne({ 
      businessName: { $regex: new RegExp(`^${businessName}$`, 'i') },
      status: 'approved'
    })
    .populate('userId', 'username email role isActive profilePicture avatar')
    .lean();

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    req.params.artisanId = artisan._id.toString();
    return getArtisanProfile(req, res);

  } catch (error) {
    console.error('Error fetching artisan profile by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artisan profile',
      error: error.message
    });
  }
};

/**
 * Get multiple artisans (for listing page)
 */
const getArtisans = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const { specialization, city, state, minRating, search, category } = req.query;
    
    const filter = { status: 'approved' };
    
    if (specialization) {
      filter.specialization = { $in: [specialization] };
    }
    
    if (city) {
      filter['address.city'] = new RegExp(city, 'i');
    }
    
    if (state) {
      filter['address.state'] = new RegExp(state, 'i');
    }
    
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }
    
    if (search) {
      filter.$or = [
        { businessName: new RegExp(search, 'i') },
        { fullName: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { specialization: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category) {
      const productsInCategory = await Product.find({
        category: category,
        approvalStatus: 'approved',
        status: { $in: ['active', 'low_stock'] }
      }).distinct('artisan');
      
      filter._id = { $in: productsInCategory };
    }
    
    const artisans = await Artisan.find(filter)
      .populate('userId', 'username email role isActive profilePicture avatar')
      .select('businessName fullName description specialization rating totalProducts totalSales address socialLinks userId submittedAt yearsOfExperience')
      .sort('-rating -totalSales')
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Artisan.countDocuments(filter);
    
    const artisanIds = artisans.map(a => a._id);
    const productStats = await Product.aggregate([
      {
        $match: {
          artisan: { $in: artisanIds },
          approvalStatus: 'approved',
          status: { $in: ['active', 'low_stock'] }
        }
      },
      {
        $group: {
          _id: '$artisan',
          productCount: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          totalSales: { $sum: '$sales' },
          categories: { $addToSet: '$category' }
        }
      }
    ]);
    
    const statsMap = {};
    productStats.forEach(stat => {
      statsMap[stat._id.toString()] = stat;
    });
    
    const processedArtisans = artisans.map(artisan => {
      const artisanStats = statsMap[artisan._id.toString()] || {};
      
      let displayInitials = '';
      let profilePicture = artisan.userId?.profilePicture || artisan.userId?.avatar || null;
      
      if (artisan.fullName) {
        const nameParts = artisan.fullName.trim().split(' ');
        if (nameParts.length >= 2) {
          const firstName = nameParts[0];
          const lastName = nameParts[nameParts.length - 1];
          displayInitials = `${firstName.charAt(0).toUpperCase()}${lastName.charAt(lastName.length - 1).toUpperCase()}`;
        } else {
          const singleName = nameParts[0];
          displayInitials = singleName ? singleName.charAt(0).toUpperCase() : 'A';
        }
      } else if (artisan.businessName) {
        displayInitials = artisan.businessName.substring(0, 2).toUpperCase();
      }
      
      return {
        id: artisan._id,
        businessName: artisan.businessName,
        fullName: artisan.fullName,
        displayInitials: displayInitials,
        profilePicture: profilePicture,
        description: artisan.description ? 
          (artisan.description.length > 120 ? artisan.description.substring(0, 120) + '...' : artisan.description) 
          : '',
        specialization: artisan.specialization,
        rating: artisan.rating || artisanStats.averageRating || 0,
        totalProducts: artisanStats.productCount || 0,
        totalSales: artisanStats.totalSales || 0,
        yearsOfExperience: artisan.yearsOfExperience,
        location: {
          city: artisan.address?.city,
          state: artisan.address?.state
        },
        socialLinks: artisan.socialLinks,
        categories: artisanStats.categories || [],
        joinedAt: artisan.submittedAt
      };
    });
    
    res.status(200).json({
      success: true,
      data: processedArtisans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching artisans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artisans',
      error: error.message
    });
  }
};

/**
 * Get artisan products with pagination
 */
const getArtisanProducts = async (req, res) => {
  try {
    const { artisanId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const { category, sort, minPrice, maxPrice } = req.query;
    
    if (!artisanId || !mongoose.Types.ObjectId.isValid(artisanId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid artisan ID is required'
      });
    }
    
    const filter = {
      artisan: artisanId,
      approvalStatus: 'approved',
      status: { $in: ['active', 'low_stock'] }
    };
    
    if (category) {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { sales: -1, rating: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1, reviewCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const products = await Product.find(filter)
  .select('name description shortDescription price discount image images galleryImages category subcategory stock status rating reviewCount sales tags colors sizes materials brand createdAt')
  .sort(sortOption)
  .skip(skip)
  .limit(limit)
  .lean();
    
    const total = await Product.countDocuments(filter);
    
    const processedProducts = products.map(product => {
      let primaryImage = null;
      if (product.galleryImages && product.galleryImages.length > 0) {
        const primary = product.galleryImages.find(img => img.isPrimary);
        primaryImage = primary ? primary.url : product.galleryImages[0].url;
      } else if (product.images && product.images.length > 0) {
        primaryImage = product.images[0];
      } else if (product.image) {
        primaryImage = product.image;
      }

      let finalPrice = product.price;
      let originalPrice = null;
      
      if (product.discount && product.discount.isActive) {
        const discount = product.discount;
        if (discount.type === 'percentage' && discount.value > 0) {
          finalPrice = product.price - (product.price * discount.value / 100);
          originalPrice = product.price;
        } else if (discount.type === 'fixed' && discount.value > 0) {
          finalPrice = Math.max(0, product.price - discount.value);
          originalPrice = product.price;
        }
      }

      return {
        id: product._id,
        name: product.name,
        description: product.shortDescription || 
          (product.description ? 
            (product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description) 
            : ''),
        price: finalPrice,
        originalPrice: originalPrice,
        discount: product.discount,
        image: primaryImage,
        category: product.category,
        stock: product.stock,
        status: product.status,
        rating: product.rating,
        reviewCount: product.reviewCount,
        inStock: product.stock > 0,
        colors: product.colors,
        sizes: product.sizes,
        createdAt: product.createdAt
      };
    });
    
    res.status(200).json({
      success: true,
      data: processedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching artisan products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artisan products',
      error: error.message
    });
  }
};

/**
 * Get artisan statistics and insights
 */
const getArtisanStats = async (req, res) => {
  try {
    const { artisanId } = req.params;
    
    if (!artisanId || !mongoose.Types.ObjectId.isValid(artisanId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid artisan ID is required'
      });
    }
    
    const productStats = await Product.aggregate([
      {
        $match: {
          artisan: new mongoose.Types.ObjectId(artisanId),
          approvalStatus: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalSales: { $sum: '$sales' },
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: '$reviewCount' },
          totalViews: { $sum: '$views' },
          categories: { $addToSet: '$category' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);
    
    const categoryBreakdown = await Product.aggregate([
      {
        $match: {
          artisan: new mongoose.Types.ObjectId(artisanId),
          approvalStatus: 'approved'
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalSales: { $sum: '$sales' },
          averageRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrend = await Product.aggregate([
      {
        $match: {
          artisan: new mongoose.Types.ObjectId(artisanId),
          approvalStatus: 'approved',
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
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    const stats = {
      overview: productStats[0] ? {
        totalProducts: productStats[0].totalProducts,
        totalSales: productStats[0].totalSales,
        averageRating: productStats[0].averageRating,
        totalReviews: productStats[0].totalReviews,
        totalViews: productStats[0].totalViews,
        categories: productStats[0].categories,
        priceRange: {
          min: productStats[0].minPrice || 0,
          max: productStats[0].maxPrice || 0
        }
      } : {
        totalProducts: 0,
        totalSales: 0,
        averageRating: 0,
        totalReviews: 0,
        totalViews: 0,
        categories: [],
        priceRange: { min: 0, max: 0 }
      },
      categoryBreakdown: categoryBreakdown.map(item => ({
        category: item._id,
        count: item.count,
        totalSales: item.totalSales,
        averageRating: item.averageRating
      })),
      monthlyTrend: monthlyTrend.map(item => ({
        year: item._id.year,
        month: item._id.month,
        productsAdded: item.productsAdded,
        totalSales: item.totalSales
      }))
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching artisan stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artisan statistics',
      error: error.message
    });
  }
};

// @desc    Update product stock (Artisan only)
// @route   PUT /api/artisan/products/:id/stock
// @access  Private (Artisan only)
const updateArtisanStock  = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, variantId, operation, notes } = req.body;

    // Verify user is an artisan
    if (req.user.role !== 'artisan') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Artisan privileges required.'
      });
    }

    // Validate input
    if (typeof stock !== 'number' || isNaN(stock)) {
      return res.status(400).json({
        success: false,
        message: 'Valid stock quantity is required'
      });
    }

    if (stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity cannot be negative'
      });
    }

    // Find product and ensure it belongs to this artisan
    const product = await Product.findOne({
      _id: id,
      artisan: req.user.artisanId || req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to update it'
      });
    }

    // Check if product is approved (optional - can allow stock updates for pending products)
    if (product.approvalStatus === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update stock for a rejected product. Please contact admin.'
      });
    }

    // Track previous stock for audit/logging
    let previousStock;
    let newStock;

    // Handle variant stock update
    if (variantId && product.variants && product.variants.length > 0) {
      const variantIndex = product.variants.findIndex(
        v => v._id.toString() === variantId
      );
      
      if (variantIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Variant not found'
        });
      }

      previousStock = product.variants[variantIndex].stock;

      // Apply operation if specified
      if (operation === 'increment') {
        newStock = previousStock + stock;
      } else if (operation === 'decrement') {
        newStock = previousStock - stock;
        if (newStock < 0) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient stock. Current stock: ' + previousStock
          });
        }
      } else {
        newStock = stock;
      }

      // Update variant stock
      product.variants[variantIndex].stock = newStock;
      
      // Update overall product stock if this is the only variant
      if (product.variants.length === 1) {
        product.stock = newStock;
      } else {
        // Recalculate total stock from all variants
        product.stock = product.variants.reduce((total, variant) => total + variant.stock, 0);
      }

      // Add stock update record to variant history
      if (!product.variants[variantIndex].stockHistory) {
        product.variants[variantIndex].stockHistory = [];
      }
      
      product.variants[variantIndex].stockHistory.push({
        previousStock,
        newStock,
        change: newStock - previousStock,
        updatedBy: req.user._id,
        updatedAt: new Date(),
        notes: notes || 'Stock updated by artisan',
        operation: operation || 'set'
      });

    } else {
      // Update main product stock
      previousStock = product.stock;

      // Apply operation if specified
      if (operation === 'increment') {
        newStock = previousStock + stock;
      } else if (operation === 'decrement') {
        newStock = previousStock - stock;
        if (newStock < 0) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient stock. Current stock: ' + previousStock
          });
        }
      } else {
        newStock = stock;
      }

      product.stock = newStock;

      // Add stock update record
      if (!product.stockHistory) {
        product.stockHistory = [];
      }
      
      product.stockHistory.push({
        previousStock,
        newStock,
        change: newStock - previousStock,
        updatedBy: req.user._id,
        updatedAt: new Date(),
        notes: notes || 'Stock updated by artisan',
        operation: operation || 'set'
      });
    }

    // Update product status based on stock levels
    const totalStock = variantId && product.variants.length > 1 
      ? product.variants.reduce((total, variant) => total + variant.stock, 0)
      : product.stock;

    if (totalStock === 0) {
      product.status = 'out_of_stock';
    } else if (totalStock < 5) {
      product.status = 'low_stock';
    } else if (product.approvalStatus === 'approved') {
      product.status = 'active';
    }

    // Set last modified timestamp and user
    product.lastModifiedBy = req.user._id;
    product.lastStockUpdate = new Date();
    
    await product.save();

    // Prepare response data
    const responseData = {
      stock: product.stock,
      status: product.status,
      lastStockUpdate: product.lastStockUpdate,
      totalStock: totalStock
    };

    // Include variant info if updating a variant
    if (variantId && product.variants) {
      const updatedVariant = product.variants.find(v => v._id.toString() === variantId);
      responseData.variant = {
        id: variantId,
        name: updatedVariant.name,
        stock: updatedVariant.stock
      };
      responseData.variantsCount = product.variants.length;
      responseData.variants = product.variants.map(v => ({
        id: v._id,
        name: v.name,
        stock: v.stock
      }));
    }

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Artisan update stock error:', error);
    
    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID or variant ID format'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating stock. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getArtisanProfile,
  getArtisanProfileBySlug,
  getArtisans,
  getArtisanProducts,
  getArtisanStats,
  updateArtisanStock
};