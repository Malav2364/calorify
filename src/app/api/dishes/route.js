import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import jwt from "jsonwebtoken";

// Helper to verify JWT token from request header
async function verifyAuthToken(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.NEXT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id) }
    });
    
    return user;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// Get authenticated user from session or token
async function getAuthenticatedUser(req) {
  // Check NextAuth session first
  try {
    const session = await getServerSession(authOptions);
    if (session && session.user) {
      console.log("Found session for user:", session.user.email);
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      return user;
    }
  } catch (error) {
    console.error("Error getting session:", error);
  }
  
  // Fall back to JWT token
  return await verifyAuthToken(req);
}

export async function GET(req) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(req);
    
    if (!user) {
      console.log("No authenticated user found");
      return NextResponse.json(
        { success: false, message: "Unauthorized" }, 
        { status: 401 }
      );
    }
    
    console.log("Fetching dishes for user ID:", user.id);
    
    // Get user's dishes - where userId matches the authenticated user's ID
    const dishes = await prisma.dish.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${dishes.length} dishes for user ID ${user.id}`);
    
    return NextResponse.json({ success: true, dishes });
  } catch (error) {
    console.error("Error fetching dishes:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dishes" }, 
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(req);
    
    if (!user) {
      console.log("No authenticated user found for POST request");
      return NextResponse.json(
        { success: false, message: "Unauthorized" }, 
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { dishName, calories } = body;
    
    console.log(`Adding dish "${dishName}" with ${calories} calories for user ID: ${user.id}`);
    
    if (!dishName || !calories) {
      return NextResponse.json(
        { success: false, message: "Dish name and calories are required" }, 
        { status: 400 }
      );
    }
    
    // Create dish using the authenticated user's ID
    const dish = await prisma.dish.create({
      data: {
        dishName,
        calories: parseInt(calories),
        userId: user.id
      }
    });
    
    console.log("Dish created successfully:", dish.id);
    
    return NextResponse.json({ success: true, dish });
  } catch (error) {
    console.error("Error adding dish:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add dish" }, 
      { status: 500 }
    );
  }
}