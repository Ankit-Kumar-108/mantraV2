import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { tracks, artists, trackArtists } from "@/app/db/schema";
import { and, eq } from "drizzle-orm";
import { r2Client } from "@/app/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { corsHeaders } from "@/app/lib/cors";

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
    try {
        // Fetch all tracks with their artist info using Drizzle relations
        const allTracks = await db
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
                artistAvatar: artists.avatarUrl,
            })
            .from(tracks)
            .leftJoin(trackArtists, and(eq(tracks.id, trackArtists.trackId), eq(trackArtists.role, 'primary')))
            .leftJoin(artists, eq(trackArtists.artistId, artists.id));

        // Build full URLs for covers (public) and audio (presigned)
        const publicPrefix = process.env.R2_PUBLIC_URL_PREFIX;

        const tracksWithUrls = await Promise.all(
            allTracks.map(async (track) => {
                // Cover is in the public bucket — just prepend the public URL
                const coverFullUrl = `${publicPrefix}/${track.coverUrl}`;

                // Audio is in the private bucket — generate a presigned URL (1 hour)
                const signedAudioUrl = await getSignedUrl(
                    r2Client,
                    new GetObjectCommand({
                        Bucket: process.env.R2_PRIVATE_BUCKET_NAME,
                        Key: track.audioUrl,
                    }),
                    { expiresIn: 3600 } // 1 hour
                );

                return {
                    id: track.id,
                    title: track.title,
                    album: track.album,
                    duration: track.duration,
                    durationSec: track.durationSec,
                    genre: track.genre,
                    mood: track.mood,
                    plays: track.plays,
                    dateAdded: track.dateAdded,
                    coverUrl: coverFullUrl,
                    audioUrl: signedAudioUrl,
                    artist: {
                        id: track.artistId,
                        name: track.artistName,
                        avatarUrl: track.artistAvatar
                            ? `${publicPrefix}/${track.artistAvatar}`
                            : null,
                    },
                };
            })
        );

        return NextResponse.json(
            { success: true, tracks: tracksWithUrls },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: any) {
        console.error("[Tracks API Error]", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch tracks" },
            { status: 500, headers: corsHeaders }
        );
    }
}
