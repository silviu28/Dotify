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
  artist: string;
};

interface DeezerGoodResponse {
  id: number;
  name: string;
  link: string;
  share: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  nb_album: number;
  nb_fan: number;
  radio: boolean;
  tracklist: string;
  type: "artist";
}

interface DeezerBadResponse {
  type: string;
  message: string;
  code: number;
}

export type DeezerResponse = DeezerGoodResponse | DeezerBadResponse;

export interface Prefs {
  username?: string;
  favoriteSongs?: Song[];
  favoriteAlbums?: Album[];
  favoriteArtists?: string[];
}

export interface Artist {
  id: number;
  name: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  type: "artist";
}