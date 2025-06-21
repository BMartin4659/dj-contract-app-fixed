'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { FaMusic, FaArrowLeft, FaSearch, FaList, FaHome, FaHeart, FaCompactDisc, FaRadiation, FaGuitar, FaMicrophone, FaHeadphones, FaDrum, FaStar, FaFire, FaPlay, FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import BackToTopButton from '../components/BackToTopButton';
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
      className="rounded-none md:rounded-lg p-4 border-2 border-gray-300 bg-white shadow-sm hover:border-gray-400 hover:shadow-md transition-all duration-200"
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
      className={`flex items-center gap-3 p-3 rounded-none md:rounded-lg cursor-pointer transition-all duration-200 border-2 ${
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
    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-none md:rounded-lg border-2 border-gray-200 mt-4">
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
  // Return some sample songs with proper genreKey mappings for immediate color display
  return [
    { id: 'sample-1', title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", genre: "Pop", genreKey: "pop", isPlaceholder: true },
    { id: 'sample-2', title: "God's Plan", artist: "Drake", album: "Scorpion", genre: "Rap", genreKey: "rap-hiphop", isPlaceholder: true },
    { id: 'sample-3', title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", genre: "Rock", genreKey: "rock", isPlaceholder: true },
    { id: 'sample-4', title: "No Scrubs", artist: "TLC", album: "FanMail", genre: "R&B", genreKey: "rnb", isPlaceholder: true },
    { id: 'sample-5', title: "One Love", artist: "Bob Marley", album: "Exodus", genre: "Reggae", genreKey: "reggae", isPlaceholder: true },
    { id: 'sample-6', title: "Despacito", artist: "Luis Fonsi", album: "Vida", genre: "Latin", genreKey: "latin", isPlaceholder: true },
    { id: 'sample-7', title: "Sweet Child O' Mine", artist: "Guns N' Roses", album: "Appetite for Destruction", genre: "Rock", genreKey: "rock", isPlaceholder: true },
    { id: 'sample-8', title: "I Will Always Love You", artist: "Whitney Houston", album: "The Bodyguard", genre: "R&B", genreKey: "rnb", isPlaceholder: true }
  ];
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
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [groupBy, setGroupBy] = useState('none'); // 'none', 'genre', 'artist'
  const [collapsedGroups, setCollapsedGroups] = useState(new Set()); // Track which groups are collapsed
  const songsPerPage = 20; // Reduced for form-style display

  // Function to map genre names to genre keys
  const mapGenreToKey = useCallback((genreName) => {
    if (!genreName) return null;
    
    // Create a mapping of common genre names to our genre keys
    const genreMapping = {
      'pop': 'pop',
      'rock': 'rock', 
      'r&b': 'rnb',
      'rnb': 'rnb',
      'rhythm & blues': 'rnb',
      'rap': 'rap-hiphop',
      'hip-hop': 'rap-hiphop',
      'hip hop': 'rap-hiphop',
      'rap & hip-hop': 'rap-hiphop',
      'reggae': 'reggae',
      'latin': 'latin',
      'christmas': 'christmas',
      'holiday': 'christmas',
      'urban': 'urban',
      'classic rock': 'rock',
      'dance': 'pop',
      'electronic': 'pop',
      'funk': 'urban',
      'soul': 'rnb',
      'disco': 'pop',
      '80s': 'classic-80s',
      'classic 80s': 'classic-80s',
      'classic 80\'s': 'classic-80s',
      'classic 80s music': 'classic-80s',
      'classic 80\'s music': 'classic-80s',
      'eighties': 'classic-80s',
      'the eighties': 'classic-80s',
      '1980s': 'classic-80s',
      'rock / pop / ac': 'rock-pop-ac',
      'rock-pop-ac': 'rock-pop-ac',
      'adult contemporary': 'rock-pop-ac',
      'alternative': 'rock',
      'country': 'pop', // Map to pop as fallback
      'jazz': 'pop', // Map to pop as fallback
      'blues': 'rnb'
    };
    
    const normalizedGenre = genreName.toLowerCase().trim();
    return genreMapping[normalizedGenre] || null;
  }, []);

  // Authentication state management
  useEffect(() => {
    try {
      // Try to import Firebase auth
      import('../../lib/firebase').then(({ auth }) => {
        if (!auth) {
          console.log('🔥 Firebase not available - Music Library will work without authentication');
          setAuthLoading(false);
          setUser(null);
          return;
        }
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          setAuthLoading(false);
        });

        return () => unsubscribe();
      }).catch(error => {
        console.log('🔥 Firebase not available - Music Library will work without authentication');
        setAuthLoading(false);
        setUser(null);
      });
    } catch (error) {
      console.log('🔥 Firebase not available - Music Library will work without authentication');
      setAuthLoading(false);
      setUser(null);
    }
  }, []);

  // Check for URL parameters and load saved songs
  useEffect(() => {
    // Check URL parameters
    const searchParams = new URLSearchParams(window.location.search);
    const view = searchParams.get('view');
    if (view === 'playlist') {
      setViewMode('playlist');
    }

    // Load saved songs from localStorage and process them for genre keys
    try {
      const savedSongs = localStorage.getItem('musicLibrarySelectedSongs');
      if (savedSongs) {
        const parsedSongs = JSON.parse(savedSongs);
        
        // Process saved songs to ensure they have proper genre keys
        const processedSongs = parsedSongs.map(song => {
          let processedSong = { ...song };
          
          // If no genreKey, try to map from genre name
          if (!processedSong.genreKey && processedSong.genre) {
            processedSong.genreKey = mapGenreToKey(processedSong.genre);
          }
          
          // If still no genreKey, try to infer from playlist/album name
          if (!processedSong.genreKey) {
            const albumName = processedSong.album?.toLowerCase() || '';
            if (albumName.includes('club anthems')) {
              // 80s Club Anthems should be R&B genre (purple)
              processedSong.genreKey = 'rnb';
            } else if (albumName.includes('80s') || albumName.includes('eighties')) {
              processedSong.genreKey = 'classic-80s';
            } else if (albumName.includes('club') || albumName.includes('dance')) {
              processedSong.genreKey = 'pop';
            } else if (albumName.includes('hip hop') || albumName.includes('rap')) {
              processedSong.genreKey = 'rap-hiphop';
            } else if (albumName.includes('r&b') || albumName.includes('rnb')) {
              processedSong.genreKey = 'rnb';
            } else if (albumName.includes('rock')) {
              processedSong.genreKey = 'rock';
            } else if (albumName.includes('reggae')) {
              processedSong.genreKey = 'reggae';
            } else if (albumName.includes('latin')) {
              processedSong.genreKey = 'latin';
            } else {
              // Default fallback
              processedSong.genreKey = 'pop';
            }
          }
          
          return processedSong;
        });
        
        setSelectedSongs(processedSongs);
      }
    } catch (error) {
      console.error('Error loading saved songs:', error);
    }

    loadRealSongsInBackground();
  }, [mapGenreToKey]);

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
          
          // Process genre songs
          genreSongs.forEach(song => {
            if (!songMap.has(song.id)) {
              const genreKey = mapGenreToKey(song.genre);
              const processedSong = {
                ...song,
                genreKey: genreKey,
                sourceType: 'genre'
              };
              songMap.set(song.id, processedSong);
            }
          });
          
          // Process playlist songs
          playlistSongs.forEach(song => {
            if (!songMap.has(song.id)) {
              // For playlist songs, use the actual genre for genreKey, not the playlist key
              const actualGenreKey = mapGenreToKey(song.genre);
              const processedSong = {
                ...song,
                genreKey: actualGenreKey, // Use actual genre, not playlist key
                sourceType: 'playlist',
                playlistKey: song.playlistKey // This should be the playlist key
              };
              songMap.set(song.id, processedSong);
            } else {
              // If song already exists from genre, add playlist info
              const existingSong = songMap.get(song.id);
              existingSong.playlistKey = song.playlistKey;
              existingSong.sourceType = 'both'; // Available in both genres and playlists
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
      songs = filteredSongs.filter(song => song.playlistKey === selectedCategory);
    } else if (categoryType === 'genre') {
      songs = filteredSongs.filter(song => song.genreKey === selectedCategory);
    }
    
    return songs;
  }, [filteredSongs, selectedCategory, categoryType]);

  // Paginated category songs
  // Group selected songs function
  const groupSelectedSongs = useCallback((songs, groupType) => {
    if (groupType === 'none') return { 'All Songs': songs };
    
    const groups = {};
    
    songs.forEach(song => {
      let groupKey;
      if (groupType === 'genre') {
        groupKey = song.genreKey || song.genre || 'Unknown Genre';
        // Convert genre key to display name if available
        if (GENRES[groupKey]) {
          groupKey = GENRES[groupKey].displayName;
        }
      } else {
        groupKey = 'All Songs';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(song);
    });
    
    // Sort groups alphabetically and sort songs within each group
    const sortedGroups = {};
    Object.keys(groups).sort().forEach(key => {
      sortedGroups[key] = groups[key].sort((a, b) => a.title.localeCompare(b.title));
    });
    
    return sortedGroups;
  }, []);

  // Toggle group collapse state
  const toggleGroup = useCallback((groupName) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  }, []);

  // Get genre-specific styling
  const getGenreStyle = useCallback((groupName, groupType, song = null) => {
    // If we have a song, try to get its genre style first
    if (song) {
      let songGenreKey = song.genreKey;
      
      // If no genreKey, try to map from genre name
      if (!songGenreKey && song.genre) {
        songGenreKey = mapGenreToKey(song.genre);
      }
      
      // If still no genreKey, try to infer from album name
      if (!songGenreKey) {
        const albumName = song.album?.toLowerCase() || '';
        if (albumName.includes('club anthems')) {
          // 80s Club Anthems should be R&B genre (purple)
          songGenreKey = 'rnb';
        } else if (albumName.includes('80s') || albumName.includes('eighties')) {
          songGenreKey = 'classic-80s';
        } else if (albumName.includes('club') || albumName.includes('dance')) {
          songGenreKey = 'pop';
        } else if (albumName.includes('hip hop') || albumName.includes('rap')) {
          songGenreKey = 'rap-hiphop';
        } else if (albumName.includes('r&b') || albumName.includes('rnb')) {
          songGenreKey = 'rnb';
        } else if (albumName.includes('rock')) {
          songGenreKey = 'rock';
        } else if (albumName.includes('reggae')) {
          songGenreKey = 'reggae';
        } else if (albumName.includes('latin')) {
          songGenreKey = 'latin';
        } else {
          // Default fallback
          songGenreKey = 'pop';
        }
      }
      
      if (songGenreKey && GENRES[songGenreKey]) {
        const genreData = GENRES[songGenreKey];
        return {
          color: genreData.color,
          icon: genreData.icon || FaMusic,
          bgGradient: `from-[${genreData.color}15] to-[${genreData.color}05]`,
          borderColor: `border-[${genreData.color}]`,
          textColor: 'text-gray-900',
          subtextColor: 'text-gray-700',
          iconColor: 'text-white'
        };
      }
    }

    // For "All Songs" or non-genre grouping without a song
    if (groupType !== 'genre') {
      return {
        color: '#8B5CF6', // Purple for mixed content
        icon: FaMusic,
        bgGradient: 'from-purple-50 to-purple-100',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-900',
        subtextColor: 'text-purple-700',
        iconColor: 'text-purple-600'
      };
    }

    // Find the genre data by display name
    const genreEntry = Object.entries(GENRES).find(([key, data]) => 
      data.displayName === groupName
    );
    
    if (genreEntry) {
      const [genreKey, genreData] = genreEntry;
      return {
        color: genreData.color,
        icon: genreData.icon || FaMusic,
        bgGradient: `from-[${genreData.color}15] to-[${genreData.color}05]`,
        borderColor: `border-[${genreData.color}]`,
        textColor: 'text-gray-900',
        subtextColor: 'text-gray-700',
        iconColor: 'text-white'
      };
    }

    // Default styling for unknown genres
    return {
      color: GENRES['pop']?.color || '#98D8C8',
      icon: FaMusic,
      bgGradient: `from-[${GENRES['pop']?.color || '#98D8C8'}15] to-[${GENRES['pop']?.color || '#98D8C8'}05]`,
      borderColor: `border-[${GENRES['pop']?.color || '#98D8C8'}]`,
      textColor: 'text-gray-900',
      subtextColor: 'text-gray-700',
      iconColor: 'text-white'
    };
  }, [mapGenreToKey]);

  const paginatedCategorySongs = useMemo(() => {
    const startIndex = (currentPage - 1) * songsPerPage;
    const endIndex = startIndex + songsPerPage;
    return categorySongs.slice(startIndex, endIndex);
  }, [categorySongs, currentPage, songsPerPage]);

  // Grouped selected songs for playlist view
  const groupedSelectedSongs = useMemo(() => {
    return groupSelectedSongs(selectedSongs, groupBy);
  }, [selectedSongs, groupBy, groupSelectedSongs]);

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
        // Process the song to ensure it has proper genre key
        let processedSong = { ...song };
        
        // If no genreKey, try to map from genre name
        if (!processedSong.genreKey && processedSong.genre) {
          processedSong.genreKey = mapGenreToKey(processedSong.genre);
        }
        
        // If still no genreKey, try to infer from playlist/album name
        if (!processedSong.genreKey) {
          const albumName = processedSong.album?.toLowerCase() || '';
          if (albumName.includes('club anthems')) {
            // 80s Club Anthems should be R&B genre (purple)
            processedSong.genreKey = 'rnb';
          } else if (albumName.includes('80s') || albumName.includes('eighties')) {
            processedSong.genreKey = 'classic-80s';
          } else if (albumName.includes('club') || albumName.includes('dance')) {
            processedSong.genreKey = 'pop';
          } else if (albumName.includes('hip hop') || albumName.includes('rap')) {
            processedSong.genreKey = 'rap-hiphop';
          } else if (albumName.includes('r&b') || albumName.includes('rnb')) {
            processedSong.genreKey = 'rnb';
          } else if (albumName.includes('rock')) {
            processedSong.genreKey = 'rock';
          } else if (albumName.includes('reggae')) {
            processedSong.genreKey = 'reggae';
          } else if (albumName.includes('latin')) {
            processedSong.genreKey = 'latin';
          } else {
            // Default fallback
            processedSong.genreKey = 'pop';
          }
        }
        
        return [...prev, processedSong];
      }
    });
  }, [mapGenreToKey]);

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
            margin: '1rem auto 3rem auto',
            padding: '0'
          }} className="px-2 md:px-4 mt-4 md:mt-8">
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              padding: '1rem',
              borderRadius: '0',
              width: '100%',
              marginBottom: '50px',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }} className="md:rounded-[20px] md:p-10">
              
              {/* Header */}
              <div className="text-center mb-10 relative pt-20 md:pt-24">
                {/* Back Arrow Button - Positioned absolutely on the left */}
                <button 
                  onClick={handleContinueAdding}
                  className="absolute left-0 top-20 md:top-24 w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors shadow-sm border border-gray-300 flex items-center justify-center"
                >
                  <FaArrowLeft className="text-gray-700 text-base" />
                </button>
                
                {/* Back to Contract Button - Positioned absolutely on the right */}
                <button 
                  onClick={handleBackToContract}
                  className="absolute right-0 top-20 md:top-24 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg border border-blue-400 font-medium text-xs"
                  title="Save your selected songs and return to the contract form"
                >
                  <span>Back to Contract</span>
                </button>
                
                {/* Centered Header Content */}
              <div className="mb-6">
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
                    Your Playlist
                  </h1>
                  <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full" style={{ width: 'fit-content', minWidth: '110px' }}></div>
                </div>
                
                <p className="text-gray-700 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                  Review And Manage Your Selected Songs
                </p>
              </div>

              {/* Playlist Actions */}
              <div className="mb-6 md:mb-8">
                <div 
                  className="rounded-lg p-3 md:p-5 border-l-4 border-green-500 border-2 border-green-200 shadow-md" 
                  style={{ background: 'linear-gradient(135deg, #10b98125, #10b98110)' }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-green-500 flex items-center justify-center text-white shadow-md">
                        <FaList className="text-sm md:text-base" />
                      </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-base md:text-lg">Playlist Summary</h3>
                        <p className="text-gray-700 font-medium text-sm md:text-base">{selectedSongs.length} songs selected</p>
                    </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                      <button
                        onClick={handleContinueAdding}
                        className="px-3 py-2 md:px-5 md:py-3 bg-white border-2 border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium shadow-sm text-sm md:text-base"
                      >
                        Continue Adding Songs
                      </button>
                      <button
                        onClick={() => setSelectedSongs([])}
                        className="px-3 py-2 md:px-5 md:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-md border-2 border-red-500 text-sm md:text-base"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={handleBackToContract}
                        className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg border border-blue-400 font-medium text-sm md:text-base"
                        title="Save your selected songs and return to the contract form"
                      >
                        <span>Save & Return to Contract</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Navigation */}
              <div className="mb-8">
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setViewMode('library');
                      setSelectedCategory(null);
                      setCategoryType(null);
                      setActiveTab('genres');
                      setCurrentPage(1);
                    }}
                    className="px-6 py-3 font-semibold text-sm rounded-lg border-2 bg-purple-600 text-white border-purple-500 hover:bg-purple-700 hover:shadow-md transition-all duration-200 flex items-center gap-2 shadow-sm"
                  >
                    <FaGuitar className="text-base" /> Browse Genres
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('library');
                      setSelectedCategory(null);
                      setCategoryType(null);
                      setActiveTab('playlists');
                      setCurrentPage(1);
                    }}
                    className="px-6 py-3 font-semibold text-sm rounded-lg border-2 bg-green-600 text-white border-green-500 hover:bg-green-700 hover:shadow-md transition-all duration-200 flex items-center gap-2 shadow-sm"
                  >
                    <FaHeadphones className="text-base" /> Browse Playlists
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
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{
                    color: '#111827',
                    fontSize: 'clamp(22px, 3vw, 28px)',
                    fontWeight: '800',
                    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
                    letterSpacing: '-0.025em',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0'
                  }}>
                    <FaHeart className="text-green-600 mr-4" style={{ marginRight: '12px', fontSize: '1.2em' }} /> 
                    Your Selected Songs
                  </h3>
                  
                  {/* Group Dropdown */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="group-select" className="text-sm font-medium text-gray-700">Group by:</label>
                    <select
                      id="group-select"
                      value={groupBy}
                      onChange={(e) => setGroupBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="none">No Grouping</option>
                      <option value="genre">Group by Genre</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Grouped Songs List */}
              <div className="space-y-4">
                {Object.entries(groupedSelectedSongs).map(([groupName, songs]) => {
                  const isCollapsed = collapsedGroups.has(groupName);
                  const showGroupHeader = groupBy !== 'none';
                  // Get the first song to determine genre style for the group
                  const firstSong = songs[0];
                  const genreStyle = getGenreStyle(groupName, groupBy, firstSong);
                  const IconComponent = genreStyle.icon;
                  
                  return (
                    <div key={groupName} className="space-y-2">
                      {/* Group Header */}
                      {showGroupHeader && (
                        <div className="sticky top-0 z-10">
                    <button 
                            onClick={() => toggleGroup(groupName)}
                            className="w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border-2"
                            style={{
                              background: `linear-gradient(135deg, ${genreStyle.color}15, ${genreStyle.color}05)`,
                              borderColor: genreStyle.color,
                              borderLeftWidth: '6px'
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-md"
                                style={{ backgroundColor: genreStyle.color }}
                              >
                                <IconComponent className="text-lg" />
                              </div>
                              <div className="text-left">
                                <h4 className="font-bold text-gray-900 text-lg tracking-tight">{groupName}</h4>
                                <p className="text-sm text-gray-700 font-medium">
                                  {songs.length} song{songs.length !== 1 ? 's' : ''} selected
                                </p>
                              </div>
                            </div>
                            <div 
                              className="text-xl transition-transform duration-200"
                              style={{ 
                                color: genreStyle.color,
                                transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)'
                              }}
                            >
                              <FaChevronRight />
                            </div>
                    </button>
                  </div>
                      )}
                      
                      {/* Songs in Group */}
                      {(!showGroupHeader || !isCollapsed) && (
                        <div className="space-y-2 ml-0">
                          {songs.map((song, index) => {
                            // Get individual song's genre style with improved detection
                            let songGenreKey = song.genreKey;
                            
                            // If no genreKey, try to map from genre name
                            if (!songGenreKey && song.genre) {
                              songGenreKey = mapGenreToKey(song.genre);
                            }
                            
                            // If still no genreKey, try to infer from playlist/album name
                            if (!songGenreKey) {
                              const albumName = song.album?.toLowerCase() || '';
                              const songTitle = song.title?.toLowerCase() || '';
                              
                              if (albumName.includes('club anthems')) {
                                // 80s Club Anthems should be R&B genre (purple)
                                songGenreKey = 'rnb';
                              } else if (albumName.includes('80s') || albumName.includes('eighties')) {
                                songGenreKey = 'classic-80s';
                              } else if (albumName.includes('club') || albumName.includes('dance')) {
                                songGenreKey = 'pop';
                              } else if (albumName.includes('hip hop') || albumName.includes('rap')) {
                                songGenreKey = 'rap-hiphop';
                              } else if (albumName.includes('r&b') || albumName.includes('rnb')) {
                                songGenreKey = 'rnb';
                              } else if (albumName.includes('rock')) {
                                songGenreKey = 'rock';
                              } else if (albumName.includes('reggae')) {
                                songGenreKey = 'reggae';
                              } else if (albumName.includes('latin')) {
                                songGenreKey = 'latin';
                              } else {
                                // Default fallback
                                songGenreKey = 'pop';
                              }
                            }
                            
                            const songGenreData = songGenreKey && GENRES[songGenreKey] ? GENRES[songGenreKey] : null;
                            const songGenreStyle = songGenreData ? {
                              color: songGenreData.color,
                              icon: songGenreData.icon || FaMusic
                            } : {
                              // Default to classic-80s for Club Anthems songs
                              color: GENRES['classic-80s']?.color || '#F7DC6F',
                              icon: FaMusic
                            };
                            const SongIconComponent = songGenreStyle.icon;
                            
                            return (
                            <div 
                              key={`${song.id}-playlist-${groupName}`}
                              className="flex items-center gap-3 p-3 rounded-lg border-2 bg-white hover:bg-gray-50 hover:shadow-sm transition-all duration-200"
                              style={{
                                borderColor: songGenreStyle.color + '40',
                                borderLeftWidth: '4px'
                              }}
                            >
                              {/* Track Number */}
                              <div className="w-8 text-center flex-shrink-0">
                                <div 
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                  style={{ backgroundColor: songGenreStyle.color }}
                                >
                                  {index + 1}
                                </div>
                  </div>
                  
                              {/* Album Art */}
                              <div 
                                className="w-10 h-10 rounded-md flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: songGenreStyle.color }}
                              >
                                <SongIconComponent className="text-sm" />
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
                                  {songGenreData && (
                                    <span 
                                      className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                                      style={{ 
                                        backgroundColor: songGenreStyle.color + '20',
                                        color: songGenreStyle.color
                                      }}
                                    >
                                      {songGenreData.displayName}
                                    </span>
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
                            );
                          })}
                  </div>
                      )}
                  </div>
                  );
                })}
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
        
              {/* Group Summary */}
              {groupBy !== 'none' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{Object.keys(groupedSelectedSongs).length} group{Object.keys(groupedSelectedSongs).length !== 1 ? 's' : ''}</span>
                    <span>{selectedSongs.length} total song{selectedSongs.length !== 1 ? 's' : ''}</span>
                  </div>
                  </div>
                              )}
            </div>
          </div>
        </div>
        
        {/* Back to Top Button */}
        <BackToTopButton />
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
                <div className="text-center mb-10 relative pt-20 md:pt-24">
                  {/* Simple Navigation Buttons */}
                  <button 
                    onClick={handleBackToCategory}
                    className="absolute left-0 top-20 md:top-24 flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-xs shadow-sm"
                  >
                    <FaArrowLeft className="text-xs" />
                    <span className="hidden sm:inline">Back to Library</span>
                    <span className="sm:hidden">Back</span>
                  </button>

                  <div className="absolute right-0 top-20 md:top-24 flex gap-2">
                    <button 
                      onClick={handleBackToContract}
                      className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg border border-blue-400 font-medium text-xs"
                      title="Save your selected songs and return to the contract form"
                    >
                      <FaArrowLeft className="text-xs" />
                      <span className="hidden sm:inline">Contract</span>
                      <span className="sm:hidden">Save</span>
                    </button>
                    
                    {user && (
                      <button 
                        onClick={() => router.push('/dj/dashboard')}
                        className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg border border-indigo-400 font-medium text-xs"
                        title="Return to DJ Dashboard"
                      >
                        <FaHome className="text-xs" />
                        <span className="hidden sm:inline">Dashboard</span>
                        <span className="sm:hidden">DJ</span>
                      </button>
                    )}
                  </div>
                
                {/* Centered Header Content */}
                <div className="mb-6">
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
                    Music Library
                  </h1>
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" style={{ width: 'fit-content', minWidth: '120px' }}></div>
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
                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-500 shadow-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                      title="Clear search"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  )}
                      </div>
                      </div>
                      
              {/* Quick Navigation */}
              <div className="mb-8">
                <div className="flex gap-4 justify-center">
                        <button 
                    onClick={() => {
                      setSelectedCategory(null);
                      setCategoryType(null);
                      setActiveTab('genres');
                      setCurrentPage(1);
                    }}
                    className="px-6 py-3 font-semibold text-sm rounded-lg border-2 bg-purple-500 text-white border-purple-400 hover:bg-purple-600 hover:shadow-lg transition-all duration-200 flex items-center gap-2 shadow-md"
                  >
                    <FaGuitar className="text-base" /> Browse Genres
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setCategoryType(null);
                      setActiveTab('playlists');
                      setCurrentPage(1);
                    }}
                    className="px-6 py-3 font-semibold text-sm rounded-lg border-2 bg-green-500 text-white border-green-400 hover:bg-green-600 hover:shadow-lg transition-all duration-200 flex items-center gap-2 shadow-md"
                  >
                    <FaHeadphones className="text-base" /> Browse Playlists
                  </button>
                </div>
              </div>

                          {/* Selected Songs Summary */}
            {selectedSongs.length > 0 && (
              <div className="mb-6 md:mb-8">
                <div 
                  className="rounded-lg p-3 md:p-5 border-l-4 border-green-500 border-2 border-green-200 shadow-md" 
                  style={{ background: 'linear-gradient(135deg, #10b98125, #10b98110)' }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-green-500 flex items-center justify-center text-white shadow-md">
                        <FaList className="text-sm md:text-base" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base md:text-lg">Your Playlist</h3>
                        <p className="text-gray-700 font-medium text-sm md:text-base">{selectedSongs.length} songs selected</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                      <button
                        onClick={handleViewPlaylist}
                        className="px-3 py-2 md:px-5 md:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md border-2 border-green-500 text-sm md:text-base"
                      >
                        View Playlist
                        </button>
                        <button
                          onClick={() => setSelectedSongs([])}
                        className="px-3 py-2 md:px-5 md:py-3 bg-white border-2 border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium shadow-sm text-sm md:text-base"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={handleBackToContract}
                        className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg border border-blue-400 font-medium text-sm md:text-base"
                        title="Save your selected songs and return to the contract form"
                        >
                        <span>Save & Return to Contract</span>
                        </button>
                        
                        {user && (
                          <button
                            onClick={() => router.push('/dj/dashboard')}
                          className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg border border-indigo-400 font-medium text-sm md:text-base"
                          title="Return to DJ Dashboard"
                          >
                          <span>DJ Dashboard</span>
                          </button>
                        )}
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
                  className="rounded-none md:rounded-lg p-4 border-l-4" 
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
        
        {/* Back to Top Button */}
        <BackToTopButton />
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
          margin: '1rem auto 3rem auto',
          padding: '0'
        }} className="px-2 md:px-4 mt-4 md:mt-8">
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            padding: '1rem',
            borderRadius: '0',
            width: '100%',
            marginBottom: '50px',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }} className="md:rounded-[20px] md:p-10">
            


            {/* Header */}
            <div className="text-center mb-10 music-library-header pt-20 md:pt-24">
              <div className="mb-6">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
                  Browse And Select Songs For Your Event
                </h1>
                <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" style={{ width: 'fit-content', minWidth: '120px' }}></div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-8 music-library-search">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search songs, artists, albums..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-300 rounded-none md:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-500 shadow-sm bg-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                    title="Clear search"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                )}
              </div>
          </div>

            {/* Navigation Buttons */}
            <div className="mb-8 music-library-nav-container">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleTabChange('genres')}
                  className={`music-library-nav-button px-8 py-4 font-bold text-base rounded-none md:rounded-xl border-2 transition-all duration-200 flex items-center gap-3 shadow-md ${
                    activeTab === 'genres'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-lg'
                      : 'bg-white text-gray-900 border-purple-400 hover:bg-purple-50 hover:border-purple-600 hover:shadow-lg'
                  }`}
                >
                  <FaGuitar className="text-lg icon" /> Music Genres
                </button>
                <button
                  onClick={() => handleTabChange('playlists')}
                  className={`music-library-nav-button px-8 py-4 font-bold text-base rounded-none md:rounded-xl border-2 transition-all duration-200 flex items-center gap-3 shadow-md ${
                    activeTab === 'playlists'
                      ? 'bg-green-600 text-white border-green-600 shadow-lg'
                      : 'bg-white text-gray-900 border-green-400 hover:bg-green-50 hover:border-green-600 hover:shadow-lg'
                  }`}
                >
                  <FaHeadphones className="text-lg icon" /> Curated Playlists
                </button>
            </div>
        </div>

          {/* Selected Songs Summary */}
          {selectedSongs.length > 0 && (
              <div className="mb-6 md:mb-8">
                <div 
                  className="rounded-none md:rounded-lg p-3 md:p-5 border-l-4 border-green-500 border-2 border-green-200 shadow-md" 
                  style={{ background: 'linear-gradient(135deg, #10b98125, #10b98110)' }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-green-500 flex items-center justify-center text-white shadow-md">
                        <FaList className="text-sm md:text-base" />
                      </div>
                <div>
                        <h3 className="font-bold text-gray-900 text-base md:text-lg">Your Playlist</h3>
                        <p className="text-gray-700 font-medium text-sm md:text-base">{selectedSongs.length} songs selected</p>
                </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                      <button
                        onClick={handleViewPlaylist}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md border-2 border-green-500 text-xs"
                      >
                        <span className="hidden sm:inline">View Your Playlist</span>
                        <span className="sm:hidden">View Playlist</span>
                      </button>
                      <button
                        onClick={handleBackToContract}
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg border border-blue-400 font-medium text-xs"
                        title="Save your selected songs and return to the contract form"
                      >
                        <FaArrowLeft className="text-xs" />
                        <span className="hidden sm:inline">Back to Contract</span>
                        <span className="sm:hidden">Back to Contract</span>
                      </button>
                      {user && (
                        <button
                          onClick={() => router.push('/dj/dashboard')}
                          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg border border-indigo-400 font-medium text-xs"
                          title="Return to DJ Dashboard"
                        >
                          <FaHome className="text-xs" />
                          <span className="hidden sm:inline">DJ Dashboard</span>
                          <span className="sm:hidden">Dashboard</span>
                        </button>
                      )}
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
                // Show all genres, even if no songs are loaded yet (they'll load when clicked)
                    
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
                const playlistSongs = filteredSongs.filter(song => song.playlistKey === playlistKey);
                // Show all playlists, even if no songs are loaded yet (they'll load when clicked)
                    
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
      
      {/* Back to Top Button */}
      <BackToTopButton />
    </div>
  );
} 