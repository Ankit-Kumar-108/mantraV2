import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { artists, trackArtists, tracks } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { r2Client } from "@/app/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { corsHeaders } from "@/app/lib/cors";
import { auth } from "@/auth";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorised" },
        { status: 401, headers: corsHeaders }
      );
    }

    const { id } = await params;

    // 1. Fetch artist details
    const [artist] = await db
      .select()
      .from(artists)
      .where(eq(artists.id, id))
      .limit(1);

    if (!artist) {
      return NextResponse.json(
        { success: false, message: "Artist profile not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 2. Fetch tracks related to this artist (both primary and featured)
    const primaryTrackArtists = alias(trackArtists, "primary_track_artists");
    const primaryArtists = alias(artists, "primary_artists");

    const artistTracks = await db
      .select({
        id: tracks.id,
        title: tracks.title,
        album: tracks.album,
        coverUrl: tracks.coverUrl,
        audioUrl: tracks.audioUrl,
        duration: tracks.duration,
        durationSec: tracks.durationSec,
        genre: tracks.genre,
        mood: tracks.mood,
        plays: tracks.plays,
        dateAdded: tracks.dateAdded,
        role: trackArtists.role, // role of our artist on this track
        artistId: primaryArtists.id,
        artistName: primaryArtists.name,
        artistAvatar: primaryArtists.avatarUrl,
      })
      .from(trackArtists)
      .where(eq(trackArtists.artistId, id))
      .innerJoin(tracks, eq(trackArtists.trackId, tracks.id))
      .leftJoin(
        primaryTrackArtists,
        and(
          eq(tracks.id, primaryTrackArtists.trackId),
          eq(primaryTrackArtists.role, "primary")
        )
      )
      .leftJoin(
        primaryArtists,
        eq(primaryTrackArtists.artistId, primaryArtists.id)
      );

    const publicPrefix = process.env.R2_PUBLIC_URL_PREFIX;

    const getFullUrl = (urlPath: string) => {
      if (!urlPath) return "";
      if (urlPath.startsWith("http://") || urlPath.startsWith("https://")) {
        return urlPath;
      }
      return `${publicPrefix}/${urlPath}`;
    };

    // 3. Process track URLs (covers and signed audio URLs)
    const topTracks = await Promise.all(
      artistTracks.map(async (track) => {
        const coverFullUrl = getFullUrl(track.coverUrl);
        let signedAudioUrl = track.audioUrl;

        if (
          track.audioUrl &&
          !track.audioUrl.startsWith("http://") &&
          !track.audioUrl.startsWith("https://")
        ) {
          try {
            signedAudioUrl = await getSignedUrl(
              r2Client,
              new GetObjectCommand({
                Bucket: process.env.R2_PRIVATE_BUCKET_NAME,
                Key: track.audioUrl,
              }),
              { expiresIn: 3600 } // 1 hour
            );
          } catch (err) {
            console.error(`Error signing URL for key ${track.audioUrl}:`, err);
          }
        }

        return {
          id: track.id,
          title: track.title,
          album: track.album,
          coverUrl: coverFullUrl,
          audioUrl: signedAudioUrl,
          duration: track.duration,
          durationSec: track.durationSec,
          genre: track.genre,
          mood: track.mood,
          plays: track.plays,
          dateAdded: track.dateAdded,
          artistId: track.artistId || id,
          artistName: track.artistName || artist.name,
          role: track.role,
        };
      })
    );

    // 4. Return processed artist object with topTracks
    return NextResponse.json(
      {
        success: true,
        artist: {
          id: artist.id,
          name: artist.name,
          avatarUrl: getFullUrl(artist.avatarUrl),
          bannerUrl: getFullUrl(artist.bannerUrl),
          monthlyListeners: artist.monthlyListeners,
          verified: artist.verified,
          bio: artist.bio,
          topTracks,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error(`[Artist GET API Error for ID]:`, error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch artist profile" },
      { status: 500, headers: corsHeaders }
    );
  }
}
