'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Howl } from 'howler';
import { Track, Playlist, Artist, fetchTracksFromApi, fetchPlaylistsFromApi, fetchArtistFromApi } from './data/musicData';
import Sidebar from './components/Sidebar';
import PlayerShell from './components/PlayerShell';
import HomeDiscover from './components/HomeDiscover';
import SearchExplore from './components/SearchExplore';
import ArtistProfile from './components/ArtistProfile';
import PlaylistView from './components/PlaylistView';
import Visualizer from './components/Visualizer';
import { Volume2, Sparkles, Disc, Home, Search, User, ListMusic, Palette, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function page() {
  // Navigation View State
  const [activeView, setActiveView] = useState<'discover' | 'search' | 'artist' | 'playlist'>('discover');
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');

  // Audio Playback State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.6);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [trackQueue, setTrackQueue] = useState<Track[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [HowlConstructor, setHowlConstructor] = useState<any>(null);


useEffect(() => {
  if (typeof window !== 'undefined') {
    import('howler').then((mod) => {
      setHowlConstructor(() => mod.Howl);
    });
  }
}, []);

// Detect ?artist=id query parameter on page mount to load artist profile
useEffect(() => {
  if (typeof window !== 'undefined') {
    const searchParams = new URLSearchParams(window.location.search);
    const artistParam = searchParams.get('artist');
    if (artistParam) {
      setSelectedArtistId(artistParam);
      setActiveView('artist');
      
      // Clean up search parameters from the URL bar
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }
}, []);

useEffect(() => {
  async function loadData() {
    try {
      const [dbTracks, dbPlaylists, dbArtists] = await Promise.all([
        fetchTracksFromApi(),
        fetchPlaylistsFromApi(),
        fetchArtistFromApi(),
      ]);
      setTracks(dbTracks);
      setTrackQueue(dbTracks);
      setPlaylists(dbPlaylists);
      setArtists(dbArtists);

      if (dbArtists.length > 0) {
        setSelectedArtistId(dbArtists[0].id);
      }
      if (dbPlaylists.length > 0) {
        setSelectedPlaylistId(dbPlaylists[0].id);
      }
    } catch (err) {
      console.error("Failed to load data from database:", err);
    } finally {
      setLoading(false);
    }
  }
  loadData();
}, []);

  // User Library State
  const [likedTracks, setLikedTracks] = useState<string[]>(['track-1', 'track-5']);
  const [recentSearches, setRecentSearches] = useState<string[]>(['Synth Odyssey', 'Midnight Chill']);

  // Theme Vibe State
  const [theme, setTheme] = useState<'sonic-deep' | 'electric-pulse' | 'pure-minimalist' | 'retro-futurist'>('sonic-deep');

  // Ref to the Howler instance
  const howlRef = useRef<Howl | null>(null);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('aura-theme') as any;
    if (savedTheme && ['sonic-deep', 'electric-pulse', 'pure-minimalist', 'retro-futurist'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply Theme Attribute to HTML Element & Save to LocalStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura-theme', theme);
  }, [theme]);

  // Handle Audio Source & Playback Changes
  useEffect(() => {
  if (!HowlConstructor || !currentTrack) {
    if (howlRef.current) {
      howlRef.current.unload();
      howlRef.current = null;
    }
    return;
  }

  if (howlRef.current) {
    howlRef.current.unload();
  }

  const sound = new HowlConstructor({
    src: [currentTrack.audioUrl],
    html5: true, // Required to stream larger files and bypass potential CORS issues
    volume: volume,
    onplay: () => setIsPlaying(true),
    onpause: () => setIsPlaying(false),
    onstop: () => {
      setIsPlaying(false);
      setCurrentTime(0);
    },
    onend: () => {
      handleSkipNext();
    },
    onload: () => {
      setDuration(sound.duration());
    }
  });

  howlRef.current = sound;

  if (isPlaying) {
    sound.play();
  }

  return () => {
    if (howlRef.current) {
      howlRef.current.unload();
    }
  };
}, [currentTrack, HowlConstructor]);


  // Toggle Play Pause
  const handlePlayPause = () => {
    if (!currentTrack && tracks.length > 0) {
      handlePlayTrack(tracks[0]);
      return;
    }
    
    const audio = howlRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  // Sync Volume
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(volume);
    }
  }, [volume]);

  // Play Specific Track and Set Queue
  const handlePlayTrack = (track: Track, customQueue?: Track[]) => {
    if (customQueue && customQueue.length > 0) {
      setTrackQueue(customQueue);
    } else if (trackQueue.length === 0 || !trackQueue.find(t => t.id === track.id)) {
      setTrackQueue(tracks);
    }
    
    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  // Skip Forward
  const handleSkipNext = () => {
    if (!currentTrack || trackQueue.length === 0) return;

    if (repeat === 'one') {
      if (howlRef.current) {
        howlRef.current.seek(0);
        howlRef.current.play();
        setCurrentTime(0);
      }
      return;
    }

    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * trackQueue.length);
      handlePlayTrack(trackQueue[randomIndex]);
      return;
    }

    const currentIndex = trackQueue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex === -1) {
      handlePlayTrack(trackQueue[0]);
    } else if (currentIndex === trackQueue.length - 1) {
      // End of playlist
      if (repeat === 'all') {
        handlePlayTrack(trackQueue[0]);
      } else {
        // Stop playing
        setIsPlaying(false);
        if (howlRef.current) {
          howlRef.current.stop();
        }
        setCurrentTime(0);
      }
    } else {
      handlePlayTrack(trackQueue[currentIndex + 1]);
    }
  };

  // Skip Backward
  const handleSkipPrevious = () => {
    if (!currentTrack || trackQueue.length === 0) return;

    if (currentTime > 4) {
      // Restart track
      if (howlRef.current) {
        howlRef.current.seek(0);
      }
      setCurrentTime(0);
      return;
    }

    const currentIndex = trackQueue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex === -1 || currentIndex === 0) {
      // Loop back to end or restart first track
      if (repeat === 'all') {
        handlePlayTrack(trackQueue[trackQueue.length - 1]);
      } else {
        handlePlayTrack(trackQueue[0]);
      }
    } else {
      handlePlayTrack(trackQueue[currentIndex - 1]);
    }
  };

  // Poll currentTime while playing
  useEffect(() => {
    let animationFrameId: number;

    const updateProgress = () => {
      if (howlRef.current && isPlaying) {
        const currentPos = howlRef.current.seek() as number;
        if (typeof currentPos === 'number') {
          setCurrentTime(currentPos);
        }
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(updateProgress);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, currentTrack]);

  // Scrub Timeline
  const handleScrub = (time: number) => {
    if (howlRef.current) {
      howlRef.current.seek(time);
      setCurrentTime(time);
    }
  };

  // Toggle Heart Like
  const handleToggleLike = (trackId: string) => {
    setLikedTracks((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  };

  // Search History Management
  const handleAddSearch = (query: string) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q !== query);
      return [query, ...filtered].slice(0, 6); // Keep top 6 unique searches
    });
  };

  const handleClearHistory = () => {
    setRecentSearches([]);
  };

  // Toggle Shuffle
  const handleToggleShuffle = () => {
    setShuffle(!shuffle);
  };

  // Toggle Repeat
  const handleToggleRepeat = () => {
    setRepeat((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  // Helper selectors
  const handleViewPlaylist = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    setActiveView('playlist');
  };

  const handleViewArtist = (artistId: string) => {
    setSelectedArtistId(artistId);
    setActiveView('artist');
  };

  return (
    <div className="flex flex-col h-screen h-dvh w-screen overflow-hidden bg-[var(--bg-color)] text-[var(--text-primary)]">
      {/* Howler.js is initialized dynamically and does not require a React audio element */}

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden w-full">
        {/* Persistent Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          selectedPlaylistId={selectedPlaylistId}
          setSelectedPlaylistId={setSelectedPlaylistId}
          selectedArtistId={selectedArtistId}
          setSelectedArtistId={setSelectedArtistId}
          theme={theme}
          setTheme={setTheme}
          likedTracksCount={likedTracks.length}
          playlists={playlists}
          artists={artists}
        />

        {/* Dynamic Display Panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black/10">
          
          {/* Custom Glassmorphic Header Bar with embedded Audio Visualizer */}
          <header className="h-16 md:h-20 w-full glass-panel border-b border-[var(--glass-border)] flex items-center justify-between px-4 md:px-8 py-2 z-10 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <Disc className={`w-5 h-5 text-[var(--accent-color)] flex-shrink-0 ${isPlaying ? 'animate-spin-slow' : ''}`} />
              <span className="text-xs md:text-sm font-bold tracking-widest text-[var(--text-secondary)] uppercase truncate">
                {activeView === 'discover' && 'Home & Discover'}
                {activeView === 'search' && 'Explore Soundscapes'}
                {activeView === 'artist' && `Artist – ${artists.find(a => a.id === selectedArtistId)?.name || 'Profile'}`}
                {activeView === 'playlist' && `Playlist – ${playlists.find(p => p.id === selectedPlaylistId)?.name || 'Playlist'}`}
              </span>
              <button onClick={() => signOut({callbackUrl: '/'})} className='size-12 flex justify-center items-center bg-red-500 rounded-full cursor-pointer'>
                <LogOut className='w-5 h-5 flex-shrink-0' />
              </button>
            </div>

            {/* Visualizer inside Header (Desktop/Tablet only) */}
            <div className="hidden sm:flex w-40 md:w-64 h-10 border border-[var(--glass-border)] rounded-[8px] bg-black/30 overflow-hidden items-end p-1">
              <Visualizer audioRef={howlRef} isPlaying={isPlaying} theme={theme} />
            </div>

            {/* Mobile Vibe Toggler */}
            <div className="flex md:hidden items-center">
              <button 
                onClick={() => {
                  const themeOrder: ('sonic-deep' | 'electric-pulse' | 'pure-minimalist' | 'retro-futurist')[] = ['sonic-deep', 'electric-pulse', 'pure-minimalist', 'retro-futurist'];
                  const nextIdx = (themeOrder.indexOf(theme) + 1) % themeOrder.length;
                  setTheme(themeOrder[nextIdx]);
                }}
                className="w-9 h-9 rounded-full bg-white/5 border border-[var(--glass-border)] flex items-center justify-center text-[var(--accent-color)] active-scale shadow-sm"
                title="Change Theme Vibe"
              >
                <Palette className="w-4.5 h-4.5" />
              </button>
            </div>
          </header>

          {/* Dynamic Component Switching */}
          {activeView === 'discover' && (
            <HomeDiscover
              tracks={tracks}
              playlists={playlists}
              artists={artists}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              likedTracks={likedTracks}
              onToggleLike={handleToggleLike}
              onViewPlaylist={handleViewPlaylist}
              onViewArtist={handleViewArtist}
            />
          )}

          {activeView === 'search' && (
            <SearchExplore
              tracks={tracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              likedTracks={likedTracks}
              onToggleLike={handleToggleLike}
              recentSearches={recentSearches}
              onAddSearch={handleAddSearch}
              onClearHistory={handleClearHistory}
              onViewArtist={handleViewArtist}
            />
          )}

          {activeView === 'artist' && (
            <ArtistProfile
              artistId={selectedArtistId}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              likedTracks={likedTracks}
              onToggleLike={handleToggleLike}
              onViewPlaylist={handleViewPlaylist}
            />
          )}

          {activeView === 'playlist' && (
            <PlaylistView
              playlistId={selectedPlaylistId}
              playlists={playlists}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              likedTracks={likedTracks}
              onToggleLike={handleToggleLike}
              shuffle={shuffle}
              onToggleShuffle={handleToggleShuffle}
              onViewArtist={handleViewArtist}
            />
          )}

          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden h-16 w-full glass-panel border-t border-[var(--glass-border)] flex items-center justify-around px-2 z-10 flex-shrink-0">
            <button
              onClick={() => setActiveView('discover')}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all active-scale ${
                activeView === 'discover' ? 'text-[var(--accent-color)] text-glow' : 'text-[var(--text-secondary)]'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-medium font-sans">Discover</span>
            </button>
            <button
              onClick={() => setActiveView('search')}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all active-scale ${
                activeView === 'search' ? 'text-[var(--accent-color)] text-glow' : 'text-[var(--text-secondary)]'
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="text-[10px] font-medium font-sans">Search</span>
            </button>
            <button
              onClick={() => handleViewArtist(selectedArtistId || (artists[0]?.id || ''))}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all active-scale ${
                activeView === 'artist' ? 'text-[var(--accent-color)] text-glow' : 'text-[var(--text-secondary)]'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium font-sans">Artist</span>
            </button>
            <button
              onClick={() => handleViewPlaylist(selectedPlaylistId || (playlists[0]?.id || ''))}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all active-scale ${
                activeView === 'playlist' ? 'text-[var(--accent-color)] text-glow' : 'text-[var(--text-secondary)]'
              }`}
            >
              <ListMusic className="w-5 h-5" />
              <span className="text-[10px] font-medium font-sans">Playlist</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Persistent Audio Control Footer Shell */}
      <PlayerShell
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onSkipNext={handleSkipNext}
        onSkipPrevious={handleSkipPrevious}
        currentTime={currentTime}
        duration={duration}
        onScrub={handleScrub}
        volume={volume}
        onVolumeChange={setVolume}
        isLiked={currentTrack ? likedTracks.includes(currentTrack.id) : false}
        onToggleLike={() => currentTrack && handleToggleLike(currentTrack.id)}
        shuffle={shuffle}
        onToggleShuffle={handleToggleShuffle}
        repeat={repeat}
        onToggleRepeat={handleToggleRepeat}
        onViewPlaylist={() => currentTrack && handleViewPlaylist(playlists.find(p => p.tracks.some(t => t.id === currentTrack.id))?.id || '')}
      />
    </div>
  );
}
