'use client';

import React from 'react';
import { 
  Home, 
  Search, 
  User, 
  ListMusic, 
  Heart, 
  Palette, 
  Volume2, 
  Disc,
  Verified
} from 'lucide-react';
import { PLAYLISTS, ARTISTS, Playlist } from '../data/musicData';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: 'discover' | 'search' | 'artist' | 'playlist') => void;
  selectedPlaylistId: string | null;
  setSelectedPlaylistId: (id: string) => void;
  selectedArtistId: string | null;
  setSelectedArtistId: (id: string) => void;
  theme: string;
  setTheme: (theme: 'sonic-deep' | 'electric-pulse' | 'pure-minimalist' | 'retro-futurist') => void;
  likedTracksCount: number;
}

export default function Sidebar({
  activeView,
  setActiveView,
  selectedPlaylistId,
  setSelectedPlaylistId,
  selectedArtistId,
  setSelectedArtistId,
  theme,
  setTheme,
  likedTracksCount,
}: SidebarProps) {

  const handlePlaylistClick = (id: string) => {
    setSelectedPlaylistId(id);
    setActiveView('playlist');
  };

  const handleArtistClick = (id: string) => {
    setSelectedArtistId(id);
    setActiveView('artist');
  };

  const themes: { id: 'sonic-deep' | 'electric-pulse' | 'pure-minimalist' | 'retro-futurist'; name: string; color: string }[] = [
    { id: 'sonic-deep', name: 'Sonic Deep', color: 'bg-[#1db954]' },
    { id: 'electric-pulse', name: 'Electric Pulse', color: 'bg-[#d946ef]' },
    { id: 'pure-minimalist', name: 'Pure Minimalist', color: 'bg-white border border-zinc-700' },
    { id: 'retro-futurist', name: 'Retro Futurist', color: 'bg-[#00f0ff]' },
  ];

  return (
    <aside className="hidden md:flex w-64 h-full flex-col glass-panel border-r border-[var(--glass-border)] z-20 select-none">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-[var(--glass-border)]">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--accent-color)] to-purple-600 flex items-center justify-center shadow-lg active-scale">
          <Disc className="w-5 h-5 text-black animate-spin-slow" />
        </div>
        <span className="text-xl font-bold tracking-wider text-glow bg-gradient-to-r from-white via-[var(--text-primary)] to-[var(--accent-color)] bg-clip-text text-transparent">
          AURA
        </span>
      </div>

      {/* Primary Navigation */}
      <nav className="p-4 flex flex-col gap-1.5">
        <button
          onClick={() => setActiveView('discover')}
          className={`flex items-center gap-3 px-4 py-3 rounded-[8px] text-sm font-medium transition-all active-scale ${
            activeView === 'discover'
              ? 'bg-[var(--panel-bg-hover)] text-[var(--accent-color)] border-l-2 border-[var(--accent-color)] shadow-md'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
          }`}
        >
          <Home className="w-4 h-4" />
          Discover
        </button>

        <button
          onClick={() => setActiveView('search')}
          className={`flex items-center gap-3 px-4 py-3 rounded-[8px] text-sm font-medium transition-all active-scale ${
            activeView === 'search'
              ? 'bg-[var(--panel-bg-hover)] text-[var(--accent-color)] border-l-2 border-[var(--accent-color)] shadow-md'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
          }`}
        >
          <Search className="w-4 h-4" />
          Search & Explore
        </button>

        <button
          onClick={() => handleArtistClick(selectedArtistId || ARTISTS[0].id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-[8px] text-sm font-medium transition-all active-scale ${
            activeView === 'artist'
              ? 'bg-[var(--panel-bg-hover)] text-[var(--accent-color)] border-l-2 border-[var(--accent-color)] shadow-md'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />
          Artist Profile
        </button>

        <button
          onClick={() => handlePlaylistClick(selectedPlaylistId || PLAYLISTS[0].id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-[8px] text-sm font-medium transition-all active-scale ${
            activeView === 'playlist'
              ? 'bg-[var(--panel-bg-hover)] text-[var(--accent-color)] border-l-2 border-[var(--accent-color)] shadow-md'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
          }`}
        >
          <ListMusic className="w-4 h-4" />
          Current Playlist
        </button>
      </nav>

      {/* Playlists & Library */}
      <div className="flex-1 px-4 overflow-y-auto mt-2">
        <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
          <span>Your Library</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-current opacity-70" />
        </div>
        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-center justify-between px-4 py-2.5 rounded-[8px] text-sm text-[var(--text-secondary)] hover:text-white hover:bg-white/5 cursor-pointer transition-all">
            <span className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              Liked Songs
            </span>
            <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full text-[var(--text-secondary)] font-mono">
              {likedTracksCount}
            </span>
          </div>
        </div>

        <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          <span>Featured Playlists</span>
        </div>
        <div className="flex flex-col gap-1 pb-4">
          {PLAYLISTS.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => handlePlaylistClick(playlist.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-left text-sm font-medium transition-all truncate w-full hover:bg-white/5 ${
                activeView === 'playlist' && selectedPlaylistId === playlist.id
                  ? 'text-[var(--accent-color)] bg-[var(--panel-bg-hover)] font-semibold shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <div className="w-5 h-5 rounded-[4px] overflow-hidden flex-shrink-0 bg-zinc-800">
                <img 
                  src={playlist.coverUrl} 
                  alt={playlist.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="truncate">{playlist.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Control Area */}
      <div className="p-4 border-t border-[var(--glass-border)] bg-black/20">
        <div className="flex items-center gap-2 px-2 pb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          <Palette className="w-3.5 h-3.5" />
          <span>Select Vibe</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              title={t.name}
              className={`h-8 rounded-[8px] active-scale flex items-center justify-center transition-all ${t.color} ${
                theme === t.id 
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105 shadow-lg' 
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
            >
              {theme === t.id && (
                <div className={`w-2 h-2 rounded-full ${t.id === 'pure-minimalist' ? 'bg-black' : 'bg-white'}`} />
              )}
            </button>
          ))}
        </div>
        <div className="mt-3 text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] block text-glow">
            {theme.replace('-', ' ')}
          </span>
        </div>
      </div>
    </aside>
  );
}
