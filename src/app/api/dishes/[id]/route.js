import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Helper function to check dish ownership
async function checkDishOwnership(dishId, userEmail) {
  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });
  
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
    
    // Get the user session to check authentication
    const session = await getServerSession(authOptions);
    
    // Return error if not authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check dish ownership
    const { authorized, message, dish } = await checkDishOwnership(
      dishId,
      session.user.email
    );
    
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
    if ((!dishName && calories === undefined) || (!dishName && !calories)) {
      return NextResponse.json(
        { success: false, message: "At least one field (dishName or calories) must be provided" },
        { status: 400 }
      );
    }
    
    // Check dish ownership
    const { authorized, message, dish } = await checkDishOwnership(
      dishId,
      session.user.email
    );
    
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
export async function DELETE(req, { params }) {
  try {
    const dishId = params.id;
    
    // Get the user session to check authentication
    const session = await getServerSession(authOptions);
    
    // Return error if not authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check dish ownership
    const { authorized, message } = await checkDishOwnership(
      dishId,
      session.user.email
    );
    
    if (!authorized) {
      return NextResponse.json(
        { success: false, message },
        { status: 403 }
      );
    }
    
    // Delete the dish
    await prisma.dish.delete({
      where: { id: parseInt(dishId) },
    });
    
    return NextResponse.json(
      { success: true, message: "Dish deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting dish:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}