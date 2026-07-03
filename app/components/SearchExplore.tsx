'use client';

import React, { useState } from 'react';
import { Search as SearchIcon, History, X, Play, Pause, Calendar, ArrowRight, Heart } from 'lucide-react';
import { TRACKS, Track } from '../data/musicData';

interface SearchExploreProps {
  tracks: Track[]
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, trackList?: Track[]) => void;
  likedTracks: string[];
  onToggleLike: (trackId: string) => void;
  recentSearches: string[];
  onAddSearch: (query: string) => void;
  onClearHistory: () => void;
  onViewArtist: (artistId: string) => void;
}

export default function SearchExplore({
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  likedTracks,
  onToggleLike,
  recentSearches,
  onAddSearch,
  onClearHistory,
  onViewArtist,
}: SearchExploreProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<{ type: 'genre' | 'mood' | 'all'; value: string }>({ type: 'all', value: '' });

  // Handle live search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      setFilterType({ type: 'all', value: '' }); // Reset genre/mood filter if searching text
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onAddSearch(searchQuery.trim());
    }
  };

  const handleHistoryItemClick = (query: string) => {
    setSearchQuery(query);
    setFilterType({ type: 'all', value: '' });
    onAddSearch(query);
  };

  const handleCategoryClick = (type: 'genre' | 'mood', value: string) => {
    setFilterType({ type, value });
    setSearchQuery(''); // Reset search input
    onAddSearch(`Category: ${value}`); // Log category search
  };

  const handleClearFilter = () => {
    setFilterType({ type: 'all', value: '' });
    setSearchQuery('');
  };

  // Filter track database based on query or categories
  const getFilteredTracks = () => {
    let list = tracks;

    if (filterType.type === 'genre') {
      list = list.filter(t => t.genre.toLowerCase() === filterType.value.toLowerCase());
    } else if (filterType.type === 'mood') {
      list = list.filter(t => t.mood.toLowerCase() === filterType.value.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        t => 
          t.title.toLowerCase().includes(q) || 
          t.artistName.toLowerCase().includes(q) || 
          t.album.toLowerCase().includes(q) ||
          t.genre.toLowerCase().includes(q)
      );
    }

    return list;
  };

  const filteredTracks = getFilteredTracks();

  const genres = [
    { name: 'Synthwave', color: 'from-pink-600 to-purple-800', desc: 'Neon nostalgia' },
    { name: 'Cyberpunk', color: 'from-cyan-600 to-blue-900', desc: 'Heavy synthesizer grids' },
    { name: 'Lo-Fi', color: 'from-amber-600 to-amber-900', desc: 'Smooth lazy loops' },
    { name: 'Acoustic', color: 'from-emerald-600 to-teal-800', desc: 'Calming authentic strums' },
    { name: 'Cinematic', color: 'from-violet-700 to-indigo-950', desc: 'Expansive epic scores' },
  ];

  const moods = [
    { name: 'Focus', color: 'from-zinc-700 to-zinc-900', desc: 'Calm and steady productivity' },
    { name: 'Chill', color: 'from-sky-500 to-indigo-800', desc: 'Slow down and drift away' },
    { name: 'Energetic', color: 'from-orange-500 to-rose-700', desc: 'High pulse rhythms' },
    { name: 'Sad', color: 'from-slate-600 to-slate-800', desc: 'Comfort in melodies' },
  ];

  const liveEvents = [
    { title: 'Cyber Lounge Live', curator: 'AURA Beats', listeners: '14.2K listening', date: 'LIVE NOW' },
    { title: 'Retro Grid Fest 2026', curator: 'Vortex Theory', listeners: 'Starts 9PM EST', date: 'Jul 5' },
    { title: 'Acoustic Solace Session', curator: 'Sarah Chen', listeners: 'Weekly Stream', date: 'Jul 12' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 select-none">
      {/* Search Header & Bar */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-glow bg-gradient-to-r from-white to-[var(--text-secondary)] bg-clip-text text-transparent mb-4">
          Search & Explore
        </h1>
        <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
          <input
            type="text"
            placeholder="Search by tracks, artists, albums, or genres..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-[var(--panel-bg)] hover:bg-[var(--panel-bg-hover)] border border-[var(--glass-border)] focus:border-[var(--accent-color)] rounded-full py-3 md:py-3.5 pl-11 md:pl-12 pr-10 text-xs md:text-sm placeholder-[var(--text-muted)] text-[var(--text-primary)] focus:outline-none transition-all shadow-md focus:shadow-[0_0_15px_var(--accent-glow)]"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearFilter}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Main Grid: Shows results if searching/filtering, otherwise default Categories */}
      {searchQuery || filterType.type !== 'all' ? (
        <section className="mb-10 animate-fade-in">
          <div className="flex items-center justify-between mb-5 border-b border-[var(--glass-border)] pb-3">
            <h3 className="text-sm md:text-lg font-bold tracking-tight text-glow">
              {filterType.type !== 'all' 
                ? `Filter: ${filterType.value}` 
                : `Search results for "${searchQuery}"`}
              <span className="text-xs font-normal text-[var(--text-secondary)] ml-3 hidden sm:inline">
                ({filteredTracks.length} found)
              </span>
            </h3>
            <button
              onClick={handleClearFilter}
              className="text-xs text-[var(--accent-color)] hover:underline flex items-center gap-1 active-scale"
            >
              Clear filters
            </button>
          </div>

          {filteredTracks.length > 0 ? (
            <div className="flex flex-col gap-1.5 max-w-3xl">
              {filteredTracks.map((track) => {
                const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;
                const isLiked = likedTracks.includes(track.id);

                return (
                  <div
                    key={track.id}
                    onClick={() => onPlayTrack(track, filteredTracks)}
                    className="flex items-center justify-between p-2 md:p-2.5 rounded-[8px] hover:bg-white/5 border border-transparent transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-9 h-9 md:w-11 md:h-11 rounded-[6px] overflow-hidden bg-zinc-800 flex-shrink-0 shadow-sm">
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
                        <span className={`text-xs md:text-sm font-semibold truncate block ${
                          currentTrack?.id === track.id ? 'text-[var(--accent-color)] font-bold text-glow' : ''
                        }`}>
                          {track.title}
                        </span>
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewArtist(track.artistId);
                          }}
                          className="text-[10px] md:text-xs text-[var(--text-secondary)] truncate block hover:underline mt-0.5"
                        >
                          {track.artistName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                      <span className="text-[10px] md:text-xs bg-white/5 border border-[var(--glass-border)] px-2 py-0.5 rounded-[4px] text-[var(--text-secondary)] font-mono hidden sm:inline">
                        {track.genre}
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
          ) : (
            <div className="py-12 text-center max-w-md">
              <p className="text-sm text-[var(--text-secondary)]">No songs, artists, or albums match your search query.</p>
              <button
                onClick={handleClearFilter}
                className="mt-4 text-xs bg-[var(--accent-color)] text-black font-semibold px-4 py-2 rounded-full active-scale"
              >
                Reset Search
              </button>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Recent Searches
                </span>
                <button
                  onClick={onClearHistory}
                  className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] hover:text-white"
                >
                  Clear History
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleHistoryItemClick(query)}
                    className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] hover:border-zinc-700 rounded-full px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer"
                  >
                    <span>{query}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Genre Category Tiles */}
          <section className="mb-10">
            <h3 className="text-lg font-bold tracking-tight mb-4 text-glow">Browse by Genre</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {genres.map((g) => (
                <div
                  key={g.name}
                  onClick={() => handleCategoryClick('genre', g.name)}
                  className={`h-36 rounded-[12px] bg-gradient-to-br ${g.color} p-4 flex flex-col justify-between cursor-pointer group shadow-lg hover:scale-[1.03] transition-all relative overflow-hidden active-scale`}
                >
                  {/* Subtle Grid overlay for Cyberpunk */}
                  {g.name === 'Cyberpunk' && (
                    <div className="absolute inset-0 bg-image pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:10px_10px]" />
                  )}
                  <div>
                    <h4 className="font-extrabold text-lg text-white tracking-tight">{g.name}</h4>
                    <p className="text-[10px] text-white/70 font-medium leading-tight mt-1">{g.desc}</p>
                  </div>
                  <span className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center self-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Mood Category Tiles */}
          <section className="mb-10">
            <h3 className="text-lg font-bold tracking-tight mb-4 text-glow">Soundscapes by Mood</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {moods.map((m) => (
                <div
                  key={m.name}
                  onClick={() => handleCategoryClick('mood', m.name)}
                  className={`h-28 rounded-[12px] bg-gradient-to-br ${m.color} p-4 flex flex-col justify-between cursor-pointer group shadow-md hover:scale-[1.03] transition-all relative overflow-hidden active-scale`}
                >
                  <div>
                    <h4 className="font-extrabold text-base text-white tracking-tight">{m.name}</h4>
                    <p className="text-[10px] text-white/70 font-medium leading-tight mt-1">{m.desc}</p>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center self-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Live Events Section */}
          <section className="mb-6">
            <h3 className="text-lg font-bold tracking-tight mb-4 text-glow">Live Streaming Broadcasts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {liveEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="glass-panel p-4 rounded-[12px] flex items-center justify-between border border-[var(--glass-border)] relative overflow-hidden"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-extrabold tracking-widest text-[var(--accent-color)] text-glow block mb-1">
                      {event.date}
                    </span>
                    <h4 className="font-bold text-sm text-[var(--text-primary)] truncate">{event.title}</h4>
                    <span className="text-xs text-[var(--text-secondary)] block mt-0.5">{event.curator}</span>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] mb-2">{event.listeners}</span>
                    <button
                      onClick={() => {
                        // Play track 1 or 2 as a simulated live event audio
                        onPlayTrack(TRACKS[idx % TRACKS.length]);
                      }}
                      className="flex items-center gap-1 bg-white/10 hover:bg-[var(--accent-color)] hover:text-black font-semibold text-[10px] px-3 py-1.5 rounded-full active-scale transition-all"
                    >
                      <Calendar className="w-3 h-3" />
                      Tune In
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
