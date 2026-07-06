'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, User, Users, Award, Search, Sparkles, 
  Loader2, ShieldAlert, CheckCircle 
} from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  bannerUrl: string;
  monthlyListeners: number;
  verified: boolean;
  bio: string;
}

export default function ArtistsPage() {
  const router = useRouter();

  // Data states
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Theme Vibe State
  const [theme, setTheme] = useState<'sonic-deep' | 'electric-pulse' | 'pure-minimalist' | 'retro-futurist'>('sonic-deep');

  // Load saved theme and fetch artists list on mount
  useEffect(() => {
    // 1. Sync theme preset
    const savedTheme = localStorage.getItem('aura-theme') as any;
    if (savedTheme && ['sonic-deep', 'electric-pulse', 'pure-minimalist', 'retro-futurist'].includes(savedTheme)) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // 2. Fetch artists list
    async function fetchArtists() {
      try {
        setIsLoading(true);
        setError('');
        const res = await fetch('/api/artists');
        const data = await res.json();

        if (res.status === 401) {
          throw new Error('Unauthorised. Please Signin to browse artists.');
        }

        if (!res.ok) {
          throw new Error(data.message || `Server returned status ${res.status}`);
        }

        if (data.success && Array.isArray(data.artists)) {
          setArtists(data.artists);
        } else {
          setArtists([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load artists directory.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchArtists();
  }, []);

  // Update theme state and persist
  const handleThemeChange = (newTheme: 'sonic-deep' | 'electric-pulse' | 'pure-minimalist' | 'retro-futurist') => {
    setTheme(newTheme);
    localStorage.setItem('aura-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Filter logic
  const filteredArtists = artists.filter((artist) => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          artist.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerified = !showVerifiedOnly || artist.verified;
    return matchesSearch && matchesVerified;
  });

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
          <span className="text-sm font-black tracking-tight hidden sm:inline">AURA DIRECTORY</span>
        </div>
      </div>

      {/* Main Panel */}
      <div className="max-w-5xl w-full mx-auto glass-panel p-6 md:p-8 rounded-[16px] border border-[var(--glass-border)] shadow-2xl relative z-10 flex-grow flex flex-col justify-between mb-6">
        
        {/* Header Section */}
        <div className="border-b border-[var(--glass-border)] pb-4 mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-glow flex items-center gap-2">
            <Users className="w-6 h-6 text-[var(--accent-color)] text-glow" />
            Artists Directory
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Browse the creators behind AURA's custom modular soundscapes. Click an artist to view their full profile.
          </p>
        </div>

        {/* Dynamic State Rendering */}
        {isLoading ? (
          /* Loading State */
          <div className="flex-grow flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[var(--accent-color)] animate-spin mb-3" />
            <p className="text-xs text-[var(--text-secondary)] font-mono">Fetching creator database...</p>
          </div>
        ) : error ? (
          /* Error State (e.g. Unauthorised) */
          <div className="flex-grow flex flex-col items-center justify-center py-12 max-w-md mx-auto text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white text-glow">Browse Blocked</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{error}</p>
            </div>
            {error.includes('Unauthorised') && (
              <Link 
                href="/login" 
                className="bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-black font-bold text-xs px-6 py-3 rounded-full active-scale transition-colors shadow-md"
              >
                Sign In to Account
              </Link>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* DIRECTORY CONTENT                                                         */
          /* ========================================================================= */
          <div className="flex-grow flex flex-col justify-between">
            
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-[8px] py-2 pl-9 pr-4 text-xs placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all shadow-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              </div>

              <button
                onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 border px-4 py-2 rounded-[8px] text-xs font-semibold active-scale transition-all ${
                  showVerifiedOnly 
                    ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)] shadow-[0_0_10px_rgba(29,185,84,0.08)]' 
                    : 'border-[var(--glass-border)] hover:bg-white/5 text-[var(--text-secondary)]'
                }`}
              >
                <Award className={`w-4 h-4 ${showVerifiedOnly ? 'text-[var(--accent-color)]' : ''}`} />
                Verified Only
              </button>
            </div>

            {/* Artists grid */}
            {filteredArtists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8 flex-grow content-start">
                {filteredArtists.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => router.push(`/?artist=${artist.id}`)}
                    className="flex flex-col items-center text-center p-4 rounded-[12px] bg-white/5 border border-transparent hover:border-[var(--glass-border)] hover:bg-white/10 cursor-pointer transition-all duration-300 group active-scale shadow-sm relative overflow-hidden"
                  >
                    {/* Glowing highlight on hover */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-color)]/0 to-[var(--accent-color)]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    {/* Circular Avatar */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[var(--accent-color)] shadow-md transition-all duration-300 bg-zinc-850 flex-shrink-0 relative">
                      {artist.avatarUrl ? (
                        <img 
                          src={artist.avatarUrl} 
                          alt={artist.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                          <User className="w-10 h-10 text-zinc-600" />
                        </div>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="mt-4 min-w-0 w-full space-y-1">
                      <span className="text-sm font-bold text-white group-hover:text-[var(--accent-color)] transition-colors flex items-center justify-center gap-1.5 truncate">
                        {artist.name}
                        {artist.verified && (
                          <Award className="w-4 h-4 text-[var(--accent-color)] flex-shrink-0" />
                        )}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono block">
                        {artist.monthlyListeners.toLocaleString('en-US')} listeners
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty Directory State */
              <div className="flex-grow flex flex-col items-center justify-center py-20 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[var(--text-muted)] border border-white/5">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white block mt-2">No creators found</span>
                <span className="text-[10px] text-[var(--text-muted)] block">Try adjusting your search filters.</span>
              </div>
            )}

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
