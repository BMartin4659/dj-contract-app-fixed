import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaTimes, FaPlay, FaPlus, FaMinus, FaMusic, FaFilter, FaSort } from 'react-icons/fa';
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

// Function to determine if a color is light or dark for better text contrast
const isLightColor = (hexColor) => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance using the relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if light (luminance > 0.5)
  return luminance > 0.5;
};

// Function to get appropriate text color for a background
const getTextColor = (backgroundColor) => {
  return isLightColor(backgroundColor) ? '#1f2937' : '#ffffff'; // dark gray or white
};

const ItunesPlaylistBrowser = ({ isOpen, onClose, selectedSongs = [], onSongsChange, onViewPlaylist }) => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [mode, setMode] = useState('genres'); // 'genres' or 'playlists'
  
  const songsPerPage = 30; // Increased from 20 to show more songs per page

  // Load songs when component mounts, mode changes, or genre selection changes
  useEffect(() => {
    if (isOpen) {
      loadSongs();
    }
  }, [isOpen, mode, selectedGenre]);

  const loadSongs = async () => {
    setLoading(true);
    try {
      console.log(`Loading songs in ${mode} mode...`);
      
      // If a specific genre/playlist is selected, load only from that source
      if (selectedGenre && selectedGenre !== 'all') {
        let songs = [];
        if (mode === 'playlists') {
          console.log(`Loading songs from specific playlist: ${selectedGenre}`);
          songs = await loadPlaylistSongs(selectedGenre);
          // Add playlist information to each song
          songs = songs.map(song => ({
            ...song,
            playlistKey: selectedGenre,
            playlistDisplay: PLAYLISTS[selectedGenre]?.displayName || selectedGenre,
            genreKey: selectedGenre, // For compatibility with existing filtering
            genreDisplay: PLAYLISTS[selectedGenre]?.displayName || selectedGenre
          }));
        } else {
          console.log(`Loading songs from specific genre: ${selectedGenre}`);
          songs = await loadGenreSongs(selectedGenre);
          // Add genre information to each song
          songs = songs.map(song => ({
            ...song,
            genreKey: selectedGenre,
            genreDisplay: GENRES[selectedGenre]?.displayName || selectedGenre
          }));
        }
        console.log(`Loaded ${songs.length} songs from ${mode === 'playlists' ? 'playlist' : 'genre'}: ${selectedGenre}`);
        setSongs(songs);
        setFilteredSongs(songs);
      } else {
        // Load all songs when "all" is selected
        const allSongs = await loadSongsByMode(mode);
        console.log(`Loaded ${allSongs.length} total songs`);
        setSongs(allSongs);
        setFilteredSongs(allSongs);
      }
    } catch (error) {
      console.error('Error loading songs:', error);
      setSongs([]);
      setFilteredSongs([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let result = songs;
    
    // Apply search
    result = searchSongs(result, searchTerm);
    
    // Only apply genre filter if we loaded all songs (selectedGenre === 'all')
    // If we loaded specific genre/playlist data, no need to filter again
    if (selectedGenre === 'all') {
      result = filterByGenre(result, selectedGenre);
    }
    
    // Apply sorting
    result = sortSongs(result, sortBy, sortDirection);
    
    setFilteredSongs(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [songs, searchTerm, selectedGenre, sortBy, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredSongs.length / songsPerPage);
  const startIndex = (currentPage - 1) * songsPerPage;
  const endIndex = startIndex + songsPerPage;
  const currentSongs = filteredSongs.slice(startIndex, endIndex);

  const handleSongToggle = (song) => {
    const isSelected = selectedSongs.some(s => s.id === song.id);
    
    if (isSelected) {
      // Remove song
      const newSelection = selectedSongs.filter(s => s.id !== song.id);
      onSongsChange(newSelection);
    } else {
      // Add song
      const newSelection = [...selectedSongs, song];
      onSongsChange(newSelection);
    }
  };

  const clearSelection = () => {
    onSongsChange([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 sm:p-4" style={{ overscrollBehavior: 'contain' }}>
      <div className="bg-white w-full h-full sm:rounded-lg sm:shadow-xl sm:max-w-6xl sm:h-[90vh] flex flex-col sm:max-h-screen overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-white flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">DJ Bobby Drake&apos;s Music Library</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {loading ? 'Loading...' : `${filteredSongs.length} songs available`}
              {selectedSongs.length > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  • {selectedSongs.length} selected
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold ml-2 flex-shrink-0 p-2"
          >
            ×
          </button>
        </div>

        {/* Controls */}
        <div className="p-3 sm:p-6 border-b bg-gray-50 flex-shrink-0">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* First Row: Mode Toggle and Search */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Mode Toggle */}
              <div className="sm:w-48">
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => {
                      setMode('genres');
                      setSelectedGenre('all');
                    }}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                      mode === 'genres'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Genres
                  </button>
                  <button
                    onClick={() => {
                      setMode('playlists');
                      setSelectedGenre('all');
                    }}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                      mode === 'playlists'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Playlists
                  </button>
                </div>
              </div>
              
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search songs, artists, or albums..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Second Row: Filter, Sort, and Clear */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Genre/Playlist Filter */}
              <div className="flex-1 sm:max-w-xs">
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">{mode === 'playlists' ? 'All Playlists' : 'All Genres'}</option>
                  {mode === 'playlists' 
                    ? Object.entries(PLAYLISTS)
                        .sort(([,a], [,b]) => a.displayName.localeCompare(b.displayName))
                        .map(([key, playlist]) => (
                          <option key={key} value={key}>
                            {playlist.displayName}
                          </option>
                        ))
                    : Object.entries(GENRES)
                        .sort(([,a], [,b]) => a.displayName.localeCompare(b.displayName))
                        .map(([key, genre]) => (
                          <option key={key} value={key}>
                            {genre.displayName}
                          </option>
                        ))
                  }
                </select>
              </div>
              
              {/* Sort */}
              <div className="flex-1 sm:max-w-xs flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="title">Sort by Title</option>
                  <option value="artist">Sort by Artist</option>
                  <option value="album">Sort by Album</option>
                  <option value="dateAdded">Sort by Date</option>
                </select>
                
                {/* Sort Direction Toggle for Date Added */}
                {sortBy === 'dateAdded' && (
                  <button
                    onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
                    className="px-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    title={sortDirection === 'desc' ? 'Last songs added (newest first)' : 'First songs added (oldest first)'}
                  >
                    {sortDirection === 'desc' ? (
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              
              {/* Clear Selection */}
              {selectedSongs.length > 0 && (
                <button
                  onClick={clearSelection}
                  className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
                >
                  Clear ({selectedSongs.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Songs List - Scrollable Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your music library...</p>
              </div>
            </div>
          ) : currentSongs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">No songs found</p>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-6">
              <div className="space-y-1 sm:space-y-2">
                {currentSongs.map((song) => {
                  const isSelected = selectedSongs.some(s => s.id === song.id);
                  const sourceData = mode === 'playlists' ? PLAYLISTS[song.genreKey] : GENRES[song.genreKey];
                  
                  // Create unique key combining song ID with source to avoid duplicate keys
                  const uniqueKey = `${song.id}-${song.genreKey || 'unknown'}`;
                  
                  return (
                    <div
                      key={uniqueKey}
                      onClick={() => handleSongToggle(song)}
                      className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex-shrink-0">
                              <div
                                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                                style={{ backgroundColor: sourceData?.color || '#gray' }}
                                title={song.genreDisplay}
                              ></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                {song.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {song.artist}
                                {song.album && song.album !== 'Unknown Album' && (
                                  <span className="text-gray-400 hidden sm:inline"> • {song.album}</span>
                                )}
                              </p>
                              <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                <span 
                                  className="inline-block px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs rounded-full font-medium"
                                  style={{ 
                                    backgroundColor: sourceData?.color || '#6B7280',
                                    color: getTextColor(sourceData?.color || '#6B7280')
                                  }}
                                >
                                  {song.genreDisplay || sourceData?.displayName || song.genre || 'Music'}
                                </span>
                                {song.playCount > 0 && (
                                  <span className="text-xs text-gray-500 hidden sm:inline">
                                    {song.playCount} plays
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2 sm:ml-4">
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredSongs.length > songsPerPage && (
          <div className="p-3 sm:p-6 border-t bg-gray-50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredSongs.length)} of {filteredSongs.length} songs
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Prev
                </button>
                <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                  {currentPage}/{totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 sm:p-6 border-t bg-gray-50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Select songs to add to your playlist request
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="px-4 sm:px-6 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {selectedSongs.length > 0 && onViewPlaylist && (
                <button
                  onClick={() => {
                    onViewPlaylist();
                  }}
                  className="px-4 sm:px-6 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span className="hidden sm:inline">View Playlist</span> ({selectedSongs.length})
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 sm:px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done ({selectedSongs.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItunesPlaylistBrowser; 