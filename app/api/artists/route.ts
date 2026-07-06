import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { artists } from "@/app/db/schema"; 
import { corsHeaders } from "@/app/lib/cors";
import { auth } from "@/auth";

export async function OPTIONS(){
    return new NextResponse(null, {status: 204, headers: corsHeaders})
}
export async function GET() {
    try {
      const session = await auth()
      if (!session?.user){
          return NextResponse.json({success: false, message: "Unauthorised"}, {status: 401, headers: corsHeaders})
      }

      const data = await db.query.artists.findMany();

      const publicPrefix = process.env.R2_PUBLIC_URL_PREFIX;
      const getFullUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `${publicPrefix}/${url}`;
      };

      const formattedArtists = data.map(artist => ({
        ...artist,
        avatarUrl: getFullUrl(artist.avatarUrl),
        bannerUrl: getFullUrl(artist.bannerUrl),
      }));

      return NextResponse.json({success: true, artists: formattedArtists}, {status: 200, headers: corsHeaders})
  } catch (error) {
    console.error("Error fetching artists:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}