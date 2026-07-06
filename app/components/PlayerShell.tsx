'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX, 
  Laptop, 
  Heart,
  ListMusic,
  Disc
} from 'lucide-react';
import { Track } from '../data/musicData';

interface PlayerShellProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  currentTime: number;
  duration: number;
  onScrub: (time: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isLiked: boolean;
  onToggleLike: () => void;
  shuffle: boolean;
  onToggleShuffle: () => void;
  repeat: 'off' | 'all' | 'one';
  onToggleRepeat: () => void;
  onViewPlaylist: () => void;
}

export default function PlayerShell({
  currentTrack,
  isPlaying,
  onPlayPause,
  onSkipNext,
  onSkipPrevious,
  currentTime,
  duration,
  onScrub,
  volume,
  onVolumeChange,
  isLiked,
  onToggleLike,
  shuffle,
  onToggleShuffle,
  repeat,
  onToggleRepeat,
  onViewPlaylist,
}: PlayerShellProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.5);
  const [showDevicePopover, setShowDevicePopover] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('This Device (AURA High-Fi)');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDisabled = !isMounted || !currentTrack;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      onVolumeChange(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  const handleVolumeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onVolumeChange(val);
    if (val > 0) setIsMuted(false);
  };

  const handleScrubSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    onScrub(parseFloat(e.target.value));
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const devices = [
    'This Device (AURA High-Fi)',
    'AURA Studio Speakers (Bluetooth)',
    'Living Room HomePod (AirPlay)',
    'Sony WH-1000XM4 (Headphones)'
  ];

  return (
    <footer className="h-20 md:h-24 w-full glass-panel border-t border-[var(--glass-border)] flex items-center justify-between px-4 md:px-6 z-30 select-none relative">
      {/* Mobile Top Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 md:hidden overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-hover)] transition-all duration-300" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Left: Track Info */}
      <div className="flex items-center gap-3 md:gap-4 w-2/3 md:w-1/3 min-w-0">
        {currentTrack ? (
          <>
            <div className="w-11 h-11 md:w-14 md:h-14 rounded-[8px] overflow-hidden flex-shrink-0 bg-zinc-800 shadow-md group relative">
              <img 
                src={currentTrack.coverUrl} 
                alt={currentTrack.title} 
                className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? 'scale-105' : ''}`}
              />
            </div>
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs md:text-sm font-semibold truncate hover:text-[var(--accent-color)] cursor-pointer text-glow transition-colors">
                {currentTrack.title}
              </span>
              <span className="text-[10px] md:text-xs text-[var(--text-secondary)] truncate hover:underline cursor-pointer">
                {currentTrack.artistName}
              </span>
            </div>
            <button
              onClick={onToggleLike}
              className={`p-1 rounded-full hover:bg-white/5 active-scale transition-colors ${
                isLiked ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-11 h-11 md:w-14 md:h-14 rounded-[8px] bg-zinc-800/40 border border-dashed border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)]">
              <Disc className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs md:text-sm font-semibold text-[var(--text-secondary)]">No track</span>
              <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline">Choose a song</span>
            </div>
          </div>
        )}
      </div>

      {/* Center: Playback controls & Timeline */}
      <div className="flex flex-col items-center justify-center w-1/3 md:max-w-[600px] flex-shrink-0">
        {/* Buttons */}
        <div className="flex items-center gap-4 md:gap-5">
          <button
            onClick={onToggleShuffle}
            title="Shuffle"
            className={`p-1 rounded-full active-scale transition-colors hidden md:block ${
              shuffle ? 'text-[var(--accent-color)] text-glow' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={onSkipPrevious}
            title="Previous"
            disabled={isDisabled}
            className="p-1 rounded-full text-[var(--text-secondary)] hover:text-white active-scale disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            <SkipBack className="w-4 h-4 md:w-5 md:h-5 fill-current" />
          </button>

          <button
            onClick={onPlayPause}
            disabled={isDisabled}
            className="w-8.5 h-8.5 md:w-9 md:h-9 rounded-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-black flex items-center justify-center active-scale shadow-md hover:scale-105 disabled:opacity-50 disabled:pointer-events-none transition-all border-glow"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current text-black" />
            ) : (
              <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current text-black translate-x-[1px]" />
            )}
          </button>

          <button
            onClick={onSkipNext}
            title="Next"
            disabled={isDisabled}
            className="p-1 rounded-full text-[var(--text-secondary)] hover:text-white active-scale disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            <SkipForward className="w-4 h-4 md:w-5 md:h-5 fill-current" />
          </button>

          <button
            onClick={onToggleRepeat}
            title={`Repeat: ${repeat}`}
            className={`p-1 rounded-full active-scale relative transition-colors hidden md:block ${
              repeat !== 'off' ? 'text-[var(--accent-color)] text-glow' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Repeat className="w-4 h-4" />
            {repeat === 'one' && (
              <span className="absolute -top-1 -right-1 text-[8px] bg-[var(--accent-color)] text-black font-bold font-mono px-0.5 rounded-full leading-none">
                1
              </span>
            )}
          </button>
        </div>

        {/* Timeline (Desktop only) */}
        <div className="hidden md:flex items-center gap-3 w-full text-[10px] font-mono text-[var(--text-secondary)] mt-2">
          <span className="w-8 text-right select-none">{formatTime(currentTime)}</span>
          <div className="relative flex-1 group py-2">
            {/* Custom scrubber track with percentage visual background */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-[var(--text-muted)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-hover)] rounded-full" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime || 0}
              onChange={handleScrubSlider}
              disabled={isDisabled}
              className="absolute top-1/2 left-0 right-0 -translate-y-1/2 w-full custom-slider cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <span className="w-8 text-left select-none">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume & Utilities (Desktop only) */}
      <div className="hidden md:flex items-center justify-end gap-4 w-1/3 min-w-[240px]">
        <button
          onClick={onViewPlaylist}
          title="Queue / Playlist Details"
          className="p-2 rounded-full text-[var(--text-secondary)] hover:text-white hover:bg-white/5 active-scale transition-colors"
        >
          <ListMusic className="w-4.5 h-4.5" />
        </button>

        {/* Device output selector */}
        <div className="relative">
          <button
            onClick={() => setShowDevicePopover(!showDevicePopover)}
            title="Connect to a device"
            className={`p-2 rounded-full active-scale transition-colors ${
              showDevicePopover ? 'text-[var(--accent-color)] bg-white/5' : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
            }`}
          >
            <Laptop className="w-4.5 h-4.5" />
          </button>

          {showDevicePopover && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDevicePopover(false)} />
              <div className="absolute bottom-12 right-0 w-64 glass-panel rounded-[8px] p-3 shadow-xl z-50 border border-[var(--glass-border)] animate-fade-in text-xs">
                <span className="font-semibold text-[var(--text-primary)] block pb-2 mb-2 border-b border-[var(--glass-border)] uppercase tracking-wider text-[10px]">
                  Connect to a device
                </span>
                <div className="flex flex-col gap-1">
                  {devices.map((device) => (
                    <button
                      key={device}
                      onClick={() => {
                        setSelectedDevice(device);
                        setShowDevicePopover(false);
                      }}
                      className={`w-full text-left px-2 py-2 rounded-[6px] transition-colors truncate ${
                        selectedDevice === device 
                          ? 'text-[var(--accent-color)] font-semibold bg-white/5' 
                          : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {device}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2 group w-28 pr-2">
          <button
            onClick={handleMuteToggle}
            className="p-1 text-[var(--text-secondary)] hover:text-white active-scale transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4.5 h-4.5" />
            ) : (
              <Volume2 className="w-4.5 h-4.5" />
            )}
          </button>
          <div className="relative flex-1 py-2">
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-[var(--text-muted)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--accent-color)]" 
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeSlider}
              className="absolute top-1/2 left-0 right-0 -translate-y-1/2 w-full custom-slider cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
