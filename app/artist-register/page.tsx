'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, User, Users, Award, FileText, Image as ImageIcon, 
  Sparkles, CheckCircle, ShieldAlert, Loader2, Link2 
} from 'lucide-react';

export default function ArtistRegisterPage() {
  const router = useRouter();

  // Input states
  const [artistId, setArtistId] = useState('');
  const [artistName, setArtistName] = useState('');
  const [monthlyListeners, setMonthlyListeners] = useState('120000');
  const [verified, setVerified] = useState(false);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Theme Vibe State
  const [theme, setTheme] = useState<'sonic-deep' | 'electric-pulse' | 'pure-minimalist' | 'retro-futurist'>('sonic-deep');

  // Unsplash presets to facilitate testing
  const avatarPresets = [
    { name: 'Retro Vocalist', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&q=80' },
    { name: 'DJ Producer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80' },
    { name: 'Synth Artist', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&q=80' }
  ];

  const bannerPresets = [
    { name: 'Neon Grid Stage', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop&q=80' },
    { name: 'Studio Console', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=400&fit=crop&q=80' },
    { name: 'Laser Synthwave', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=400&fit=crop&q=80' }
  ];

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

  // Convert name to ID suggestion
  const handleNameChange = (val: string) => {
    setArtistName(val);
    // Auto-suggest id by converting spaces to hyphens and lowercasing
    if (!artistId || artistId === artistName.toLowerCase().replace(/\s+/g, '-')) {
      setArtistId(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  // Handle submit to API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('artistId', artistId.trim());
      formData.append('artistName', artistName.trim());
      formData.append('avatarUrl', avatarUrl.trim());
      formData.append('bannerUrl', bannerUrl.trim());
      formData.append('bio', bio.trim());
      formData.append('monthlyListeners', monthlyListeners);
      
      // Critical check for Boolean parsing in Drizzle API:
      // Boolean("") is false. Boolean("true") is true.
      if (verified) {
        formData.append('verified', 'true');
      }

      const res = await fetch('/api/artistRegister', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Server returned status ${res.status}`);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setArtistId('');
    setArtistName('');
    setMonthlyListeners('120000');
    setVerified(false);
    setBio('');
    setAvatarUrl('');
    setBannerUrl('');
    setSuccess(false);
    setError('');
  };

  return (
    <div className="h-screen w-full flex flex-col p-4 md:p-8 bg-[#0a0c0c] text-white relative overflow-y-auto select-none">
      {/* Background radial highlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--accent-color)]/5 blur-[150px] pointer-events-none transition-all duration-700" />
      
      {/* Top Header Controls */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between mb-6 md:mb-8 z-10 flex-shrink-0">
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
      <div className="max-w-5xl w-full mx-auto glass-panel p-6 md:p-8 rounded-[16px] border border-[var(--glass-border)] shadow-2xl relative z-10 flex-grow flex flex-col justify-between mb-6">
        
        {/* Title Info */}
        <div className="border-b border-[var(--glass-border)] pb-4 mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-glow flex items-center gap-2">
            <Award className="w-6 h-6 text-[var(--accent-color)] text-glow" />
            Register New Artist
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Publish verified artist profiles with Monthly Listeners and high-fidelity custom banner soundscapes.
          </p>
        </div>

        {success ? (
          /* ========================================================================= */
          /* SUCCESS SCREEN                                                           */
          /* ========================================================================= */
          <div className="flex-grow flex flex-col items-center justify-center py-12 max-w-md mx-auto w-full text-center space-y-6 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-glow text-white">Artist Registered Successfully!</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                "{artistName}" has been registered in the database under ID <span className="font-mono text-white font-semibold">@{artistId}</span>.
              </p>
            </div>

            {/* Profile preview summary */}
            <div className="w-full glass-panel p-4 rounded-[12px] border border-[var(--glass-border)] text-left flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-zinc-800">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User className="w-6 h-6 text-zinc-600" /></div>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                  {artistName}
                  {verified && <Award className="w-4 h-4 text-[var(--accent-color)] flex-shrink-0" />}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5 font-mono">
                  {Number(monthlyListeners).toLocaleString()} monthly listeners
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full">
              <button 
                onClick={handleResetForm}
                className="flex-1 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-black font-semibold text-xs py-3 rounded-[8px] active-scale transition-colors cursor-pointer"
              >
                Register Another Artist
              </button>
              <Link 
                href="/"
                className="flex-1 bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] text-white text-center font-semibold text-xs py-3 rounded-[8px] active-scale transition-colors flex items-center justify-center"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* FORM ENTRY                                                                */
          /* ========================================================================= */
          <div className="flex-grow flex flex-col justify-between">
            {/* Error message Banner */}
            {error && (
              <div className="mb-6 p-4 rounded-[8px] bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-start gap-2.5 animate-shake">
                <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Registration Failed</span>
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Form Fields (lg:span-7) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Row 1: Artist Name & ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                      Artist Display Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={artistName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g. Aether Theory"
                        className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2.5 pl-11 pr-4 text-sm placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all shadow-md focus:shadow-[0_0_15px_var(--accent-glow)]"
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                      Artist ID (lowercase URL string)
                    </label>
                    <input
                      type="text"
                      required
                      value={artistId}
                      onChange={(e) => setArtistId(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                      placeholder="e.g. aether-theory"
                      className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2.5 px-4 text-sm placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all font-mono shadow-md focus:shadow-[0_0_15px_var(--accent-glow)]"
                    />
                  </div>
                </div>

                {/* Row 2: Listeners & Verification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                      Monthly Listeners
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        value={monthlyListeners}
                        onChange={(e) => setMonthlyListeners(e.target.value)}
                        placeholder="120000"
                        className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2.5 pl-11 pr-4 text-sm placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all shadow-md focus:shadow-[0_0_15px_var(--accent-glow)] font-mono"
                      />
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
                    </div>
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="flex items-center gap-3 bg-white/5 border border-[var(--glass-border)] p-2.5 md:p-3 rounded-[8px] hover:bg-white/10 cursor-pointer select-none transition-colors h-[42px]">
                      <input
                        type="checkbox"
                        checked={verified}
                        onChange={(e) => setVerified(e.target.checked)}
                        className="w-4.5 h-4.5 rounded border-[var(--glass-border)] checked:bg-[var(--accent-color)] focus:ring-0 cursor-pointer accent-[var(--accent-color)]"
                      />
                      <div className="min-w-0 flex-1 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-[var(--accent-color)] flex-shrink-0" />
                        <span className="text-xs font-bold text-white">Verified Badge Status</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Bio text area */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                    Biography (Bio)
                  </label>
                  <div className="relative">
                    <textarea
                      rows={5}
                      required
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Explain the artist profile, background themes, and sound design characteristics..."
                      className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2.5 pl-11 pr-4 text-xs placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all shadow-md focus:shadow-[0_0_15px_var(--accent-glow)]"
                    />
                    <FileText className="absolute left-4 top-3.5 w-4.5 h-4.5 text-[var(--text-muted)]" />
                  </div>
                </div>

              </div>

              {/* Right Column: Previews & URLs (lg:span-5) */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* Avatar URL Input & Picker */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                    Avatar Image URL
                  </label>
                  
                  {/* Preset Suggestions */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Presets:</span>
                    {avatarPresets.map((p, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setAvatarUrl(p.url)}
                        className="text-[9px] font-semibold bg-white/5 hover:bg-[var(--accent-color)] hover:text-black border border-white/5 px-2 py-0.5 rounded transition-all active-scale"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="url"
                      required
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2 pl-9 pr-4 text-xs placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all shadow-md focus:shadow-[0_0_15px_var(--accent-glow)] font-mono"
                    />
                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  </div>

                  {/* Circular preview card */}
                  <div className="flex items-center gap-4 bg-white/5 border border-[var(--glass-border)] p-3 rounded-[8px]">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-zinc-800 flex-shrink-0 flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-zinc-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block">Avatar Preview</span>
                      <span className="text-[9px] text-[var(--text-muted)] block truncate">{avatarUrl || 'No image selected'}</span>
                    </div>
                  </div>
                </div>

                {/* Banner URL Input & Picker */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold block">
                    Banner Image URL
                  </label>
                  
                  {/* Preset Suggestions */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Presets:</span>
                    {bannerPresets.map((p, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setBannerUrl(p.url)}
                        className="text-[9px] font-semibold bg-white/5 hover:bg-[var(--accent-color)] hover:text-black border border-white/5 px-2 py-0.5 rounded transition-all active-scale"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="url"
                      required
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2 pl-9 pr-4 text-xs placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all shadow-md focus:shadow-[0_0_15px_var(--accent-glow)] font-mono"
                    />
                    <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  </div>

                  {/* Horizontal banner preview card */}
                  <div className="relative h-20 w-full rounded-[8px] overflow-hidden bg-zinc-800 border border-[var(--glass-border)] flex items-center justify-center">
                    {bannerUrl ? (
                      <>
                        <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                          <span className="text-[10px] font-bold tracking-widest uppercase text-white/90">Banner Preview</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-zinc-600 gap-1">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-[9px] uppercase tracking-wider font-bold">No banner loaded</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </form>

            {/* Submission triggers */}
            <div className="pt-6 border-t border-[var(--glass-border)] mt-6">
              <button
                type="submit"
                disabled={isLoading}
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-black font-semibold text-sm py-3.5 rounded-[8px] active-scale transition-all border-glow shadow-lg cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 text-black animate-spin" />
                    Registering Artist...
                  </>
                ) : (
                  <>
                    <Award className="w-4.5 h-4.5 text-black" />
                    Register Artist to AURA
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Theme Vibe Sync Picker (Glow dots) */}
        <div className="mt-8 border-t border-white/5 pt-4 flex flex-col items-center gap-2 flex-shrink-0">
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
