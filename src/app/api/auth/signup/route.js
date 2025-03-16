import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        console.log("📥 Signup request received");
        
        const body = await req.json();
        console.log("📋 Request body:", JSON.stringify(body, null, 2));
        
        const {name, email, password, height, weight, gender} = body;

        // Validate gender
        if (!gender || !['Male', 'Female', 'Other'].includes(gender)) {
            console.log("❌ Invalid gender:", gender);
            return NextResponse.json({
                success: false, 
                message: "Gender must be Male, Female, or Other"
            }, {status: 400});
        }

        console.log("✅ Gender validation passed");

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: {email}
        });
        
        if (existingUser) {
            console.log("❌ User already exists with email:", email);
            return NextResponse.json({success: false, message: "User Already Exists"}, {status: 400});
        }
        
        console.log("✅ Email is available");
        
        // Hash password
        console.log("🔒 Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        console.log("👤 Creating new user...");
        const newUser = await prisma.user.create({
            data: {name, email, hashedPassword, height, weight, gender},
        });
        
        console.log("✅ User created successfully with ID:", newUser.id);
        
        // Sanitize user object by removing hashedPassword before returning
        const { hashedPassword: _, ...userWithoutPassword } = newUser;
        
        console.log("🚀 Returning user data:", JSON.stringify(userWithoutPassword, null, 2));
        
        return NextResponse.json({
            success: true, 
            message: "User registered successfully",
            user: userWithoutPassword
        }, {status: 201});
        
    } catch (error) {
        console.error("❌ Error in signup:", error);
        return NextResponse.json({success: false, message: error.message}, {status: 500});
    }
}