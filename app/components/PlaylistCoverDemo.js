import React from 'react';
import PlaylistCover, { playlistIcons } from './PlaylistCover';

const PlaylistCoverDemo = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Playlist Cover Demo</h1>
        
        {/* Basic Examples - Using Icon Keys */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">Basic Examples (Icon Keys)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PlaylistCover
              name="90s Hip Hop & RnB"
              svgIcon="music_note"
            />
            <PlaylistCover
              name="My Favorites"
              svgIcon="heart"
              style={{ borderColor: '#ef4444' }}
            />
            <PlaylistCover
              name="Party Playlist"
              svgIcon="disco_ball"
              style={{ borderColor: '#10b981' }}
            />
            <PlaylistCover
              name="Karaoke Night"
              svgIcon="microphone"
              style={{ borderColor: '#f59e0b' }}
            />
          </div>
        </section>

        {/* Direct SVG String Examples - Your Examples */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">Your Examples (Direct SVG Strings)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PlaylistCover
              name="90s Hip Hop & RnB"
              svgIcon={playlistIcons.headphones}
            />
            <PlaylistCover
              name="Classic Disco"
              svgIcon={playlistIcons.disco_ball}
            />
            <PlaylistCover
              name="Summer Bangers"
              svgIcon={playlistIcons.fire}
            />
          </div>
        </section>

        {/* Custom Styled Examples */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">Custom Styled</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PlaylistCover
              name="Rock Classics"
              svgIcon="guitar"
              style={{ 
                borderColor: '#8b5cf6',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            />
            <PlaylistCover
              name="Chill Vibes"
              svgIcon="headphones"
              style={{ 
                borderColor: '#06b6d4',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            />
            <PlaylistCover
              name="Workout Mix"
              svgIcon="heart"
              style={{ 
                borderColor: '#ef4444',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white'
              }}
            />
          </div>
        </section>

        {/* Different Sizes */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">Different Sizes</h2>
          <div className="flex items-end gap-6 flex-wrap">
            <PlaylistCover
              name="Small"
              svgIcon="vinyl"
              style={{ width: '120px', height: '120px' }}
            />
            <PlaylistCover
              name="Medium"
              svgIcon="radio"
              style={{ width: '160px', height: '160px' }}
            />
            <PlaylistCover
              name="Large"
              svgIcon="heart"
              style={{ width: '240px', height: '240px' }}
            />
          </div>
        </section>

        {/* All Icon Types */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-6">All Available Icons</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.keys(playlistIcons).map(icon => (
              <PlaylistCover
                key={icon}
                name={icon.replace('_', ' ').toUpperCase()}
                svgIcon={icon}
                style={{ width: '120px', height: '120px' }}
              />
            ))}
          </div>
        </section>

        {/* Usage Examples */}
        <section className="mt-12 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Usage Examples</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-2">Method 1: Using Icon Keys</h3>
            <pre className="text-green-400 text-sm overflow-x-auto bg-gray-900 p-3 rounded">
{`<PlaylistCover
  name="90s Hip Hop & RnB"
  svgIcon="music_note"
  style={{ borderColor: '#10b981' }}
/>`}
            </pre>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-2">Method 2: Using Direct SVG Strings</h3>
            <pre className="text-green-400 text-sm overflow-x-auto bg-gray-900 p-3 rounded">
{`import { playlistIcons } from './PlaylistCover';

<PlaylistCover
  name="90s Hip Hop & RnB"
  svgIcon={playlistIcons.music_note}
  style={{ borderColor: '#10b981' }}
/>`}
            </pre>
          </div>

          <div className="text-gray-300 text-sm">
            <p><strong>Available Icon Keys:</strong></p>
            <p className="mt-2 font-mono text-xs bg-gray-900 p-2 rounded">
              {Object.keys(playlistIcons).join(', ')}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PlaylistCoverDemo; 