import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcription, subject, gradeLevel, language } = req.body;

  if (!transcription || transcription.trim() === '') {
    return res.status(400).json({ error: 'Transcription is required' });
  }

  try {
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      Analyze the following ${subject} class recording transcription for a ${gradeLevel} level class and provide detailed feedback on:
      
      1. Conceptual clarity - Were the concepts explained clearly and logically?
      2. Engagement - How well did the teacher engage students?
      3. Organization - Was the lesson well-structured?
      4. Examples - Were helpful examples provided?
      5. Areas for improvement - What specific aspects could be improved?
      
      Format your response with clear headings and bullet points where appropriate.
      The language of the transcription is ${language || 'English'}:
      
      ${transcription}
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedback = response.text();
    
    if (!feedback || feedback.trim() === '') {
      throw new Error('Generated feedback is empty');
    }
    
    return res.status(200).json({ feedback });
  } catch (error) {
    console.error("Error processing with Gemini:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to process with Gemini",
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}
