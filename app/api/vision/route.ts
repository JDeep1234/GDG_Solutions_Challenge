
import { NextRequest, NextResponse } from "next/server";
import * as fs from 'fs';
import * as path from 'path';
import { ImageAnnotatorClient } from "@google-cloud/vision";


const credentials = process.env.GOOGLE_VISION_CREDENTIALS 
  ? JSON.parse(process.env.GOOGLE_VISION_CREDENTIALS) 
  : undefined;


let visionClient: ImageAnnotatorClient;


try {
  if (credentials) {
    visionClient = new ImageAnnotatorClient({ credentials });
  } else {
 
    visionClient = new ImageAnnotatorClient();
  }
} catch (error) {
  console.error("Error initializing Vision client:", error);
}

export async function POST(request: NextRequest) {
  try {
 
    if (!visionClient) {
      return NextResponse.json(
        { error: "Vision API client not initialized. Check your credentials." },
        { status: 500 }
      );
    }

   
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

  
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    

    console.log(`Processing image: ${file.name}, size: ${buffer.length} bytes`);
    
  
    const [result] = await visionClient.textDetection(buffer);
    
 
    if (!result.textAnnotations || result.textAnnotations.length === 0) {
      return NextResponse.json({
        text: "No text detected in the image.",
        success: true
      });
    }
    

    const extractedText = result.textAnnotations[0].description || "";
   
    console.log(`Successfully extracted ${extractedText.length} characters of text`);
    
    return NextResponse.json({
      text: extractedText,
      success: true
    });
  } catch (error) {
    console.error("Vision API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process image";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
