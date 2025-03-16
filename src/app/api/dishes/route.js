import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET: Get all dishes for the authenticated user
export async function GET(req) {
  try {
    // Get the user session to check authentication
    const session = await getServerSession(authOptions);
    
    // Return error if not authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get user email from session
    const userEmail = session.user.email;
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    
    // Get all dishes for the user
    const dishes = await prisma.dish.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ success: true, dishes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching dishes:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new dish for the authenticated user
export async function POST(req) {
  try {
    // Get the user session to check authentication
    const session = await getServerSession(authOptions);
    
    // Return error if not authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { dishName, calories } = body;
    
    // Validate required fields
    if (!dishName || calories === undefined) {
      return NextResponse.json(
        { success: false, message: "Dish name and calories are required" },
        { status: 400 }
      );
    }
    
    // Get user email from session
    const userEmail = session.user.email;
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    
    // Create new dish
    const newDish = await prisma.dish.create({
      data: {
        dishName,
        calories: parseFloat(calories),
        userId: user.id,
      },
    });
    
    return NextResponse.json(
      { success: true, dish: newDish },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating dish:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}