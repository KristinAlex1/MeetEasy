// actions/user.js
"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function updateUsername(username) {
  console.log('Server Action: Starting with username', username);
  
  try {
    // Verify database connection
    try {
      await db.$queryRaw`SELECT NOW()`;
    } catch (dbError) {
      throw new Error(`Database connection failed: ${dbError.message}`);
    }

    // Validate input
    if (!username || typeof username !== "string") {
      throw new Error("Invalid username provided");
    }

    // Get auth details and user data
    const { userId } = auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get user email from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      throw new Error("User email not found");
    }

    // Check for existing username
    const existingUser = await db.user.findUnique({
      where: { username },
      select: { clerkUserId: true }
    });

    if (existingUser && existingUser.clerkUserId !== userId) {
      throw new Error("Username already taken");
    }

    // Update user record
    const updatedUser = await db.user.upsert({
      where: { clerkUserId: userId },
      create: {
        clerkUserId: userId,
        username,
        email: userEmail,
      },
      update: { 
        username,
        email: userEmail
      },
    });

    // Update Clerk profile
    await clerkClient.users.updateUser(userId, {
      username,
    });

    return { success: true, username: updatedUser.username };
  } catch (error) {
    console.error("Update failed:", error);
    throw error;
  }
}