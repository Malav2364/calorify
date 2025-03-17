import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    console.log("📥 Login request received");
    
    const body = await req.json();
    console.log("📋 Request body (email only):", body.email);
    
    const { email, password } = body;
    
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return NextResponse.json({
        success: false,
        message: "Email and password are required"
      }, { status: 400 });
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log("❌ User not found:", email);
      return NextResponse.json({
        success: false,
        message: "Invalid credentials"
      }, { status: 401 });
    }
    
    // Verify password
    const passwordValid = await compare(password, user.hashedPassword);
    
    if (!passwordValid) {
      console.log("❌ Invalid password for:", email);
      return NextResponse.json({
        success: false,
        message: "Invalid credentials"
      }, { status: 401 });
    }
    
    // Generate token
    console.log("Signing token with secret:", process.env.NEXT_SECRET?.substring(0, 3) + "...");
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        name: user.name
      },
      process.env.NEXT_SECRET,
      { expiresIn: '30d' }
    );
    
    console.log("✅ User authenticated successfully:", email);
    console.log("🔑 Generated token for user ID:", user.id);
    
    // Return user data and token
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    }, { status: 200 });
    
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}