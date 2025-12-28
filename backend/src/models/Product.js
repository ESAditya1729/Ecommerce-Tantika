// Creating a product with variants
const newProduct = new Product({
  name: "Handcrafted Silk Saree",
  description: "Traditional handwoven silk saree...",
  price: 2999,
  variants: [
    {
      name: "Red",
      price: 2999,
      stock: 10,
      sku: "SAR-RED-001"
    },
    {
      name: "Blue", 
      price: 3199,
      stock: 5,
      sku: "SAR-BLU-001"
    }
  ],
  specifications: [
    { key: "Material", value: "Pure Silk" },
    { key: "Length", value: "5.5 meters" }
  ]
});

// Using virtual fields
console.log(product.salePrice); // Calculated price with discount
console.log(product.totalStock); // Total stock across variants
console.log(product.stockStatus); // 'active', 'low_stock', or 'out_of_stock'

// Using static methods
const activeProducts = await Product.findByStatus('active');
const searchResults = await Product.search("silk saree");

// Using instance methods
await product.decreaseStock(1);
await product.addReview(4.5);