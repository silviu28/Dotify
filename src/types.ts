// use this type whenever using buffers to avoid confusion
export type base64 = string;

export interface Song {
  filename: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  size: number;
  bitrate: number;
  genre: string;
  sampleRate: number;
  year: number;
  albumArt?: base64;
  deezer_artist_id?: number;
};

export interface Album {
  coverArt?: base64;
  name?: string;
  songs: Song[];
};