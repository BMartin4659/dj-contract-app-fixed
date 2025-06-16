import { playlistIcons } from '../utils/playlistIcons';
import { getPlaylistIconType } from '../utils/iconMap';

export function usePlaylistIcon(playlistName) {
  const iconType = getPlaylistIconType(playlistName);
  const svgIcon = playlistIcons[iconType];
  
  return {
    iconType,
    svgIcon
  };
} 