import { NextRequest, NextResponse } from 'next/server';  
import { SpeechClient } from '@google-cloud/speech';  
import path from 'path';  
import fs from 'fs';  
import os from 'os';  
import { v4 as uuidv4 } from 'uuid';  
import { exec } from 'child_process';  
import { promisify } from 'util';  

const execPromise = promisify(exec);  

export async function POST(request: NextRequest) {  
    let originalFilePath: string = '';  
    let monoFilePath: string = '';  
  
    try {  

        const credentialsPath = path.join(process.cwd(), 'static-concept-453810-s8-e7c9ecf40b33.json');  
        
        if (!fs.existsSync(credentialsPath)) {  
            console.error(`Credentials file not found at: ${credentialsPath}`);  
            return NextResponse.json(  
                { error: 'Google Cloud credentials file not found' },  
                { status: 500 }  
            );  
        }  
        
        process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;  
 
        const formData = await request.formData();  
        
        const subject = formData.get('subject')?.toString() || '';  
        const gradeLevel = formData.get('gradeLevel')?.toString() || '';  
        
        const file = formData.get('file') as File;   
        
        if (!file) {  
            return NextResponse.json(  
                { error: 'No audio file uploaded' },  
                { status: 400 }  
            );  
        }  

        if (!file.type.startsWith('audio/')) {  
            return NextResponse.json(  
                { error: 'Uploaded file is not an audio file' },  
                { status: 400 }  
            );  
        }  

      
        const tempDir = os.tmpdir();  
        originalFilePath = path.join(tempDir, `${uuidv4()}-original-${file.name}`);  
        monoFilePath = path.join(tempDir, `${uuidv4()}-mono-${file.name}`);  
     
        const fileBuffer = Buffer.from(await file.arrayBuffer());  
        fs.writeFileSync(originalFilePath, fileBuffer);  
        
        // Initialize Speech client  
        const speechClient = new SpeechClient({  
            keyFilename: credentialsPath  
        });  

        const getEncoding = (mime: string): string => {  
            if (mime.includes('wav') || mime.includes('wave')) return 'LINEAR16';  
            if (mime.includes('mp3')) return 'MP3';  
            if (mime.includes('ogg')) return 'OGG_OPUS';  
            if (mime.includes('flac')) return 'FLAC';  
            if (mime.includes('webm')) return 'WEBM_OPUS';  
            return 'LINEAR16'; 
        };  

        let audio: { content: string } | undefined;  
        let config: {  
            encoding: string;  
            languageCode: string;  
            enableAutomaticPunctuation: boolean;  
            model: string;  
            useEnhanced: boolean;  
            audioChannelCount: number;  
        };  

        try {  
          
            console.log("Attempting to use FFmpeg for audio conversion...");  
            const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;  
            await execPromise(`"${ffmpegPath}" -i "${originalFilePath}" -ac 1 "${monoFilePath}"`);  

            console.log("Successfully converted audio to mono format");  

            
            const fileContent = fs.readFileSync(monoFilePath);  
            audio = { content: fileContent.toString('base64') };  
            
         
            config = {  
                encoding: getEncoding(file.type),  
                languageCode: 'en-US',  
                enableAutomaticPunctuation: true,  
                model: 'default',  
                useEnhanced: true,  
                audioChannelCount: 1 
            };  
        } catch (ffmpegError) {  
            console.log("Failed to use FFmpeg for conversion, cannot proceed with transcription:");  
            console.error(ffmpegError);  
            return NextResponse.json(  
                { error: 'Audio conversion to mono failed. Please provide a mono audio file.' },  
                { status: 400 }  
            );  
        }  

        console.log(`Transcribing audio file (${file.name})`);  

     
        const [response] = await speechClient.recognize({ audio, config });  
        
        
        try {  
            if (fs.existsSync(originalFilePath)) fs.unlinkSync(originalFilePath);  
            if (fs.existsSync(monoFilePath)) fs.unlinkSync(monoFilePath);  
        } catch (err) {  
            console.error('Failed to delete temp files:', err);  
        }  
        
        if (!response.results || response.results.length === 0) {  
            return NextResponse.json(  
                { error: 'No speech detected in the audio file' },  
                { status: 400 }  
            );  
        }  

        const transcription = response.results  
            .map(result => result.alternatives && result.alternatives[0] ? result.alternatives[0].transcript : '')  
            .join("\n");  
        
        return NextResponse.json({  
            transcription,  
            language: 'en-US',  
            subject,  
            gradeLevel  
        });  
        
    } catch (error: any) {  
        console.error('Error transcribing audio:', error);  
        
       
        try {  
            if (originalFilePath && fs.existsSync(originalFilePath)) fs.unlinkSync(originalFilePath);  
            if (monoFilePath && fs.existsSync(monoFilePath)) fs.unlinkSync(monoFilePath);  
        } catch (cleanupErr) {  
            console.error('Failed to clean up temp files after error:', cleanupErr);  
        }  
        
        return NextResponse.json(  
            { error: error.message || 'Failed to transcribe audio' },  
            { status: 500 }  
        );  
    }  
}  
