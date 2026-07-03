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

export const TRACKS: Track[] = [
  {
    id: "track-1",
    title: "Electric Dreams",
    artistId: "aether",
    artistName: "Aether Echo",
    album: "Synth Odyssey",
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "6:12",
    durationSec: 372,
    genre: "Synthwave",
    mood: "Energetic",
    plays: 1245000,
    dateAdded: "2026-06-15",
  },
  {
    id: "track-2",
    title: "Neon Horizon",
    artistId: "aether",
    artistName: "Aether Echo",
    album: "Synth Odyssey",
    coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&h=400&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "7:05",
    durationSec: 425,
    genre: "Synthwave",
    mood: "Chill",
    plays: 874000,
    dateAdded: "2026-06-15",
  },
  {
    id: "track-3",
    title: "Cyber Sunset",
    artistId: "vortex",
    artistName: "Vortex Theory",
    album: "Hyperdrive",
    coverUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&h=400&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "5:44",
    durationSec: 344,
    genre: "Cyberpunk",
    mood: "Energetic",
    plays: 532000,
    dateAdded: "2026-06-20",
  },
  {
    id: "track-4",
    title: "Digital Rain",
    artistId: "vortex",
    artistName: "Vortex Theory",
    album: "Hyperdrive",
    coverUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=400&h=400&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: "5:02",
    durationSec: 302,
    genre: "Cyberpunk",
    mood: "Focus",
    plays: 641000,
    dateAdded: "2026-06-20",
  },
  {
    id: "track-5",
    title: "Midnight Breeze",
    artistId: "lumina",
    artistName: "Lumina Sound",
    album: "Silent Glow",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&h=400&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    duration: "6:03",
    durationSec: 363,
    genre: "Lo-Fi",
    mood: "Chill",
    plays: 912000,
    dateAdded: "2026-06-10",
  },
  {
    id: "track-6",
    title: "Acoustic Silence",
    artistId: "lumina",
    artistName: "Lumina Sound",
    album: "Silent Glow",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&h=400&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    duration: "7:59",
    durationSec: 479,
    genre: "Acoustic",
    mood: "Sad",
    plays: 405000,
    dateAdded: "2026-06-10",
  },
  {
    id: "track-7",
    title: "Solar Eclipse",
    artistId: "aether",
    artistName: "Aether Echo",
    album: "Corona",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&h=400&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    duration: "7:38",
    durationSec: 458,
    genre: "Cinematic",
    mood: "Focus",
    plays: 312000,
    dateAdded: "2026-06-25",
  },
  {
    id: "track-8",
    title: "Velocity Shift",
    artistId: "vortex",
    artistName: "Vortex Theory",
    album: "Grid Runner",
    coverUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400&h=400&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    duration: "5:38",
    durationSec: 338,
    genre: "Cyberpunk",
    mood: "Energetic",
    plays: 289000,
    dateAdded: "2026-06-28",
  },
];

export const ARTISTS: Artist[] = [
  {
    id: "aether",
    name: "Aether Echo",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&h=300&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&h=400&fit=crop",
    monthlyListeners: 1420500,
    verified: true,
    bio: "Aether Echo is an electronic project born in the neon-soaked streets. Blending heavy analog synthesizers, modular arpeggios, and spatial soundscapes, they craft auditory journeys for midnight drives and focused deep dives.",
    topTracks: [TRACKS[0], TRACKS[1], TRACKS[6]]
  },
  {
    id: "lumina",
    name: "Lumina Sound",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&h=300&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=1200&h=400&fit=crop",
    monthlyListeners: 894300,
    verified: true,
    bio: "Lumina Sound explores the soft intersections of acoustic instrumentation and minimalist lo-fi electronics. Led by multi-instrumentalist Sarah Chen, their melodies offer solace, focus, and a warm embrace for the wandering mind.",
    topTracks: [TRACKS[4], TRACKS[5]]
  },
  {
    id: "vortex",
    name: "Vortex Theory",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&h=300&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&h=400&fit=crop",
    monthlyListeners: 231000,
    verified: false,
    bio: "Vortex Theory is a pseudonymous producer producing high-octane cyberpunk tracks. Their music features distorted basslines, digital glitches, and industrial syncopation designed to push listeners into hyper-focused states.",
    topTracks: [TRACKS[2], TRACKS[3], TRACKS[7]]
  }
];

export const PLAYLISTS: Playlist[] = [
  {
    id: "playlist-1",
    name: "Midnight Chill",
    description: "Deep, soothing soundscapes and slow beats to wind down your day. Handpicked for long nights.",
    coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&h=400&fit=crop",
    creator: "AURA Curator",
    tracks: [TRACKS[4], TRACKS[1], TRACKS[5]],
    type: "playlist"
  },
  {
    id: "playlist-2",
    name: "Cyberpunk Beats",
    description: "High-octane, neon-drenched industrial synthesis. Perfect for coding in dark mode or late night sprints.",
    coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&h=400&fit=crop",
    creator: "Vortex Theory",
    tracks: [TRACKS[2], TRACKS[3], TRACKS[7], TRACKS[0]],
    type: "playlist"
  },
  {
    id: "album-1",
    name: "Synth Odyssey",
    description: "The debut album from Aether Echo. An atmospheric tour through classic synthesizer waveforms.",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&h=400&fit=crop",
    creator: "Aether Echo",
    tracks: [TRACKS[0], TRACKS[1], TRACKS[6]],
    type: "album",
    releaseYear: 2025
  },
  {
    id: "album-2",
    name: "Silent Glow",
    description: "Warm, textured sounds combined with delicate acoustic strums. A cozy blanket of sound.",
    coverUrl: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=400&h=400&fit=crop",
    creator: "Lumina Sound",
    tracks: [TRACKS[4], TRACKS[5]],
    type: "album",
    releaseYear: 2026
  }
];
