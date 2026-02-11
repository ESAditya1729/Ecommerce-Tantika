// components/Shop/AdvancedSearch.jsx
import { Search, Filter, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AdvancedSearch = ({ 
  searchQuery, 
  onSearchChange, 
  searchType, 
  onSearchTypeChange,
  onClear 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [selectedType, setSelectedType] = useState(searchType);

  // Sync with parent
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setSelectedType(searchType);
  }, [searchType]);

  const handleSearch = () => {
    onSearchChange(localQuery, selectedType);
  };

  const handleClear = () => {
    setLocalQuery('');
    setSelectedType('product');
    onClear();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full">
      {/* Search Input Row */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="What are you looking for?"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-12 pr-12 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm hover:shadow-md"
          />
          {localQuery && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            Search
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Advanced
          </button>
        </div>
      </div>

      {/* Advanced Search Options */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Search by:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'product', label: 'Product Name', description: 'Search in product titles' },
                    { id: 'artisan', label: 'Artisan Name', description: 'Find by artisan/craftsperson' },
                    { id: 'description', label: 'Description', description: 'Search in product descriptions' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type.id);
                        onSearchTypeChange(type.id);
                      }}
                      className={`p-4 rounded-lg text-left transition-all ${
                        selectedType === type.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-white border border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-medium text-gray-800 mb-1">{type.label}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Currently searching by: <span className="font-medium text-blue-600">
                    {selectedType === 'product' ? 'Product Name' : 
                     selectedType === 'artisan' ? 'Artisan Name' : 
                     'Description'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply Search
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Info */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-blue-800">Searching:</span>
            <span className="bg-white px-3 py-1 rounded-full border border-blue-300 text-blue-700">
              {searchType === 'product' ? 'Product Name' : 
               searchType === 'artisan' ? 'Artisan Name' : 
               'Description'}
            </span>
            <span className="text-gray-600">for</span>
            <span className="font-medium text-gray-800">"{searchQuery}"</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdvancedSearch;