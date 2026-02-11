// src/components/Ad.jsx
import { useEffect } from 'react';

const Ad = ({ 
  src,           // The ad script URL
  id,            // Optional unique ID for the container
  className = '' // Optional custom styling
}) => {
  useEffect(() => {
    if (!src) return;

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    const container = document.getElementById(id || 'ad-container');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      if (container && script.parentNode) {
        container.removeChild(script);
      }
    };
  }, [src, id]);

  return <div id={id || 'ad-container'} className={`ad-space ${className}`} />;
};

export default Ad;