// File: /app/api/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
// Note: In production, you should use a singleton pattern to avoid too many connections
const prisma = new PrismaClient();

interface FeedbackRequestData {
  input: string;
  feedback: string;
  subject: string;
  gradeLevel: string;
  type: "assignment" | "classroom" | string;
}

export async function POST(request: NextRequest) {
  try {
    const data: FeedbackRequestData = await request.json();
    
    const { input, feedback, subject, gradeLevel, type } = data;
    
    // Validate required fields
    if (!feedback || !subject || !gradeLevel || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Save to database
    const savedFeedback = await prisma.feedback.create({
      data: {
        input: input || "",
        feedback,
        subject,
        gradeLevel,
        type,
        createdAt: new Date()
      }
    });
    
    return NextResponse.json({
      id: savedFeedback.id,
      success: true,
      message: "Feedback saved successfully"
    });
  } catch (error) {
    console.error("Feedback API error:", error);
    
    // Check for Prisma-specific errors
    if (error instanceof Error && error.message.includes("Prisma")) {
      // This might be a database connection issue or schema mismatch
      return NextResponse.json(
        { error: "Database error occurred", details: error.message },
        { status: 500 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : "Failed to save feedback";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
