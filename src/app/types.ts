export interface Track {
  id: string;
  name: string;
  artist: string;
  playedAt: string;
  plays: number;
  albumArt?: string;
  durationMs?: number;
  isPlaying?: boolean;
}
