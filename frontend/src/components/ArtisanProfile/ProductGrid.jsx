import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaImage } from 'react-icons/fa';
import ProductCard from './ProductCard';

// Animation variants
const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const ProductGrid = ({ 
  products, 
  loading, 
  emptyMessage = "No products available in this category.",
  gridCols = {
    default: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 4
  }
}) => {
  // Generate grid classes based on props
  const getGridClasses = () => {
    const classes = ['grid', 'gap-6'];
    
    // Default (mobile first)
    classes.push(`grid-cols-${gridCols.default}`);
    
    // Small screens
    if (gridCols.sm) classes.push(`sm:grid-cols-${gridCols.sm}`);
    
    // Medium screens
    if (gridCols.md) classes.push(`md:grid-cols-${gridCols.md}`);
    
    // Large screens
    if (gridCols.lg) classes.push(`lg:grid-cols-${gridCols.lg}`);
    
    // Extra large screens
    if (gridCols.xl) classes.push(`xl:grid-cols-${gridCols.xl}`);
    
    return classes.join(' ');
  };

  // Ensure products array exists
  const productList = Array.isArray(products) ? products : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 min-h-[300px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FaSpinner className="text-4xl text-orange-500" />
        </motion.div>
      </div>
    );
  }

  if (productList.length === 0) {
    return (
      <motion.div 
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="text-center py-12 min-h-[300px] flex flex-col items-center justify-center"
      >
        <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={getGridClasses()}
    >
      <AnimatePresence mode="popLayout">
        {productList.map((product, index) => (
          <motion.div
            key={product.id || product._id || index}
            variants={scaleIn}
            layout
            className="h-full flex"
          >
            <div className="w-full">
              <ProductCard product={product} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductGrid;