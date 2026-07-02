import { NextResponse } from "next/server";
import { db } from "@/app/db";
import {users} from "@/app/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { corsHeaders } from "@/app/lib/cors";

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
    try {
        const {email, password, name} = await req.json();

        if (!email || !password) {
            return NextResponse.json({
                success: false,
                message: "Email and password are required",
            }, {status: 400, headers: corsHeaders});
        }

        const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (existing) {
            return NextResponse.json({
                success: false,
                message: "User already exists",
            }, {status: 400, headers: corsHeaders});
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const [newUser] = await db.insert(users).values({
            id: crypto.randomUUID(),
            email,
            password: hashedPassword,
            name: name || "",
            emailVerified: new Date(),
        }).returning()

        const {password: _, ...userWithoutPassword} = newUser;

        return NextResponse.json({
            success: true,
            user: userWithoutPassword,
        }, {status: 201, headers: corsHeaders});

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: "Internal Server Error",
        }, {status: 500, headers: corsHeaders})
    }
}