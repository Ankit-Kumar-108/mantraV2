'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Shuffle, 
  Download, 
  Heart, 
  Clock, 
  Music, 
  MoreHorizontal, 
  Calendar,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { PLAYLISTS, Playlist, Track } from '../data/musicData';

interface PlaylistViewProps {
  playlistId: string;
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, trackList?: Track[]) => void;
  likedTracks: string[];
  onToggleLike: (trackId: string) => void;
  shuffle: boolean;
  onToggleShuffle: () => void;
  onViewArtist: (artistId: string) => void;
}

export default function PlaylistView({
  playlistId,
  currentTrack,
  isPlaying,
  onPlayTrack,
  likedTracks,
  onToggleLike,
  shuffle,
  onToggleShuffle,
  onViewArtist,
}: PlaylistViewProps) {
  // Download Simulation State
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'completed'>('idle');

  const playlist = PLAYLISTS.find(p => p.id === playlistId) || PLAYLISTS[0];

  // Reset download state if playlist changes
  useEffect(() => {
    setDownloadStatus('idle');
    setDownloadProgress(null);
  }, [playlistId]);

  const handlePlayPlaylist = () => {
    if (playlist.tracks.length > 0) {
      onPlayTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  const handleDownloadSimulation = () => {
    if (downloadStatus !== 'idle') return;
    
    setDownloadStatus('downloading');
    setDownloadProgress(0);
    
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadStatus('completed');
          // Hide toast after 3 seconds
          setTimeout(() => {
            setDownloadProgress(null);
          }, 3000);
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  // Calculate total playlist duration
  const totalSeconds = playlist.tracks.reduce((acc, t) => acc + t.durationSec, 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalSecRemainder = totalSeconds % 60;
  
  const formattedDuration = `${totalMinutes} min ${totalSecRemainder > 0 ? `${totalSecRemainder} sec` : ''}`;

  const isPlaylistPlaying = playlist.tracks.some(t => t.id === currentTrack?.id) && isPlaying;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 select-none relative">
      
      {/* Header Info Section */}
      <div className="flex flex-col md:flex-row items-center md:items-end text-center md:text-left gap-6 mb-8 mt-4">
        {/* Cover Art */}
        <div className="w-40 h-40 md:w-56 md:h-56 rounded-[12px] overflow-hidden shadow-2xl flex-shrink-0 bg-zinc-800 border border-[var(--glass-border)] relative group">
          <img 
            src={playlist.coverUrl} 
            alt={playlist.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Music className="w-12 h-12 text-[var(--accent-color)] text-glow animate-pulse" />
          </div>
        </div>

        {/* Text Metadata */}
        <div className="flex-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-color)] text-glow mb-2 block">
            {playlist.type}
          </span>
          <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight text-white mb-3 md:mb-4 text-glow">
            {playlist.name}
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mb-4 leading-relaxed max-w-xl">
            {playlist.description}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1.5 text-xs text-[var(--text-secondary)] font-medium">
            <span className="text-white font-semibold">{playlist.creator}</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span>{playlist.tracks.length} songs</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span>{formattedDuration}</span>
            {playlist.releaseYear && (
              <>
                <span className="text-[var(--text-muted)]">•</span>
                <span>{playlist.releaseYear}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Controller Bar */}
      <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-6 mb-6">
        <div className="flex items-center gap-4 md:gap-5">
          <button
            onClick={handlePlayPlaylist}
            className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-black flex items-center justify-center active-scale shadow-lg hover:scale-105 transition-all border-glow"
            title="Play Playlist"
          >
            {isPlaylistPlaying ? (
              <Pause className="w-4.5 h-4.5 fill-current text-black" />
            ) : (
              <Play className="w-4.5 h-4.5 fill-current text-black translate-x-[1px]" />
            )}
          </button>

          <button
            onClick={onToggleShuffle}
            className={`p-2 rounded-full border border-[var(--glass-border)] active-scale transition-colors ${
              shuffle ? 'text-[var(--accent-color)] border-[var(--accent-color)] text-glow bg-white/5' : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
            }`}
            title="Shuffle Playlist"
          >
            <Shuffle className="w-4 h-4 md:w-4.5 md:h-4.5" />
          </button>

          <button
            onClick={handleDownloadSimulation}
            disabled={downloadStatus === 'downloading'}
            className={`p-2 rounded-full border border-[var(--glass-border)] active-scale transition-colors disabled:opacity-50 ${
              downloadStatus === 'completed' 
                ? 'text-emerald-500 border-emerald-500 bg-white/5' 
                : downloadStatus === 'downloading' 
                  ? 'text-[var(--accent-color)]' 
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
            }`}
            title="Download for Offline"
          >
            {downloadStatus === 'downloading' ? (
              <Loader2 className="w-4 h-4 md:w-4.5 md:h-4.5 animate-spin" />
            ) : (
              <Download className="w-4 h-4 md:w-4.5 md:h-4.5" />
            )}
          </button>
        </div>

        <button className="p-2 rounded-full text-[var(--text-secondary)] hover:text-white hover:bg-white/5 active-scale transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Tracklist Columnar Table */}
      <div className="flex flex-col">
        {/* Table Headers */}
        <div className="grid grid-cols-[40px_1fr_48px] md:grid-cols-[48px_1fr_1fr_120px_64px] gap-2 md:gap-4 px-2 md:px-4 py-2 border-b border-[var(--glass-border)] text-[10px] md:text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] select-none">
          <span className="text-center">#</span>
          <span>Title</span>
          <span className="hidden md:block">Album</span>
          <span className="hidden lg:block">Date Added</span>
          <span className="text-right flex items-center justify-end gap-1"><Clock className="w-3.5 h-3.5" /></span>
        </div>

        {/* Tracks List */}
        <div className="flex flex-col gap-1 mt-2 mb-20">
          {playlist.tracks.map((track, idx) => {
            const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
            const isLiked = likedTracks.includes(track.id);

            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track, playlist.tracks)}
                className={`grid grid-cols-[40px_1fr_48px] md:grid-cols-[48px_1fr_1fr_120px_64px] gap-2 md:gap-4 px-2 md:px-4 py-2.5 md:py-3 rounded-[8px] hover:bg-white/5 border border-transparent transition-all group cursor-pointer items-center ${
                  currentTrack?.id === track.id ? 'bg-white/5 border-[var(--glass-border)] shadow-sm' : ''
                }`}
              >
                {/* Index / Play Button */}
                <div className="text-center flex items-center justify-center">
                  <span className="text-xs md:text-sm font-mono text-[var(--text-muted)] group-hover:hidden w-4">
                    {idx + 1}
                  </span>
                  <div className="hidden group-hover:block w-4">
                    {isCurrentPlaying ? (
                      <Pause className="w-4 h-4 text-[var(--accent-color)] fill-current" />
                    ) : (
                      <Play className="w-4 h-4 text-[var(--accent-color)] fill-current translate-x-[0.5px]" />
                    )}
                  </div>
                </div>

                {/* Title + Artist */}
                <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-[4px] overflow-hidden flex-shrink-0 bg-zinc-800">
                    <img 
                      src={track.coverUrl} 
                      alt={track.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className={`text-xs md:text-sm font-semibold truncate block ${
                      currentTrack?.id === track.id ? 'text-[var(--accent-color)] font-bold text-glow' : 'text-white'
                    }`}>
                      {track.title}
                    </span>
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewArtist(track.artistId);
                      }}
                      className="text-[10px] md:text-xs text-[var(--text-secondary)] hover:text-white hover:underline truncate block mt-0.5"
                    >
                      {track.artistName}
                    </span>
                  </div>
                </div>

                {/* Album Name */}
                <span className="text-xs text-[var(--text-secondary)] truncate hidden md:block">
                  {track.album}
                </span>

                {/* Date Added */}
                <span className="text-xs text-[var(--text-secondary)] truncate hidden lg:block font-mono">
                  {track.dateAdded}
                </span>

                {/* Like & Duration */}
                <div className="flex items-center justify-end gap-2 md:gap-3 pr-1">
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
                  <span className="text-xs font-mono text-[var(--text-secondary)] w-8 text-right">
                    {track.duration}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Download Simulation Toast */}
      {downloadProgress !== null && (
        <div className="fixed bottom-28 right-4 md:right-8 w-72 md:w-80 glass-panel rounded-[12px] p-4 shadow-2xl border border-[var(--glass-border)] z-50 animate-fade-in text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold flex items-center gap-1.5">
              {downloadStatus === 'completed' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Download Completed
                </>
              ) : (
                <>
                  <Loader2 className="w-4 h-4 text-[var(--accent-color)] animate-spin" />
                  Syncing Offline Content...
                </>
              )}
            </span>
            <span className="font-mono text-[var(--text-secondary)] font-semibold">{downloadProgress}%</span>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] mb-3">
            {downloadStatus === 'completed' 
              ? `Saved ${playlist.tracks.length} tracks to local cache.` 
              : `Downloading offline package for "${playlist.name}".`}
          </p>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 rounded-full ${
                downloadStatus === 'completed' ? 'bg-emerald-500' : 'bg-[var(--accent-color)]'
              }`}
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
