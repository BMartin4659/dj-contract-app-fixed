import PlaylistCover from './PlaylistCover';
import SafePlaylistCover, { MusicIcon, PlaylistIcon } from './SafePlaylistCover';

// Example usage of both components
const PlaylistCoverExample = () => {

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold text-white">Playlist Cover Examples</h2>
      
      {/* Using PlaylistCover with safe inline SVG */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">PlaylistCover (Safe Inline SVG)</h3>
        <div className="flex gap-4 flex-wrap">
          {/* Using predefined icon types */}
          <PlaylistCover 
            name="My Music" 
            svgIcon="music"
            style={{ borderColor: '#3B82F6', color: '#3B82F6' }}
          />
          <PlaylistCover 
            name="Favorites" 
            svgIcon="heart"
            style={{ borderColor: '#EF4444', color: '#EF4444' }}
          />
          <PlaylistCover 
            name="Playlists" 
            svgIcon="playlist"
            style={{ borderColor: '#10B981', color: '#10B981' }}
          />
          <PlaylistCover 
            name="Search Music" 
            svgIcon="search"
            style={{ borderColor: '#F59E0B', color: '#F59E0B' }}
          />
        </div>
      </div>

      {/* Using SafePlaylistCover without dangerouslySetInnerHTML */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">SafePlaylistCover (React components)</h3>
        <div className="flex gap-4 flex-wrap">
          <SafePlaylistCover 
            name="My Music" 
            iconName="music" 
            color="#3B82F6" 
            size="md"
          />
          <SafePlaylistCover 
            name="Favorites" 
            iconName="heart" 
            color="#EF4444" 
            size="md"
          />
          <SafePlaylistCover 
            name="Playlists" 
            iconName="playlist" 
            color="#10B981" 
            size="md"
          />
          <SafePlaylistCover 
            name="Search" 
            iconName="search" 
            color="#F59E0B" 
            size="md"
          />
        </div>
      </div>

      {/* Different sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Different Sizes</h3>
        <div className="flex gap-4 items-end flex-wrap">
          <SafePlaylistCover 
            name="Small" 
            iconName="music" 
            color="#6366F1" 
            size="sm"
          />
          <SafePlaylistCover 
            name="Medium" 
            iconName="music" 
            color="#6366F1" 
            size="md"
          />
          <SafePlaylistCover 
            name="Large" 
            iconName="music" 
            color="#6366F1" 
            size="lg"
          />
          <SafePlaylistCover 
            name="Extra Large" 
            iconName="music" 
            color="#6366F1" 
            size="xl"
          />
        </div>
      </div>

      {/* Using individual icon components */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Individual Icon Components</h3>
        <div className="flex gap-4 items-center">
          <MusicIcon className="w-8 h-8 text-blue-500" />
          <PlaylistIcon className="w-8 h-8 text-green-500" />
          <div className="text-white">
            Icons can also be used individually in other components
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCoverExample; 