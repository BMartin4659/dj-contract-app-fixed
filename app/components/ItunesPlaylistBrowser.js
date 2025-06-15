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

// Color utility functions
const isLightColor = (hexColor) => {
  if (!hexColor) return false;
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 155;
};

const getTextColor = (backgroundColor) => {
  return isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
};

const ItunesPlaylistBrowser = ({ isOpen, onClose, selectedSongs = [], onSongsChange, onViewPlaylist }) => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [mode, setMode] = useState('genres');
  const songsPerPage = 40;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ overscrollBehavior: 'contain' }}>
      <div className="bg-white w-full h-full sm:w-full sm:h-full sm:rounded-lg sm:shadow-xl sm:max-w-6xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-1 sm:p-2 border-b bg-white flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-lg font-bold text-gray-900 truncate">DJ Bobby Drake&apos;s Music Library</h2>
            <p className="text-xs text-gray-600">
              {loading ? 'Loading...' : `${filteredSongs.length} songs`}
              {selectedSongs.length > 0 && (
                <span className="ml-1 text-blue-600 font-medium">• {selectedSongs.length} selected</span>
              )}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg font-bold ml-1 p-1">×</button>
        </div>

        {/* Controls */}
        <div className="p-1 border-b bg-gray-50 flex-shrink-0">
          <div className="flex flex-col gap-1">
            {/* Mode Toggle and Search */}
            <div className="flex flex-col sm:flex-row gap-1">
              <div className="sm:w-32">
                <div className="flex rounded border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => { setMode('genres'); setSelectedGenre('all'); }}
                    className={`flex-1 px-1 py-0.5 text-xs font-medium transition-colors ${
                      mode === 'genres' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Genres
                  </button>
                  <button
                    onClick={() => { setMode('playlists'); setSelectedGenre('all'); }}
                    className={`flex-1 px-1 py-0.5 text-xs font-medium transition-colors ${
                      mode === 'playlists' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Playlists
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search songs, artists, or albums..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Filter, Sort, and Clear */}
            <div className="flex flex-col sm:flex-row gap-1">
              <div className="flex-1 sm:max-w-xs">
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">{mode === 'playlists' ? 'All Playlists' : 'All Genres'}</option>
                  {mode === 'playlists' 
                    ? Object.entries(PLAYLISTS)
                        .sort(([,a], [,b]) => a.displayName.localeCompare(b.displayName))
                        .map(([key, playlist]) => (
                          <option key={key} value={key}>{playlist.displayName}</option>
                        ))
                    : Object.entries(GENRES)
                        .sort(([,a], [,b]) => a.displayName.localeCompare(b.displayName))
                        .map(([key, genre]) => (
                          <option key={key} value={key}>{genre.displayName}</option>
                        ))
                  }
                </select>
              </div>
              
              <div className="flex-1 sm:max-w-xs flex gap-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  <option value="title">Sort by Title</option>
                  <option value="artist">Sort by Artist</option>
                  <option value="album">Sort by Album</option>
                  <option value="dateAdded">Sort by Date</option>
                </select>
                
                {sortBy === 'dateAdded' && (
                  <button
                    onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
                    className="px-0.5 py-0.5 border border-gray-300 rounded hover:bg-gray-50"
                    title={sortDirection === 'desc' ? 'Newest first' : 'Oldest first'}
                  >
                    {sortDirection === 'desc' ? (
                      <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    ) : (
                      <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              
              {selectedSongs.length > 0 && (
                <button
                  onClick={clearSelection}
                  className="px-1 py-0.5 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 whitespace-nowrap"
                >
                  Clear ({selectedSongs.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-1"></div>
                <p className="text-gray-600 text-xs">Loading...</p>
              </div>
            </div>
          ) : currentSongs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-1">No songs found</p>
                <p className="text-gray-400 text-xs">Try adjusting your search or filter</p>
              </div>
            </div>
          ) : (
            <div className="p-0.5">
              {currentSongs.map((song) => {
                const isSelected = selectedSongs.some(s => s.id === song.id);
                const sourceData = mode === 'playlists' ? PLAYLISTS[song.genreKey] : GENRES[song.genreKey];
                const uniqueKey = `${song.id}-${song.genreKey || 'unknown'}`;
                
                return (
                  <div
                    key={uniqueKey}
                    onClick={() => handleSongToggle(song)}
                    className={`p-1 mb-0.5 rounded border cursor-pointer transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <div className="flex-shrink-0">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: sourceData?.color || '#6B7280' }}
                              title={song.genreDisplay}
                            ></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{song.title}</h3>
                            <p className="text-xs text-gray-700 truncate font-medium">
                              {song.artist}
                              {song.album && song.album !== 'Unknown Album' && (
                                <span className="text-gray-500 hidden sm:inline font-normal"> • {song.album}</span>
                              )}
                            </p>
                            <div className="flex items-center gap-0.5">
                              <span 
                                className="inline-block px-0.5 py-0 text-xs rounded font-medium"
                                style={{ 
                                  backgroundColor: sourceData?.color || '#6B7280',
                                  color: getTextColor(sourceData?.color || '#6B7280')
                                }}
                              >
                                {song.genreDisplay || sourceData?.displayName || song.genre || 'Music'}
                              </span>
                              {song.playCount > 0 && (
                                <span className="text-xs text-gray-600 hidden sm:inline">{song.playCount} plays</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-1">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
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
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t flex-shrink-0">
          {/* Pagination */}
          {!loading && filteredSongs.length > songsPerPage && (
            <div className="px-1 py-0.5 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-700">{startIndex + 1}-{Math.min(endIndex, filteredSongs.length)} of {filteredSongs.length}</p>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-1 py-0 text-xs border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  <span className="px-0.5 text-xs">{currentPage}/{totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-1 py-0 text-xs border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-1 py-0.5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600 hidden sm:block">Select songs for your playlist</p>
              <div className="flex gap-0.5 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="px-1 py-0.5 text-xs text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                {selectedSongs.length > 0 && onViewPlaylist && (
                  <button
                    onClick={() => { onViewPlaylist(); }}
                    className="px-1 py-0.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-0.5"
                  >
                    <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span className="hidden sm:inline">View</span> ({selectedSongs.length})
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-1 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  Done ({selectedSongs.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItunesPlaylistBrowser;