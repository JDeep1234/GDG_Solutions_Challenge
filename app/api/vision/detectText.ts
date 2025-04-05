
import type { NextApiRequest, NextApiResponse } from "next";  
import { ImageAnnotatorClient } from "@google-cloud/vision";  

const client = new ImageAnnotatorClient({  
  keyFilename: process.env.NEXT_PUBLIC_GCLOUD_VISION_KEYFILE, 
});  

export default async function handler(req: NextApiRequest, res: NextApiResponse) {  
  if (req.method === "POST") {  
    try {  
    
      const { image } = req.body; 

      
      const [result] = await client.textDetection({  
        image: { content: Buffer.from(image, "base64") },  
      });  
      const textAnnotations = result.textAnnotations || [];  
      res.status(200).json({  
        text: textAnnotations.length > 0 ? textAnnotations[0].description : "No text detected",  
      });  
    } catch (error) {  
      console.error("Error during text detection:", error);  
      res.status(500).json({ error: "Failed to detect text" });  
    }  
  } else {  
    res.setHeader("Allow", ["POST"]);  
    res.status(405).end(`Method ${req.method} Not Allowed`);  
  }  
}  
