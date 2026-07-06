import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { playlists, playlistTracks, tracks, trackArtists, artists } from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import { r2Client } from "@/app/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { corsHeaders } from "@/app/lib/cors";
import { auth } from "@/auth";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorised" },
        { status: 401, headers: corsHeaders }
      );
    }

    const list = await db.select().from(playlists);

    const publicPrefix = process.env.R2_PUBLIC_URL_PREFIX;
    const getFullUrl = (urlPath: string) => {
      if (!urlPath) return "";
      if (urlPath.startsWith("http://") || urlPath.startsWith("https://")) {
        return urlPath;
      }
      return `${publicPrefix}/${urlPath}`;
    };

    const playlistsWithTracks = await Promise.all(
      list.map(async (playlist) => {
        // Query linked tracks for this playlist/album
        const playlistTracksData = await db
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
            artistId: trackArtists.artistId,
            artistName: artists.name,
          })
          .from(playlistTracks)
          .where(eq(playlistTracks.playlistId, playlist.id))
          .innerJoin(tracks, eq(playlistTracks.trackId, tracks.id))
          .leftJoin(
            trackArtists,
            and(eq(tracks.id, trackArtists.trackId), eq(trackArtists.role, "primary"))
          )
          .leftJoin(artists, eq(trackArtists.artistId, artists.id));

        const tracksWithUrls = await Promise.all(
          playlistTracksData.map(async (track) => {
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
                  { expiresIn: 3600 }
                );
              } catch (e) {
                console.error(`Error signing URL for track ${track.id}:`, e);
              }
            }

            return {
              id: track.id,
              title: track.title,
              album: track.album,
              coverUrl: getFullUrl(track.coverUrl),
              audioUrl: signedAudioUrl,
              duration: track.duration,
              durationSec: track.durationSec,
              genre: track.genre,
              mood: track.mood,
              plays: track.plays,
              dateAdded: track.dateAdded,
              artistId: track.artistId || "",
              artistName: track.artistName || "Unknown Artist",
            };
          })
        );

        return {
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          coverUrl: getFullUrl(playlist.coverUrl),
          creator: playlist.creator,
          type: playlist.type,
          releaseYear: playlist.releaseYear,
          tracks: tracksWithUrls,
        };
      })
    );

    return NextResponse.json(
      { success: true, playlists: playlistsWithTracks },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("[Playlists API Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch playlists" },
      { status: 500, headers: corsHeaders }
    );
  }
}
