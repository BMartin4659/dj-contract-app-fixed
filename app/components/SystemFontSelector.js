'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FaFont, FaChevronDown, FaChevronUp, FaKeyboard, FaMouse } from 'react-icons/fa';

export default function SystemFontSelector({ onFontChange, onPreviewChange, currentFont }) {
  const [availableFonts, setAvailableFonts] = useState([]);
  const [selectedFont, setSelectedFont] = useState(currentFont || 'Ka Blam');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(-1);
  const [userIsNavigating, setUserIsNavigating] = useState(false);
  const [hasRestoredPosition, setHasRestoredPosition] = useState(false);
  
  // Refs for keyboard navigation and scrolling
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const fontListRef = useRef(null);
  const wheelTimeoutRef = useRef(null);
  const lastWheelTime = useRef(0);
  const navigationTimeoutRef = useRef(null);

  // Curated list of distinctive fonts more likely to be available
  const systemFonts = [
    // Current custom fonts
    'Ka Blam',
    'The Bambank Script',
    'Bouncy',
    'Jember Sketch',
    'Kamryn 3D Italic D',
    'Hugh is Life',
    
    // Highly distinctive Windows fonts
    'Arial Black', 'Comic Sans MS', 'Impact', 'Gabriola', 'Segoe Print', 
    'Segoe Script', 'Palatino Linotype', 'Franklin Gothic Medium',
    
    // Highly distinctive macOS fonts  
    'American Typewriter', 'Brush Script MT', 'Chalkduster', 'Copperplate',
    'Didot', 'Futura', 'Herculanum', 'Luminari', 'Marker Felt', 'Noteworthy',
    'Optima', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter',
    'Snell Roundhand', 'Trattatello', 'Zapfino',
    
    // Common but distinctive system fonts
    'Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS',
    'Courier New', 'Helvetica', 'Helvetica Neue', 'Calibri', 'Cambria',
    'Candara', 'Consolas', 'Constantia', 'Corbel', 'Baskerville', 'Big Caslon',
    'Charter', 'Cochin', 'Geneva', 'Gill Sans', 'Hoefler Text', 'Lucida Grande',
    'Menlo', 'Monaco', 'Palatino', 'San Francisco', 'Skia', 'Superclarendon',
    'Thonburi', 'Times',
    
    // Web fonts (if loaded)
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro',
    'Raleway', 'PT Sans', 'Lora', 'Merriweather', 'Playfair Display',
    'Oswald', 'Source Code Pro', 'Fira Sans', 'PT Serif', 'Ubuntu'
  ];

  // Enhanced font detection function
  const isFontAvailable = (fontName) => {
    // Skip testing for our custom fonts - we know they exist
    const customFonts = ['Ka Blam', 'The Bambank Script', 'Bouncy', 'Jember Sketch', 'Kamryn 3D Italic D', 'Hugh is Life'];
    if (customFonts.includes(fontName)) {
      return true;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Use multiple test strings for better detection
    const testStrings = ['mmmmmmmmmmlli', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '1234567890'];
    
    let isAvailable = false;
    
    for (const testString of testStrings) {
      // Measure with serif baseline
      context.font = '72px serif';
      const serifWidth = context.measureText(testString).width;
      
      // Measure with sans-serif baseline  
      context.font = '72px sans-serif';
      const sansWidth = context.measureText(testString).width;
      
      // Measure with monospace baseline
      context.font = '72px monospace';
      const monoWidth = context.measureText(testString).width;
      
      // Measure with test font
      context.font = `72px "${fontName}", serif`;
      const testSerifWidth = context.measureText(testString).width;
      
      context.font = `72px "${fontName}", sans-serif`;
      const testSansWidth = context.measureText(testString).width;
      
      context.font = `72px "${fontName}", monospace`;
      const testMonoWidth = context.measureText(testString).width;
      
      // Font is available if it differs from all baseline measurements
      if (testSerifWidth !== serifWidth || testSansWidth !== sansWidth || testMonoWidth !== monoWidth) {
        isAvailable = true;
        break;
      }
    }
    
    return isAvailable;
  };

  // Load and filter available fonts
  useEffect(() => {
    const loadFonts = async () => {
      setLoading(true);
      
      // Test each font to see if it's available
      const available = [];
      const tested = new Set(); // Prevent duplicates
      
      for (const font of systemFonts) {
        if (tested.has(font.toLowerCase())) {
          continue; // Skip duplicates
        }
        tested.add(font.toLowerCase());
        
        try {
          if (isFontAvailable(font)) {
            available.push(font);
            console.log(`✓ Font available: ${font}`);
          } else {
            console.log(`✗ Font not available: ${font}`);
          }
        } catch (error) {
          console.log(`Error testing font ${font}:`, error);
        }
      }
      
      // Sort alphabetically but keep custom fonts at top
      const customFonts = ['Ka Blam', 'The Bambank Script', 'Bouncy', 'Jember Sketch', 'Kamryn 3D Italic D', 'Hugh is Life'];
      const customAvailable = available.filter(font => customFonts.includes(font));
      const systemAvailable = available.filter(font => !customFonts.includes(font)).sort();
      
      const sortedFonts = [...customAvailable, ...systemAvailable];
      
      console.log(`Total fonts detected: ${sortedFonts.length}`);
      setAvailableFonts(sortedFonts);
      setLoading(false);
      
      // Set initial last selected index based on current font
      const currentIndex = sortedFonts.indexOf(currentFont || 'Ka Blam');
      if (currentIndex !== -1) {
        setLastSelectedIndex(currentIndex);
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(loadFonts, 100);
  }, [currentFont]);

  // Filter fonts based on search term
  const filteredFonts = availableFonts.filter(font =>
    font.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Trigger preview update when highlighted font changes
  useEffect(() => {
    if (onPreviewChange && highlightedIndex >= 0 && highlightedIndex < filteredFonts.length) {
      const highlightedFont = filteredFonts[highlightedIndex];
      onPreviewChange(highlightedFont);
    }
  }, [highlightedIndex, filteredFonts.length]); // Remove onPreviewChange from dependencies to prevent infinite loops

  // Only restore position when dropdown is first opened, not during navigation
  useEffect(() => {
    // Don't restore position if user is actively navigating or already restored
    if (userIsNavigating || hasRestoredPosition || !isOpen) {
      return;
    }

    // Only restore once when dropdown opens
    const restoreTimeout = setTimeout(() => {
      if (searchTerm === '' && !userIsNavigating) {
        // No search term, try to restore last selected position
        if (lastSelectedIndex >= 0 && lastSelectedIndex < filteredFonts.length) {
          setHighlightedIndex(lastSelectedIndex);
          setHasRestoredPosition(true);
          // Use instant scroll for restoration to avoid conflicts
          if (fontListRef.current) {
            const listItems = fontListRef.current.children;
            if (listItems[lastSelectedIndex]) {
              listItems[lastSelectedIndex].scrollIntoView({
                behavior: 'instant',
                block: 'center'
              });
            }
          }
        } else {
          // Find current selected font in filtered list
          const currentIndex = filteredFonts.indexOf(selectedFont);
          if (currentIndex !== -1) {
            setHighlightedIndex(currentIndex);
            setHasRestoredPosition(true);
            if (fontListRef.current) {
              const listItems = fontListRef.current.children;
              if (listItems[currentIndex]) {
                listItems[currentIndex].scrollIntoView({
                  behavior: 'instant',
                  block: 'center'
                });
              }
            }
          }
        }
      } else {
        // Search is active, start from top
        setHighlightedIndex(-1);
        setHasRestoredPosition(true);
      }
    }, 50);

    return () => clearTimeout(restoreTimeout);
  }, [isOpen, hasRestoredPosition]);

  // Mark user as navigating and set timeout to reset - simplified
  const markUserNavigating = () => {
    if (!userIsNavigating) {
      setUserIsNavigating(true);
    }
    
    // Clear any existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    
    // Reset navigation flag after 1 second of inactivity
    navigationTimeoutRef.current = setTimeout(() => {
      setUserIsNavigating(false);
    }, 1000);
  };

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setHasRestoredPosition(false);
        setUserIsNavigating(false);
        // Focus search input when opening
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 50);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        markUserNavigating();
        setHighlightedIndex(prev => {
          const newIndex = prev < filteredFonts.length - 1 ? prev + 1 : 0;
          scrollToHighlighted(newIndex);
          return newIndex;
        });
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        markUserNavigating();
        setHighlightedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : filteredFonts.length - 1;
          scrollToHighlighted(newIndex);
          return newIndex;
        });
        break;
        
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredFonts.length) {
          handleFontSelect(filteredFonts[highlightedIndex]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        setUserIsNavigating(false);
        setHasRestoredPosition(false);
        break;
        
      default:
        // Focus search input for typing
        if (e.key.length === 1 && searchInputRef.current) {
          searchInputRef.current.focus();
        }
        break;
    }
  };

  // Scroll to highlighted item with controlled animation
  const scrollToHighlighted = (index) => {
    if (fontListRef.current && index >= 0 && index < filteredFonts.length) {
      const listItems = fontListRef.current.children;
      if (listItems[index]) {
        // Use smooth scrolling but with better positioning
        listItems[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  };

  // Improved mouse wheel handler with better control
  const handleWheel = (e) => {
    if (!isOpen) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Immediately disable position restoration when wheel scrolling starts
    setHasRestoredPosition(true);
    markUserNavigating();
    
    const now = Date.now();
    const timeSinceLastWheel = now - lastWheelTime.current;
    
    // Slower scrolling - increased throttling for better control
    if (timeSinceLastWheel < 300) {
      return;
    }
    
    lastWheelTime.current = now;
    
    // Clear any existing timeout
    if (wheelTimeoutRef.current) {
      clearTimeout(wheelTimeoutRef.current);
    }
    
    // Determine scroll direction with normalized delta
    const delta = e.deltaY > 0 ? 1 : -1;
    
    // Immediate state update for better responsiveness
    setHighlightedIndex(prev => {
      let newIndex;
      if (prev === -1) {
        // Start from current position in list, not saved position
        const currentIndex = filteredFonts.indexOf(selectedFont);
        newIndex = currentIndex !== -1 ? currentIndex : (delta > 0 ? 0 : filteredFonts.length - 1);
      } else {
        newIndex = prev + delta;
        if (newIndex < 0) newIndex = filteredFonts.length - 1;
        if (newIndex >= filteredFonts.length) newIndex = 0;
      }
      
      // Scroll to new position with slight delay
      requestAnimationFrame(() => {
        scrollToHighlighted(newIndex);
      });
      
      return newIndex;
    });
  };

  // Handle font selection and remember position
  const handleFontSelect = (fontName) => {
    console.log('🎨 SystemFontSelector: Font selected:', fontName);
    console.log('🎨 SystemFontSelector: onFontChange callback exists:', !!onFontChange);
    
    const fontIndex = availableFonts.indexOf(fontName);
    if (fontIndex !== -1) {
      setLastSelectedIndex(fontIndex);
      // Save to localStorage for persistence
      localStorage.setItem('lastSelectedFontIndex', fontIndex.toString());
      localStorage.setItem('lastSelectedFont', fontName);
    }
    
    setSelectedFont(fontName);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setUserIsNavigating(false);
    setHasRestoredPosition(false);
    
    if (onFontChange) {
      console.log('🎨 SystemFontSelector: Calling onFontChange with:', fontName);
      onFontChange(fontName);
    } else {
      console.error('🎨 SystemFontSelector: onFontChange callback is missing!');
    }
  };

  // Load saved font position on mount
  useEffect(() => {
    try {
      const savedIndex = localStorage.getItem('lastSelectedFontIndex');
      const savedFont = localStorage.getItem('lastSelectedFont');
      
      if (savedIndex && savedFont && availableFonts.length > 0) {
        const index = parseInt(savedIndex, 10);
        if (index >= 0 && index < availableFonts.length && availableFonts[index] === savedFont) {
          setLastSelectedIndex(index);
        }
      }
    } catch (error) {
      console.log('Error loading saved font position:', error);
    }
  }, [availableFonts]);

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);
    setUserIsNavigating(false);
    setHasRestoredPosition(true); // Prevent restoration when searching
  };

  // Handle dropdown open/close and restore position
  const handleDropdownToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
      setHasRestoredPosition(false);
      setUserIsNavigating(false);
      setHighlightedIndex(-1); // Reset highlighted index when opening
      // Position restoration will be handled by useEffect
    } else {
      setIsOpen(false);
      setHighlightedIndex(-1);
      setUserIsNavigating(false);
      setHasRestoredPosition(false);
    }
  };

  // Handle mouse enter on font items - simplified to prevent infinite loops
  const handleMouseEnter = (index) => {
    // Simply set the highlighted index without calling markUserNavigating
    if (highlightedIndex !== index) {
      setHighlightedIndex(index);
    }
  };



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        setUserIsNavigating(false);
        setHasRestoredPosition(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);



  return (
    <div 
      ref={dropdownRef}
      className="relative w-full max-w-md"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onWheel={handleWheel}
    >
      {/* Font Selector Button */}
      <button
        type="button"
        onClick={handleDropdownToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <div className="flex items-center space-x-3">
          <FaFont className="text-blue-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">Header Font</div>
            <div 
              className="text-sm text-gray-500 truncate"
              style={{ 
                fontFamily: `"${selectedFont}", system-ui, sans-serif`,
                fontSize: '14px',
                fontWeight: 'normal'
              }}
            >
              {selectedFont}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-400 hidden sm:flex items-center space-x-1">
            <FaKeyboard className="w-3 h-3" />
            <span>↑↓</span>
            <FaMouse className="w-3 h-3" />
          </div>
          {isOpen ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </div>
      </button>



      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search fonts... (use ↑↓ arrows to navigate)"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              onKeyDown={handleKeyDown}
            />
            <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
              <span>Use ↑↓ arrows, Enter to select, Esc to close</span>
              <span>Scroll wheel supported (controlled)</span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              Detecting available fonts...
            </div>
          )}

          {/* Font List */}
          {!loading && (
            <div ref={fontListRef} className="max-h-64 overflow-y-auto">
              {filteredFonts.length > 0 ? (
                filteredFonts.map((font, index) => (
                  <button
                    key={font}
                    type="button"
                    onClick={() => handleFontSelect(font)}
                    onMouseEnter={() => handleMouseEnter(index)}
                    className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                      selectedFont === font 
                        ? 'bg-blue-100 text-blue-900' 
                        : highlightedIndex === index
                        ? 'bg-yellow-50 text-gray-900'
                        : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{font}</div>
                        <div 
                          className="text-sm text-gray-500 mt-1"
                          style={{ 
                            fontFamily: `"${font}", system-ui, sans-serif`,
                            fontSize: '16px',
                            fontWeight: 'normal'
                          }}
                        >
                          EVENT CONTRACT
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedFont === font && (
                          <div className="text-blue-600 text-sm">✓</div>
                        )}
                        {highlightedIndex === index && (
                          <div className="text-yellow-600 text-sm">→</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'No fonts found matching your search.' : 'No fonts detected.'}
                </div>
              )}
            </div>
          )}

          {/* Font Count and Instructions */}
          {!loading && filteredFonts.length > 0 && (
            <div className="p-2 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>{filteredFonts.length} font{filteredFonts.length !== 1 ? 's' : ''} available</span>
                <span className="flex items-center space-x-2">
                  <span>Navigate: ↑↓</span>
                  <span>Select: Enter</span>
                  <span>Close: Esc</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 