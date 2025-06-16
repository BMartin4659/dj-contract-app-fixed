// iTunes Music Library Data Handler
// This file will process and serve the CSV data for the playlist browser

export const MUSIC_GENRES = [
  { id: 'christmas', label: 'Christmas', file: 'Genre_Christmas.csv', color: '#F1948A' },
  { id: 'classic-80s', label: 'Classic 80s Music', file: "Genre_Classic_80's_Music.csv", color: '#F7DC6F' },
  { id: 'latin', label: 'Latin', file: 'Genre_Latin.csv', color: '#FF5722' },
  { id: 'pop', label: 'Pop', file: 'Genre_Pop.csv', color: '#98D8C8' },
  { id: 'rnb', label: 'R&B', file: 'Genre_R&B.csv', color: '#DDA0DD' },
  { id: 'rap-hiphop', label: 'Rap & Hip-Hop', file: 'Genre_Rap_&_Hip-Hop.csv', color: '#FFEAA7' },
  { id: 'reggae', label: 'Reggae', file: 'Genre_Reggae.csv', color: '#96CEB4' },
  { id: 'rock', label: 'Rock', file: 'Genre_Rock.csv', color: '#45B7D1' },
  { id: 'rock-pop-ac', label: 'Rock / Pop / AC', file: 'Genre_Rock_-_Pop_-_AC.csv', color: '#4ECDC4' },
  { id: 'urban', label: 'Urban', file: 'Genre_Urban.csv', color: '#CD853F' }
];

// Curated playlists from DJ Bobby Drake's collection - sorted alphabetically
export const PLAYLISTS = {
  '100_Classic_Summer_Hits': {
    color: '#FF9800',
    file: 'Playlist_100_Classic_Mega_Summer_Hits.csv',
    displayName: '100 Classic Summer Hits',
    description: 'Mega summer hits collection'
  },
  '4th_of_July': {
    color: '#F44336',
    file: 'Playlist_4th_of_July.csv',
    displayName: '4th of July',
    description: 'Patriotic and celebration music'
  },
  '80s_Club_Anthems': {
    color: '#9C27B0',
    file: "Playlist_80's_Club_Anthems.csv",
    displayName: '80s Club Anthems',
    description: 'Classic 80s club and dance hits'
  },
  '90s_Hip_Hop_RandB': {
    color: '#9B59B6',
    file: "Playlist_90's_Hip_Hop_and_RandB_Playlist.csv",
    displayName: "90's Hip Hop & R&B",
    description: 'Classic 90s hip hop and R&B hits'
  },
  '90s_Music': {
    color: '#673AB7',
    file: "Playlist_90's_Music.csv",
    displayName: '90s Music',
    description: 'The best of 1990s music'
  },
  'Baltimore_Bmore': {
    color: '#FF5722',
    file: 'Playlist_Baltimore_Bmore.csv',
    displayName: 'Baltimore Bmore',
    description: 'Baltimore club and Bmore beats'
  },
  'Billboard_2014': {
    color: '#3498DB',
    file: 'Playlist_Billboard_2014_Year_End_Top_!00.csv',
    displayName: 'Billboard 2014 Top 100',
    description: 'Year-end chart toppers from 2014'
  },
  'Christmas_Music': { 
    color: '#FF9FF3', 
    file: 'Playlist_Christmas_Music.csv',
    displayName: 'Christmas Music',
    description: 'Holiday favorites and Christmas classics'
  },
  'Classic_50s': {
    color: '#795548',
    file: "Playlist_Classic_50's_Music.csv",
    displayName: 'Classic 50s Music',
    description: 'Hits from the 1950s'
  },
  'Classic_60s': {
    color: '#607D8B',
    file: "Playlist_Classic_60's_Music.csv",
    displayName: 'Classic 60s Music',
    description: 'Hits from the 1960s'
  },
  'Classic_70s': {
    color: '#FF9800',
    file: "Playlist_Classic_70's_Music.csv",
    displayName: 'Classic 70s Music',
    description: 'Hits from the 1970s'
  },
  'Classic_80s_Music': { 
    color: '#F7DC6F', 
    file: "Playlist_Classic_80's_Music.csv",
    displayName: "Classic 80's",
    description: 'Nostalgic hits from the 1980s'
  },
  'Classic_90s_Music': { 
    color: '#E67E22', 
    file: "Playlist_Classic_90's_Music.csv",
    displayName: "Classic 90's",
    description: 'Nostalgic hits from the 1990s'
  },
  'Classic_Hip_Hop': {
    color: '#E74C3C',
    file: 'Playlist_Classic_Hip-Hop_Set.csv',
    displayName: 'Classic Hip-Hop Set',
    description: 'Old school hip-hop classics'
  },
  'Classic_Rock': {
    color: '#424242',
    file: 'Playlist_Classic_Rock.csv',
    displayName: 'Classic Rock',
    description: 'Timeless rock classics'
  },
  'Classic_Soul': { 
    color: '#F39C12', 
    file: 'Playlist_Classic_Soul.csv',
    displayName: 'Classic Soul',
    description: 'Timeless soul and Motown classics'
  },
  'Country': {
    color: '#8BC34A',
    file: 'Playlist_Country.csv',
    displayName: 'Country',
    description: 'Country music favorites'
  },
  'Dance_Hits_70s_80s': {
    color: '#E91E63',
    file: "Playlist_Dance_Hits_Of_The_70's_and_80's.csv",
    displayName: 'Dance Hits 70s & 80s',
    description: 'Dance classics from the 70s and 80s'
  },
  'Dance_Music': { 
    color: '#E74C3C', 
    file: 'Playlist_Dance_Music.csv',
    displayName: 'Dance Music',
    description: 'Electronic and dance floor favorites'
  },
  'Disco': {
    color: '#FF6F00',
    file: 'Playlist_Disco.csv',
    displayName: 'Disco',
    description: 'Classic disco hits'
  },
  'Disco_Hits': {
    color: '#FFC107',
    file: 'Playlist_Disco_Hits.csv',
    displayName: 'Disco Hits',
    description: 'Greatest disco hits collection'
  },
  'Discotech_Remixes': {
    color: '#FF4081',
    file: 'Playlist_Discotech_(Remixes).csv',
    displayName: 'Discotech Remixes',
    description: 'Disco remixes and club versions'
  },
  'Feel_Good_Music': {
    color: '#F1C40F',
    file: 'Playlist_Feel_Good_Music.csv',
    displayName: 'Feel Good Music',
    description: 'Uplifting and positive vibes'
  },
  'Freestyle': {
    color: '#00BCD4',
    file: 'Playlist_Freestyle.csv',
    displayName: 'Freestyle',
    description: 'Freestyle and Latin freestyle hits'
  },
  'Funk': {
    color: '#4CAF50',
    file: 'Playlist_Funk.csv',
    displayName: 'Funk',
    description: 'Funky grooves and bass lines'
  },
  'Greatest_80s_Hits': {
    color: '#9E9E9E',
    file: "Playlist_Greatest_Hits_Of_The_80's.csv",
    displayName: 'Greatest 80s Hits',
    description: 'The greatest hits of the 1980s'
  },
  'Halloween_Music': {
    color: '#FF5722',
    file: 'Playlist_Halloween_Music.csv',
    displayName: 'Halloween Music',
    description: 'Spooky and Halloween-themed music'
  },
  'Holiday': {
    color: '#4CAF50',
    file: 'Playlist_Holiday.csv',
    displayName: 'Holiday',
    description: 'General holiday music'
  },
  'Jazz': {
    color: '#795548',
    file: 'Playlist_Jazz.csv',
    displayName: 'Jazz',
    description: 'Jazz classics and smooth jazz'
  },
  'Late_Night_Love': {
    color: '#8E44AD',
    file: 'Playlist_Late_Night_Love.csv',
    displayName: 'Late Night Love',
    description: 'Romantic slow jams for intimate moments'
  },
  'Latin_Mix': {
    color: '#E67E22',
    file: 'Playlist_Latin_Mix.csv',
    displayName: 'Latin Mix',
    description: 'Latin beats and rhythms'
  },
  'MainStream': {
    color: '#607D8B',
    file: 'Playlist_MainStream.csv',
    displayName: 'MainStream',
    description: 'Mainstream popular music'
  },
  'Mainstream_Standards': {
    color: '#34495E',
    file: 'Playlist_Mainstream_Standards.csv',
    displayName: 'Mainstream Standards',
    description: 'Popular mainstream hits'
  },
  'Mash_Up': {
    color: '#E91E63',
    file: 'Playlist_Mash-Up.csv',
    displayName: 'Mash-Up',
    description: 'Creative mashups and remixes'
  },
  'Michael_Jackson': {
    color: '#000000',
    file: 'Playlist_Michael_Jackson.csv',
    displayName: 'Michael Jackson',
    description: 'The King of Pop collection'
  },
  'Mix_Tape_Mixes': {
    color: '#FF5722',
    file: 'Playlist_Mix_Tape_Mixes.csv',
    displayName: 'Mix Tape Mixes',
    description: 'Classic mix tape style combinations'
  },
  'New_Years_Eve': {
    color: '#FFD700',
    file: "Playlist_New_Year's_Eve.csv",
    displayName: 'New Years Eve',
    description: 'New Year celebration music'
  },
  'Old_School_Rap': {
    color: '#FF5722',
    file: 'Playlist_Old_School_Rap.csv',
    displayName: 'Old School Rap',
    description: 'Classic old school rap hits'
  },
  'Old_Skool': {
    color: '#9C27B0',
    file: 'Playlist_Old_Skool.csv',
    displayName: 'Old Skool',
    description: 'Old school classics'
  },
  'Oldies': {
    color: '#8BC34A',
    file: 'Playlist_Oldies.csv',
    displayName: 'Oldies',
    description: 'Classic oldies but goodies'
  },
  'Party_Dances': {
    color: '#FF1744',
    file: 'Playlist_Party_Dances.csv',
    displayName: 'Party Dances',
    description: 'Dance floor favorites and party anthems'
  },
  'Party_Playlist': { 
    color: '#FF6B6B', 
    file: 'Playlist_Party_Playlist.csv',
    displayName: 'Party Playlist',
    description: 'High-energy tracks perfect for any party'
  },
  'Party_To_Go': { 
    color: '#FF4757', 
    file: 'Playlist_Party_To_Go.csv',
    displayName: 'Party To Go',
    description: 'Ready-to-go party mix'
  },
  'Pop': { 
    color: '#98D8C8', 
    file: 'Playlist_Pop.csv',
    displayName: 'Pop Hits',
    description: 'Chart-topping pop favorites'
  },
  'Pop_Dance_Mixes': {
    color: '#E91E63',
    file: 'Playlist_Pop-Dance_Mixes.csv',
    displayName: 'Pop Dance Mixes',
    description: 'Pop tracks with dance remixes'
  },
  'Powerhouse_Remixes': {
    color: '#FF4081',
    file: 'Playlist_Powerhouse_Remixes.csv',
    displayName: 'Powerhouse Remixes',
    description: 'High-energy remix collection'
  },
  'RandB': { 
    color: '#DDA0DD', 
    file: 'Playlist_RandB.csv',
    displayName: 'R&B Classics',
    description: 'Smooth R&B and soul music'
  },
  'RandB_Hip_Hop': {
    color: '#9C27B0',
    file: 'Playlist_RandB-_Hip_Hop.csv',
    displayName: 'R&B Hip Hop',
    description: 'R&B and hip hop fusion'
  },
  'RandB_Soul_Dance': {
    color: '#9B59B6',
    file: 'Playlist_RandB-Soul-Dance_Mix.csv',
    displayName: 'R&B Soul Dance Mix',
    description: 'Danceable R&B and soul tracks'
  },
  'Rap_and_Hip-Hop': { 
    color: '#FFEAA7', 
    file: 'Playlist_Rap_and_Hip-Hop.csv',
    displayName: 'Rap & Hip-Hop',
    description: 'The best in rap and hip-hop music'
  },
  'Reggae': { 
    color: '#96CEB4', 
    file: 'Playlist_Reggae.csv',
    displayName: 'Reggae Vibes',
    description: 'Island rhythms and reggae classics'
  },
  'Reggae_Mix': {
    color: '#27AE60',
    file: 'Playlist_Reggae_Mix.csv',
    displayName: 'Reggae Mix',
    description: 'Curated reggae selection'
  },
  'Reggaeton': {
    color: '#E74C3C',
    file: 'Playlist_Reggaeton.csv',
    displayName: 'Reggaeton',
    description: 'Latin urban reggaeton beats'
  },
  'Rock': { 
    color: '#45B7D1', 
    file: 'Playlist_Rock.csv',
    displayName: 'Rock Collection',
    description: 'Classic and modern rock anthems'
  },
  'Rock_-_Pop_-_AC': { 
    color: '#4ECDC4', 
    file: 'Playlist_Rock_-_Pop_-_AC.csv',
    displayName: 'Rock / Pop / AC',
    description: 'Rock, Pop, and Adult Contemporary hits'
  },
  'Rock_Dance_Mixes': {
    color: '#3498DB',
    file: 'Playlist_Rock-Dance_Mixes.csv',
    displayName: 'Rock Dance Mixes',
    description: 'Rock tracks with dance beats'
  },
  'Steppers': {
    color: '#8E44AD',
    file: 'Playlist_Steppers.csv',
    displayName: 'Steppers',
    description: 'Smooth stepping music'
  },
  'Sweet16': {
    color: '#E91E63',
    file: 'Playlist_Sweet16_Playlist.csv',
    displayName: 'Sweet 16 Playlist',
    description: 'Perfect for sweet sixteen celebrations'
  },
  'Ted_Smooth_Remixes': {
    color: '#FF5722',
    file: 'Playlist_Ted_Smooth_Remixes.csv',
    displayName: 'Ted Smooth Remixes',
    description: 'Smooth remix collection'
  },
  'Top_100_Dance': {
    color: '#FF9800',
    file: 'Playlist_Top_100_Dance_Mix.csv',
    displayName: 'Top 100 Dance Mix',
    description: 'Top dance floor fillers'
  },
  'Top_250_Hip_Hop': {
    color: '#795548',
    file: 'Playlist_Top_250_of_the_Greatest_Hip-Hop_and_Rap_Songs.csv',
    displayName: 'Top 250 Hip Hop',
    description: 'The greatest hip hop tracks of all time'
  },
  'Transition_Mixes': {
    color: '#9C27B0',
    file: 'Playlist_Transition_Mixes.csv',
    displayName: 'Transition Mixes',
    description: 'Smooth transitions between songs'
  },
  'Ultimate_Rock_Ballads': {
    color: '#607D8B',
    file: 'Playlist_Ultimate_Rock_Ballads.csv',
    displayName: 'Ultimate Rock Ballads',
    description: 'Epic rock ballads and power songs'
  },
  'Urban': { 
    color: '#CD853F', 
    file: 'Playlist_Urban.csv',
    displayName: 'Urban Hits',
    description: 'The best in urban and contemporary R&B'
  }
};

// Genre mapping for easier access - sorted alphabetically
export const GENRES = {
  'christmas': { 
    color: '#F1948A', 
    file: 'Genre_Christmas.csv',
    displayName: 'Christmas',
    description: 'Holiday and Christmas music'
  },
  'classic-80s': { 
    color: '#F7DC6F', 
    file: "Genre_Classic_80's_Music.csv",
    displayName: "Classic 80s Music",
    description: 'Hits from the 1980s'
  },
  'latin': { 
    color: '#FF5722', 
    file: 'Genre_Latin.csv',
    displayName: 'Latin',
    description: 'Latin music and Spanish favorites'
  },
  'pop': { 
    color: '#98D8C8', 
    file: 'Genre_Pop.csv',
    displayName: 'Pop',
    description: 'Popular music hits'
  },
  'rnb': { 
    color: '#DDA0DD', 
    file: 'Genre_R&B.csv',
    displayName: 'R&B',
    description: 'Rhythm and Blues'
  },
  'rap-hiphop': { 
    color: '#FFEAA7', 
    file: 'Genre_Rap_&_Hip-Hop.csv',
    displayName: 'Rap & Hip-Hop',
    description: 'Hip-hop and rap music'
  },
  'reggae': { 
    color: '#96CEB4', 
    file: 'Genre_Reggae.csv',
    displayName: 'Reggae',
    description: 'Reggae and island music'
  },
  'rock': { 
    color: '#45B7D1', 
    file: 'Genre_Rock.csv',
    displayName: 'Rock',
    description: 'Classic and modern rock music'
  },
  'rock-pop-ac': { 
    color: '#4ECDC4', 
    file: 'Genre_Rock_-_Pop_-_AC.csv',
    displayName: 'Rock / Pop / AC',
    description: 'Rock, Pop, and Adult Contemporary'
  },
  'urban': { 
    color: '#CD853F', 
    file: 'Genre_Urban.csv',
    displayName: 'Urban',
    description: 'Contemporary urban and R&B music'
  }
};

// Sample data structure - will be replaced with actual CSV data
export const SAMPLE_SONGS = [
  {
    id: 1,
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    genre: "pop",
    duration: "3:20",
    year: 2019
  },
  {
    id: 2,
    title: "God's Plan",
    artist: "Drake",
    genre: "rap-hiphop",
    duration: "3:19",
    year: 2018
  },
  // More sample data will be added when CSV files are processed
];

// Parse CSV data with proper handling of quoted values and iTunes format
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];
  
  // Skip header line - iTunes format: Track ID,Name,Artist,Album,Genre,Date Added,Play Count,Location
  const dataLines = lines.slice(1);
  const songs = [];
  
  for (const line of dataLines) {
    if (!line.trim()) continue;
    
    // Parse CSV line handling quoted values
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add the last value
    
    // iTunes CSV format: Track ID,Name,Artist,Album,Genre,Date Added,Play Count,Location
    if (values.length >= 4) {
      const song = {
        id: values[0] || '',
        title: values[1] || 'Unknown Title',
        artist: values[2] || 'Unknown Artist',
        album: values[3] || 'Unknown Album',
        genre: values[4] || '',
        dateAdded: values[5] || '',
        playCount: parseInt(values[6]) || 0,
        location: values[7] || ''
      };
      
      // Only add songs with valid title and artist
      if (song.title && song.title !== 'Unknown Title' && 
          song.artist && song.artist !== 'Unknown Artist') {
        songs.push(song);
      }
    }
  }
  
  console.log(`Parsed ${songs.length} songs from CSV`);
  return songs;
}

// Load songs from a specific genre CSV file
export async function loadGenreSongs(genreKey) {
  const genre = GENRES[genreKey];
  if (!genre) {
    console.error(`Genre ${genreKey} not found`);
    return [];
  }
  
  try {
    console.log(`Loading songs from ${genre.file}`);
    const response = await fetch(`/data/${genre.file}`);
    
    if (!response.ok) {
      console.error(`Failed to load ${genre.file}: ${response.status}`);
      return [];
    }
    
    const csvText = await response.text();
    const songs = parseCSV(csvText);
    
    console.log(`Loaded ${songs.length} songs from ${genre.displayName}`);
    return songs;
  } catch (error) {
    console.error(`Error loading ${genre.file}:`, error);
    return [];
  }
}

// Load songs from a specific playlist CSV file
export async function loadPlaylistSongs(playlistKey) {
  const playlist = PLAYLISTS[playlistKey];
  if (!playlist) {
    console.error(`Playlist ${playlistKey} not found`);
    return [];
  }
  
  try {
    console.log(`Loading songs from ${playlist.file}`);
    const response = await fetch(`/data/${playlist.file}`);
    
    if (!response.ok) {
      console.error(`Failed to load ${playlist.file}: ${response.status}`);
      return [];
    }
    
    const csvText = await response.text();
    const songs = parseCSV(csvText);
    
    console.log(`Loaded ${songs.length} songs from ${playlist.displayName}`);
    return songs;
  } catch (error) {
    console.error(`Error loading ${playlist.file}:`, error);
    return [];
  }
}

// Load all songs from all genres
export async function loadAllSongs() {
  const allSongs = [];
  const seenTrackIds = new Set(); // Track IDs we've already seen
  const genreKeys = Object.keys(GENRES);
  let duplicateCount = 0;
  
  console.log(`Loading songs from ${genreKeys.length} genres...`);
  
  for (const genreKey of genreKeys) {
    const songs = await loadGenreSongs(genreKey);
    // Add genre information to each song and deduplicate
    const songsWithGenre = songs
      .map(song => ({
        ...song,
        genreKey,
        genreDisplay: GENRES[genreKey]?.displayName || genreKey || 'Music'
      }))
      .filter(song => {
        // Only include songs we haven't seen before
        if (seenTrackIds.has(song.id)) {
          duplicateCount++;
          return false;
        }
        seenTrackIds.add(song.id);
        return true;
      });
    allSongs.push(...songsWithGenre);
  }
  
  console.log(`Total songs loaded: ${allSongs.length} (deduplicated)`);
  if (duplicateCount > 0) {
    console.log(`Removed ${duplicateCount} duplicate songs from genres`);
  }
  return allSongs;
}

// Load all songs from all playlists
export async function loadAllPlaylistSongs() {
  const allSongs = [];
  const seenTrackIds = new Set(); // Track IDs we've already seen
  const playlistKeys = Object.keys(PLAYLISTS);
  let duplicateCount = 0;
  
  console.log(`Loading songs from ${playlistKeys.length} playlists...`);
  
  for (const playlistKey of playlistKeys) {
    const songs = await loadPlaylistSongs(playlistKey);
    // Add playlist information to each song and deduplicate
    const songsWithPlaylist = songs
      .map(song => ({
        ...song,
        playlistKey,
        playlistDisplay: PLAYLISTS[playlistKey].displayName,
        genreKey: playlistKey, // For compatibility with existing filtering
        genreDisplay: PLAYLISTS[playlistKey].displayName
      }))
      .filter(song => {
        // Only include songs we haven't seen before
        if (seenTrackIds.has(song.id)) {
          duplicateCount++;
          return false;
        }
        seenTrackIds.add(song.id);
        return true;
      });
    allSongs.push(...songsWithPlaylist);
  }
  
  console.log(`Total playlist songs loaded: ${allSongs.length} (deduplicated)`);
  if (duplicateCount > 0) {
    console.log(`Removed ${duplicateCount} duplicate songs from playlists`);
  }
  return allSongs;
}

// Load songs based on mode (genres or playlists)
export async function loadSongsByMode(mode = 'genres') {
  if (mode === 'playlists') {
    return await loadAllPlaylistSongs();
  } else {
    return await loadAllSongs();
  }
}

// Search and filter functions
export function searchSongs(songs, searchTerm) {
  if (!searchTerm) return songs;
  
  const term = searchTerm.toLowerCase();
  return songs.filter(song => 
    song.title.toLowerCase().includes(term) ||
    song.artist.toLowerCase().includes(term) ||
    song.album.toLowerCase().includes(term)
  );
}

export function filterByGenre(songs, genreKey) {
  if (!genreKey || genreKey === 'all') return songs;
  return songs.filter(song => song.genreKey === genreKey);
}

export function sortSongs(songs, sortBy, sortDirection = 'desc') {
  const sorted = [...songs];
  
  switch (sortBy) {
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'artist':
      return sorted.sort((a, b) => a.artist.localeCompare(b.artist));
    case 'album':
      return sorted.sort((a, b) => a.album.localeCompare(b.album));

    case 'dateAdded':
      return sorted.sort((a, b) => {
        // Parse dates and sort based on direction
        const dateA = new Date(a.dateAdded || '1970-01-01');
        const dateB = new Date(b.dateAdded || '1970-01-01');
        
        if (sortDirection === 'asc') {
          // Ascending: oldest first (first songs added)
          return dateA - dateB;
        } else {
          // Descending: newest first (last songs added)
          return dateB - dateA;
        }
      });
    default:
      return sorted;
  }
}