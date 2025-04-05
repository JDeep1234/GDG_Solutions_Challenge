// File: app/api/fetch-document/route.js
import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

// Helper function to convert stream to text
async function streamToText(readableStream) {
  let result = '';
  for await (const chunk of readableStream) {
    result += chunk;
  }
  return result;
}

export async function POST(request) {
  try {
    const { documentId } = await request.json();
    
    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    // Initialize Google Cloud Storage
    const storage = new Storage();
    
    // Define your bucket name
    const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
    
    // Get file from bucket
    const file = storage.bucket(bucketName).file(documentId);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    
    // Get file content
    const [fileContent] = await file.download();
    
    // For text files, return the content directly
    // For other file types, you might need different processing
    const content = fileContent.toString('utf-8');
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}