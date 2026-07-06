// app/db/seed.ts
import "dotenv/config"
import { db } from '.';
import { artists, tracks, playlists, playlistTracks, trackArtists } from './schema';
import { ARTISTS, TRACKS, PLAYLISTS } from '../data/musicData';

async function seed() {
  console.log("🌱 Starting database seeding...");

  // 1. Clear existing data (to avoid duplicate key conflicts if run multiple times)
  console.log("🧹 Cleaning existing data...");
  await db.delete(playlistTracks);
  await db.delete(trackArtists);
  await db.delete(tracks);
  await db.delete(playlists);
  await db.delete(artists);

  // 2. Insert Artists
  console.log("🎙️ Inserting artists...");
  for (const artist of ARTISTS) {
    await db.insert(artists).values({
      id: artist.id,
      name: artist.name,
      avatarUrl: artist.avatarUrl,
      bannerUrl: artist.bannerUrl,
      monthlyListeners: artist.monthlyListeners,
      verified: artist.verified,
      bio: artist.bio,
    });
  }

  // 3. Insert Tracks
  console.log("🎵 Inserting tracks...");
  for (const track of TRACKS) {
    await db.insert(tracks).values({
      id: track.id,
      title: track.title,
      album: track.album,
      coverUrl: track.coverUrl,
      audioUrl: track.audioUrl,
      duration: track.duration,
      durationSec: track.durationSec,
      genre: track.genre,
      mood: track.mood,
      plays: track.plays,
      dateAdded: track.dateAdded,
    });

    if (track.artistId) {
      await db.insert(trackArtists).values({
        trackId: track.id,
        artistId: track.artistId,
        role: 'primary',
      });
    }
  }

  // 4. Insert Playlists and Playlist-Track Links
  console.log("📋 Inserting playlists and linking tracks...");
  for (const playlist of PLAYLISTS) {
    await db.insert(playlists).values({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      coverUrl: playlist.coverUrl,
      creator: playlist.creator,
      type: playlist.type,
      releaseYear: playlist.releaseYear || null,
    });

    // Link tracks to this playlist
    for (const track of playlist.tracks) {
      await db.insert(playlistTracks).values({
        playlistId: playlist.id,
        trackId: track.id,
      });
    }
  }

  console.log("✅ Seeding completed successfully!");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
