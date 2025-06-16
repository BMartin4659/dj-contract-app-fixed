import React from 'react';

// SVG Icon Components
const MusicIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
);

const PlaylistIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
  </svg>
);

const MicrophoneIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2zm5.3 6c-.08 0-.15.02-.22.06-.1.06-.18.15-.18.24v1.7c0 3.33-2.67 6-6 6s-6-2.67-6-6V8.3c0-.17-.22-.3-.4-.3-.22 0-.4.18-.4.4v1.6c0 3.74 2.89 6.82 6.5 7.14v2.96h-2c-.22 0-.4.18-.4.4 0 .22.18.4.4.4h4.8c.22 0 .4-.18.4-.4 0-.22-.18-.4-.4-.4h-2v-2.96c3.61-.32 6.5-3.4 6.5-7.14V8.4c0-.22-.18-.4-.4-.4z"/>
  </svg>
);

const HeartIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const StarIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const SunIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z"/>
  </svg>
);

// Icon mapping
const ICON_COMPONENTS = {
  music: MusicIcon,
  playlist: PlaylistIcon,
  microphone: MicrophoneIcon,
  heart: HeartIcon,
  star: StarIcon,
  sun: SunIcon
};

const PlaylistCoverCard = ({ 
  name, 
  iconName = 'music',
  backgroundColor = 'transparent',
  borderColor = '#ccc',
  textColor = '#333',
  size = 'default',
  onClick,
  className = '',
  songCount
}) => {
  const IconComponent = ICON_COMPONENTS[iconName] || MusicIcon;

  // Size variants following your CSS structure
  const sizeClasses = {
    small: {
      container: 'w-32 h-32',
      icon: 'w-8 h-8',
      text: 'text-xs'
    },
    default: {
      container: 'w-50 h-50', // 200px equivalent
      icon: 'w-12 h-12', // 48px equivalent  
      text: 'text-sm'
    },
    large: {
      container: 'w-64 h-64',
      icon: 'w-16 h-16',
      text: 'text-base'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.default;

  return (
    <div 
      className={`
        ${currentSize.container}
        border-2 
        rounded-lg 
        flex 
        flex-col 
        items-center 
        justify-center 
        font-sans
        cursor-pointer
        transition-all
        duration-200
        hover:shadow-lg
        hover:scale-105
        ${className}
      `}
      style={{ 
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        color: textColor
      }}
      onClick={onClick}
    >
      {/* Icon */}
      <div className="icon">
        <IconComponent className={currentSize.icon} />
      </div>
      
      {/* Name */}
      {name && (
        <div className={`name ${currentSize.text} text-center mt-2 px-2 leading-tight`}>
          {name}
        </div>
      )}
      
      {/* Song Count */}
      {songCount && (
        <div className="text-xs text-gray-500 mt-1">
          {songCount} songs
        </div>
      )}
    </div>
  );
};

export default PlaylistCoverCard;
export { MusicIcon, PlaylistIcon, MicrophoneIcon, HeartIcon, StarIcon, SunIcon }; 