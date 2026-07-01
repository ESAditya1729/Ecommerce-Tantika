// src/components/BannerAd.jsx
import { useEffect, useRef } from 'react';

const BannerAd = ({ 
  adKey = '708f1310e8b739077a59073d869d1360',  // Changed from 'key' to 'adKey'
  format = 'iframe',
  height = 90,
  width = 728,
  className = '',
  responsive = true
}) => {
  const adRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Only load if container exists and script not already loaded
    if (!adRef.current || scriptLoadedRef.current) return;

    // Clear container first
    adRef.current.innerHTML = '';

    // Set up atOptions globally
    window.atOptions = {
      key: adKey,  // Use adKey here
      format: format,
      height: height,
      width: width,
      params: {}
    };

    // Create and append script
    const script = document.createElement('script');
    script.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
    script.async = true;
    script.type = 'text/javascript';
    
    script.onload = () => {
      scriptLoadedRef.current = true;
    };

    script.onerror = (error) => {
      console.error('Failed to load ad script:', error);
      if (adRef.current) {
        adRef.current.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">Ad failed to load</div>';
      }
    };

    adRef.current.appendChild(script);

    // Cleanup
    return () => {
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
      scriptLoadedRef.current = false;
      // Clean up global atOptions if needed
      if (window.atOptions?.key === adKey) {
        delete window.atOptions;
      }
    };
  }, [adKey, format, height, width]);

  // Responsive styles
  const responsiveStyles = responsive ? {
    maxWidth: '100%',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  } : {};

  return (
    <div 
      ref={adRef}
      className={`banner-ad ${className}`}
      style={{
        minHeight: `${height}px`,
        minWidth: responsive ? 'auto' : `${width}px`,
        maxWidth: '100%',
        margin: '0 auto',
        ...responsiveStyles
      }}
    />
  );
};

export default BannerAd;