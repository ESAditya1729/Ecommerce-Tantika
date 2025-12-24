const products = [
  {
    id: 1,
    name: 'Kantha Stitch Silk Saree',
    category: 'Textiles',
    price: 3499,
    description: 'Hand-embroidered traditional Kantha stitch saree with authentic Bengali motifs. Made with pure silk and crafted by skilled artisans.',
    images: [
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop'
    ],
    artisan: 'Maya Das',
    location: 'Shantiniketan, West Bengal',
    material: 'Pure Silk',
    careInstructions: 'Dry clean only. Store in muslin cloth.',
    rating: 4.8,
    reviewCount: 24,
    stock: 15,
    featured: true
  },
  {
    id: 2,
    name: 'Terracotta Ganesha Sculpture',
    category: 'Home Decor',
    price: 1299,
    description: 'Handcrafted terracotta sculpture of Lord Ganesha. Made using traditional Bankura pottery techniques.',
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1589561454226-796a8e9f8b19?w=800&h=800&fit=crop'
    ],
    artisan: 'Rajesh Pal',
    location: 'Bishnupur, West Bengal',
    material: 'Terracotta Clay',
    careInstructions: 'Keep away from water. Dust with dry cloth.',
    rating: 4.5,
    reviewCount: 18,
    stock: 8,
    featured: true
  },
  {
    id: 3,
    name: 'Madhubani Painting - Radha Krishna',
    category: 'Art',
    price: 2499,
    description: 'Traditional Madhubani painting depicting Radha and Krishna. Natural colors on handmade paper.',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=800&fit=crop'
    ],
    artisan: 'Anjali Roy',
    location: 'Murshidabad, West Bengal',
    material: 'Handmade Paper, Natural Colors',
    careInstructions: 'Frame behind glass. Avoid direct sunlight.',
    rating: 4.9,
    reviewCount: 32,
    stock: 5,
    featured: true
  },
  {
    id: 4,
    name: 'Jute Handbag with Embroidery',
    category: 'Accessories',
    price: 899,
    description: 'Eco-friendly jute handbag with traditional Bengali embroidery. Perfect for daily use.',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&h=800&fit=crop'
    ],
    artisan: 'Bikash Mondal',
    location: 'Kolkata, West Bengal',
    material: 'Jute, Cotton Thread',
    careInstructions: 'Spot clean with damp cloth. Air dry.',
    rating: 4.7,
    reviewCount: 15,
    stock: 20,
    featured: false
  },
  {
    id: 5,
    name: 'Dokra Metal Craft - Elephant',
    category: 'Home Decor',
    price: 1799,
    description: 'Traditional Dokra metal craft elephant. Made using lost-wax casting technique.',
    images: [
      'https://images.unsplash.com/photo-1590188054283-2d7b2f5b8d1f?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=800&h=800&fit=crop'
    ],
    artisan: 'Suresh Malakar',
    location: 'Bardhaman, West Bengal',
    material: 'Bell Metal',
    careInstructions: 'Polish with soft cloth occasionally.',
    rating: 4.6,
    reviewCount: 12,
    stock: 6,
    featured: false
  },
  {
    id: 6,
    name: 'Baluchari Silk Scarf',
    category: 'Textiles',
    price: 1599,
    description: 'Pure silk scarf with traditional Baluchari weaving patterns. Lightweight and elegant.',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&h=800&fit=crop'
    ],
    artisan: 'Lata Ghosh',
    location: 'Murshidabad, West Bengal',
    material: 'Pure Silk',
    careInstructions: 'Dry clean only.',
    rating: 4.4,
    reviewCount: 9,
    stock: 12,
    featured: false
  },
  {
    id: 7,
    name: 'Sholapith Wedding Decor Set',
    category: 'Decorations',
    price: 2199,
    description: 'Traditional Sholapith wedding decoration set. Used in Bengali weddings for generations.',
    images: [
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=800&fit=crop'
    ],
    artisan: 'Prakash Nandi',
    location: 'Kolkata, West Bengal',
    material: 'Sholapith (Indian Cork)',
    careInstructions: 'Fragile. Handle with care. Keep dry.',
    rating: 4.7,
    reviewCount: 7,
    stock: 4,
    featured: false
  },
  {
    id: 8,
    name: 'Patachitra Painting Scroll',
    category: 'Art',
    price: 2899,
    description: 'Traditional Patachitra scroll painting depicting mythological stories. Hand-painted on cloth.',
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=800&fit=crop'
    ],
    artisan: 'Gopal Chitrakar',
    location: 'Medinipur, West Bengal',
    material: 'Cloth, Natural Colors',
    careInstructions: 'Frame behind UV-protected glass.',
    rating: 4.9,
    reviewCount: 11,
    stock: 3,
    featured: true
  }
];

export const categories = [
  'All',
  'Textiles',
  'Home Decor',
  'Art',
  'Accessories',
  'Decorations'
];

export default products;