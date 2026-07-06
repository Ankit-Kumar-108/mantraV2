import { NextRequest, NextResponse } from "next/server";
import { r2Client } from "@/app/lib/r2";
import { corsHeaders } from "@/app/lib/cors";
import { auth } from "@/auth";
import { db } from "@/app/db";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { artists, trackArtists, tracks, playlists, playlistTracks } from "@/app/db/schema";

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        // 1. Auth & Admin Check
        const session = await auth();
        const adminMail = process.env.ADMIN_MAIL;

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorised, Please Signin' },
                { status: 401, headers: corsHeaders }
            );
        }

        if (session.user.email !== adminMail) {
            return NextResponse.json(
                { success: false, message: `Unauthorised. Only Admin is allowed to Upload` },
                { status: 403, headers: corsHeaders }
            );
        }

        // 2. Parse form data
        const formData = await req.formData();
        const artistId = formData.get('artistId') as string;
        const featuredArtistIdsStr = formData.get('featuredArtistIds') as string || '';
        const featuredArtistIds = featuredArtistIdsStr
            ? featuredArtistIdsStr.split(',').map(id => id.trim())
            : [];

        const artistName = (formData.get('artistName') as string) || artistId;
        const title = formData.get('title') as string;
        const album = (formData.get('album') as string) || 'Single';
        const duration = formData.get('duration') as string;
        const durationSecStr = formData.get('durationSec') as string;
        const genre = formData.get('genre') as string;
        const mood = formData.get('mood') as string;

        const audioFile = formData.get('audio') as File | null;
        const coverFile = formData.get('cover') as File | null;

        // 3. Validate required fields (album is optional, defaults to 'Single')
        if (!artistId || !title || !duration || !durationSecStr || !genre || !mood) {
            return NextResponse.json(
                { success: false, message: `Missing required fields. Got: artistId=${artistId}, title=${title}, duration=${duration}, durationSec=${durationSecStr}, genre=${genre}, mood=${mood}` },
                { status: 400, headers: corsHeaders }
            );
        }

        // Fetch primary artist details from Turso DB
        const [primaryArtist] = await db
            .select()
            .from(artists)
            .where(eq(artists.id, artistId))
            .limit(1);

        const officialName = primaryArtist ? primaryArtist.name : artistId;
        const cleanArtistName = officialName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '');


        if (!audioFile || !coverFile) {
            return NextResponse.json(
                { success: false, message: 'Missing audio or cover file' },
                { status: 400, headers: corsHeaders }
            );
        }

        const durationSec = parseInt(durationSecStr, 10);
        if (isNaN(durationSec)) {
            return NextResponse.json(
                { success: false, message: 'durationSec must be a number' },
                { status: 400, headers: corsHeaders }
            );
        }

        // 4. Validate file sizes and types
        if (audioFile.size > 50 * 1024 * 1024 || !audioFile.type.startsWith('audio/')) {
            return NextResponse.json(
                { success: false, message: `Invalid audio file. Type: ${audioFile.type}, Size: ${(audioFile.size / 1024 / 1024).toFixed(1)}MB` },
                { status: 400, headers: corsHeaders }
            );
        }

        if (coverFile.size > 5 * 1024 * 1024 || !coverFile.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, message: `Invalid cover file. Type: ${coverFile.type}, Size: ${(coverFile.size / 1024 / 1024).toFixed(1)}MB` },
                { status: 400, headers: corsHeaders }
            );
        }

        // 5. Prepare file keys for R2
        const timestamp = Date.now();
        const cleanAudioName = audioFile.name.replace(/\s+/g, '_');
        const cleanCoverName = coverFile.name.replace(/\s+/g, '_');
        // Organize upload path by the primary artist
        const audioKey = `artists/${cleanArtistName}/songs/${timestamp}-${cleanAudioName}`;
        const coverKey = `artists/${cleanArtistName}/covers/${timestamp}-${cleanCoverName}`;

        const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
        const coverBuffer = Buffer.from(await coverFile.arrayBuffer());

        // 6. Upload audio + cover to R2 in parallel
        await Promise.all([
            r2Client.send(new PutObjectCommand({
                Bucket: process.env.R2_PRIVATE_BUCKET_NAME,
                Key: audioKey,
                Body: audioBuffer,
                ContentType: audioFile.type,
            })),
            r2Client.send(new PutObjectCommand({
                Bucket: process.env.R2_PUBLIC_BUCKET_NAME,
                Key: coverKey,
                Body: coverBuffer,
                ContentType: coverFile.type,
            })),
        ]);

        // Check if artist exists, if not create one
        const [existingArtist] = await db.select().from(artists).where(eq(artists.id, artistId)).limit(1);

        if (!existingArtist) {
            await db.insert(artists).values({
                id: artistId,
                name: artistName,
                avatarUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&h=400&fit=crop",
                bannerUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&h=400&fit=crop",
                monthlyListeners: 0,
                verified: false,
                bio: "Independent artist on AURA",
            });
        }

        // 8. Insert track record into Turso DB
        // 1. Insert Track record
        const trackId = `track-${crypto.randomUUID()}`;
        await db.insert(tracks).values({
            id: trackId,
            title,
            album,
            coverUrl: coverKey,
            audioUrl: audioKey,
            duration,
            durationSec,
            genre,
            mood,
            dateAdded: new Date().toISOString().split('T')[0],
        });

        // 2. Build insertion list for track-artist relationships
        const relationValues = [
            { trackId, artistId: artistId, role: 'primary' as const },
            ...featuredArtistIds.map(fId => ({
                trackId,
                artistId: fId,
                role: 'featured' as const
            }))
        ];

        // 3. Insert relationships into Turso
        await db.insert(trackArtists).values(relationValues);

        // 4. Automatically create album and link track to it if it is not a "Single"
        if (album && album.toLowerCase() !== 'single') {
            const albumId = `album-${album.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '')}`;
            
            // Check if album already exists
            const [existingAlbum] = await db
                .select()
                .from(playlists)
                .where(eq(playlists.id, albumId))
                .limit(1);

            if (!existingAlbum) {
                await db.insert(playlists).values({
                    id: albumId,
                    name: album,
                    description: `Album by ${artistName}`,
                    coverUrl: coverKey,
                    creator: artistName,
                    type: 'album',
                    releaseYear: new Date().getFullYear(),
                });
            }

            // Link track to this album
            await db.insert(playlistTracks).values({
                playlistId: albumId,
                trackId: trackId,
            });
        }


        return NextResponse.json(
            { success: true, message: 'Track uploaded and added in DB successfully', trackId },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: any) {
        console.error('[Upload API Error]', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal Server Error' },
            { status: 500, headers: corsHeaders }
        );
    }
}