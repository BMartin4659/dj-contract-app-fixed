export function getPlaylistIconType(name) {
  const lower = name.toLowerCase();
  if (lower.includes('summer')) return 'sun';
  if (lower.includes('july')) return 'fireworks';
  if (lower.includes('80s club')) return 'disco_ball';
  if (lower.includes("hip hop") || lower.includes("r&b")) return 'boombox';
  if (lower.includes('christmas')) return 'christmas_tree';
  if (lower.includes('classic 60s')) return 'microphone';
  if (lower.includes('classic 50s')) return 'turntable';
  if (lower.includes('classic 70s')) return 'turntable';
  if (lower.includes('classic hip-hop')) return 'turntable';
  if (lower.includes('classic soul')) return 'music_note';
  if (lower.includes('country')) return 'country';
  if (lower.includes('dance')) return 'headphones';
  if (lower === 'disco') return 'disco_ball_simple';
  if (lower.includes('disco hits')) return 'disco_sparkle';
  if (lower.includes('star')) return 'star';
  // fallback
  return 'music_note';
} 