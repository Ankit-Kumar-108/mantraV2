// Add this to app/data/musicData.ts
export async function fetchTracksFromApi(): Promise<Track[]> {
  try {
    const res = await fetch("/api/tracks");
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch tracks");
    }

    // Convert API response schema (artist is an object) to match the Track interface
    return data.tracks.map((t: any) => ({
      id: t.id,
      title: t.title,
      artistId: t.artist.id,
      artistName: t.artist.name,
      album: t.album,
      coverUrl: t.coverUrl,
      audioUrl: t.audioUrl,
      duration: t.duration,
      durationSec: t.durationSec,
      genre: t.genre,
      mood: t.mood,
      plays: t.plays,
      dateAdded: t.dateAdded,
    }));
  } catch (error) {
    console.error("Error fetching tracks from API:", error);
    return [];
  }
}

export async function fetchArtistFromApi(): Promise<Artist[]>{
  try {
    const res = await fetch("/api/artists");
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch artists");
    }
    return data.artists;
  } catch (error) {
    console.error("Error fetching artists from API:", error);
    return [];
  }
}

export async function fetchPlaylistsFromApi(): Promise<Playlist[]> {
  try {
    const res = await fetch("/api/playlists");
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch playlists");
    }
    return data.playlists;
  } catch (error) {
    console.error("Error fetching playlists from API:", error);
    return [];
  }
}

export interface Track {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: string; // e.g. "6:12"
  durationSec: number; // e.g. 372
  genre: string;
  mood: string;
  plays: number;
  isLiked?: boolean;
  dateAdded: string;
}

export interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  bannerUrl: string;
  monthlyListeners: number;
  verified: boolean;
  bio: string;
  topTracks: Track[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  creator: string;
  tracks: Track[];
  type: 'playlist' | 'album';
  releaseYear?: number;
}

export const TRACKS: Track[] = [];
export const ARTISTS: Artist[] = [];
export const PLAYLISTS: Playlist[] = [];
