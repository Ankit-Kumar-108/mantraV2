import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { AdapterAccount } from 'next-auth/adapters';

// 1. Artists Table
export const artists = sqliteTable('artists', {
  id: text('id').primaryKey(), // e.g. "aether"
  name: text('name').notNull(),
  avatarUrl: text('avatar_url').notNull(),
  bannerUrl: text('banner_url').notNull(),
  monthlyListeners: integer('monthly_listeners').notNull().default(0),
  verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
  bio: text('bio').notNull(),
});

// 2. Tracks Table
export const tracks = sqliteTable('tracks', {
  id: text('id').primaryKey(), // e.g. "track-1"
  title: text('title').notNull(),
  artistId: text('artist_id').notNull().references(() => artists.id, { onDelete: 'cascade' }),
  album: text('album').notNull(),
  coverUrl: text('cover_url').notNull(),
  audioUrl: text('audio_url').notNull(), // Stream URL (Google Drive Alt Link or Cloudflare R2 link)
  duration: text('duration').notNull(), // e.g. "6:12"
  durationSec: integer('duration_sec').notNull(), // e.g. 372
  genre: text('genre').notNull(),
  mood: text('mood').notNull(),
  plays: integer('plays').notNull().default(0),
  dateAdded: text('date_added').notNull(),
});

// 3. Playlists & Albums Table
export const playlists = sqliteTable('playlists', {
  id: text('id').primaryKey(), // e.g. "playlist-1"
  name: text('name').notNull(),
  description: text('description').notNull(),
  coverUrl: text('cover_url').notNull(),
  creator: text('creator').notNull(), // e.g. "AURA Curator"
  type: text('type').$type<'playlist' | 'album'>().notNull(), // Restricts values in TypeScript
  releaseYear: integer('release_year'), // Optional, mainly for albums
});

// 4. Junction Table for Playlist-to-Track Many-to-Many Relationship
export const playlistTracks = sqliteTable('playlist_tracks', {
  playlistId: text('playlist_id').notNull().references(() => playlists.id, { onDelete: 'cascade' }),
  trackId: text('track_id').notNull().references(() => tracks.id, { onDelete: 'cascade' }),
}, (t) => [
  primaryKey({ columns: [t.playlistId, t.trackId] })
]);

// 5. Auth.js Users Table
export const users = sqliteTable('user', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  password: text('password'),
});

// 6. Auth.js Accounts Table (Links social logins like Google to the user)
export const accounts = sqliteTable('account', {
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccount['type']>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => [
  primaryKey({ columns: [account.provider, account.providerAccountId] })
]);

// 7. Auth.js Sessions Table
export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

// 8. Auth.js Verification Tokens Table (For magic link sign-ins)
export const verificationTokens = sqliteTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
}, (vt) => [
  primaryKey({ columns: [vt.identifier, vt.token] })
]);


// Relations

export const artistsRelations = relations(artists, ({ many }) => ({
  tracks: many(tracks),
}));

export const tracksRelations = relations(tracks, ({ one, many }) => ({
  artist: one(artists, {
    fields: [tracks.artistId],
    references: [artists.id],
  }),
  playlistLinks: many(playlistTracks),
}));

export const playlistsRelations = relations(playlists, ({ many }) => ({
  trackLinks: many(playlistTracks),
}));

export const playlistTracksRelations = relations(playlistTracks, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistTracks.playlistId],
    references: [playlists.id],
  }),
  track: one(tracks, {
    fields: [playlistTracks.trackId],
    references: [tracks.id],
  }),
}));
