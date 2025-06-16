import React from 'react';

// Professional playlist icon library with detailed SVG strings matching the design example
export const playlistIcons = {
  default: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    <circle cx="10" cy="17" r="2" fill="currentColor"/>
    <rect x="12" y="3" width="2" height="11" fill="currentColor"/>
  </svg>`,

  music_note: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    <circle cx="10" cy="17" r="2" fill="currentColor"/>
    <rect x="12" y="3" width="2" height="11" fill="currentColor"/>
  </svg>`,

  sun: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="5" fill="#FFD700" stroke="#FFA500" stroke-width="0.5"/>
    <circle cx="12" cy="12" r="3" fill="#FFFF00" opacity="0.8"/>
    <circle cx="12" cy="12" r="1.5" fill="#FFFFFF" opacity="0.6"/>
    <path d="M12 1l0.5 3.5L12 5l-0.5-3.5L12 1z" fill="#FFD700"/>
    <path d="M12 19l0.5 3.5L12 23l-0.5-3.5L12 19z" fill="#FFD700"/>
    <path d="M4.22 4.22l2.5 2.5l-0.36 0.36l-2.5-2.5L4.22 4.22z" fill="#FFD700"/>
    <path d="M17.66 17.66l2.5 2.5l-0.36 0.36l-2.5-2.5L17.66 17.66z" fill="#FFD700"/>
    <path d="M1 12l3.5 0.5L5 12l-3.5-0.5L1 12z" fill="#FFD700"/>
    <path d="M19 12l3.5 0.5L23 12l-3.5-0.5L19 12z" fill="#FFD700"/>
    <path d="M4.22 19.78l2.5-2.5l0.36 0.36l-2.5 2.5L4.22 19.78z" fill="#FFD700"/>
    <path d="M17.66 6.34l2.5-2.5l0.36 0.36l-2.5 2.5L17.66 6.34z" fill="#FFD700"/>
  </svg>`,

  fireworks: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <g transform="translate(12,12)">
      <circle cx="0" cy="0" r="1" fill="#FF6B6B"/>
      <path d="M0,-8 L1,-6 L0,-4 L-1,-6 Z" fill="#FF6B6B"/>
      <path d="M5.66,-5.66 L6.66,-4.66 L5.66,-3.66 L4.66,-4.66 Z" fill="#FFD700"/>
      <path d="M8,0 L6,1 L4,0 L6,-1 Z" fill="#FF6B6B"/>
      <path d="M5.66,5.66 L6.66,6.66 L5.66,7.66 L4.66,6.66 Z" fill="#4ECDC4"/>
      <path d="M0,8 L1,6 L0,4 L-1,6 Z" fill="#45B7D1"/>
      <path d="M-5.66,5.66 L-4.66,6.66 L-5.66,7.66 L-6.66,6.66 Z" fill="#96CEB4"/>
      <path d="M-8,0 L-6,1 L-4,0 L-6,-1 Z" fill="#FFEAA7"/>
      <path d="M-5.66,-5.66 L-4.66,-4.66 L-5.66,-3.66 L-6.66,-4.66 Z" fill="#DDA0DD"/>
    </g>
    <circle cx="6" cy="4" r="0.5" fill="#FFD700"/>
    <circle cx="18" cy="6" r="0.5" fill="#FF6B6B"/>
    <circle cx="4" cy="18" r="0.5" fill="#4ECDC4"/>
    <circle cx="20" cy="16" r="0.5" fill="#45B7D1"/>
    <path d="M3,3 L4,2 L5,3 L4,4 Z" fill="#FFD700"/>
    <path d="M19,5 L20,4 L21,5 L20,6 Z" fill="#FF6B6B"/>
    <path d="M2,20 L3,19 L4,20 L3,21 Z" fill="#96CEB4"/>
    <path d="M20,19 L21,18 L22,19 L21,20 Z" fill="#DDA0DD"/>
  </svg>`,

  boombox: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="7" width="20" height="12" rx="2" fill="#2C3E50" stroke="#34495E" stroke-width="0.5"/>
    <rect x="3" y="8" width="18" height="10" rx="1.5" fill="#34495E"/>
    <circle cx="8" cy="13" r="3" fill="#1A252F" stroke="#0F1419" stroke-width="0.5"/>
    <circle cx="16" cy="13" r="3" fill="#1A252F" stroke="#0F1419" stroke-width="0.5"/>
    <circle cx="8" cy="13" r="2" fill="#E74C3C"/>
    <circle cx="16" cy="13" r="2" fill="#E74C3C"/>
    <circle cx="8" cy="13" r="1" fill="#C0392B"/>
    <circle cx="16" cy="13" r="1" fill="#C0392B"/>
    <circle cx="8" cy="13" r="0.3" fill="#FFFFFF"/>
    <circle cx="16" cy="13" r="0.3" fill="#FFFFFF"/>
    <rect x="10" y="9.5" width="4" height="2" rx="1" fill="#95A5A6"/>
    <rect x="10.5" y="10" width="3" height="1" rx="0.5" fill="#BDC3C7"/>
    <rect x="11" y="15" width="2" height="1.5" rx="0.5" fill="#95A5A6"/>
    <circle cx="11.2" cy="15.7" r="0.2" fill="#FFFFFF"/>
    <circle cx="12.8" cy="15.7" r="0.2" fill="#FFFFFF"/>
    <rect x="5" y="5" width="2" height="3" rx="1" fill="#2C3E50"/>
    <rect x="17" y="5" width="2" height="3" rx="1" fill="#2C3E50"/>
    <rect x="5.5" y="5.5" width="1" height="2" rx="0.5" fill="#7F8C8D"/>
    <rect x="17.5" y="5.5" width="1" height="2" rx="0.5" fill="#7F8C8D"/>
  </svg>`,

  christmas_tree: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <polygon points="12,3 8.5,8 15.5,8" fill="#27AE60"/>
    <polygon points="12,6.5 7.5,12 16.5,12" fill="#2ECC71"/>
    <polygon points="12,10 6,16 18,16" fill="#27AE60"/>
    <rect x="11" y="16" width="2" height="4" fill="#8B4513"/>
    <rect x="10.5" y="15.5" width="3" height="1" fill="#A0522D" rx="0.5"/>
    <polygon points="12,2 10.5,4.5 13.5,4.5" fill="#FFD700"/>
    <circle cx="12" cy="2.5" r="0.5" fill="#FFA500"/>
    <circle cx="9" cy="7" r="0.3" fill="#E74C3C"/>
    <circle cx="15" cy="7" r="0.3" fill="#E74C3C"/>
    <circle cx="8" cy="11" r="0.3" fill="#3498DB"/>
    <circle cx="16" cy="11" r="0.3" fill="#3498DB"/>
    <circle cx="7" cy="15" r="0.3" fill="#F39C12"/>
    <circle cx="17" cy="15" r="0.3" fill="#F39C12"/>
    <circle cx="10" cy="9" r="0.2" fill="#E67E22"/>
    <circle cx="14" cy="9" r="0.2" fill="#E67E22"/>
    <circle cx="9" cy="13" r="0.2" fill="#9B59B6"/>
    <circle cx="15" cy="13" r="0.2" fill="#9B59B6"/>
  </svg>`,

  vintage_microphone: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="8" rx="4.5" ry="5" fill="#C0C0C0" stroke="#A0A0A0" stroke-width="0.5"/>
    <ellipse cx="12" cy="8" rx="3.5" ry="4" fill="#E8E8E8"/>
    <rect x="11" y="13" width="2" height="6" fill="#7F8C8D"/>
    <rect x="10.5" y="12.5" width="3" height="1" fill="#95A5A6" rx="0.5"/>
    <rect x="8" y="18.5" width="8" height="2.5" fill="#2C3E50" rx="1"/>
    <rect x="8.5" y="19" width="7" height="1.5" fill="#34495E" rx="0.5"/>
    <rect x="9" y="6" width="6" height="0.4" fill="#34495E" rx="0.2"/>
    <rect x="9" y="7" width="6" height="0.4" fill="#34495E" rx="0.2"/>
    <rect x="9" y="8" width="6" height="0.4" fill="#34495E" rx="0.2"/>
    <rect x="9" y="9" width="6" height="0.4" fill="#34495E" rx="0.2"/>
    <rect x="9" y="10" width="6" height="0.4" fill="#34495E" rx="0.2"/>
    <circle cx="12" cy="5" r="0.8" fill="#FFD700"/>
    <circle cx="12" cy="5" r="0.4" fill="#FFA500"/>
    <rect x="11.7" y="3" width="0.6" height="2" fill="#FFD700"/>
  </svg>`,

  acoustic_guitar: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="16" rx="6" ry="4" fill="currentColor"/>
    <circle cx="12" cy="16" r="2" fill="white"/>
    <rect x="11.5" y="4" width="1" height="12" fill="currentColor"/>
    <rect x="9" y="4" width="6" height="1.5" fill="currentColor"/>
    <rect x="10" y="7" width="4" height="0.3" fill="white"/>
    <rect x="10" y="9" width="4" height="0.3" fill="white"/>
    <rect x="10" y="11" width="4" height="0.3" fill="white"/>
    <rect x="10" y="13" width="4" height="0.3" fill="white"/>
  </svg>`,

  turntable: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="10" width="20" height="8" fill="currentColor"/>
    <circle cx="12" cy="14" r="6" fill="black"/>
    <circle cx="12" cy="14" r="4" fill="#333"/>
    <circle cx="12" cy="14" r="2" fill="black"/>
    <circle cx="12" cy="14" r="0.5" fill="currentColor"/>
    <rect x="18" y="12" width="2" height="4" fill="currentColor"/>
    <polygon points="19,10 17,12 19,12" fill="currentColor"/>
  </svg>`,

  banjo_country: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="14" r="5" fill="currentColor"/>
    <circle cx="12" cy="14" r="3" fill="white"/>
    <rect x="11.5" y="4" width="1" height="10" fill="currentColor"/>
    <rect x="9" y="4" width="6" height="1" fill="currentColor"/>
    <rect x="10" y="11" width="4" height="0.3" fill="white"/>
    <rect x="10" y="13" width="4" height="0.3" fill="white"/>
    <rect x="10" y="15" width="4" height="0.3" fill="white"/>
    <ellipse cx="16" cy="14" rx="2" ry="1" fill="currentColor"/>
    <ellipse cx="8" cy="14" rx="2" ry="1" fill="currentColor"/>
  </svg>`,

  dj_headphones: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8 2 5 5 5 9v6c0 1 1 2 2 2h2V9c0-2 1-3 3-3s3 1 3 3v8h2c1 0 2-1 2-2V9c0-4-3-7-7-7z" fill="currentColor"/>
    <rect x="5" y="13" width="3" height="4" rx="1" fill="currentColor"/>
    <rect x="16" y="13" width="3" height="4" rx="1" fill="currentColor"/>
    <circle cx="6.5" cy="15" r="0.5" fill="white"/>
    <circle cx="17.5" cy="15" r="0.5" fill="white"/>
  </svg>`,

  disco_ball: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8" fill="#2C3E50" stroke="#34495E" stroke-width="0.5"/>
    <rect x="7" y="7" width="2" height="2" fill="#C0C0C0" stroke="#A0A0A0" stroke-width="0.2"/>
    <rect x="13" y="7" width="2" height="2" fill="#E8E8E8" stroke="#D0D0D0" stroke-width="0.2"/>
    <rect x="10" y="9" width="2" height="2" fill="#F0F0F0" stroke="#E0E0E0" stroke-width="0.2"/>
    <rect x="7" y="13" width="2" height="2" fill="#D8D8D8" stroke="#C8C8C8" stroke-width="0.2"/>
    <rect x="13" y="13" width="2" height="2" fill="#C0C0C0" stroke="#B0B0B0" stroke-width="0.2"/>
    <rect x="10" y="15" width="2" height="2" fill="#E8E8E8" stroke="#D8D8D8" stroke-width="0.2"/>
    <rect x="15" y="10" width="2" height="2" fill="#F8F8F8" stroke="#E8E8E8" stroke-width="0.2"/>
    <rect x="5" y="10" width="2" height="2" fill="#D0D0D0" stroke="#C0C0C0" stroke-width="0.2"/>
    <rect x="8.5" y="8.5" width="1" height="1" fill="#FFD700"/>
    <rect x="13.5" y="8.5" width="1" height="1" fill="#FFD700"/>
    <rect x="8.5" y="13.5" width="1" height="1" fill="#FFD700"/>
    <rect x="13.5" y="13.5" width="1" height="1" fill="#FFD700"/>
    <rect x="11" y="6" width="2" height="1" fill="#FFD700" rx="0.5"/>
    <line x1="12" y1="2" x2="12" y2="4" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
    <circle cx="12" cy="3" r="0.5" fill="#FFD700"/>
  </svg>`,

  disco_sparkle: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="6" fill="currentColor"/>
    <rect x="9" y="9" width="1.5" height="1.5" fill="silver"/>
    <rect x="13.5" y="9" width="1.5" height="1.5" fill="silver"/>
    <rect x="9" y="13.5" width="1.5" height="1.5" fill="silver"/>
    <rect x="13.5" y="13.5" width="1.5" height="1.5" fill="silver"/>
    <polygon points="6,6 7,8 9,7 7,9 8,11 6,10 4,11 5,9 3,8 5,7 4,5 6,6" fill="currentColor"/>
    <polygon points="18,4 19,6 21,5 19,7 20,9 18,8 16,9 17,7 15,6 17,5 16,3 18,4" fill="currentColor"/>
    <polygon points="20,16 21,18 23,17 21,19 22,21 20,20 18,21 19,19 17,18 19,17 18,15 20,16" fill="currentColor"/>
  </svg>`,

  star: `<svg width="48" height="48" viewBox="0 0 24 24" fill="gold" stroke="currentColor" stroke-width="1">
    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/>
  </svg>`,

  heart: `<svg width="48" height="48" viewBox="0 0 24 24" fill="red" stroke="currentColor" stroke-width="1">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>`,

  fire: `<svg width="48" height="48" viewBox="0 0 24 24" fill="orange">
    <path d="M12 2C8 6 6 10 6 14c0 3.31 2.69 6 6 6s6-2.69 6-6c0-4-2-8-6-12z"/>
    <path d="M12 6C10 8 9 10 9 12c0 1.66 1.34 3 3 3s3-1.34 3-3c0-2-1-4-3-6z" fill="red"/>
    <path d="M12 10c-1 1-1.5 1.5-1.5 2.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5c0-1-.5-1.5-1.5-2.5z" fill="yellow"/>
  </svg>`,

  headphones: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8 2 5 5 5 9v6c0 1 1 2 2 2h2V9c0-2 1-3 3-3s3 1 3 3v8h2c1 0 2-1 2-2V9c0-4-3-7-7-7z" fill="currentColor"/>
    <rect x="5" y="13" width="3" height="4" rx="1" fill="currentColor"/>
    <rect x="16" y="13" width="3" height="4" rx="1" fill="currentColor"/>
    <circle cx="6.5" cy="15" r="0.5" fill="white"/>
    <circle cx="17.5" cy="15" r="0.5" fill="white"/>
  </svg>`,

  party: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="6" fill="currentColor"/>
    <rect x="9" y="9" width="1.5" height="1.5" fill="silver"/>
    <rect x="13.5" y="9" width="1.5" height="1.5" fill="silver"/>
    <rect x="9" y="13.5" width="1.5" height="1.5" fill="silver"/>
    <rect x="13.5" y="13.5" width="1.5" height="1.5" fill="silver"/>
    <polygon points="6,6 7,8 9,7 7,9 8,11 6,10 4,11 5,9 3,8 5,7 4,5 6,6" fill="currentColor"/>
    <polygon points="18,4 19,6 21,5 19,7 20,9 18,8 16,9 17,7 15,6 17,5 16,3 18,4" fill="currentColor"/>
    <polygon points="20,16 21,18 23,17 21,19 22,21 20,20 18,21 19,19 17,18 19,17 18,15 20,16" fill="currentColor"/>
  </svg>`,

  microphone: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="8" r="4" fill="currentColor"/>
    <rect x="11" y="12" width="2" height="6" fill="currentColor"/>
    <rect x="9" y="18" width="6" height="2" fill="currentColor"/>
    <circle cx="12" cy="8" r="2" fill="white"/>
    <rect x="10" y="6" width="4" height="0.5" fill="white"/>
    <rect x="10" y="8" width="4" height="0.5" fill="white"/>
    <rect x="10" y="10" width="4" height="0.5" fill="white"/>
  </svg>`,

  vinyl: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="10" width="20" height="8" fill="currentColor"/>
    <circle cx="12" cy="14" r="6" fill="black"/>
    <circle cx="12" cy="14" r="4" fill="#333"/>
    <circle cx="12" cy="14" r="2" fill="black"/>
    <circle cx="12" cy="14" r="0.5" fill="currentColor"/>
    <rect x="18" y="12" width="2" height="4" fill="currentColor"/>
    <polygon points="19,10 17,12 19,12" fill="currentColor"/>
  </svg>`,

  guitar: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="16" rx="6" ry="4" fill="currentColor"/>
    <circle cx="12" cy="16" r="2" fill="white"/>
    <rect x="11.5" y="4" width="1" height="12" fill="currentColor"/>
    <rect x="9" y="4" width="6" height="1.5" fill="currentColor"/>
    <rect x="10" y="7" width="4" height="0.3" fill="white"/>
    <rect x="10" y="9" width="4" height="0.3" fill="white"/>
    <rect x="10" y="11" width="4" height="0.3" fill="white"/>
    <rect x="10" y="13" width="4" height="0.3" fill="white"/>
  </svg>`,

  cowboy: `<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="14" r="5" fill="currentColor"/>
    <circle cx="12" cy="14" r="3" fill="white"/>
    <rect x="11.5" y="4" width="1" height="10" fill="currentColor"/>
    <rect x="9" y="4" width="6" height="1" fill="currentColor"/>
    <line x1="10" y1="11" x2="14" y2="11" stroke="white" stroke-width="0.3"/>
    <line x1="10" y1="13" x2="14" y2="13" stroke="white" stroke-width="0.3"/>
    <line x1="10" y1="15" x2="14" y2="15" stroke="white" stroke-width="0.3"/>
    <path d="M16 12c2 0 3 1 3 2s-1 2-3 2" stroke="currentColor" stroke-width="1" fill="none"/>
    <path d="M8 12c-2 0-3 1-3 2s1 2 3 2" stroke="currentColor" stroke-width="1" fill="none"/>
  </svg>`
};

const PlaylistCover = ({ name, svgIcon = 'music_note', className = '', style = {} }) => {
  // Handle both string keys and direct SVG strings
  let iconSvg;
  
  if (typeof svgIcon === 'string' && svgIcon.includes('<svg')) {
    // Direct SVG string passed
    iconSvg = svgIcon;
  } else {
    // Icon key passed, look it up in the library
    iconSvg = playlistIcons[svgIcon] || playlistIcons.music_note;
  }

  return (
    <div 
      className={`playlist-cover ${className}`}
      style={{
        width: '200px',
        height: '200px',
        background: 'transparent',
        border: '2px solid #ccc',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        padding: '10px',
        ...style
      }}
    >
      <span
        className="icon"
        dangerouslySetInnerHTML={{ __html: iconSvg }}
        style={{
          width: '48px',
          height: '48px'
        }}
      />
      <span 
        className="name"
        style={{
          fontSize: '0.9em',
          textAlign: 'center',
          marginTop: '0.5em',
          wordWrap: 'break-word'
        }}
      >
        {name}
      </span>
    </div>
  );
};

export default PlaylistCover; 