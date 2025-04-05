
import { NextRequest, NextResponse } from "next/server";
import vision from "@google-cloud/vision";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    
    const client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_CLOUD_VISION_KEYFILE,
    });

    // Perform text detection
    const [result] = await client.textDetection({ image: { content: buffer } });
    const textAnnotations = result.textAnnotations;

    if (textAnnotations && textAnnotations.length > 0) {
      return NextResponse.json({
        text: textAnnotations[0].description,
      });
    } else {
      return NextResponse.json(
        { error: "No text detected in the image" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
