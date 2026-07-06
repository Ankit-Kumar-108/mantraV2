'use client';

import React from 'react';
import { Play, Pause, Heart, Sparkles, Plus, Check } from 'lucide-react';
import { Track, Playlist, Artist } from '../data/musicData';

interface HomeDiscoverProps {
  tracks: Track[];
  playlists: Playlist[];
  artists: Artist[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, trackList?: Track[]) => void;
  likedTracks: string[];
  onToggleLike: (trackId: string) => void;
  onViewPlaylist: (playlistId: string) => void;
  onViewArtist: (artistId: string) => void;
}

export default function HomeDiscover({
  tracks,
  playlists,
  artists,
  currentTrack,
  isPlaying,
  onPlayTrack,
  likedTracks,
  onToggleLike,
  onViewPlaylist,
  onViewArtist,
}: HomeDiscoverProps) {
  // Let's feature the "Synth Odyssey" album in the hero banner

  const heroAlbum = playlists.find(p => p.type === 'album') || playlists[0] || null;
  const heroTrack = tracks[0] || null;

  const handleHeroPlay = () => {
    if (!heroTrack) return;
    if (heroAlbum) {
      onPlayTrack(heroTrack, heroAlbum.tracks);
    } else {
      onPlayTrack(heroTrack);
    }
  };

  const isHeroTrackPlaying = heroTrack && currentTrack?.id === heroTrack.id && isPlaying;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 select-none">
      {/* Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-glow bg-gradient-to-r from-white to-[var(--text-secondary)] bg-clip-text text-transparent">
            Welcome to AURA
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1">
            Discover the soundscapes curated for your mood.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-[var(--glass-border)] px-4 py-1.5 rounded-full text-[10px] md:text-xs font-semibold text-[var(--accent-color)] text-glow self-start sm:self-auto flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Release Radar Active</span>
        </div>
      </div>

      {/* Hero Section: New Release Banner */}
      <div className="relative min-h-[280px] md:h-80 rounded-[12px] overflow-hidden mb-8 md:mb-10 shadow-2xl border border-[var(--glass-border)] flex flex-col justify-end">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&h=450&fit=crop" 
            alt="Hero Banner" 
            className="w-full h-full object-cover opacity-35 filter blur-xs"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-black/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col p-6 md:p-12 md:max-w-2xl">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[var(--accent-color)] text-glow mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[var(--accent-color)] rounded-full animate-ping" />
            New Release
          </span>
          <h2 className="text-2xl md:text-5xl font-extrabold tracking-tight mb-2 md:mb-3 text-glow">
            {heroTrack ? heroTrack.album : "Welcome to AURA"}
          </h2>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mb-4 md:mb-6 line-clamp-2 md:line-clamp-3">
            {heroTrack ? (
              <>
                Experience the latest masterpiece from <span className="text-white hover:underline cursor-pointer" onClick={() => onViewArtist(heroTrack.artistId)}>{heroTrack.artistName}</span>. A full-length synthesised odyssey traversing analog arpeggios and cybernetic wave modulations.
              </>
            ) : (
              "Get started by uploading your own audio tracks in the upload section to build your dynamic library."
            )}
          </p>

          {heroTrack && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleHeroPlay}
                className="flex items-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-black font-semibold text-xs md:text-sm px-4 md:px-6 py-2.5 md:py-3 rounded-full active-scale transition-all border-glow shadow-lg"
              >
                {isHeroTrackPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current text-black" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-black translate-x-[1px]" />
                    Play Odyssey
                  </>
                )}
              </button>
              {heroAlbum && (
                <button
                  onClick={() => onViewPlaylist(heroAlbum.id)}
                  className="bg-white/10 hover:bg-white/15 border border-[var(--glass-border)] text-white font-semibold text-xs md:text-sm px-4 md:px-6 py-2.5 md:py-3 rounded-full active-scale transition-colors"
                >
                  View Album
                </button>
              )}
            </div>
          )}
        </div>

        {/* Hero Album Cover Float */}
        {heroTrack && (
          <div className="absolute right-12 bottom-12 w-48 h-48 rounded-[8px] overflow-hidden shadow-2xl border border-white/10 hidden md:block group cursor-pointer" onClick={() => heroAlbum && onViewPlaylist(heroAlbum.id)}>
            <img 
              src={heroTrack.coverUrl} 
              alt="Album cover" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="w-12 h-12 text-[var(--accent-color)] fill-current" />
            </div>
          </div>
        )}
      </div>

      {/* Made For You - Playlists */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold tracking-tight text-glow">Made For You</h3>
          <span className="text-xs text-[var(--text-muted)] hover:underline cursor-pointer">Show All</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="glass-panel glass-panel-hover p-4 rounded-[12px] group cursor-pointer transition-all flex flex-col h-full"
              onClick={() => onViewPlaylist(playlist.id)}
            >
              <div className="relative w-full aspect-square rounded-[8px] overflow-hidden bg-zinc-800 mb-4 shadow-md">
                <img 
                  src={playlist.coverUrl} 
                  alt={playlist.name} 
                  className="w-full h-full object-cover"
                />
                
                {/* Floating Play Overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayTrack(playlist.tracks[0], playlist.tracks);
                  }}
                  className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl active-scale hover:scale-105 border-glow"
                >
                  <Play className="w-4.5 h-4.5 text-black fill-current translate-x-[1px]" />
                </button>
              </div>

              <span className="font-bold text-sm truncate text-glow block">
                {playlist.name}
              </span>
              <span className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1 flex-1">
                {playlist.description}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Discover Tracks / Popular Audio */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold tracking-tight text-glow">Popular Tracks</h3>
          <span className="text-xs text-[var(--text-muted)] hover:underline cursor-pointer">View Charts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.slice(0, 6).map((track, idx) => {
            const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
            const isLiked = likedTracks.includes(track.id);

            return (
              <div
                key={track.id}
                className={`flex items-center justify-between p-3 rounded-[8px] hover:bg-white/5 border border-transparent transition-all group cursor-pointer ${
                  currentTrack?.id === track.id ? 'bg-white/5 border-[var(--glass-border)]' : ''
                }`}
                onClick={() => onPlayTrack(track, tracks)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-sm font-mono text-[var(--text-muted)] w-4 text-center">
                    {idx + 1}
                  </span>
                  <div className="relative w-12 h-12 rounded-[6px] overflow-hidden bg-zinc-800 flex-shrink-0 shadow-sm">
                    <img 
                      src={track.coverUrl} 
                      alt={track.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {isCurrentPlaying ? (
                        <Pause className="w-4 h-4 text-[var(--accent-color)] fill-current" />
                      ) : (
                        <Play className="w-4 h-4 text-[var(--accent-color)] fill-current translate-x-[0.5px]" />
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className={`text-sm font-semibold truncate block ${
                      currentTrack?.id === track.id ? 'text-[var(--accent-color)] text-glow font-bold' : ''
                    }`}>
                      {track.title}
                    </span>
                    <span 
                      className="text-xs text-[var(--text-secondary)] truncate block hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewArtist(track.artistId);
                      }}
                    >
                      {track.artistName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[var(--text-muted)] hidden md:block">
                    {track.plays.toLocaleString('en-US')} plays
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(track.id);
                    }}
                    className={`p-1.5 rounded-full hover:bg-white/5 active-scale transition-colors ${
                      isLiked ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-white opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  </button>

                  <span className="text-xs font-mono text-[var(--text-secondary)] w-8 text-right pr-1">
                    {track.duration}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
