
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'POST') {
    try {
      const { input, feedback, subject, gradeLevel, type } = req.body;
      
      if (!feedback) {
        return res.status(400).json({ error: 'No feedback provided' });
      }
      
     
      const result = await prisma.feedbackEntry.create({
        data: {
          transcription: input,
          feedback: feedback,
          subject: subject || 'Unknown',
          gradeLevel: gradeLevel || 'Unknown',
          type: type || 'classroom',
          createdAt: new Date(),
        },
      });
      
      return res.status(200).json({
        success: true,
        feedbackId: result.id,
        message: 'Feedback saved successfully',
      });
      
    } catch (error: any) {
      console.error('Error saving feedback:', error);
      
      return res.status(500).json({ 
        error: 'Failed to save feedback', 
        details: error.message 
      });
    }
  }
  
 
  else if (req.method === 'GET') {
    try {
      const { subject, gradeLevel } = req.query;
      
      let whereClause: any = {};
      
      if (subject) {
        whereClause.subject = subject;
      }
      
      if (gradeLevel) {
        whereClause.gradeLevel = gradeLevel;
      }
      
      const feedbackEntries = await prisma.feedbackEntry.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        take: 50 
      });
      
      return res.status(200).json({
        success: true,
        count: feedbackEntries.length,
        data: feedbackEntries,
      });
      
    } catch (error: any) {
      console.error('Error retrieving feedback entries:', error);
      
      return res.status(500).json({ 
        error: 'Failed to retrieve feedback entries', 
        details: error.message 
      });
    }
  }
  

  else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
