import { Storage } from '@google-cloud/storage';  
import { v4 as uuidv4 } from 'uuid';  
import formidable from 'formidable';  
import path from 'path';  


export const config = {  
  api: {  
    bodyParser: false,  
  },  
};  

export default async function handler(req, res) {  
 
  if (req.method !== 'POST') {  
    return res.status(405).json({ error: 'Method not allowed' });  
  }  

  try {  
   
    const form = formidable({ multiples: false }); 
    const { fields, files } = await new Promise((resolve, reject) => {  
      form.parse(req, (err, fields, files) => {  
        if (err) {  
          reject(err);  
        } else {  
          resolve({ fields, files });  
        }  
      });  
    });  

  
    const file = files.file; 
    const subject = fields.subject?.[0] || 'unknown';  
    const grade = fields.grade?.[0] || 'unknown';  

 
    const keyFilePath = path.join(process.cwd(), process.env.GCP_CREDENTIALS_JSON || 'lively-iris-453907-d1-45bfd898b74c.json');  

    
    const storage = new Storage({ keyFilename: keyFilePath });  
    const bucketName = 'shikshaksaathi'; 
    const bucket = storage.bucket(bucketName);  

   
    const fileId = uuidv4();  
    const fileExtension = file.originalFilename.split('.').pop();  
    const fileName = `references/${subject}/${grade}/${fileId}.${fileExtension}`;  

  
    await bucket.upload(file.filepath, {  
      destination: fileName,  
      metadata: {  
        contentType: file.mimetype,  
        metadata: {  
          originalName: file.originalFilename,  
          subject: subject,  
          grade: grade,  
        },  
      },  
    });  

    const fileObject = bucket.file(fileName);  
    await fileObject.makePublic();  
    const fileUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;  

    return res.status(200).json({  
      success: true,  
      fileId,  
      fileUrl,  
      message: 'File uploaded successfully',  
    });  
  } catch (error) {  
    console.error('Error uploading file:', error);  
    return res.status(500).json({ error: 'Failed to upload file', details: error.message });  
  }  
}  
