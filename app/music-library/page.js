'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { playlistIcons } from '../components/PlaylistCover';

// Debug: Check if playlistIcons are loaded correctly
console.log('PlaylistIcons loaded:', Object.keys(playlistIcons));

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

// Professional SVG icon components matching the design example
const IconComponents = {
  music_note: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  ),
  disco_ball: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
      <circle cx="12" cy="12" r="9"/>
      <rect x="7" y="7" width="2" height="2" fill="gold"/>
      <rect x="15" y="7" width="2" height="2" fill="gold"/>
      <rect x="7" y="15" width="2" height="2" fill="gold"/>
      <rect x="15" y="15" width="2" height="2" fill="gold"/>
      <rect x="11" y="5" width="2" height="2" fill="gold"/>
      <rect x="11" y="17" width="2" height="2" fill="gold"/>
      <rect x="5" y="11" width="2" height="2" fill="gold"/>
      <rect x="17" y="11" width="2" height="2" fill="gold"/>
    </svg>
  ),
  star: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="gold" stroke="white" strokeWidth="1">
      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/>
    </svg>
  ),
  heart: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="red" stroke="white" strokeWidth="1">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  fire: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="orange">
      <path d="M12 2C8 6 6 10 6 14c0 3.31 2.69 6 6 6s6-2.69 6-6c0-4-2-8-6-12z"/>
      <path d="M12 6C10 8 9 10 9 12c0 1.66 1.34 3 3 3s3-1.34 3-3c0-2-1-4-3-6z" fill="red"/>
      <path d="M12 10c-1 1-1.5 1.5-1.5 2.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5c0-1-.5-1.5-1.5-2.5z" fill="yellow"/>
    </svg>
  ),
  headphones: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C8 2 5 5 5 9v6c0 1 1 2 2 2h2V9c0-2 1-3 3-3s3 1 3 3v8h2c1 0 2-1 2-2V9c0-4-3-7-7-7z"/>
      <rect x="5" y="13" width="3" height="4" rx="1" fill="white"/>
      <rect x="16" y="13" width="3" height="4" rx="1" fill="white"/>
      <circle cx="6.5" cy="15" r="0.5" fill="black"/>
      <circle cx="17.5" cy="15" r="0.5" fill="black"/>
    </svg>
  ),
  party: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="purple">
      <circle cx="12" cy="12" r="8"/>
      <circle cx="8" cy="8" r="1" fill="red"/>
      <circle cx="16" cy="8" r="1" fill="blue"/>
      <circle cx="8" cy="16" r="1" fill="green"/>
      <circle cx="16" cy="16" r="1" fill="yellow"/>
      <circle cx="12" cy="6" r="1" fill="orange"/>
      <circle cx="12" cy="18" r="1" fill="pink"/>
      <circle cx="6" cy="12" r="1" fill="cyan"/>
      <circle cx="18" cy="12" r="1" fill="magenta"/>
    </svg>
  ),
  microphone: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="silver">
      <circle cx="12" cy="8" r="4"/>
      <rect x="11" y="12" width="2" height="6"/>
      <rect x="9" y="18" width="6" height="2"/>
      <circle cx="12" cy="8" r="2" fill="black"/>
      <circle cx="10" cy="7" r="0.5" fill="black"/>
      <circle cx="14" cy="7" r="0.5" fill="black"/>
      <circle cx="10" cy="9" r="0.5" fill="black"/>
      <circle cx="14" cy="9" r="0.5" fill="black"/>
    </svg>
  ),
  vinyl: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="black">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="8" fill="#333"/>
      <circle cx="12" cy="12" r="6" fill="black"/>
      <circle cx="12" cy="12" r="4" fill="#333"/>
      <circle cx="12" cy="12" r="2" fill="black"/>
      <circle cx="12" cy="12" r="1" fill="red"/>
    </svg>
  ),
  guitar: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="brown">
      <ellipse cx="12" cy="16" rx="6" ry="4"/>
      <circle cx="12" cy="16" r="2" fill="black"/>
      <rect x="11.5" y="4" width="1" height="12" fill="tan"/>
      <rect x="9" y="4" width="6" height="1.5" fill="tan"/>
      <rect x="10" y="7" width="4" height="0.3" fill="silver"/>
      <rect x="10" y="9" width="4" height="0.3" fill="silver"/>
      <rect x="10" y="11" width="4" height="0.3" fill="silver"/>
      <rect x="10" y="13" width="4" height="0.3" fill="silver"/>
    </svg>
  ),
  cowboy: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="brown">
      <ellipse cx="12" cy="18" rx="9" ry="3"/>
      <circle cx="12" cy="10" r="4"/>
      <ellipse cx="12" cy="6" rx="7" ry="2"/>
      <rect x="8" y="5" width="8" height="1" fill="tan"/>
    </svg>
  )
};

// Professional tile-style cover art function matching the image design
const getCoverArt = (title, color) => {
  const baseStyle = "w-full aspect-square rounded-xl flex flex-col items-center justify-center text-white relative overflow-hidden shadow-lg";
  
  // Get the appropriate professional icon
  let iconKey = 'music_note'; // default
  
  const titleLower = title.toLowerCase();
  
  // Debug logging
  console.log(`Getting icon for: "${title}" (${titleLower})`);
  
  // Exact matches first for specific playlists visible in the screenshot
  if (titleLower === '100 classic summer hits') {
    iconKey = 'sun';
  } else if (titleLower === '4th of july') {
    iconKey = 'fireworks';
  } else if (titleLower === "90's hip hop & r&b") {
    iconKey = 'boombox';
  } else if (titleLower === '80s club anthems') {
    iconKey = 'disco_ball';
  } else if (titleLower === 'christmas music') {
    iconKey = 'christmas_tree';
  } else if (titleLower === 'classic 60s music') {
    iconKey = 'vintage_microphone';
  } else if (titleLower === 'classic rock') {
    iconKey = 'acoustic_guitar';
  } else if (titleLower === 'classic hip-hop set') {
    iconKey = 'turntable';
  } else if (titleLower === 'country') {
    iconKey = 'banjo_country';
  } else if (titleLower === 'dance hits 70s & 80s' || titleLower === 'dance music') {
    iconKey = 'dj_headphones';
  } else if (titleLower === 'disco hits') {
    iconKey = 'disco_sparkle';
  } else if (titleLower === 'disco') {
    iconKey = 'disco_ball';
  } else if (titleLower === 'discotech remixes') {
    iconKey = 'party';
  } else if (titleLower === 'feel good music') {
    iconKey = 'music_note';
  } else if (titleLower === 'freestyle') {
    iconKey = 'music_note';
  } else if (titleLower === 'funk') {
    iconKey = 'music_note';
  } else if (titleLower === 'greatest 80s hits') {
    iconKey = 'star';
  } else if (titleLower === 'halloween music') {
    iconKey = 'fire';
  } else if (titleLower === 'classic 50s music') {
    iconKey = 'vintage_microphone';
  } else if (titleLower === 'classic 70s music') {
    iconKey = 'vinyl';
  } else if (titleLower === 'classic soul') {
    iconKey = 'vinyl';
  // Pattern matches for broader categories
  } else if (titleLower.includes('summer') || titleLower.includes('sun')) {
    iconKey = 'sun';
  } else if (titleLower.includes('4th of july') || titleLower.includes('july') || titleLower.includes('patriotic') || titleLower.includes('independence')) {
    iconKey = 'fireworks';
  } else if (titleLower.includes('hip hop') || titleLower.includes('hip-hop') || titleLower.includes('rap') || titleLower.includes('urban') || titleLower.includes('r&b') || titleLower.includes('90s') || titleLower.includes('90\'s')) {
    iconKey = 'boombox';
  } else if (titleLower.includes('christmas') || titleLower.includes('holiday') || titleLower.includes('xmas')) {
    iconKey = 'christmas_tree';
  } else if (titleLower.includes('60s') || titleLower.includes('60\'s') || titleLower.includes('classic') && (titleLower.includes('60') || titleLower.includes('vintage'))) {
    iconKey = 'vintage_microphone';
  } else if (titleLower.includes('rock') || titleLower.includes('guitar')) {
    iconKey = 'acoustic_guitar';
  } else if (titleLower.includes('classic') && (titleLower.includes('hip') || titleLower.includes('hop') || titleLower.includes('rap'))) {
    iconKey = 'turntable';
  } else if (titleLower.includes('soul') || titleLower.includes('classic') && !titleLower.includes('rock') && !titleLower.includes('country')) {
    iconKey = 'vinyl';
  } else if (titleLower.includes('country') || titleLower.includes('folk') || titleLower.includes('bluegrass')) {
    iconKey = 'banjo_country';
  } else if (titleLower.includes('dance') || titleLower.includes('electronic') || titleLower.includes('edm')) {
    iconKey = 'dj_headphones';
  } else if (titleLower.includes('disco') && titleLower.includes('hits')) {
    iconKey = 'disco_sparkle';
  } else if (titleLower.includes('disco') || titleLower.includes('club') || titleLower.includes('anthems')) {
    iconKey = 'disco_ball';
  } else if (titleLower.includes('love') || titleLower.includes('romantic') || titleLower.includes('valentine')) {
    iconKey = 'heart';
  } else if (titleLower.includes('fire') || titleLower.includes('hot') || titleLower.includes('latin') || titleLower.includes('salsa') || titleLower.includes('halloween')) {
    iconKey = 'fire';
  } else if (titleLower.includes('top') || titleLower.includes('hits') || titleLower.includes('best') || titleLower.includes('greatest')) {
    iconKey = 'star';
  } else if (titleLower.includes('classic') || titleLower.includes('50s') || titleLower.includes('70s') || titleLower.includes('80s') || titleLower.includes('oldies')) {
    iconKey = 'vinyl';
  } else if (titleLower.includes('party') || titleLower.includes('remix')) {
    iconKey = 'party';
  } else if (titleLower.includes('headphones') || titleLower.includes('dj')) {
    iconKey = 'headphones';
  } else if (titleLower.includes('microphone') || titleLower.includes('mic')) {
    iconKey = 'microphone';
  }
  
  // Get the professional SVG icon
  const iconSvg = playlistIcons[iconKey] || playlistIcons.music_note;
  
  // Debug logging
  console.log(`Selected icon key: "${iconKey}" for "${title}"`);
  
  // Use the professional SVG icon as-is (no color processing needed for detailed icons)
  let processedSvg = iconSvg
    .replace(/width="48" height="48"/, 'width="48" height="48"');
  
  return (
    <div className={baseStyle} style={{ backgroundColor: color || '#374151' }}>
      {/* Large Icon */}
      <div 
        className="w-12 h-12 flex items-center justify-center mb-3"
        dangerouslySetInnerHTML={{ __html: processedSvg }}
      />
      
      {/* Title */}
      <div className="text-center px-2">
        <h3 className="font-bold text-sm leading-tight text-white">{title}</h3>
      </div>
      
      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-xl pointer-events-none"></div>
    </div>
  );
};

// Professional Tile Card matching the image design
const BrowseCard = React.memo(({ title, songCount, color, type, onSelect, description }) => (
  <div 
    className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
    onClick={() => onSelect(type, title)}
  >
    <div className="relative">
      {getCoverArt(title, color)}
      
      {/* Song count badge */}
      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
        <span className="text-white text-xs font-medium">{songCount}</span>
      </div>
      
      {/* Subtle hover overlay without play button */}
      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
    </div>
  </div>
));

BrowseCard.displayName = 'BrowseCard';

// Song List Item Component - Ultra-compact for maximum songs visible
const SongListItem = React.memo(({ song, index, isSelected, onToggle, sourceData }) => {
  const handleClick = useCallback(() => {
    onToggle(song);
  }, [song, onToggle]);

  return (
    <div 
      className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-green-500/25 border border-green-500/60' 
          : 'bg-gray-800/70 border border-gray-600/60 hover:bg-gray-700/80 hover:border-gray-500/70'
      }`}
      onClick={handleClick}
    >
      {/* Track Number */}
      <div className="w-6 text-xs text-gray-400 text-center flex-shrink-0">
        {isSelected ? (
          <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        ) : (
          <span>{index + 1}</span>
        )}
      </div>

      {/* Album Art */}
      <div 
        className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs flex-shrink-0"
        style={{ backgroundColor: sourceData?.color || '#4B5563' }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-xs truncate ${
          isSelected ? 'text-green-300' : 'text-gray-100'
        }`}>
          {song.title}
        </h3>
        <p className={`text-xs truncate ${
          isSelected ? 'text-green-200/80' : 'text-gray-200'
        }`}>
          {song.artist}
          {song.album && song.album !== 'Unknown Album' && (
            <span className="text-gray-400 ml-1">• {song.album}</span>
          )}
        </p>
      </div>

      {/* Duration */}
      <div className="text-xs text-gray-400 flex-shrink-0">
        3:45
      </div>
    </div>
  );
});

SongListItem.displayName = 'SongListItem';

// List Container for Songs - Ultra-compact
const SongList = React.memo(({ children, title, count }) => (
  <div className="space-y-0.5">
    {title && (
      <div className="flex items-center justify-between mb-1 px-1">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        {count && <span className="text-gray-400 text-xs">{count} songs</span>}
      </div>
    )}
    <div className="space-y-0.5">
      {children}
    </div>
  </div>
));

SongList.displayName = 'SongList';

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
    <div className="flex items-center justify-between px-2 py-2 bg-gray-800/30 rounded-md border-t border-gray-600/50 mt-2">
      <div className="text-xs text-gray-400">
        Showing {startIndex}-{endIndex} of {totalSongs} songs
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        <div className="flex items-center gap-1 mx-2">
          {/* Show page numbers with ellipsis for large page counts */}
          {totalPages <= 7 ? (
            // Show all pages if 7 or fewer
            Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  currentPage === page
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                    className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="text-gray-500 text-xs">...</span>}
                </>
              )}
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      currentPage === page
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="text-gray-500 text-xs">...</span>}
                  <button
                    onClick={() => onPageChange(totalPages)}
                    className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
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
          className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
});

PaginationControls.displayName = 'PaginationControls';

// Fixed Pagination Footer Component
const FixedPaginationFooter = React.memo(({ 
  currentPage, 
  totalPages, 
  startIndex, 
  endIndex, 
  totalSongs, 
  onPageChange,
  show = true
}) => {
  if (!show || totalPages <= 1) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50">
      <div className="flex items-center justify-between px-2 py-2">
        <div className="text-xs text-gray-400">
          Showing {startIndex}-{endIndex} of {totalSongs} songs
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1 mx-2">
            {/* Show page numbers with ellipsis for large page counts */}
            {totalPages <= 7 ? (
              // Show all pages if 7 or fewer
              Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    currentPage === page
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                      className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                    >
                      1
                    </button>
                    {currentPage > 4 && <span className="text-gray-500 text-xs">...</span>}
                  </>
                )}
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        currentPage === page
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="text-gray-500 text-xs">...</span>}
                    <button
                      onClick={() => onPageChange(totalPages)}
                      className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
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
            className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
});

FixedPaginationFooter.displayName = 'FixedPaginationFooter';

// Optimized Song Card Component with React.memo - More compact
const SongCard = React.memo(({ song, isSelected, onToggle, sourceData }) => {
  const handleClick = useCallback(() => {
    onToggle(song);
  }, [song, onToggle]);

  return (
    <div 
      className={`flex-shrink-0 w-40 rounded-lg p-2 transition-all duration-200 cursor-pointer group border ${
        isSelected 
          ? 'bg-green-500/25 border-green-500/60 shadow-lg shadow-green-500/15' 
          : 'bg-gray-800/70 border-gray-600/60 hover:bg-gray-700/80 hover:border-gray-500/70'
      }`}
      onClick={handleClick}
    >
      {/* Album Art Placeholder */}
      <div className="relative mb-2">
        <div 
          className="w-full h-32 rounded-lg flex items-center justify-center text-white text-2xl shadow-md"
          style={{ backgroundColor: sourceData?.color || '#4B5563' }}
        >
          <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Song Info */}
      <div>
        <h3 className={`font-semibold text-xs mb-0.5 truncate transition-colors ${
          isSelected ? 'text-green-300' : 'text-gray-100 group-hover:text-white'
        }`}>
          {song.title}
        </h3>
        <p className={`text-xs truncate transition-colors ${
          isSelected ? 'text-green-200/80' : 'text-gray-200 group-hover:text-gray-100'
        }`}>
          {song.artist}
        </p>
        {song.album && song.album !== 'Unknown Album' && (
          <p className={`text-xs truncate mt-0.5 transition-colors ${
            isSelected ? 'text-green-200/60' : 'text-gray-300 group-hover:text-gray-200'
          }`}>
            {song.album}
          </p>
        )}
      </div>
    </div>
  );
});

SongCard.displayName = 'SongCard';

// Ultra-compact Section Header
const SectionHeader = React.memo(({ title, count, onViewAll, color, showViewAll = true, showBack = false, onBack }) => (
  <div className="flex items-center justify-between mb-1">
    <div className="flex items-center gap-2">
      {showBack && (
        <button 
          onClick={onBack}
          className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
        >
          <span dangerouslySetInnerHTML={{ __html: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>` }} />
        </button>
      )}
      <div>
        <h2 className="text-white text-lg font-bold">{title}</h2>
        {count && <span className="text-gray-400 text-xs">{count} songs available</span>}
      </div>
    </div>
    {showViewAll && (
      <button 
        onClick={onViewAll}
        className="text-gray-400 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
      >
        View All <span dangerouslySetInnerHTML={{ __html: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4 11h12.17l-5.59-5.59L12 4l8 8-8 8-1.41-1.41L16.17 13H4v-2z"/></svg>` }} />
      </button>
    )}
  </div>
));

SectionHeader.displayName = 'SectionHeader';

// Optimized Horizontal Scroll with pagination - More compact
const HorizontalScroll = React.memo(({ children, maxItems = 10 }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(maxItems);
  
  const totalPages = Math.ceil(React.Children.count(children) / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleChildren = React.Children.toArray(children).slice(startIndex, endIndex);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  }, []);

  if (React.Children.count(children) === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex gap-2 overflow-hidden">
        {visibleChildren}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="flex items-center gap-1 px-2 py-1 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors text-xs"
          >
            <span dangerouslySetInnerHTML={{ __html: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>` }} />
            <span className="hidden sm:inline">Prev</span>
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                  currentPage === i 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-1 px-2 py-1 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors text-xs"
          >
            <span className="hidden sm:inline">Next</span>
            <span dangerouslySetInnerHTML={{ __html: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M4 11h12.17l-5.59-5.59L12 4l8 8-8 8-1.41-1.41L16.17 13H4v-2z"/></svg>` }} />
          </button>
        </div>
      )}
    </div>
  );
});

HorizontalScroll.displayName = 'HorizontalScroll';

// Professional Grid Layout for Tile Cards
const BrowseGrid = React.memo(({ children }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
    {children}
  </div>
));

BrowseGrid.displayName = 'BrowseGrid';

// Ultra-compact Bottom Navigation Component
const BottomNavigation = React.memo(({ activeTab, onTabChange, onBackToContract, onShowLibrary }) => (
  <div className="fixed bottom-0 left-0 right-0 z-50 bg-black">
    <div className="flex items-center justify-around py-1 px-2 max-w-md mx-auto">
      <button
        onClick={onBackToContract}
        className="flex flex-col items-center gap-0.5 p-1 text-gray-400 hover:text-white transition-colors"
      >
                      <span dangerouslySetInnerHTML={{ __html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>` }} />
              <span className="text-xs">Home</span>
      </button>
      
      <button
        onClick={() => onTabChange('genres')}
        className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
          activeTab === 'genres' ? 'text-white' : 'text-gray-400 hover:text-white'
        }`}
      >
        <span dangerouslySetInnerHTML={{ __html: playlistIcons.music_note }} />
        <span className="text-xs">Genres</span>
      </button>
      
      <button
        onClick={onShowLibrary}
        className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
          activeTab === 'library' ? 'text-white' : 'text-gray-400 hover:text-white'
        }`}
      >
        <span dangerouslySetInnerHTML={{ __html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>` }} />
        <span className="text-xs">Library</span>
      </button>
      
      <button
        onClick={() => onTabChange('playlists')}
        className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
          activeTab === 'playlists' ? 'text-white' : 'text-gray-400 hover:text-white'
        }`}
      >
        <span dangerouslySetInnerHTML={{ __html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>` }} />
        <span className="text-xs">Playlists</span>
      </button>
    </div>
  </div>
));

BottomNavigation.displayName = 'BottomNavigation';

// Ultra-minimal Fixed Header Component
const FixedHeader = React.memo(({ title, subtitle, onBack, searchTerm, onSearchChange, searchPlaceholder = "Search songs, artists, albums...", activeTab, onTabChange, showTabs = false }) => (
  <div className="fixed top-0 left-0 right-0 z-50 bg-black">
    <div className="w-full px-2 flex items-center justify-center min-h-[48px]">
      {/* Mobile back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800 md:hidden mr-2 flex-shrink-0"
      >
        <span dangerouslySetInnerHTML={{ __html: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>` }} />
      </button>
      
      {/* Navigation Tabs - Desktop only, positioned to the left */}
      {showTabs && (
        <div className="hidden md:flex items-center mr-2 flex-shrink-0">
          <div className="flex gap-0.5">
            {['genres', 'playlists'].map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-white text-black'
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ultra-compact Search Bar */}
      <div className="relative flex-1 max-w-lg">
        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" dangerouslySetInnerHTML={{ __html: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>` }} />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-3 py-1 bg-gray-900 border border-gray-600 rounded-full text-white text-xs placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all"
        />
      </div>
    </div>
  </div>
));

FixedHeader.displayName = 'FixedHeader';

// Ultra-compact Scrollable Content Container
const ScrollableContent = React.memo(({ children, className = "", withTabs = false, withPagination = false }) => (
  <div className={`flex-1 pt-12 pb-20 overflow-y-auto ${className}`} style={{ minHeight: 0, height: 'calc(100vh - 128px)' }}>
    <div className="pb-4">
      {children}
    </div>
  </div>
));

ScrollableContent.displayName = 'ScrollableContent';

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
  const [activeTab, setActiveTab] = useState('playlists');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryType, setCategoryType] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const songsPerPage = 30; // Reduced from 50 for faster rendering

  // Load real songs in background
  useEffect(() => {
    loadRealSongsInBackground();
  }, []);

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

  // Pagination info
  const totalPages = Math.ceil(categorySongs.length / songsPerPage);
  const startIndex = (currentPage - 1) * songsPerPage + 1;
  const endIndex = Math.min(currentPage * songsPerPage, categorySongs.length);

  // Optimized grouping with limits
  const groupedSongs = useMemo(() => {
    const groups = {};
    
    filteredSongs.forEach(song => {
      const key = song.genreKey || 'unknown';
      const displayName = song.genreDisplay || 'Unknown Genre';
      const sourceData = GENRES[key] || PLAYLISTS[key];
      
      if (!groups[key]) {
        groups[key] = {
          name: displayName,
          songs: [],
          color: sourceData?.color || '#6B7280'
        };
      }
      groups[key].songs.push(song);
    });
    
    // Sort by song count and limit to top groups
    return Object.entries(groups)
      .sort(([,a], [,b]) => b.songs.length - a.songs.length)
      .slice(0, 20); // Limit to top 20 groups for performance
  }, [filteredSongs]);

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
    router.push('/');
  }, [router]);

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
  }, []);

  const handleShowLibrary = useCallback(() => {
    setShowLibrary(true);
    setActiveTab('library');
    setSelectedCategory(null);
    setCategoryType(null);
  }, []);

  const handleBackToMusicLibrary = useCallback(() => {
    setShowLibrary(false);
    setActiveTab('discover');
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your music library...</p>
        </div>
      </div>
    );
  }

  // If a category is selected, show songs from that category
  if (selectedCategory && categoryType) {
    const categoryData = categoryType === 'playlist' ? PLAYLISTS[selectedCategory] : GENRES[selectedCategory];
    
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
        {/* Fixed Header */}
        <FixedHeader
          title=""
          subtitle=""
          onBack={handleBackToContract}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search in this category..."
        />

        {/* Scrollable Content */}
        <ScrollableContent>
          <div className="px-1 h-full flex flex-col max-w-none w-full">
            {/* Selected Songs Summary */}
            {selectedSongs.length > 0 && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">Your Playlist</h3>
                      <p className="text-green-100">{selectedSongs.length} songs selected</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedSongs([])}
                        className="px-4 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={handleBackToContract}
                        className="px-6 py-2 bg-white text-green-600 rounded-full font-medium hover:bg-gray-100 transition-colors"
                      >
                        Use These Songs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

                        {/* Category Header with Compact Display */}
            <div className="flex-1 flex flex-col" style={{ minHeight: 'calc(100vh - 200px)' }}>
              <div className="flex items-start gap-3 mb-2 flex-shrink-0">
                {/* Compact Category Art */}
                <div className="flex-shrink-0">
                          <div 
          className="w-16 h-16 md:w-20 md:h-20 rounded-md flex items-center justify-center text-white text-lg md:text-xl shadow-lg"
          style={{ backgroundColor: categoryData?.color || '#374151' }}
        >
          <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
                </div>
                
                {/* Category Info */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <button 
                      onClick={handleBackToCategory}
                      className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors hidden md:block"
                    >
                      <span dangerouslySetInnerHTML={{ __html: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>` }} />
                    </button>
                    <span className="text-gray-400 text-xs uppercase tracking-wide">
                      {categoryType === 'playlist' ? 'Playlist' : 'Genre'}
                    </span>
                  </div>
                  <h1 className="text-lg md:text-xl font-bold text-white mb-1">
                    {categoryData?.displayName || selectedCategory}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <span>DJ Bobby Drake</span>
                    <span>•</span>
                    <span>{categorySongs.length} songs</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-2">
                    <button className="p-1 hover:bg-gray-800 rounded-full transition-colors">
                      <span className="text-gray-400 hover:text-green-500" dangerouslySetInnerHTML={{ __html: playlistIcons.heart }} />
                    </button>
                    <button className="p-1 hover:bg-gray-800 rounded-full transition-colors">
                      <span className="text-gray-400" dangerouslySetInnerHTML={{ __html: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>` }} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Songs List */}
              <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg border border-gray-700/50 p-2 shadow-lg flex-1 flex flex-col" style={{ minHeight: 'calc(100vh - 380px)' }}>
                {/* List Header - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-2 px-2 py-1 border-b border-gray-600/50 mb-1 bg-gray-800/30 rounded-md">
                  <div className="w-6 text-center">
                    <span className="text-gray-300 text-xs font-medium">#</span>
                  </div>
                  <div className="w-8"></div> {/* Album art space */}
                  <div className="flex-1">
                    <span className="text-gray-300 text-xs font-medium uppercase tracking-wider">Title</span>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-gray-300 text-xs font-medium uppercase tracking-wider">Duration</span>
                  </div>
                </div>
                
                {/* Songs */}
                <div className="space-y-0.5 overflow-y-auto pr-1 flex-1">
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
                  <div className="text-center py-6">
                    <svg className="w-8 h-8 text-gray-600 mx-auto block mb-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-300 mb-1">No songs found</h3>
                    <p className="text-gray-500 text-xs">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollableContent>
        
        {/* Fixed Pagination Footer */}
        <FixedPaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalSongs={categorySongs.length}
          onPageChange={handlePageChange}
          show={selectedCategory && categorySongs.length > 0}
        />
        
        {/* Bottom Navigation */}
        <BottomNavigation 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onBackToContract={handleBackToContract}
          onShowLibrary={handleShowLibrary}
        />
      </div>
    );
  }

  // If showing library view, display the user's playlist
  if (showLibrary) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
        {/* Fixed Header */}
        <FixedHeader
          title="Your Library"
          subtitle={`${selectedSongs.length} songs in your playlist`}
          onBack={handleBackToContract}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search your playlist..."
        />

        {/* Scrollable Content */}
        <ScrollableContent>
          <div className="px-1 h-full flex flex-col max-w-none w-full">
            {selectedSongs.length > 0 ? (
              <>
                {/* Playlist Header */}
                <div className="flex-1 flex flex-col" style={{ minHeight: 'calc(100vh - 200px)' }}>
                  <div className="flex items-start gap-3 mb-2 flex-shrink-0">
                    {/* Compact Playlist Art */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-md bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-lg md:text-xl shadow-lg">
                        <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                        </svg>
                      </div>
                    </div>
                    
                    {/* Playlist Info */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Playlist</span>
                      </div>
                      <h1 className="text-lg md:text-xl font-bold text-white mb-1">
                        Your Selected Songs
                      </h1>
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <span>DJ Bobby Drake</span>
                        <span>•</span>
                        <span>{selectedSongs.length} songs</span>
                      </div>
                      
                                                                   {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          onClick={handleBackToMusicLibrary}
                          className="px-3 py-1 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors text-xs"
                        >
                          Add More
                        </button>
                        <button
                          onClick={() => setSelectedSongs([])}
                          className="px-3 py-1 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors text-xs"
                        >
                          Clear All
                        </button>
                        <button
                          onClick={handleBackToContract}
                          className="px-3 py-1 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors text-xs"
                        >
                          Use Playlist
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Songs List */}
                  <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg border border-gray-700/50 p-2 shadow-lg flex-1 flex flex-col" style={{ minHeight: 'calc(100vh - 380px)' }}>
                    {/* List Header - Hidden on mobile */}
                    <div className="hidden md:flex items-center gap-2 px-2 py-1 border-b border-gray-600/50 mb-1 bg-gray-800/30 rounded-md">
                      <div className="w-6 text-center">
                        <span className="text-gray-300 text-xs font-medium">#</span>
                      </div>
                      <div className="w-8"></div> {/* Album art space */}
                      <div className="flex-1">
                        <span className="text-gray-300 text-xs font-medium uppercase tracking-wider">Title</span>
                      </div>
                      <div className="w-16 text-right">
                        <span className="text-gray-300 text-xs font-medium uppercase tracking-wider">Duration</span>
                      </div>
                    </div>
                    
                    {/* Songs */}
                    <div className="space-y-0.5 overflow-y-auto pr-1 flex-1">
                      {(() => {
                        const filteredLibrarySongs = selectedSongs.filter(song => 
                          !searchTerm || 
                          song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (song.album && song.album.toLowerCase().includes(searchTerm.toLowerCase()))
                        );
                        
                        const libraryStartIndex = (currentPage - 1) * songsPerPage;
                        const libraryEndIndex = libraryStartIndex + songsPerPage;
                        const paginatedLibrarySongs = filteredLibrarySongs.slice(libraryStartIndex, libraryEndIndex);
                        
                        return paginatedLibrarySongs.map((song, index) => {
                          const sourceData = GENRES[song.genreKey] || PLAYLISTS[song.genreKey];
                          return (
                            <SongListItem
                              key={`${song.id}-${song.genreKey || 'unknown'}`}
                              song={song}
                              index={libraryStartIndex + index}
                              isSelected={true}
                              onToggle={handleSongToggle}
                              sourceData={sourceData}
                            />
                          );
                        });
                      })()}
                    </div>
                    

                  </div>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Your Library is Empty</h3>
                <p className="text-gray-400 mb-4 max-w-md mx-auto text-sm">
                  Start building your playlist by browsing and selecting songs from the music library.
                </p>
                <button
                  onClick={handleBackToMusicLibrary}
                  className="px-4 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors text-sm"
                >
                  Browse Music Library
                </button>
              </div>
            )}
          </div>
        </ScrollableContent>
        
        {/* Fixed Pagination Footer for Library */}
        {(() => {
          const filteredLibrarySongs = selectedSongs.filter(song => 
            !searchTerm || 
            song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (song.album && song.album.toLowerCase().includes(searchTerm.toLowerCase()))
          );
          
          const libraryTotalPages = Math.ceil(filteredLibrarySongs.length / songsPerPage);
          const libraryStartIndex = (currentPage - 1) * songsPerPage + 1;
          const libraryEndIndex = Math.min(currentPage * songsPerPage, filteredLibrarySongs.length);
          
          return (
            <FixedPaginationFooter
              currentPage={currentPage}
              totalPages={libraryTotalPages}
              startIndex={libraryStartIndex}
              endIndex={libraryEndIndex}
              totalSongs={filteredLibrarySongs.length}
              onPageChange={handlePageChange}
              show={selectedSongs.length > 0}
            />
          );
        })()}
        
        {/* Bottom Navigation */}
        <BottomNavigation 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onBackToContract={handleBackToContract}
          onShowLibrary={handleShowLibrary}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* Fixed Header with integrated navigation tabs */}
      <FixedHeader
        title=""
        subtitle=""
        onBack={handleBackToContract}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showTabs={true}
      />

      {/* Scrollable Content */}
      <ScrollableContent withTabs={true}>
        <div className="px-1 py-0 h-full flex flex-col max-w-none w-full">

          {/* Selected Songs Summary */}
          {selectedSongs.length > 0 && (
            <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-md p-2 mb-1 hidden md:block">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-sm">Your Playlist</h3>
                  <p className="text-green-100 text-xs">{selectedSongs.length} songs selected</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSongs([])}
                    className="px-3 py-1 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors text-xs"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleBackToContract}
                    className="px-4 py-1 bg-white text-green-600 rounded-full font-medium hover:bg-gray-100 transition-colors text-xs"
                  >
                    Use These Songs
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content Sections - Desktop */}
          <div className="flex-1 hidden md:block" style={{ minHeight: 'calc(100vh - 280px)' }}>
            {activeTab === 'genres' && (
              <section className="h-full">
                <div className="px-4 py-2">
                  <h2 className="text-white text-2xl font-bold mb-1">Music Genres</h2>
                  <p className="text-gray-400 text-sm">Discover music by genre</p>
                </div>
                <div className="overflow-y-auto h-full">
                  <BrowseGrid>
                    {Object.entries(GENRES).map(([genreKey, genreData]) => {
                      const genreSongs = filteredSongs.filter(song => song.genreKey === genreKey);
                      if (genreSongs.length === 0) return null;
                      
                      return (
                        <BrowseCard
                          key={genreKey}
                          title={genreData.displayName}
                          songCount={genreSongs.length}
                          color={genreData.color}
                          type="genre"
                          onSelect={handleCategorySelect}
                          description={`Explore ${genreData.displayName} music`}
                        />
                      );
                    })}
                  </BrowseGrid>
                </div>
              </section>
            )}

            {activeTab === 'playlists' && (
              <section className="h-full">
                <div className="px-4 py-2">
                  <h2 className="text-white text-2xl font-bold mb-1">Curated Playlists</h2>
                  <p className="text-gray-400 text-sm">Hand-picked collections for every occasion</p>
                </div>
                <div className="overflow-y-auto h-full">
                  <BrowseGrid>
                    {Object.entries(PLAYLISTS).map(([playlistKey, playlistData]) => {
                      const playlistSongs = filteredSongs.filter(song => song.genreKey === playlistKey);
                      if (playlistSongs.length === 0) return null;
                      
                      return (
                        <BrowseCard
                          key={playlistKey}
                          title={playlistData.displayName}
                          songCount={playlistSongs.length}
                          color={playlistData.color}
                          type="playlist"
                          onSelect={handleCategorySelect}
                          description={`Curated ${playlistData.displayName} playlist`}
                        />
                      );
                    })}
                  </BrowseGrid>
                </div>
              </section>
            )}
          </div>

          {/* Empty State - Desktop */}
          {filteredSongs.length === 0 && !loading && (
            <div className="text-center py-20 hidden md:block">
              <svg className="w-16 h-16 text-gray-600 mx-auto block mb-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              <h3 className="text-xl font-semibold text-gray-300 mb-3">No songs found</h3>
              <p className="text-gray-500">Try adjusting your search or check back later</p>
            </div>
          )}
        </div>

        {/* Mobile Content */}
        <div className="md:hidden flex-1" style={{ minHeight: 'calc(100vh - 280px)' }}>
          {/* Selected Songs Summary */}
          {selectedSongs.length > 0 && (
            <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-3 mx-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold text-sm">Your Playlist</h3>
                  <p className="text-green-100 text-xs">{selectedSongs.length} songs selected</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSongs([])}
                    className="px-3 py-1 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors text-xs"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleBackToContract}
                    className="px-4 py-1 bg-white text-green-600 rounded-full font-medium hover:bg-gray-100 transition-colors text-xs"
                  >
                    Use
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Browse Grid */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'genres' && (
              <section className="h-full">
                <div className="px-4 py-2">
                  <h2 className="text-white text-xl font-bold mb-1">Music Genres</h2>
                  <p className="text-gray-400 text-sm">Discover music by genre</p>
                </div>
                <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                  {Object.entries(GENRES).map(([genreKey, genreData]) => {
                    const genreSongs = filteredSongs.filter(song => song.genreKey === genreKey);
                    if (genreSongs.length === 0) return null;
                    
                    return (
                      <BrowseCard
                        key={genreKey}
                        title={genreData.displayName}
                        songCount={genreSongs.length}
                        color={genreData.color}
                        type="genre"
                        onSelect={handleCategorySelect}
                        description={`Explore ${genreData.displayName} music`}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {activeTab === 'playlists' && (
              <section className="h-full">
                <div className="px-4 py-2">
                  <h2 className="text-white text-xl font-bold mb-1">Curated Playlists</h2>
                  <p className="text-gray-400 text-sm">Hand-picked collections</p>
                </div>
                <div className="grid grid-cols-2 gap-3 px-4 pb-4">
                  {Object.entries(PLAYLISTS).map(([playlistKey, playlistData]) => {
                    const playlistSongs = filteredSongs.filter(song => song.genreKey === playlistKey);
                    if (playlistSongs.length === 0) return null;
                    
                    return (
                      <BrowseCard
                        key={playlistKey}
                        title={playlistData.displayName}
                        songCount={playlistSongs.length}
                        color={playlistData.color}
                        type="playlist"
                        onSelect={handleCategorySelect}
                        description={`Curated ${playlistData.displayName} playlist`}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* Empty State - Mobile */}
            {filteredSongs.length === 0 && !loading && (
              <div className="text-center py-10 px-4">
                <svg className="w-12 h-12 text-gray-600 mx-auto block mb-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No songs found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your search or check back later</p>
              </div>
            )}
          </div>
        </div>
      </ScrollableContent>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onBackToContract={handleBackToContract}
        onShowLibrary={handleShowLibrary}
      />

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Custom scrollbar for main content */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #1f2937;
        }
        ::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
} 