// utils/csvGenerator.js

/**
 * Generate CSV from array of objects
 * @param {Array} data - Array of objects to convert to CSV
 * @param {Array} columns - Array of column definitions [{key: 'name', label: 'Name'}]
 * @returns {Promise<string>} CSV string
 */
const generateCSV = (data, columns) => {
  return new Promise((resolve) => {
    try {
      // Create CSV header
      const headers = columns.map(col => `"${col.label}"`).join(',');
      
      // Create CSV rows
      const rows = data.map(item => {
        return columns.map(col => {
          let value = item[col.key];
          
          // Handle nested properties (e.g., user.name)
          if (col.key.includes('.')) {
            const keys = col.key.split('.');
            value = keys.reduce((obj, key) => obj && obj[key], item);
          }
          
          // Handle different data types
          if (value === null || value === undefined) {
            value = '';
          } else if (typeof value === 'object') {
            value = JSON.stringify(value);
          } else if (typeof value === 'string') {
            // Escape quotes and wrap in quotes
            value = `"${value.replace(/"/g, '""')}"`;
          } else {
            value = String(value);
          }
          
          return value;
        }).join(',');
      });
      
      // Combine header and rows
      const csvContent = [headers, ...rows].join('\n');
      resolve(csvContent);
    } catch (error) {
      console.error('Error generating CSV:', error);
      // Return empty CSV with headers on error
      const headers = columns.map(col => `"${col.label}"`).join(',');
      resolve(headers);
    }
  });
};

/**
 * Generate CSV from array of objects (alternative simple version)
 * @param {Array} data - Array of objects
 * @returns {string} CSV string
 */
const simpleCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      
      // Escape quotes and wrap in quotes if string
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }
      
      return String(value);
    });
    
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV content
 * @param {string} filename - Filename for download
 */
const downloadCSV = (csvContent, filename = 'export.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

module.exports = {
  generateCSV,
  simpleCSV,
  downloadCSV
};