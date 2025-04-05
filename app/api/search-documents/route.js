import { Storage } from '@google-cloud/storage';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    // Initialize Google Cloud Storage
    const storage = new Storage();
    
   
    const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
    
  
    const [files] = await storage.bucket(bucketName).getFiles();
    
   
    const matchingFiles = files.filter(file => {
      const fileName = file.name.toLowerCase();
      return fileName.includes(query.toLowerCase());
    });
    
   
    const documents = matchingFiles.map(file => ({
      id: file.id || file.name, 
      name: file.name,
      contentType: file.metadata.contentType,
      updated: file.metadata.updated,
      size: file.metadata.size
    }));
    
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error searching documents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
