'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Music, Image as ImageIcon, FileAudio, Sparkles,
  UploadCloud, CheckCircle, Check, Loader2, ShieldAlert, Award
} from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('Synthwave');
  const [mood, setMood] = useState('Chill');
  const [releaseDate, setReleaseDate] = useState('');
  const [isExplicit, setIsExplicit] = useState(false);
  const [isHiRes, setIsHiRes] = useState(true);
  const [lyrics, setLyrics] = useState('');
  const [artistId, setArtistId] = useState('aether');
  const [duration, setDuration] = useState('0:00');
  const [durationSec, setDurationSec] = useState(0);
  const [error, setError] = useState('');

  // File states (mocked with local URLs for client side previewing)
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // Theme Vibe State
  const [theme, setTheme] = useState<'sonic-deep' | 'electric-pulse' | 'pure-minimalist' | 'retro-futurist'>('sonic-deep');

  // Upload simulation states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('aura-theme') as any;
    if (savedTheme && ['sonic-deep', 'electric-pulse', 'pure-minimalist', 'retro-futurist'].includes(savedTheme)) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setReleaseDate(today);
  }, []);

  // Update theme state and persist
  const handleThemeChange = (newTheme: 'sonic-deep' | 'electric-pulse' | 'pure-minimalist' | 'retro-futurist') => {
    setTheme(newTheme);
    localStorage.setItem('aura-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Handle image select
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setCoverPreviewUrl(url);
    }
  };

  // Handle audio select
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setAudioFile(file);
    setError('');
    const audioUrl = URL.createObjectURL(file);
    const audioEl = new Audio(audioUrl);
    audioEl.addEventListener('loadedmetadata', () => { // Note: use 'loadedmetadata' for duration!
      const seconds = Math.ceil(audioEl.duration);
      const minutes = Math.floor(seconds / 60);
      setDurationSec(seconds);
      setDuration(`${minutes}:${(seconds % 60).toString().padStart(2, '0')}`);
    });
  }
};

  // Trigger simulated multi-step upload
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      alert("Please select an audio file.");
      return;
    }

    if (!coverFile) {
      alert("Please select a cover file");
      return;
    }

    setIsUploading(true);
    setUploadStep(1);
    setUploadProgress(15);
    setError('')

    try {
      const formData = new FormData()
      formData.append('artistId', artistId)
      formData.append('title', title)
      formData.append('album', album)
      formData.append('genre', genre)
      formData.append('mood', mood)
      formData.append('duration', duration)
      formData.append('durationSec', durationSec.toString())
      formData.append('cover', coverFile)
      formData.append('audio', audioFile)

      setUploadProgress(45)
      setUploadStep(2);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Upload Failed')
      }

      setUploadProgress(75);
      setUploadStep(3);

      setTimeout(() => {
        setUploadProgress(90);
        setUploadStep(4); // Generating Hi-Res Stream Profiles

        setTimeout(() => {
          setUploadProgress(100);
          setUploadStep(5 as any); // Completed!
        }, 800);
      }, 800);

    } catch (error: any) {
      setError(error.message);
      setIsUploading(false);
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setAlbum('');
    setGenre('Synthwave');
    setMood('Chill');
    setCoverFile(null);
    setCoverPreviewUrl('');
    setAudioFile(null);
    setIsUploading(false);
    setUploadStep(0);
    setUploadProgress(0);
  };

  return (
    <div className="h-screen w-full flex flex-col p-4 md:p-8 bg-[#0a0c0c] text-white relative overflow-y-auto">
      {/* Background radial highlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--accent-color)]/5 blur-[150px] pointer-events-none transition-all duration-700" />

      {/* Top Header Controls */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between mb-8 z-10">
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
      <div className="max-w-5xl w-full mx-auto glass-panel p-6 md:p-8 rounded-[16px] border border-[var(--glass-border)] shadow-2xl relative z-10 flex-grow flex flex-col justify-between mb-8">

        {/* Title Info */}
        <div className="border-b border-[var(--glass-border)] pb-4 mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-glow flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-[var(--accent-color)] text-glow" />
            Publish New Track
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Admin console: Upload media assets, transcode stream profiles, and sync live database records.
          </p>
        </div>

        {isUploading ? (

          // MOCK UPLOAD WORKFLOW PROCESSOR       
          <div className="flex-grow flex flex-col items-center justify-center py-12 max-w-md mx-auto w-full">
            {uploadStep < 5 ? (
              <div className="w-full space-y-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <Loader2 className="w-10 h-10 text-[var(--accent-color)] animate-spin" />
                  <h3 className="font-bold text-lg text-glow">Processing Media Assets</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Please wait while the files are packaged for high-fidelity distribution.</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-[var(--text-secondary)]">
                    <span>Transcoding progress</span>
                    <span className="text-[var(--accent-color)] font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="bg-[var(--accent-color)] h-full transition-all duration-150 rounded-full shadow-[0_0_10px_var(--accent-color)]"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>

                {/* Checklist steps */}
                <div className="glass-panel p-4 rounded-[12px] border border-[var(--glass-border)] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className={uploadStep >= 1 ? 'text-white' : 'text-[var(--text-muted)]'}>
                      1. Uploading Audio Segment
                    </span>
                    {uploadStep > 1 ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : uploadStep === 1 ? (
                      <Loader2 className="w-3.5 h-3.5 text-[var(--accent-color)] animate-spin" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={uploadStep >= 2 ? 'text-white' : 'text-[var(--text-muted)]'}>
                      2. Optimizing Cover Image
                    </span>
                    {uploadStep > 2 ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : uploadStep === 2 ? (
                      <Loader2 className="w-3.5 h-3.5 text-[var(--accent-color)] animate-spin" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={uploadStep >= 3 ? 'text-white' : 'text-[var(--text-muted)]'}>
                      3. Registering Drizzle DB Records
                    </span>
                    {uploadStep > 3 ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : uploadStep === 3 ? (
                      <Loader2 className="w-3.5 h-3.5 text-[var(--accent-color)] animate-spin" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={uploadStep >= 4 ? 'text-white' : 'text-[var(--text-muted)]'}>
                      4. Generating Hi-Res Stream Profiles
                    </span>
                    {uploadStep > 4 ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : uploadStep === 4 ? (
                      <Loader2 className="w-3.5 h-3.5 text-[var(--accent-color)] animate-spin" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Success Panel */
              <div className="text-center space-y-6 animate-fade-in w-full">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-xl text-glow text-white">Track Published Successfully!</h3>
                  <p className="text-xs text-[var(--text-secondary)]">"{title || 'Untitled Track'}" has been added to the AURA sound index and is ready to stream.</p>
                </div>

                <div className="glass-panel p-5 rounded-[12px] border border-[var(--glass-border)] flex items-center gap-4 text-left">
                  <div className="w-16 h-16 rounded-[8px] overflow-hidden bg-zinc-800 flex-shrink-0 border border-white/10 shadow-md">
                    {coverPreviewUrl ? (
                      <img src={coverPreviewUrl} alt="Published Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Music className="w-6 h-6 text-zinc-600" /></div>
                    )}
                  </div>
                  {error && (
                    <div className="col-span-12 mb-4 p-4 rounded-[8px] border border-red-500/50 bg-red-500/10 text-red-400 text-xs font-mono">
                      ⚠️ Upload Failed: {error}
                    </div>
                  )}

                  <div className="min-w-0">
                    <span className="text-sm font-bold text-white truncate block">{title || 'Untitled Track'}</span>
                    <span className="text-xs text-[var(--text-secondary)] truncate block mt-0.5">{album || 'Single Album'}</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-[4px] text-[var(--accent-color)]">{genre}</span>
                      {isHiRes && <span className="text-[9px] font-mono bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded-[4px] text-amber-400 flex items-center gap-0.5"><Award className="w-2.5 h-2.5" />Hi-Res</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleResetForm}
                    className="flex-1 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-black font-semibold text-xs py-3 rounded-[8px] active-scale transition-colors cursor-pointer"
                  >
                    Upload Another Track
                  </button>
                  <Link
                    href="/"
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] text-white text-center font-semibold text-xs py-3 rounded-[8px] active-scale transition-colors flex items-center justify-center"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handlePublish} className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">

            {/* Error Banner */}
            {error && (
              <div className="col-span-1 lg:col-span-12 p-4 rounded-[8px] border border-red-500/50 bg-red-500/10 text-red-400 text-xs font-mono">
                ⚠️ Upload Failed: {error}
              </div>
            )}

            {/* Left Column: Drops / Drag and Drop (lg:span-5) */}
            <div className="lg:col-span-5 space-y-6">

              {/* Cover Art Box */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                  Cover Art Image
                </label>
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="relative aspect-square w-full rounded-[12px] bg-white/5 border border-dashed border-[var(--glass-border)] hover:border-[var(--accent-color)] hover:bg-white/10 transition-all cursor-pointer flex flex-col items-center justify-center p-4 overflow-hidden group shadow-inner"
                >
                  <input
                    type="file"
                    ref={coverInputRef}
                    accept="image/*"
                    onChange={handleCoverSelect}
                    className="hidden"
                  />
                  {coverPreviewUrl ? (
                    <>
                      <img
                        src={coverPreviewUrl}
                        alt="Cover Preview"
                        className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-xs text-white">
                        <ImageIcon className="w-8 h-8 text-[var(--accent-color)] mb-2" />
                        <span>Change Cover Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center flex flex-col items-center space-y-2.5">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[var(--text-secondary)] border border-white/5 group-hover:text-white transition-colors">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white block">Upload artwork</span>
                        <span className="text-[10px] text-[var(--text-muted)] block">Drag & drop or click (JPG, PNG, WebP)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Audio File Box */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                  Audio Asset File
                </label>
                <div
                  onClick={() => audioInputRef.current?.click()}
                  className={`w-full rounded-[12px] bg-white/5 border border-dashed hover:bg-white/10 transition-all cursor-pointer p-5 text-center flex flex-col items-center justify-center group ${audioFile ? 'border-[var(--accent-color)] shadow-[0_0_10px_rgba(29,185,84,0.05)]' : 'border-[var(--glass-border)] hover:border-[var(--accent-color)]'
                    }`}
                >
                  <input
                    type="file"
                    ref={audioInputRef}
                    accept="audio/*"
                    onChange={handleAudioSelect}
                    className="hidden"
                  />
                  {audioFile ? (
                    <div className="w-full flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-[8px] bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/25 flex items-center justify-center text-[var(--accent-color)] flex-shrink-0 animate-pulse">
                        <FileAudio className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-white block truncate">{audioFile.name}</span>
                        <span className="text-[10px] text-[var(--text-secondary)] font-mono block">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Audio/MP3
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAudioFile(null);
                        }}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold hover:underline bg-white/5 border border-white/5 px-2.5 py-1 rounded-[6px]"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2.5">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[var(--text-secondary)] border border-white/5 group-hover:text-white transition-colors">
                        <Music className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white block">Upload audio track</span>
                        <span className="text-[10px] text-[var(--text-muted)] block">Select files (MP3, WAV, FLAC)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Metadata Details Form (lg:span-7) */}
            <div className="lg:col-span-7 space-y-5">

              {/* Row 1: Title & Album */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-1 sm:col-span-2">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                    Assign Artist
                  </label>
                  <select
                    value={artistId}
                    onChange={(e) => setArtistId(e.target.value)}
                    className="w-full bg-[#121414] hover:bg-[#1b1e1e] border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2.5 px-3 text-sm text-[var(--text-primary)] focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="aether">Aether (ID: aether)</option>
                    <option value="vortex">Vortex (ID: vortex)</option>
                    <option value="neon-dreamer">Neon Dreamer (ID: neon-dreamer)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                    Track Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Neon Horizon"
                    className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2.5 px-4 text-sm placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all shadow-md focus:shadow-[0_0_15px_var(--accent-glow)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                    Album Name
                  </label>
                  <input
                    type="text"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    placeholder="e.g. Cyber City EP"
                    className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2.5 px-4 text-sm placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all shadow-md focus:shadow-[0_0_15px_var(--accent-glow)]"
                  />
                </div>
              </div>

              {/* Row 2: Genre, Mood & Release Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                    Genre
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-[#121414] hover:bg-[#1b1e1e] border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2.5 px-3 text-sm text-[var(--text-primary)] focus:outline-none transition-all cursor-pointer"
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
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full bg-[#121414] hover:bg-[#1b1e1e] border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2.5 px-3 text-sm text-[var(--text-primary)] focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Chill">Chill</option>
                    <option value="Focus">Focus</option>
                    <option value="Energetic">Energetic</option>
                    <option value="Sad">Sad</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text(--text-secondary) font-bold block">
                    Release Date
                  </label>
                  <input
                    type="date"
                    required
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2 px-3 text-sm text-[var(--text-primary)] focus:outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>

              {/* Toggles: Explicit Content & Hi-Res */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

                <label className="flex items-center gap-3 bg-white/5 border border-[var(--glass-border)] p-3.5 rounded-[8px] hover:bg-white/10 cursor-pointer select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={isExplicit}
                    onChange={(e) => setIsExplicit(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-[var(--glass-border)] checked:bg-[var(--accent-color)] focus:ring-0 cursor-pointer accent-[var(--accent-color)]"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block">Explicit Content</span>
                    <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-red-400" /> Mark with Parental Advisory (E)
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-white/5 border border-[var(--glass-border)] p-3.5 rounded-[8px] hover:bg-white/10 cursor-pointer select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={isHiRes}
                    onChange={(e) => setIsHiRes(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-[var(--glass-border)] checked:bg-[var(--accent-color)] focus:ring-0 cursor-pointer accent-[var(--accent-color)]"
                  />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block">Hi-Res Audio Flag</span>
                    <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5 flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-400" /> Tag as lossless stream quality
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
                  rows={4}
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Enter lyrics here..."
                  className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2.5 px-4 text-xs placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all shadow-md focus:shadow-[0_0_15px_var(--accent-glow)] font-mono"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-black font-semibold text-sm py-3.5 rounded-[8px] active-scale transition-all border-glow shadow-lg mt-2 cursor-pointer"
              >
                <UploadCloud className="w-4.5 h-4.5 text-black" />
                Publish Track to AURA
              </button>

            </div>

          </form>
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
