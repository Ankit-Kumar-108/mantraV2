'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Music, Image as ImageIcon, FileAudio, Sparkles,
  UploadCloud, CheckCircle, Check, Loader2, ShieldAlert, Award,
  Trash2, Plus, Edit2, AlertCircle, RefreshCw, Layers
} from 'lucide-react';

interface UploadTrack {
  id: string;
  title: string;
  album: string;
  genre: string;
  mood: string;
  artistId: string;
  artistName: string;
  isExplicit: boolean;
  isHiRes: boolean;
  lyrics: string;
  duration: string;
  durationSec: number;
  audioFile: File;
  coverFile: File | null;
  coverPreviewUrl: string;
  status: 'pending' | 'parsing' | 'uploading' | 'success' | 'failed';
  error?: string;
  progress: number;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export default function UploadPage() {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const bulkCoverInputRef = useRef<HTMLInputElement | null>(null);

  // Tracks list state
  const [tracksToUpload, setTracksToUpload] = useState<UploadTrack[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  // Theme Vibe State
  const [theme, setTheme] = useState<'sonic-deep' | 'electric-pulse' | 'pure-minimalist' | 'retro-futurist'>('sonic-deep');

  // Overall Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadingIndex, setCurrentUploadingIndex] = useState<number>(0);
  const [error, setError] = useState('');

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('aura-theme') as any;
    if (savedTheme && ['sonic-deep', 'electric-pulse', 'pure-minimalist', 'retro-futurist'].includes(savedTheme)) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  // Update theme state and persist
  const handleThemeChange = (newTheme: 'sonic-deep' | 'electric-pulse' | 'pure-minimalist' | 'retro-futurist') => {
    setTheme(newTheme);
    localStorage.setItem('aura-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Helper to parse file metadata on client
  const parseFileMetadata = async (file: File): Promise<Partial<UploadTrack>> => {
    try {
      const { parseBlob } = await import('music-metadata');
      const metadata = await parseBlob(file);
      
      const title = metadata.common.title || file.name.replace(/\.[^/.]+$/, "");
      const rawArtist = metadata.common.artist || "Aether Echo";
      
      let matchedArtistId = "aether";
      if (rawArtist.toLowerCase().includes("vortex")) matchedArtistId = "vortex";
      else if (rawArtist.toLowerCase().includes("neon")) matchedArtistId = "neon-dreamer";
      else if (rawArtist.toLowerCase().includes("aether")) matchedArtistId = "aether";
      else {
        matchedArtistId = generateSlug(rawArtist) || "custom-artist";
      }

      const album = metadata.common.album || "Single";
      const genre = metadata.common.genre?.[0] || "Synthwave";
      
      const durationSec = Math.ceil(metadata.format.duration || 0);
      const mins = Math.floor(durationSec / 60);
      const secs = durationSec % 60;
      const durationStr = `${mins}:${secs.toString().padStart(2, '0')}`;

      // Extract cover image
      let coverFile: File | null = null;
      let coverPreviewUrl = "";
      
      const picture = metadata.common.picture?.[0];
      if (picture) {
        const blob = new Blob([picture.data as any], { type: picture.format });
        coverPreviewUrl = URL.createObjectURL(blob);
        const extension = picture.format.split('/')[1] || 'jpg';
        coverFile = new File([blob], `cover_${Date.now()}.${extension}`, { type: picture.format });
      }

      return {
        title,
        album,
        genre,
        mood: "Chill",
        artistId: matchedArtistId,
        artistName: rawArtist,
        duration: durationStr,
        durationSec,
        coverFile,
        coverPreviewUrl,
      };
    } catch (err) {
      console.error("Error parsing metadata:", err);
      // Fallback
      return {
        title: file.name.replace(/\.[^/.]+$/, ""),
        album: "Single",
        genre: "Synthwave",
        mood: "Chill",
        artistId: "aether",
        artistName: "Aether Echo",
        duration: "0:00",
        durationSec: 0,
        coverFile: null,
        coverPreviewUrl: "",
      };
    }
  };

  // Handle files selection
  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    const newTracks: UploadTrack[] = [];

    // First add placeholder tracks with 'parsing' status
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Accept various audio formats
      if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3') && !file.name.endsWith('.m4a') && !file.name.endsWith('.flac') && !file.name.endsWith('.wav')) continue;
      
      const tempId = `track-${crypto.randomUUID()}`;
      newTracks.push({
        id: tempId,
        title: file.name.replace(/\.[^/.]+$/, ""),
        album: 'Single',
        genre: 'Synthwave',
        mood: 'Chill',
        artistId: 'aether',
        artistName: 'Aether Echo',
        isExplicit: false,
        isHiRes: true,
        lyrics: '',
        duration: '0:00',
        durationSec: 0,
        audioFile: file,
        coverFile: null,
        coverPreviewUrl: '',
        status: 'parsing',
        progress: 0,
      });
    }

    if (newTracks.length === 0) return;

    setTracksToUpload((prev) => [...prev, ...newTracks]);
    if (!selectedTrackId) {
      setSelectedTrackId(newTracks[0].id);
    }

    // Now asynchronously parse each track and update its state
    for (const tempTrack of newTracks) {
      const parsedData = await parseFileMetadata(tempTrack.audioFile);
      setTracksToUpload((prev) =>
        prev.map((t) =>
          t.id === tempTrack.id
            ? {
                ...t,
                ...parsedData,
                status: 'pending',
              }
            : t
        )
      );
    }
    
    // Clear input
    e.target.value = '';
  };

  // Handle cover image selection for the active track
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedTrackId) {
      const url = URL.createObjectURL(file);
      setTracksToUpload((prev) =>
        prev.map((t) =>
          t.id === selectedTrackId
            ? {
                ...t,
                coverFile: file,
                coverPreviewUrl: url,
              }
            : t
        )
      );
    }
  };

  // Handle applying a cover image to ALL tracks
  const handleApplyCoverToAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTracksToUpload((prev) =>
        prev.map((t) => ({
          ...t,
          coverFile: file,
          coverPreviewUrl: url,
        }))
      );
    }
  };

  // Update field of selected track
  const updateTrackField = (field: keyof UploadTrack, value: any) => {
    if (!selectedTrackId) return;
    setTracksToUpload((prev) =>
      prev.map((t) => (t.id === selectedTrackId ? { ...t, [field]: value } : t))
    );
  };

  // Remove a track from list
  const handleRemoveTrack = (id: string) => {
    setTracksToUpload((prev) => prev.filter((t) => t.id !== id));
    if (selectedTrackId === id) {
      const remaining = tracksToUpload.filter((t) => t.id !== id);
      setSelectedTrackId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Clear all tracks
  const handleClearAll = () => {
    setTracksToUpload([]);
    setSelectedTrackId(null);
    setError('');
    setUploadProgress(0);
  };

  // Bulk set properties for all tracks (Artist, Genre, Mood)
  const handleBulkSet = (field: 'artistId' | 'genre' | 'mood', value: string) => {
    const artistNames: Record<string, string> = {
      'aether': 'Aether Echo',
      'vortex': 'Vortex',
      'neon-dreamer': 'Neon Dreamer'
    };

    setTracksToUpload((prev) =>
      prev.map((t) => {
        if (field === 'artistId') {
          return {
            ...t,
            artistId: value,
            artistName: artistNames[value] || value,
          };
        }
        return { ...t, [field]: value };
      })
    );
  };

  // Batch upload and publish tracks
  const handlePublishAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tracksToUpload.length === 0) return;

    // Validate that all tracks have cover art and title
    const invalidTrack = tracksToUpload.find((t) => !t.coverFile || !t.title.trim());
    if (invalidTrack) {
      setError(`Track "${invalidTrack.title || 'Untitled'}" is missing cover art or title.`);
      setSelectedTrackId(invalidTrack.id);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    const totalTracks = tracksToUpload.length;

    for (let i = 0; i < totalTracks; i++) {
      const track = tracksToUpload[i];
      if (track.status === 'success') continue; // Skip already successfully uploaded tracks

      setCurrentUploadingIndex(i);
      
      // Update status to 'uploading'
      setTracksToUpload((prev) =>
        prev.map((t) => (t.id === track.id ? { ...t, status: 'uploading', progress: 15 } : t))
      );

      try {
        const formData = new FormData();
        formData.append('artistId', track.artistId);
        formData.append('artistName', track.artistName);
        formData.append('title', track.title);
        formData.append('album', track.album);
        formData.append('genre', track.genre);
        formData.append('mood', track.mood);
        formData.append('duration', track.duration);
        formData.append('durationSec', track.durationSec.toString());
        
        if (track.coverFile) {
          formData.append('cover', track.coverFile);
        }
        formData.append('audio', track.audioFile);

        // Update progress mid-way
        setTracksToUpload((prev) =>
          prev.map((t) => (t.id === track.id ? { ...t, progress: 60 } : t))
        );

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Upload failed');
        }

        setTracksToUpload((prev) =>
          prev.map((t) => (t.id === track.id ? { ...t, status: 'success', progress: 100 } : t))
        );

      } catch (err: any) {
        console.error(`Failed to publish track: ${track.title}`, err);
        setTracksToUpload((prev) =>
          prev.map((t) => (t.id === track.id ? { ...t, status: 'failed', error: err.message || 'Upload failed', progress: 0 } : t))
        );
      }

      setUploadProgress(Math.round(((i + 1) / totalTracks) * 100));
    }

    setIsUploading(false);
  };

  const activeTrack = tracksToUpload.find((t) => t.id === selectedTrackId);
  const successCount = tracksToUpload.filter((t) => t.status === 'success').length;
  const isAllSuccess = tracksToUpload.length > 0 && successCount === tracksToUpload.length;

  return (
    <div className="h-screen w-full flex flex-col p-4 md:p-8 bg-[#0a0c0c] text-white relative overflow-y-auto">
      {/* Background radial highlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--accent-color)]/5 blur-[150px] pointer-events-none transition-all duration-700" />

      {/* Top Header Controls */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between mb-6 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-white bg-white/5 border border-[var(--glass-border)] px-4 py-2 rounded-full active-scale transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-[6px] bg-gradient-to-br from-[var(--accent-color)] to-purple-600 flex items-center justify-center border border-white/10 shadow-md">
            <span className="text-black font-black text-sm">A</span>
          </div>
          <span className="text-sm font-black tracking-tight hidden sm:inline">AURA ADMIN</span>
        </div>
      </div>

      {/* Main Panel */}
      <div className="max-w-6xl w-full mx-auto glass-panel p-6 md:p-8 rounded-[16px] border border-[var(--glass-border)] shadow-2xl relative z-10 flex-grow flex flex-col justify-between mb-8">
        
        {/* Title Info */}
        <div className="border-b border-[var(--glass-border)] pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-glow flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-[var(--accent-color)] text-glow" />
              Bulk Music Publisher
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Admin console: Upload and auto-fill metadata & cover art from YouTube audio files (yt-dlp).
            </p>
          </div>

          {tracksToUpload.length > 0 && !isUploading && (
            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] px-3 py-1.5 rounded-[8px] text-xs font-semibold active-scale transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Tracks
              </button>
              <button
                type="button"
                onClick={() => bulkCoverInputRef.current?.click()}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] px-3 py-1.5 rounded-[8px] text-xs font-semibold active-scale transition-colors cursor-pointer"
                title="Apply one cover image to all tracks in this list"
              >
                <Layers className="w-3.5 h-3.5" /> Apply Cover to All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-[8px] text-xs font-semibold active-scale transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>

              <input
                type="file"
                ref={bulkCoverInputRef}
                accept="image/*"
                onChange={handleApplyCoverToAll}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-[8px] border border-red-500/50 bg-red-500/10 text-red-400 text-xs font-mono flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">Error:</span> {error}
            </div>
          </div>
        )}

        {isUploading ? (
          /* MULTI-TRACK UPLOAD PROGRESS COMPONENT */
          <div className="flex-grow flex flex-col items-center justify-center py-12 max-w-md mx-auto w-full">
            <div className="w-full space-y-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <Loader2 className="w-10 h-10 text-[var(--accent-color)] animate-spin" />
                <h3 className="font-bold text-lg text-glow">Publishing Soundscapes</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Uploading track {currentUploadingIndex + 1} of {tracksToUpload.length}: 
                  <span className="text-white font-bold ml-1">"{tracksToUpload[currentUploadingIndex]?.title}"</span>
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-[var(--text-secondary)]">
                  <span>Batch Upload Progress</span>
                  <span className="text-[var(--accent-color)] font-bold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="bg-[var(--accent-color)] h-full transition-all duration-300 rounded-full shadow-[0_0_10px_var(--accent-color)]"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>

              {/* Sequential uploads list */}
              <div className="glass-panel p-4 rounded-[12px] border border-[var(--glass-border)] max-h-60 overflow-y-auto space-y-2.5 font-mono text-xs scrollbar-thin">
                {tracksToUpload.map((track, idx) => (
                  <div key={track.id} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <span className="truncate max-w-[250px] text-zinc-300">
                      {idx + 1}. {track.title}
                    </span>
                    <div className="flex items-center gap-2">
                      {track.status === 'uploading' && (
                        <span className="text-[var(--accent-color)] flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> {track.progress}%
                        </span>
                      )}
                      {track.status === 'success' && (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <Check className="w-3.5 h-3.5" /> Done
                        </span>
                      )}
                      {track.status === 'failed' && (
                        <span className="text-red-400 flex items-center gap-1">
                          ⚠️ Failed
                        </span>
                      )}
                      {track.status === 'pending' && (
                        <span className="text-zinc-500">Waiting...</span>
                      )}
                      {track.status === 'parsing' && (
                        <span className="text-amber-400 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Parsing...
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : isAllSuccess ? (
          /* ALL SUCCESS PANEL */
          <div className="flex-grow flex flex-col items-center justify-center py-12 max-w-md mx-auto w-full text-center space-y-6 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-glow text-white">Batch Published Successfully!</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                All {tracksToUpload.length} tracks have been registered in the database, uploaded to R2, and are now streaming live.
              </p>
            </div>

            <div className="flex gap-3 w-full pt-4">
              <button
                onClick={handleResetForm}
                className="flex-1 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-black font-semibold text-xs py-3 rounded-[8px] active-scale transition-colors cursor-pointer"
              >
                Upload More Tracks
              </button>
              <Link
                href="/"
                className="flex-1 bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] text-white text-center font-semibold text-xs py-3 rounded-[8px] active-scale transition-colors flex items-center justify-center"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : tracksToUpload.length === 0 ? (
          /* INITIAL DRAG & DROP ZONE */
          <div className="flex-grow flex flex-col items-center justify-center py-16">
            <div
              onClick={() => audioInputRef.current?.click()}
              className="max-w-xl w-full aspect-[2/1] rounded-[16px] bg-white/5 border border-dashed border-[var(--glass-border)] hover:border-[var(--accent-color)] hover:bg-white/10 transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center group shadow-inner"
            >
              <input
                type="file"
                ref={audioInputRef}
                accept="audio/*"
                multiple
                onChange={handleAudioSelect}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[var(--text-secondary)] border border-white/5 group-hover:text-white transition-colors mb-4">
                <UploadCloud className="w-8 h-8 text-[var(--accent-color)] group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white">Select Audio Tracks</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm">
                  Drag and drop files here, or click to browse. Supports multiple MP3, M4A, WAV, or FLAC files with embedded thumbnails/meta.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* WORKSPACE LAYOUT (LEFT: TRACK LIST, RIGHT: METADATA EDITOR) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow overflow-hidden">
            
            {/* Left Column: Playlist queue (lg:span-5) */}
            <div className="lg:col-span-5 flex flex-col h-[520px] lg:h-[600px] border-r border-white/5 pr-0 lg:pr-6 overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                  Tracks Queue ({tracksToUpload.length})
                </span>
                <span className="text-[9px] text-[var(--text-muted)] italic">
                  Click a track to inspect & edit
                </span>
              </div>

              {/* Scrollable track list */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 scrollbar-thin">
                {tracksToUpload.map((track) => {
                  const isSelected = track.id === selectedTrackId;
                  return (
                    <div
                      key={track.id}
                      onClick={() => setSelectedTrackId(track.id)}
                      className={`relative flex items-center gap-3 p-3 rounded-[12px] border transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-[var(--accent-color)]/5 border-[var(--accent-color)] shadow-[0_0_15px_rgba(29,185,84,0.05)]'
                          : 'bg-white/5 border-[var(--glass-border)] hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Cover Thumbnail */}
                      <div className="w-12 h-12 rounded-[6px] bg-zinc-800 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center text-zinc-500 shadow-md">
                        {track.coverPreviewUrl ? (
                          <img src={track.coverPreviewUrl} alt="Cover Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <Music className="w-5 h-5 text-zinc-600" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate block flex-1">
                            {track.title || 'Untitled Track'}
                          </span>
                          {/* Badges */}
                          {track.status === 'success' && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded-[4px] font-bold font-mono">OK</span>
                          )}
                          {track.status === 'failed' && (
                            <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1 py-0.5 rounded-[4px] font-bold font-mono">FAIL</span>
                          )}
                          {track.status === 'parsing' && (
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.5 rounded-[4px] font-mono">PARSE</span>
                          )}
                        </div>
                        
                        <span className="text-[10px] text-[var(--text-secondary)] truncate block mt-0.5">
                          {track.album || 'Single'} • {track.duration}
                        </span>

                        {!track.coverFile && track.status !== 'parsing' && (
                          <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.5 rounded-[4px] font-bold inline-block mt-1 font-mono">
                            ⚠️ MISSING COVER ART
                          </span>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTrack(track.id);
                        }}
                        className="text-zinc-500 hover:text-red-400 opacity-60 hover:opacity-100 p-1.5 rounded-[6px] hover:bg-white/5 transition-all"
                        title="Remove track"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bulk Setting Quick Panel */}
              <div className="mt-4 p-4 rounded-[12px] bg-white/5 border border-[var(--glass-border)] space-y-3">
                <span className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[var(--accent-color)]" />
                  Quick Batch Presets
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-[var(--text-muted)] block">Batch Artist</label>
                    <select
                      onChange={(e) => handleBulkSet('artistId', e.target.value)}
                      defaultValue=""
                      className="w-full bg-[#121414] border border-[var(--glass-border)] rounded-[6px] py-1 px-2 text-[11px] text-[var(--text-primary)] focus:outline-none"
                    >
                      <option value="" disabled>Select Artist...</option>
                      <option value="aether">Aether (ID: aether)</option>
                      <option value="vortex">Vortex (ID: vortex)</option>
                      <option value="neon-dreamer">Neon Dreamer (ID: neon-dreamer)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-[var(--text-muted)] block">Batch Genre</label>
                    <select
                      onChange={(e) => handleBulkSet('genre', e.target.value)}
                      defaultValue=""
                      className="w-full bg-[#121414] border border-[var(--glass-border)] rounded-[6px] py-1 px-2 text-[11px] text-[var(--text-primary)] focus:outline-none"
                    >
                      <option value="" disabled>Select Genre...</option>
                      <option value="Synthwave">Synthwave</option>
                      <option value="Cyberpunk">Cyberpunk</option>
                      <option value="Lo-Fi">Lo-Fi</option>
                      <option value="Acoustic">Acoustic</option>
                      <option value="Cinematic">Cinematic</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Active Track Metadata Editor (lg:span-7) */}
            <div className="lg:col-span-7 flex flex-col h-[600px] overflow-y-auto pr-1 scrollbar-thin">
              {activeTrack ? (
                <div className="space-y-5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold">
                      Track Editor (Metadata & Assets)
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      {(activeTrack.audioFile.size / (1024 * 1024)).toFixed(2)} MB • {activeTrack.duration}
                    </span>
                  </div>

                  {/* Active Track Asset File */}
                  <div className="bg-white/5 border border-[var(--glass-border)] rounded-[8px] p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[6px] bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/25 flex items-center justify-center text-[var(--accent-color)] flex-shrink-0">
                      <FileAudio className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-zinc-300 block truncate">{activeTrack.audioFile.name}</span>
                    </div>
                  </div>

                  {/* Split Layout: Cover Art & Main Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                    
                    {/* Cover Art Box (sm:span-4) */}
                    <div className="sm:col-span-4 space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                        Cover Artwork
                      </label>
                      <div
                        onClick={() => coverInputRef.current?.click()}
                        className="relative aspect-square w-full rounded-[12px] bg-white/5 border border-dashed border-[var(--glass-border)] hover:border-[var(--accent-color)] hover:bg-white/10 transition-all cursor-pointer flex flex-col items-center justify-center p-3 overflow-hidden group shadow-inner"
                      >
                        <input
                          type="file"
                          ref={coverInputRef}
                          accept="image/*"
                          onChange={handleCoverSelect}
                          className="hidden"
                        />
                        {activeTrack.coverPreviewUrl ? (
                          <>
                            <img
                              src={activeTrack.coverPreviewUrl}
                              alt="Cover Preview"
                              className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-xs text-white text-center p-2">
                              <ImageIcon className="w-6 h-6 text-[var(--accent-color)] mb-1" />
                              <span className="text-[10px]">Change Artwork</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center flex flex-col items-center space-y-2">
                            <ImageIcon className="w-5 h-5 text-zinc-500 group-hover:text-white" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-white block">Upload Cover</span>
                              <span className="text-[8px] text-[var(--text-muted)] block">JPG/PNG</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata fields (sm:span-8) */}
                    <div className="sm:col-span-8 space-y-4">
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                          Track Title
                        </label>
                        <input
                          type="text"
                          required
                          value={activeTrack.title}
                          onChange={(e) => updateTrackField('title', e.target.value)}
                          placeholder="e.g. Neon Horizon"
                          className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2 px-3 text-xs placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all shadow-md focus:shadow-[0_0_10px_var(--accent-glow)]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                            Artist Type
                          </label>
                          <select
                            value={['aether', 'vortex', 'neon-dreamer'].includes(activeTrack.artistId) ? activeTrack.artistId : 'custom'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'custom') {
                                updateTrackField('artistId', 'custom-artist');
                                updateTrackField('artistName', '');
                              } else {
                                const artistNames: Record<string, string> = {
                                  'aether': 'Aether Echo',
                                  'vortex': 'Vortex',
                                  'neon-dreamer': 'Neon Dreamer'
                                };
                                updateTrackField('artistId', val);
                                updateTrackField('artistName', artistNames[val]);
                              }
                            }}
                            className="w-full bg-[#121414] hover:bg-[#1b1e1e] border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2 px-2.5 text-xs text-[var(--text-primary)] focus:outline-none transition-all cursor-pointer"
                          >
                            <option value="aether">Aether (ID: aether)</option>
                            <option value="vortex">Vortex (ID: vortex)</option>
                            <option value="neon-dreamer">Neon Dreamer (ID: neon-dreamer)</option>
                            <option value="custom">Custom Artist...</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                            Album
                          </label>
                          <select
                            value={activeTrack.album}
                            onChange={(e) => updateTrackField('album', e.target.value)}
                            className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2 px-2.5 text-xs placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all cursor-pointer"
                          >
                            <option value="hindi">Hindi</option>
                            <option value="english">English</option>
                            <option value="bhojpuri">Bhojpuri</option>
                          </select>
                        </div>
                      </div>

                      {!['aether', 'vortex', 'neon-dreamer'].includes(activeTrack.artistId) && (
                        <div className="space-y-1.5 animate-fade-in">
                          <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                            Custom Artist Name
                          </label>
                          <input
                            type="text"
                            required
                            value={activeTrack.artistName}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateTrackField('artistName', val);
                              updateTrackField('artistId', generateSlug(val) || 'custom-artist');
                            }}
                            placeholder="e.g. John Doe"
                            className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2 px-3 text-xs placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all shadow-md focus:shadow-[0_0_10px_var(--accent-glow)]"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                            Genre
                          </label>
                          <select
                            value={activeTrack.genre}
                            onChange={(e) => updateTrackField('genre', e.target.value)}
                            className="w-full bg-[#121414] hover:bg-[#1b1e1e] border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2 px-2.5 text-xs text-[var(--text-primary)] focus:outline-none transition-all cursor-pointer"
                          >
                            <option value="Synthwave">Synthwave</option>
                            <option value="Cyberpunk">Cyberpunk</option>
                            <option value="Lo-Fi">Lo-Fi</option>
                            <option value="Acoustic">Acoustic</option>
                            <option value="Cinematic">Cinematic</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                            Mood Vibe
                          </label>
                          <select
                            value={activeTrack.mood}
                            onChange={(e) => updateTrackField('mood', e.target.value)}
                            className="w-full bg-[#121414] hover:bg-[#1b1e1e] border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2 px-2.5 text-xs text-[var(--text-primary)] focus:outline-none transition-all cursor-pointer"
                          >
                            <option value="Chill">Chill</option>
                            <option value="Focus">Focus</option>
                            <option value="Energetic">Energetic</option>
                            <option value="Sad">Sad</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Toggles: Explicit Content & Hi-Res */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <label className="flex items-center gap-3 bg-white/5 border border-[var(--glass-border)] p-3 rounded-[8px] hover:bg-white/10 cursor-pointer select-none transition-colors">
                      <input
                        type="checkbox"
                        checked={activeTrack.isExplicit}
                        onChange={(e) => updateTrackField('isExplicit', e.target.checked)}
                        className="w-4 h-4 rounded border-[var(--glass-border)] checked:bg-[var(--accent-color)] focus:ring-0 cursor-pointer accent-[var(--accent-color)]"
                      />
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-white block">Explicit Content</span>
                        <span className="text-[9px] text-[var(--text-secondary)] block mt-0.5 flex items-center gap-0.5">
                          <ShieldAlert className="w-2.5 h-2.5 text-red-400" /> Parental Advisory (E)
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 bg-white/5 border border-[var(--glass-border)] p-3 rounded-[8px] hover:bg-white/10 cursor-pointer select-none transition-colors">
                      <input
                        type="checkbox"
                        checked={activeTrack.isHiRes}
                        onChange={(e) => updateTrackField('isHiRes', e.target.checked)}
                        className="w-4 h-4 rounded border-[var(--glass-border)] checked:bg-[var(--accent-color)] focus:ring-0 cursor-pointer accent-[var(--accent-color)]"
                      />
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-white block">Hi-Res Audio Flag</span>
                        <span className="text-[9px] text-[var(--text-secondary)] block mt-0.5 flex items-center gap-0.5">
                          <Award className="w-2.5 h-2.5 text-amber-400" /> Lossless stream quality
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Lyrics textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                      Song Lyrics
                    </label>
                    <textarea
                      rows={3}
                      value={activeTrack.lyrics}
                      onChange={(e) => updateTrackField('lyrics', e.target.value)}
                      placeholder="Enter lyrics here..."
                      className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2 px-3 text-[11px] placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all shadow-md focus:shadow-[0_0_10px_var(--accent-glow)] font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-zinc-500">
                  Select a track to edit metadata.
                </div>
              )}
            </div>

          </div>
        )}

        {/* Footer controls for uploading */}
        {tracksToUpload.length > 0 && !isUploading && !isAllSuccess && (
          <div className="mt-8 border-t border-white/5 pt-5 flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">
              Ready to publish <span className="text-white font-bold">{tracksToUpload.filter(t => t.status !== 'success').length}</span> track(s).
            </span>
            <button
              onClick={handlePublishAll}
              className="flex items-center justify-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-black font-semibold text-xs py-3 px-6 rounded-[8px] active-scale transition-all border-glow shadow-lg cursor-pointer"
            >
              <UploadCloud className="w-4.5 h-4.5 text-black" />
              Publish All Tracks to AURA
            </button>
          </div>
        )}

        {/* Theme Vibe Sync Picker (Glow dots) */}
        <div className="mt-8 border-t border-white/5 pt-4 flex flex-col items-center gap-2">
          <span className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[var(--accent-color)]" />
            Switch AURA Vibe
          </span>
          <div className="flex items-center gap-3">
            {[
              { id: 'sonic-deep', color: 'bg-[#1db954]', title: 'Sonic Deep' },
              { id: 'electric-pulse', color: 'bg-[#ff007f]', title: 'Electric Pulse' },
              { id: 'pure-minimalist', color: 'bg-[#f5f5f7]', title: 'Pure Minimalist' },
              { id: 'retro-futurist', color: 'bg-[#00ffff]', title: 'Retro-Futurist' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => handleThemeChange(v.id as any)}
                title={v.title}
                className={`w-3.5 h-3.5 rounded-full cursor-pointer transition-all hover:scale-125 ${v.color} ${theme === v.id ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110 shadow-[0_0_10px_currentColor]' : 'opacity-65'
                  }`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const handleResetForm = () => {
  window.location.reload();
};
