'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaMusic, FaArrowLeft, FaSearch, FaList, FaHome, FaHeart, FaCompactDisc, FaRadiation, FaGuitar, FaMicrophone, FaHeadphones, FaDrum, FaStar, FaFire, FaPlay } from 'react-icons/fa';
import { 
  loadSongsByMode, 
  loadPlaylistSongs,
  loadGenreSongs,
  searchSongs, 
  filterByGenre, 
  sortSongs, 
  GENRES,
  PLAYLISTS 
} from '../data/music-library';
import { playlistIcons } from '../utils/playlistIcons';
import { getPlaylistIconType } from '../utils/iconMap';

// Debug: Check if playlistIcons are loaded correctly
console.log('PlaylistIcons loaded:', Object.keys(playlistIcons));

// Form-style Card Component matching the main form design
const CategoryCard = React.memo(({ title, color, type, onSelect, description, songCount }) => (
  <div 
    className="cursor-pointer transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
    onClick={() => onSelect(type, title)}
  >
    <div 
      className="rounded-lg p-4 border-2 border-gray-300 bg-white shadow-sm hover:border-gray-400 hover:shadow-md transition-all duration-200"
      style={{ 
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        borderLeft: `4px solid ${color}`
      }}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-sm"
          style={{ backgroundColor: color }}
        >
          <FaMusic className="text-lg" />
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg tracking-tight">{title}</h3>
          <p className="text-gray-700 text-sm font-medium">{description}</p>
          {songCount && <span className="text-xs text-gray-600 mt-1 block font-semibold">{songCount} songs</span>}
        </div>
        
        {/* Arrow */}
        <div className="text-gray-500">
          <FaPlay className="text-sm" />
        </div>
      </div>
    </div>
  </div>
));

CategoryCard.displayName = 'CategoryCard';

// Form-style Song List Item Component
const SongListItem = React.memo(({ song, index, isSelected, onToggle, sourceData }) => {
  const handleClick = useCallback(() => {
    onToggle(song);
  }, [song, onToggle]);

  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
        isSelected 
          ? 'bg-green-50 border-green-300 shadow-md' 
          : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'
      }`}
      onClick={handleClick}
    >
      {/* Track Number / Selection Indicator */}
      <div className="w-8 text-center flex-shrink-0">
        {isSelected ? (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        ) : (
          <span className="text-sm text-gray-600 font-medium">{index + 1}</span>
        )}
      </div>

      {/* Album Art */}
      <div 
        className="w-10 h-10 rounded-md flex items-center justify-center text-white flex-shrink-0 shadow-sm"
        style={{ backgroundColor: sourceData?.color || '#6B7280' }}
      >
        <FaMusic className="text-sm" />
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <h4 className={`font-bold text-sm truncate ${
          isSelected ? 'text-green-800' : 'text-gray-900'
        }`}>
          {song.title}
        </h4>
        <p className={`text-sm truncate font-medium ${
          isSelected ? 'text-green-700' : 'text-gray-700'
        }`}>
          {song.artist}
          {song.album && song.album !== 'Unknown Album' && (
            <span className="text-gray-500 ml-1">• {song.album}</span>
          )}
        </p>
      </div>

      {/* Duration */}
      <div className="text-sm text-gray-600 flex-shrink-0 font-medium">
        3:45
      </div>
    </div>
  );
});

SongListItem.displayName = 'SongListItem';

// Pagination Controls Component
const PaginationControls = React.memo(({ 
  currentPage, 
  totalPages, 
  startIndex, 
  endIndex, 
  totalSongs, 
  onPageChange 
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 mt-4">
      <div className="text-sm text-gray-600">
        Showing {startIndex}-{endIndex} of {totalSongs} songs
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        <div className="flex items-center gap-1">
          {/* Show page numbers with ellipsis for large page counts */}
          {totalPages <= 7 ? (
            // Show all pages if 7 or fewer
            Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))
          ) : (
            // Show condensed pagination for many pages
            <>
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => onPageChange(1)}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="text-gray-500 text-sm">...</span>}
                </>
              )}
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="text-gray-500 text-sm">...</span>}
                  <button
                    onClick={() => onPageChange(totalPages)}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </>
          )}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
});

PaginationControls.displayName = 'PaginationControls';

// Generate minimal placeholder data for instant loading
const generatePlaceholderSongs = () => {
  // Return empty array for faster initial load
  return [];
};

export default function MusicLibraryPage() {
  const router = useRouter();
  const [songs, setSongs] = useState(generatePlaceholderSongs()); // Start with placeholder data
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [activeTab, setActiveTab] = useState('genres');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryType, setCategoryType] = useState(null);
  const [viewMode, setViewMode] = useState('library'); // 'library' or 'playlist'
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const songsPerPage = 20; // Reduced for form-style display

  // Check for URL parameters and load saved songs
  useEffect(() => {
    // Check URL parameters
    const searchParams = new URLSearchParams(window.location.search);
    const view = searchParams.get('view');
    if (view === 'playlist') {
      setViewMode('playlist');
    }

    // Load saved songs from localStorage
    try {
      const savedSongs = localStorage.getItem('musicLibrarySelectedSongs');
      if (savedSongs) {
        const parsedSongs = JSON.parse(savedSongs);
        setSelectedSongs(parsedSongs);
      }
    } catch (error) {
      console.error('Error loading saved songs:', error);
    }

    loadRealSongsInBackground();
  }, []);

  // Save selected songs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('musicLibrarySelectedSongs', JSON.stringify(selectedSongs));
    } catch (error) {
      console.error('Error saving songs to localStorage:', error);
    }
  }, [selectedSongs]);

  const loadRealSongsInBackground = async () => {
    try {
      // Use setTimeout to defer loading until after initial render
      setTimeout(async () => {
        try {
          // Load real songs in background with reduced batch size
          const [genreSongs, playlistSongs] = await Promise.all([
            loadSongsByMode('genres').catch(err => {
              console.error('Error loading genre songs:', err);
              return [];
            }),
            loadSongsByMode('playlists').catch(err => {
              console.error('Error loading playlist songs:', err);
              return [];
            })
          ]);
          
          // Combine and deduplicate songs more efficiently
          const songMap = new Map();
          [...genreSongs, ...playlistSongs].forEach(song => {
            if (!songMap.has(song.id)) {
              songMap.set(song.id, song);
            }
          });
          
          // Replace placeholder data with real data
          setSongs(Array.from(songMap.values()));
        } catch (innerError) {
          console.error('Error in background song loading:', innerError);
          // Keep placeholder data if real data fails to load
        }
      }, 100); // Small delay to prioritize initial render
    } catch (error) {
      console.error('Error setting up background song loading:', error);
      // Keep placeholder data if real data fails to load
    }
  };

  // Optimized search with debouncing
  const filteredSongs = useMemo(() => {
    if (!searchTerm) return songs;
    return searchSongs(songs, searchTerm);
  }, [songs, searchTerm]);

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Get songs for selected category with pagination
  const categorySongs = useMemo(() => {
    if (!selectedCategory) return [];
    
    let songs = [];
    if (categoryType === 'playlist') {
      songs = filteredSongs.filter(song => song.genreKey === selectedCategory);
    } else if (categoryType === 'genre') {
      songs = filteredSongs.filter(song => song.genreKey === selectedCategory);
    }
    
    return songs;
  }, [filteredSongs, selectedCategory, categoryType]);

  // Paginated category songs
  const paginatedCategorySongs = useMemo(() => {
    const startIndex = (currentPage - 1) * songsPerPage;
    const endIndex = startIndex + songsPerPage;
    return categorySongs.slice(startIndex, endIndex);
  }, [categorySongs, currentPage, songsPerPage]);

  // Paginated selected songs for playlist view
  const paginatedSelectedSongs = useMemo(() => {
    const startIndex = (currentPage - 1) * songsPerPage;
    const endIndex = startIndex + songsPerPage;
    return selectedSongs.slice(startIndex, endIndex);
  }, [selectedSongs, currentPage, songsPerPage]);

  // Pagination info
  const totalPages = Math.ceil((viewMode === 'playlist' ? selectedSongs.length : categorySongs.length) / songsPerPage);
  const startIndex = (currentPage - 1) * songsPerPage + 1;
  const endIndex = Math.min(currentPage * songsPerPage, (viewMode === 'playlist' ? selectedSongs.length : categorySongs.length));

  const handleSongToggle = useCallback((song) => {
    // Don't allow selecting placeholder songs
    if (song.isPlaceholder) return;
    
    setSelectedSongs(prev => {
      const isSelected = prev.some(s => s.id === song.id);
      if (isSelected) {
        return prev.filter(s => s.id !== song.id);
      } else {
        return [...prev, song];
      }
    });
  }, []);

  const handleBackToContract = useCallback(() => {
    // Save selected songs to both localStorage keys for consistency
    try {
      localStorage.setItem('musicLibrarySelectedSongs', JSON.stringify(selectedSongs));
      
      // Also update the main contract form data
      const contractData = JSON.parse(localStorage.getItem('djContractFormData') || '{}');
      contractData.selectedMusicLibrarySongs = selectedSongs;
      localStorage.setItem('djContractFormData', JSON.stringify(contractData));
    } catch (error) {
      console.error('Error saving songs before navigation:', error);
    }
    
    router.push('/');
  }, [router, selectedSongs]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSelectedCategory(null);
    setCategoryType(null);
    setCurrentPage(1); // Reset pagination when changing tabs
  }, []);

  const handleCategorySelect = useCallback((type, category) => {
    // Find the key for the category
    let categoryKey = null;
    if (type === 'playlist') {
      categoryKey = Object.keys(PLAYLISTS).find(key => 
        PLAYLISTS[key].displayName === category
      );
    } else if (type === 'genre') {
      categoryKey = Object.keys(GENRES).find(key => 
        GENRES[key].displayName === category
      );
    }
    
    setSelectedCategory(categoryKey);
    setCategoryType(type);
    setCurrentPage(1); // Reset to first page when selecting new category
  }, []);

  const handleBackToCategory = useCallback(() => {
    setSelectedCategory(null);
    setCategoryType(null);
    setViewMode('library'); // Ensure we're in library mode
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleViewPlaylist = useCallback(() => {
    setViewMode('playlist');
    setCurrentPage(1); // Reset pagination when viewing playlist
  }, []);

  const handleContinueAdding = useCallback(() => {
    setViewMode('library');
    setSelectedCategory(null);
    setCategoryType(null);
    setCurrentPage(1); // Reset pagination when returning to library
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your music library...</p>
        </div>
      </div>
    );
  }

  // If viewing playlist, show playlist view
  if (viewMode === 'playlist') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Main form container matching the design */}
        <div className="max-w-4xl mx-auto">
          <div style={{ 
            maxWidth: '800px',
            width: '96%',
            margin: '2rem auto 3rem auto',
            padding: '0'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              padding: '2.5rem',
              borderRadius: '20px',
              width: '100%',
              marginBottom: '50px',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}>
              
              {/* Header */}
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <button 
                    onClick={handleContinueAdding}
                    className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors shadow-sm border border-gray-300"
                  >
                    <FaArrowLeft className="text-gray-700 text-lg" />
                  </button>
                  <div className="flex-1">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
                      Your Playlist
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full"></div>
                  </div>
                  <button 
                    onClick={handleBackToContract}
                    className="p-3 rounded-full bg-blue-200 hover:bg-blue-300 transition-colors shadow-sm border border-blue-300"
                  >
                    <FaHome className="text-blue-700 text-lg" />
                  </button>
                </div>
                <p className="text-gray-700 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                  Review And Manage Your Selected Songs
                </p>
              </div>

              {/* Playlist Actions */}
              <div className="mb-8">
                <div 
                  className="rounded-lg p-5 border-l-4 border-green-500 border-2 border-green-200 shadow-md" 
                  style={{ background: 'linear-gradient(135deg, #10b98125, #10b98110)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white shadow-md">
                        <FaList />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Playlist Summary</h3>
                        <p className="text-gray-700 font-medium">{selectedSongs.length} songs selected</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleContinueAdding}
                        className="px-5 py-3 bg-white border-2 border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium shadow-sm"
                      >
                        Continue Adding Songs
                      </button>
                      <button
                        onClick={() => setSelectedSongs([])}
                        className="px-5 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-md border-2 border-red-500"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={handleBackToContract}
                        className="px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md border-2 border-blue-500"
                      >
                        Use These Songs
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Navigation */}
              <div className="mb-8">
                <div className="flex border-b-2 border-gray-300 bg-gray-50 rounded-t-lg">
                  <button
                    onClick={() => {
                      setViewMode('library');
                      setSelectedCategory(null);
                      setCategoryType(null);
                      setActiveTab('genres');
                      setCurrentPage(1);
                    }}
                    className="px-8 py-4 font-bold text-sm border-b-2 transition-colors flex-1 border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  >
                    <FaCompactDisc className="inline mr-2" /> Browse Genres
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('library');
                      setSelectedCategory(null);
                      setCategoryType(null);
                      setActiveTab('playlists');
                      setCurrentPage(1);
                    }}
                    className="px-8 py-4 font-bold text-sm border-b-2 transition-colors flex-1 border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  >
                    <FaList className="inline mr-2" /> Browse Playlists
                  </button>
                </div>
              </div>

              {/* Section Header */}
              <div style={{
                marginTop: '2rem',
                marginBottom: '1.5rem',
                borderBottom: '3px solid #d1d5db',
                position: 'relative'
              }} className="section-header">
                <h3 style={{
                  color: '#111827',
                  fontSize: 'clamp(22px, 3vw, 28px)',
                  fontWeight: '800',
                  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                  letterSpacing: '-0.025em',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 1rem 1rem 0',
                  position: 'relative',
                  marginBottom: '0'
                }}>
                  <FaHeart className="text-green-600 mr-4" style={{ marginRight: '12px', fontSize: '1.2em' }} /> 
                  Your Selected Songs
                </h3>
              </div>
              
              {/* Songs List */}
              <div className="space-y-2">
                {paginatedSelectedSongs.map((song, index) => (
                  <div 
                    key={`${song.id}-playlist`}
                    className="flex items-center gap-3 p-3 rounded-lg border-2 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all duration-200"
                  >
                    {/* Track Number */}
                    <div className="w-8 text-center flex-shrink-0">
                      <span className="text-sm text-gray-600 font-medium">{startIndex + index - 1}</span>
                    </div>

                    {/* Album Art */}
                    <div 
                      className="w-10 h-10 rounded-md flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: '#10b981' }}
                    >
                      <FaMusic className="text-sm" />
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate text-gray-900">
                        {song.title}
                      </h4>
                      <p className="text-sm truncate font-medium text-gray-700">
                        {song.artist}
                        {song.album && song.album !== 'Unknown Album' && (
                          <span className="text-gray-500 ml-1">• {song.album}</span>
                        )}
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="text-sm text-gray-600 flex-shrink-0 font-medium mr-3">
                      3:45
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleSongToggle(song)}
                      className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors text-red-600 hover:text-red-700"
                      title="Remove from playlist"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Empty State */}
              {selectedSongs.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaHeart className="text-gray-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No songs in your playlist</h3>
                  <p className="text-gray-500 mb-4">Start adding songs from the music library</p>
                  <button
                    onClick={handleContinueAdding}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Browse Music Library
                  </button>
                </div>
              )}
        
              {/* Pagination */}
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                totalSongs={selectedSongs.length}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If a category is selected, show songs from that category
  if (selectedCategory && categoryType) {
    const categoryData = categoryType === 'playlist' ? PLAYLISTS[selectedCategory] : GENRES[selectedCategory];
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Main form container matching the design */}
        <div className="max-w-4xl mx-auto">
          <div style={{ 
            maxWidth: '800px',
            width: '96%',
            margin: '2rem auto 3rem auto',
            padding: '0'
          }}>
                    <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          padding: '2.5rem',
          borderRadius: '20px',
          width: '100%',
          marginBottom: '50px',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}>
              
              {/* Header */}
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <button 
                    onClick={handleBackToCategory}
                    className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors shadow-sm border border-gray-300"
                  >
                    <FaArrowLeft className="text-gray-700 text-lg" />
                  </button>
                  <div className="flex-1">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
                      Music Library
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                  </div>
                  <button 
                    onClick={handleBackToContract}
                    className="p-3 rounded-full bg-blue-200 hover:bg-blue-300 transition-colors shadow-sm border border-blue-300"
                  >
                    <FaHome className="text-blue-700 text-lg" />
                  </button>
                </div>
                <p className="text-gray-700 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                  Browse And Select Songs For Your Event
                </p>
              </div>

              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search songs, artists, albums..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Quick Navigation */}
              <div className="mb-8">
                <div className="flex border-b-2 border-gray-300 bg-gray-50 rounded-t-lg">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setCategoryType(null);
                      setActiveTab('genres');
                      setCurrentPage(1);
                    }}
                    className="px-8 py-4 font-bold text-sm border-b-2 transition-colors flex-1 border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  >
                    <FaCompactDisc className="inline mr-2" /> Browse Genres
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setCategoryType(null);
                      setActiveTab('playlists');
                      setCurrentPage(1);
                    }}
                    className="px-8 py-4 font-bold text-sm border-b-2 transition-colors flex-1 border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  >
                    <FaList className="inline mr-2" /> Browse Playlists
                  </button>
                </div>
              </div>

                          {/* Selected Songs Summary */}
            {selectedSongs.length > 0 && (
              <div className="mb-8">
                <div 
                  className="rounded-lg p-5 border-l-4 border-green-500 border-2 border-green-200 shadow-md" 
                  style={{ background: 'linear-gradient(135deg, #10b98125, #10b98110)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white shadow-md">
                        <FaList />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Your Playlist</h3>
                        <p className="text-gray-700 font-medium">{selectedSongs.length} songs selected</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleViewPlaylist}
                        className="px-5 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md border-2 border-green-500"
                      >
                        View Playlist
                      </button>
                      <button
                        onClick={() => setSelectedSongs([])}
                        className="px-5 py-3 bg-white border-2 border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium shadow-sm"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={handleBackToContract}
                        className="px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md border-2 border-blue-500"
                      >
                        Use These Songs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

              {/* Section Header for Category */}
              <div style={{
                marginTop: '2rem',
                marginBottom: '1rem',
                borderBottom: '2px solid #e0e0e0',
                position: 'relative'
              }} className="section-header">
                <h3 style={{
                  color: '#333',
                  fontSize: 'clamp(20px, 3vw, 24px)',
                  fontWeight: '600',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 1rem 0.5rem 0',
                  position: 'relative',
                  marginBottom: '0'
                }}>
                  <FaMusic 
                    className="mr-3" 
                    style={{ 
                      marginRight: '10px',
                      color: categoryData?.color || '#6366f1'
                    }} 
                  /> 
                  {categoryData?.displayName || selectedCategory}
                </h3>
              </div>

              {/* Category Info */}
              <div className="mb-6">
                <div 
                  className="rounded-lg p-4 border-l-4" 
                  style={{ 
                    background: `linear-gradient(135deg, ${categoryData?.color}15, ${categoryData?.color}05)`,
                    borderColor: categoryData?.color || '#6366f1'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: categoryData?.color || '#6366f1' }}
                    >
                      <FaMusic />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{categoryData?.displayName}</h4>
                      <p className="text-gray-600 text-sm">{categorySongs.length} songs available</p>
                      <p className="text-gray-500 text-sm">{categoryData?.description}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Songs List */}
              <div className="space-y-2">
                {paginatedCategorySongs.map((song, index) => (
                  <SongListItem
                    key={`${song.id}-${song.genreKey || 'unknown'}`}
                    song={song}
                    index={startIndex + index - 1} // Adjust index for pagination
                    isSelected={selectedSongs.some(s => s.id === song.id)}
                    onToggle={handleSongToggle}
                    sourceData={categoryData}
                  />
                ))}
              </div>
              
              {/* Empty State */}
              {categorySongs.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaMusic className="text-gray-400 text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No songs found</h3>
                  <p className="text-gray-500">Try adjusting your search terms</p>
                </div>
              )}

              {/* Pagination */}
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                totalSongs={categorySongs.length}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main form container matching the design */}
      <div className="max-w-4xl mx-auto">
        <div style={{ 
          maxWidth: '800px',
          width: '96%',
          margin: '2rem auto 3rem auto',
          padding: '0'
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            padding: '2.5rem',
            borderRadius: '20px',
            width: '100%',
            marginBottom: '50px',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}>
            
            {/* Header */}
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-4 mb-6">
                <button 
                  onClick={handleBackToContract}
                  className="p-3 rounded-full bg-blue-200 hover:bg-blue-300 transition-colors shadow-sm border border-blue-300"
                >
                  <FaHome className="text-blue-700 text-lg" />
                </button>
                <div className="flex-1">
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
                    Music Library
                  </h1>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                </div>
              </div>
                             <p className="text-gray-700 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                 Browse Genres And Playlists To Find The Perfect Music For Your Event
               </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search songs, artists, albums..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-500 shadow-sm"
                />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-8">
              <div className="flex border-b-2 border-gray-300 bg-gray-50 rounded-t-lg">
                <button
                  onClick={() => handleTabChange('genres')}
                  className={`px-8 py-4 font-bold text-sm border-b-2 transition-colors flex-1 ${
                    activeTab === 'genres'
                      ? 'border-blue-500 text-blue-700 bg-white'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <FaCompactDisc className="inline mr-2" /> Genres
                </button>
                <button
                  onClick={() => handleTabChange('playlists')}
                  className={`px-8 py-4 font-bold text-sm border-b-2 transition-colors flex-1 ${
                    activeTab === 'playlists'
                      ? 'border-blue-500 text-blue-700 bg-white'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <FaList className="inline mr-2" /> Playlists
                </button>
              </div>
            </div>

            {/* Selected Songs Summary */}
            {selectedSongs.length > 0 && (
              <div className="mb-8">
                <div 
                  className="rounded-lg p-5 border-l-4 border-green-500 border-2 border-green-200 shadow-md" 
                  style={{ background: 'linear-gradient(135deg, #10b98125, #10b98110)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white shadow-md">
                        <FaList />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Your Playlist</h3>
                        <p className="text-gray-700 font-medium">{selectedSongs.length} songs selected</p>
                      </div>
                    </div>
                                         <div className="flex gap-3">
                       <button
                         onClick={handleViewPlaylist}
                         className="px-5 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md border-2 border-green-500"
                       >
                         View Playlist
                       </button>
                       <button
                         onClick={() => setSelectedSongs([])}
                         className="px-5 py-3 bg-white border-2 border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium shadow-sm"
                       >
                         Clear All
                       </button>
                       <button
                         onClick={handleBackToContract}
                         className="px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md border-2 border-blue-500"
                       >
                         Use These Songs
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section Header */}
            <div style={{
              marginTop: '2rem',
              marginBottom: '1.5rem',
              borderBottom: '3px solid #d1d5db',
              position: 'relative'
            }} className="section-header">
              <h3 style={{
                color: '#111827',
                fontSize: 'clamp(22px, 3vw, 28px)',
                fontWeight: '800',
                fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                letterSpacing: '-0.025em',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                padding: '0 1rem 1rem 0',
                position: 'relative',
                marginBottom: '0'
              }}>
                <FaMusic className="text-blue-600 mr-4" style={{ marginRight: '12px', fontSize: '1.2em' }} /> 
                {activeTab === 'genres' ? 'Music Genres' : 'Curated Playlists'}
              </h3>
            </div>

            {/* Categories Grid */}
            <div className="space-y-3">
              {activeTab === 'genres' && Object.entries(GENRES).map(([genreKey, genreData]) => {
                const genreSongs = filteredSongs.filter(song => song.genreKey === genreKey);
                if (genreSongs.length === 0) return null;
                
                return (
                  <CategoryCard
                    key={genreKey}
                    title={genreData.displayName}
                    color={genreData.color}
                    type="genre"
                    onSelect={handleCategorySelect}
                    description={genreData.description}
                    songCount={genreSongs.length}
                  />
                );
              })}

              {activeTab === 'playlists' && Object.entries(PLAYLISTS).map(([playlistKey, playlistData]) => {
                const playlistSongs = filteredSongs.filter(song => song.genreKey === playlistKey);
                if (playlistSongs.length === 0) return null;
                
                return (
                  <CategoryCard
                    key={playlistKey}
                    title={playlistData.displayName}
                    color={playlistData.color}
                    type="playlist"
                    onSelect={handleCategorySelect}
                    description={playlistData.description}
                    songCount={playlistSongs.length}
                  />
                );
              })}
            </div>

            {/* Empty State */}
            {filteredSongs.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaMusic className="text-gray-400 text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No songs found</h3>
                <p className="text-gray-500">Try adjusting your search or check back later</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 