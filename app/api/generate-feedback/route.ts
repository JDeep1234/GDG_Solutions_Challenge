// app/api/generate-feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface FeedbackRequest {
  text: string;
  subject: string;
  gradeLevel: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as FeedbackRequest;
    const { text, subject, gradeLevel } = body;
    
    if (!text || !subject || !gradeLevel) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Analyze the text using Gemini Pro
    const prompt = `
      Analyze the following ${subject} assignment for a ${gradeLevel} level student:
      
      1. Content understanding - Does the student demonstrate understanding of key concepts?
      2. Application - How well does the student apply knowledge to problems?
      3. Organization - Is the work well-structured and clearly presented?
      4. Areas of strength - What aspects of the work are particularly strong?
      5. Areas for improvement - What specific aspects could be improved?
      6. Suggested grade - Provide a suggested grade based on the quality of work.
      
      Format your response with clear headings and bullet points where appropriate.
      
      The extracted text from the assignment image is:
      ${text}
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedback = response.text();

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}