'use client';

import React, { useState } from 'react';
import { Play, Pause, Heart, Award, Info, Disc, Users } from 'lucide-react';
import { ARTISTS, PLAYLISTS, TRACKS, Track, Playlist } from '../data/musicData';

interface ArtistProfileProps {
  artistId: string;
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, trackList?: Track[]) => void;
  likedTracks: string[];
  onToggleLike: (trackId: string) => void;
  onViewPlaylist: (playlistId: string) => void;
}

export default function ArtistProfile({
  artistId,
  currentTrack,
  isPlaying,
  onPlayTrack,
  likedTracks,
  onToggleLike,
  onViewPlaylist,
}: ArtistProfileProps) {
  const [activeTab, setActiveTab] = useState<'top' | 'albums' | 'about'>('top');

  const artist = ARTISTS.find(a => a.id === artistId) || ARTISTS[0];
  
  // Find albums for this artist
  const artistAlbums = PLAYLISTS.filter(
    p => p.type === 'album' && p.creator.toLowerCase() === artist.name.toLowerCase()
  );

  const handlePlayTopTracks = () => {
    if (artist.topTracks.length > 0) {
      onPlayTrack(artist.topTracks[0], artist.topTracks);
    }
  };

  const isAnyTrackPlaying = artist.topTracks.some(t => t.id === currentTrack?.id) && isPlaying;

  return (
    <div className="flex-1 overflow-y-auto select-none">
      {/* Full-bleed Hero Section */}
      <div className="relative h-80 md:h-96 w-full flex flex-col justify-end p-6 md:p-12 border-b border-[var(--glass-border)]">
        {/* Background Banner with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={artist.bannerUrl} 
            alt={artist.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-black/55 to-transparent" />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        {/* Artist Header Info */}
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end text-center md:text-left gap-4 md:gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl flex-shrink-0 bg-zinc-800">
            <img 
              src={artist.avatarUrl} 
              alt={artist.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            {artist.verified && (
              <span className="inline-flex items-center gap-1 bg-[var(--accent-color)]/10 border border-[var(--accent-color)] text-[var(--accent-color)] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-glow mb-2.5 md:mb-3">
                <Award className="w-3.5 h-3.5" />
                Verified Artist
              </span>
            )}
            <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight text-white mb-2 md:mb-3 text-shadow">
              {artist.name}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono text-[var(--text-secondary)]">
              <Users className="w-4 h-4 text-[var(--accent-color)]" />
              <span>{artist.monthlyListeners.toLocaleString('en-US')} monthly listeners</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Action Bar */}
      <div className="p-4 md:p-8 md:pb-4 pb-2 flex items-center justify-center md:justify-start gap-4">
        <button
          onClick={handlePlayTopTracks}
          className="flex items-center justify-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-black font-semibold text-xs md:text-sm px-6 md:px-8 py-3 md:py-3.5 rounded-full active-scale transition-all border-glow shadow-lg"
        >
          {isAnyTrackPlaying ? (
            <>
              <Pause className="w-4 h-4 md:w-4.5 md:h-4.5 fill-current text-black" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 md:w-4.5 md:h-4.5 fill-current text-black translate-x-[1px]" />
              Play Discography
            </>
          )}
        </button>
        <button
          className="bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] text-white font-semibold text-xs md:text-sm px-5 md:px-6 py-3 md:py-3.5 rounded-full active-scale transition-colors"
          onClick={() => setActiveTab(activeTab === 'about' ? 'top' : 'about')}
        >
          Artist Bio
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="px-4 md:px-8 border-b border-[var(--glass-border)] flex justify-center md:justify-start gap-6 text-sm font-semibold text-[var(--text-secondary)]">
        <button
          onClick={() => setActiveTab('top')}
          className={`py-3 transition-all relative ${
            activeTab === 'top' 
              ? 'text-[var(--accent-color)] font-bold text-glow' 
              : 'hover:text-white'
          }`}
        >
          Top Tracks
          {activeTab === 'top' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-color)] rounded-full text-glow" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('albums')}
          className={`py-3 transition-all relative ${
            activeTab === 'albums' 
              ? 'text-[var(--accent-color)] font-bold text-glow' 
              : 'hover:text-white'
          }`}
        >
          Popular Albums
          {activeTab === 'albums' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-color)] rounded-full text-glow" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`py-3 transition-all relative ${
            activeTab === 'about' 
              ? 'text-[var(--accent-color)] font-bold text-glow' 
              : 'hover:text-white'
          }`}
        >
          About
          {activeTab === 'about' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-color)] rounded-full text-glow" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 md:p-8">
        {activeTab === 'top' && (
          <div className="flex flex-col gap-1 max-w-3xl">
            {artist.topTracks.map((track, idx) => {
              const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
              const isLiked = likedTracks.includes(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track, artist.topTracks)}
                  className={`flex items-center justify-between p-2.5 md:p-3 rounded-[8px] hover:bg-white/5 border border-transparent transition-all group cursor-pointer ${
                    currentTrack?.id === track.id ? 'bg-white/5 border-[var(--glass-border)]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <span className="text-xs font-mono text-[var(--text-muted)] w-4 text-center">
                      {idx + 1}
                    </span>
                    <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-[6px] overflow-hidden bg-zinc-800 flex-shrink-0 shadow-sm">
                      <img 
                        src={track.coverUrl} 
                        alt={track.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {isCurrentPlaying ? (
                          <Pause className="w-3.5 h-3.5 text-[var(--accent-color)] fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-[var(--accent-color)] fill-current translate-x-[0.5px]" />
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className={`text-xs md:text-sm font-semibold truncate block ${
                        currentTrack?.id === track.id ? 'text-[var(--accent-color)] text-glow font-bold' : ''
                      }`}>
                        {track.title}
                      </span>
                      <span className="text-[10px] md:text-xs text-[var(--text-secondary)] truncate block mt-0.5">
                        {track.album}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                    <span className="text-xs font-mono text-[var(--text-muted)] hidden sm:block">
                      {track.plays.toLocaleString('en-US')} plays
                    </span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(track.id);
                      }}
                      className={`p-1.5 rounded-full hover:bg-white/5 active-scale transition-colors md:opacity-0 md:group-hover:opacity-100 ${
                        isLiked ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-white'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                    </button>

                    <span className="text-xs font-mono text-[var(--text-secondary)] w-8 text-right pr-1">
                      {track.duration}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'albums' && (
          <div>
            {artistAlbums.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {artistAlbums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => onViewPlaylist(album.id)}
                    className="glass-panel glass-panel-hover p-4 rounded-[12px] group cursor-pointer transition-all flex flex-col h-full"
                  >
                    <div className="relative w-full aspect-square rounded-[8px] overflow-hidden bg-zinc-800 mb-4 shadow-md">
                      <img 
                        src={album.coverUrl} 
                        alt={album.name} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayTrack(album.tracks[0], album.tracks);
                        }}
                        className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl active-scale hover:scale-105"
                      >
                        <Play className="w-4 h-4 text-black fill-current translate-x-[1px]" />
                      </button>
                    </div>
                    <span className="font-bold text-sm truncate text-glow block">{album.name}</span>
                    <span className="text-xs text-[var(--text-secondary)] mt-1">{album.releaseYear} • Album</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-[var(--text-secondary)] max-w-sm">
                <Disc className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
                <p className="text-sm">No albums available for this artist at this time.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="glass-panel p-6 rounded-[12px] max-w-2xl border border-[var(--glass-border)]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent-color)] text-glow mb-4">
              <Info className="w-4 h-4" />
              <span>Artist Biography</span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">
              {artist.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
