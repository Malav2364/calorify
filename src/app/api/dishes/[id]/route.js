import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

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
  const session = await getServerSession(authOptions);
  if (session && session.user) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    return user;
  }
  
  // Fall back to JWT token
  return await verifyAuthToken(req);
}

// Helper function to check dish ownership
async function checkDishOwnership(dishId, user) {
  if (!user) {
    return { authorized: false, message: "User not found" };
  }
  
  // Find the dish by ID
  const dish = await prisma.dish.findUnique({
    where: { id: parseInt(dishId) },
  });
  
  if (!dish) {
    return { authorized: false, message: "Dish not found" };
  }
  
  // Check if the dish belongs to the user
  if (dish.userId !== user.id) {
    return { authorized: false, message: "Unauthorized: This dish doesn't belong to you" };
  }
  
  return { authorized: true, user, dish };
}

// GET: Get a specific dish by ID
export async function GET(req, { params }) {
  try {
    const dishId = params.id;
    
    // Get authenticated user
    const user = await getAuthenticatedUser(req);
    
    // Return error if not authenticated
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check dish ownership
    const { authorized, message, dish } = await checkDishOwnership(dishId, user);
    
    if (!authorized) {
      return NextResponse.json(
        { success: false, message },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ success: true, dish }, { status: 200 });
  } catch (error) {
    console.error("Error fetching dish:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update a dish
export async function PUT(req, { params }) {
  try {
    const dishId = params.id;
    
    // Get authenticated user
    const user = await getAuthenticatedUser(req);
    
    // Return error if not authenticated
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { dishName, calories } = body;
    
    // Validate required fields
    if ((!dishName && calories === undefined) || (!dishName && !calories)) {
      return NextResponse.json(
        { success: false, message: "At least one field (dishName or calories) must be provided" },
        { status: 400 }
      );
    }
    
    // Check dish ownership
    const { authorized, message, dish } = await checkDishOwnership(dishId, user);
    
    if (!authorized) {
      return NextResponse.json(
        { success: false, message },
        { status: 403 }
      );
    }
    
    // Update the dish
    const updateData = {};
    if (dishName) updateData.dishName = dishName;
    if (calories !== undefined) updateData.calories = parseFloat(calories);
    
    const updatedDish = await prisma.dish.update({
      where: { id: parseInt(dishId) },
      data: updateData,
    });
    
    return NextResponse.json(
      { success: true, dish: updatedDish },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating dish:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a dish
export async function DELETE(request, context) {
  try {
    // Correctly access the ID from context.params
    const dishId = context.params.id;
    
    console.log("Attempting to delete dish with ID:", dishId);
    
    if (!dishId) {
      return NextResponse.json(
        { success: false, message: "Dish ID is required" }, 
        { status: 400 }
      );
    }
    
    // Use our existing helper function to get authenticated user
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      console.log("No authenticated user found for DELETE request");
      return NextResponse.json(
        { success: false, message: "Unauthorized" }, 
        { status: 401 }
      );
    }
    
    console.log(`User ID from authentication: ${user.id}`);
    
    // Use the checkDishOwnership helper function which is already defined
    const { authorized, message, dish } = await checkDishOwnership(dishId, user);
    
    if (!authorized) {
      console.log(message);
      return NextResponse.json(
        { success: false, message }, 
        { status: 403 }
      );
    }
    
    // Delete the dish
    await prisma.dish.delete({
      where: { id: parseInt(dishId) }
    });
    
    console.log("Dish deleted successfully:", dishId);
    
    return NextResponse.json({ success: true, message: "Dish deleted successfully" });
  } catch (error) {
    console.error("Error deleting dish:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete dish" }, 
      { status: 500 }
    );
  }
}