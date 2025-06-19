'use client';

// SongSelector component for song suggestions
const SongSelector = ({ 
  songValue, 
  artistValue, 
  onSongChange, 
  onArtistChange, 
  songName, 
  artistName, 
  suggestions, 
  placeholder = "Song title",
  isMobile = false,
  singleField = false,
  singleFieldName,
  singleFieldValue,
  onSingleFieldChange
}) => {
  // Common input styles to match main form
  const inputStyle = {
    backgroundColor: 'white',
    width: '100%',
    padding: 'clamp(12px, 2vw, 16px)',
    marginBottom: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    color: '#1a1a1a', // Darker text for better mobile visibility
    fontSize: 'clamp(16px, 2.5vw, 18px)',
    fontWeight: '500', // Thicker font weight for mobile readability
    minHeight: '44px',
    lineHeight: '1.4',
    WebkitAppearance: 'none',
    appearance: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    userSelect: 'text',
    WebkitUserSelect: 'text'
  };

  if (singleField) {
    return (
      <div>
        <label htmlFor={`${singleFieldName}_select`} style={{ display: 'none' }}>Choose Song</label>
        <select
          id={`${singleFieldName}_select`}
          name={singleFieldName}
          value={singleFieldValue}
          onChange={(e) => {
            if (e.target.value && e.target.value !== 'custom') {
              onSingleFieldChange(e);
            } else if (e.target.value === 'custom') {
              // Clear the field for custom entry
              onSingleFieldChange({ target: { name: singleFieldName, value: '' } });
            }
          }}
          style={inputStyle}
          className="field-input"
        >
          <option value="">Choose from popular songs...</option>
          {suggestions?.map((song, index) => (
            <option key={index} value={song}>{song}</option>
          ))}
          <option value="custom">🎵 Enter custom song...</option>
        </select>
        
        <input
          id={`${singleFieldName}_input`}
          type="text"
          name={singleFieldName}
          value={singleFieldValue}
          onChange={onSingleFieldChange}
          style={{
            ...inputStyle,
            marginBottom: '0'  // Remove bottom margin from last field
          }}
          className="field-input"
          placeholder={placeholder}
          aria-label={placeholder}
        />
        <label htmlFor={`${singleFieldName}_input`} style={{ display: 'none' }}>{placeholder}</label>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={`${songName}_songSelect`} style={{ display: 'none' }}>Choose Popular Song</label>
      <select
        id={`${songName}_songSelect`}
        value=""
        onChange={(e) => {
          if (e.target.value) {
            const [title, artist] = e.target.value.split(' – ');
            onSongChange({ target: { name: songName, value: title || '' } });
            onArtistChange({ target: { name: artistName, value: artist || '' } });
          }
        }}
        style={inputStyle}
        className="field-input"
      >
        <option value="">Choose from popular songs...</option>
        {suggestions?.map((song, index) => (
          <option key={index} value={song}>{song}</option>
        ))}
      </select>
      
      <input
        id={`${songName}_input`}
        type="text"
        name={songName}
        value={songValue}
        onChange={onSongChange}
        style={inputStyle}
        className="field-input"
        placeholder="Song title"
        aria-label="Song title"
      />
      <label htmlFor={`${songName}_input`} style={{ display: 'none' }}>Song title</label>
      <input
        id={`${artistName}_input`}
        type="text"
        name={artistName}
        value={artistValue}
        onChange={onArtistChange}
        style={{
          ...inputStyle,
          marginBottom: '0'  // Remove bottom margin from last field
        }}
        className="field-input"
        placeholder="Artist"
        aria-label="Artist"
      />
      <label htmlFor={`${artistName}_input`} style={{ display: 'none' }}>Artist</label>
    </div>
  );
};

export default SongSelector; 