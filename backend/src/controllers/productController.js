const Product = require('../models/Product');

// @desc    Get all products with filtering
// @route   GET /api/products
// @access  Public/Admin
const getProducts = async (req, res) => {
    try {
        const { 
            category, 
            minPrice, 
            maxPrice, 
            sort = 'createdAt', 
            order = 'desc',
            page = 1,
            limit = 10,
            search, // ADD THIS: Search query
            searchType = 'product' // ADD THIS: Search type (product, artisan, description)
        } = req.query;

        // SIMPLE FILTER: Only approved, active products
        let query = {
            status: 'active',
            approvalStatus: 'approved'
        };

        // Filter by category
        if (category && category !== 'all' && category !== 'All') {
            query.category = category;
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // ADD THIS SECTION: Search functionality
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive
            
            // Create search conditions based on searchType
            const searchConditions = [];
            
            if (searchType === 'product') {
                // Search in product name
                searchConditions.push({ name: searchRegex });
                searchConditions.push({ title: searchRegex }); // If you have title field
            } else if (searchType === 'artisan') {
                // Search in artisan/creator information
                // Assuming you have fields like artisanName, artisan, creator, etc.
                searchConditions.push({ artisanName: searchRegex });
                searchConditions.push({ creator: searchRegex });
                searchConditions.push({ 'artisan.name': searchRegex }); // If nested object
            } else if (searchType === 'description') {
                // Search in description
                searchConditions.push({ description: searchRegex });
                searchConditions.push({ shortDescription: searchRegex }); // If you have shortDescription
            } else {
                // Default: search in all fields
                searchConditions.push({ name: searchRegex });
                searchConditions.push({ description: searchRegex });
                searchConditions.push({ artisanName: searchRegex });
            }
            
            // If searchConditions exist, add $or to query
            if (searchConditions.length > 0) {
                query.$or = searchConditions;
            }
        }

        // Sorting
        const sortOptions = {};
        sortOptions[sort] = order === 'desc' ? -1 : 1;

        // Pagination
        const skip = (page - 1) * limit;

        // Simple query - no middleware interference
        const products = await Product.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit))
            .lean();

        const total = await Product.countDocuments(query);
        res.json({
            success: true,
            count: products.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public/Admin
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res) => {
    try {
        console.log('Creating product with data:', req.body);
        
        // Generate SKU if not provided
        let sku = req.body.sku;
        if (!sku) {
            const prefix = (req.body.category || 'PRO').substring(0, 3).toUpperCase();
            const random = Math.floor(10000 + Math.random() * 90000);
            sku = `${prefix}-${random}`;
        }
        
        // Create product data with SKU
        const productData = {
            ...req.body,
            sku: sku
        };
        
        const product = await Product.create(productData);
        
        console.log('Product created successfully:', product._id);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('CREATE PRODUCT ERROR:');
        console.error('Full error:', error);
        
        if (error.code === 11000) {
            // Duplicate SKU error
            if (error.keyPattern && error.keyPattern.sku) {
                return res.status(400).json({
                    success: false,
                    message: 'SKU already exists. Please try again or provide a different SKU.'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'Duplicate key error'
            });
        }
        
        // Check for validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res) => {
    try {
        // Prevent SKU updates
        if (req.body.sku) {
            delete req.body.sku;
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Bulk update products
// @route   PUT /api/products/bulk/update
// @access  Admin
const bulkUpdateProducts = async (req, res) => {
    try {
        const { ids, updateData } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Product IDs are required'
            });
        }

        const result = await Product.updateMany(
            { _id: { $in: ids } },
            updateData,
            { runValidators: true }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} products updated successfully`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Bulk delete products
// @route   DELETE /api/products/bulk/delete
// @access  Admin
const bulkDeleteProducts = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Product IDs are required'
            });
        }

        const result = await Product.deleteMany({ _id: { $in: ids } });

        res.json({
            success: true,
            message: `${result.deletedCount} products deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Admin
const updateStock = async (req, res) => {
    try {
        const { stock } = req.body;
        
        if (typeof stock !== 'number' || stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid stock quantity is required'
            });
        }

        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        product.stock = stock;
        product.status = stock === 0 ? 'out_of_stock' : (stock < 5 ? 'low_stock' : 'active');
        await product.save();

        res.json({
            success: true,
            message: 'Stock updated successfully',
            product
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get product statistics
// @route   GET /api/products/stats/summary
// @access  Admin
const getProductStats = async (req, res) => {
    try {
        const stats = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
                    totalSales: { $sum: '$sales' },
                    avgRating: { $avg: '$rating' },
                    avgPrice: { $avg: '$price' },
                    categories: { $addToSet: '$category' }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    pipeline: [
                        { $sort: { sales: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'topProduct'
                }
            },
            {
                $project: {
                    totalProducts: 1,
                    totalValue: 1,
                    totalSales: 1,
                    avgRating: 1,
                    avgPrice: 1,
                    categoryCount: { $size: '$categories' },
                    topProduct: { $arrayElemAt: ['$topProduct', 0] }
                }
            }
        ]);

        res.json({
            success: true,
            stats: stats[0] || {}
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get categories
// @route   GET /api/products/categories
// @access  Public/Admin
const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        
        res.json({
            success: true,
            categories: [
        'All',
        'Sarees',
        'Home Decor',
        'Bags',
        'Sculptures',
        'Clothing',
        'Jewelry',
        'Accessories',
        'Pottery',
        'Textiles',
        'Art'
      ]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Export products
// @route   GET /api/products/export
// @access  Admin
const exportProducts = async (req, res) => {
    try {
        const products = await Product.find().lean();
        
        // Convert to CSV format
        const csvData = products.map(product => ({
            Name: product.name,
            Category: product.category,
            Price: product.price,
            Stock: product.stock,
            Status: product.status,
            Sales: product.sales,
            Rating: product.rating,
            SKU: product.sku || ''
        }));

        res.json({
            success: true,
            data: csvData,
            format: 'csv',
            count: products.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkUpdateProducts,
    bulkDeleteProducts,
    updateStock,
    getProductStats,
    getCategories,
    exportProducts
};