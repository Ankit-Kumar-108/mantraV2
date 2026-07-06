import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/app/db";
import { artists } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { corsHeaders } from "@/app/lib/cors";

export async function OPTION(){
    return new NextResponse(null, {status: 204, headers: corsHeaders});
}

export async function POST(req: NextRequest){
    try {
        const session = await auth ()
        const adminMail = process.env.ADMIN_MAIL

        if (!session?.user){
            return NextResponse.json(
                {success: false, message: 'Unauthorised, Please Signin'},
                {status: 401, headers: corsHeaders}
            )
        }

        if (session.user.email !== adminMail){
            return NextResponse.json(
                {success: false, message: `Unauthorised. Only Admin is allowed to Register an Artist`},
                {status: 403, headers: corsHeaders}
            )
        }

        const formData = await req.formData()
        const artistId = formData.get('artistId') as string
        const artistName = (formData.get('artistName') as string) || artistId
        const avatarUrl = formData.get('avatarUrl') as string
        const bannerUrl = formData.get('bannerUrl') as string
        const bio = formData.get('bio') as string
        const monthlyListeners = Number(formData.get('monthlyListeners')) || 0
        const verified = Boolean(formData.get('verified')) || false

        if (!artistId || !artistName || !avatarUrl || !bannerUrl || !bio){
            return NextResponse.json(
                {success: false, message: `Missing required fields. Got: artistId=${artistId}, artistName=${artistName}, avatarUrl=${avatarUrl}, bannerUrl=${bannerUrl}, bio=${bio}`},
                {status: 400, headers: corsHeaders}
            )
        }

        //check if artist already exists
        const [existingArtist] = await db.select().from(artists).where(eq(artists.id, artistId)).limit(1);

        if (existingArtist){
            return NextResponse.json(
                {success: false, message: `Artist with ID ${artistId} already exists`},
                {status: 400, headers: corsHeaders}
            )
        }

        //insert artist
        await db.insert(artists).values({
            id: artistId,
            name: artistName,
            avatarUrl,
            bannerUrl,
            bio,
            monthlyListeners,
            verified,
        });

        return NextResponse.json(
            {success: true, message: `Artist ${artistName} registered successfully`},
            {status: 200, headers: corsHeaders}
        );

    } catch (error: any) {

        return NextResponse.json(
            { success: false, message: `Failed to register artist: ${error.message}` },
            { status: 500, headers: corsHeaders }
        );
    }
}