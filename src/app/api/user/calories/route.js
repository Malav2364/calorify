import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Store daily calorie consumption
export async function POST(request) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("No authenticated session found");
      return NextResponse.json(
        { success: false, message: "Unauthorized" }, 
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { date, calories, target } = body;
    
    if (!date || !calories) {
      return NextResponse.json(
        { success: false, message: "Date and calories are required" }, 
        { status: 400 }
      );
    }
    
    // Get current user ID
    const userId = parseInt(session.user.id);
    console.log("Updating calorie history for user ID:", userId);
    
    try {
      // IMPORTANT: Use the CalorieHistory model, not the caloriesHistory JSON field
      // Find existing entry for this date
      const existingEntry = await prisma.calorieHistory.findUnique({
        where: {
          userId_date: {
            userId: userId,
            date: date
          }
        }
      });
      
      if (existingEntry) {
        // Update existing entry
        await prisma.calorieHistory.update({
          where: {
            id: existingEntry.id
          },
          data: {
            calories: parseInt(calories),
            target: parseInt(target || 0)
          }
        });
        console.log(`Updated calorie entry for date ${date}`);
      } else {
        // Create new entry
        await prisma.calorieHistory.create({
          data: {
            userId: userId,
            date: date,
            calories: parseInt(calories),
            target: parseInt(target || 0)
          }
        });
        console.log(`Created new calorie entry for date ${date}`);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: "Calorie history updated successfully" 
      });
    } catch (error) {
      console.error("Database operation error:", error);
      return NextResponse.json(
        { success: false, message: "Database operation failed: " + error.message }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating calorie history:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to update calorie history: " + error.message }, 
      { status: 500 }
    );
  }
}

// Get user's calorie history
export async function GET(request) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log("No authenticated session found");
      return NextResponse.json(
        { success: false, message: "Unauthorized" }, 
        { status: 401 }
      );
    }
    
    const userId = parseInt(session.user.id);
    console.log("Fetching calorie history for user ID:", userId);
    
    try {
      // Get calorie history using the CalorieHistory model
      const history = await prisma.calorieHistory.findMany({
        where: { 
          userId: userId 
        },
        orderBy: { 
          date: 'desc' 
        },
        take: 30
      });
      
      console.log(`Found ${history.length} calorie history entries for user ${userId}`);
      
      // Return properly formatted data
      return NextResponse.json({ 
        success: true, 
        history: history.map(entry => ({
          id: entry.id,
          userId: entry.userId,
          date: entry.date,
          calories: entry.calories,
          target: entry.target,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt
        }))
      });
    } catch (error) {
      console.error("Database fetch error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error fetching calorie history:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to fetch calorie history: " + error.message }, 
      { status: 500 }
    );
  }
}