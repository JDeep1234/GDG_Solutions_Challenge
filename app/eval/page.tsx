"use client"  

import React, { useState } from "react"  
import { Button } from "@/components/ui/button"  
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"  
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"  
import { Upload, Download, Image } from "lucide-react"  
import { jsPDF } from "jspdf"  

export default function AssignmentEvaluation() {  
  // State variables  
  const [subject, setSubject] = useState("")  
  const [gradeLevel, setGradeLevel] = useState("")  
  const [assignmentImage, setAssignmentImage] = useState<File | null>(null)  
  const [imageUrl, setImageUrl] = useState<string | null>(null)  
  const [assignmentFeedback, setAssignmentFeedback] = useState("")  
  const [isProcessing, setIsProcessing] = useState(false)  
  const [uploadStatus, setUploadStatus] = useState("No image uploaded")  
  const [extractedText, setExtractedText] = useState("")  

  // Subject options  
  const subjectOptions = [  
    "Mathematics", "Science", "English", "History",   
    "Geography", "Physics", "Chemistry", "Biology",   
    "Computer Science", "Art", "Music", "Physical Education"  
  ]  

  // Grade level options  
  const gradeLevelOptions = [  
    "Elementary (K-5)", "Middle School (6-8)", "High School (9-12)",  
    "College", "Adult Education"  
  ]  

  // Handle image upload  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {  
    const files = e.target.files  
    if (files && files.length > 0) {  
      const file = files[0]  
      if (file.type.startsWith('image/')) {  
        setAssignmentImage(file)  
        setImageUrl(URL.createObjectURL(file))  
        setUploadStatus("Image uploaded")  
        setExtractedText("")  
        setAssignmentFeedback("")  
      } else {  
        alert("Please upload an image file.")  
        setUploadStatus("Invalid file type")  
      }  
    }  
  }  

  // Extract text from image using API route
  const extractText = async () => {  
    if (!assignmentImage) {  
      alert("Please upload an assignment image first.")  
      return  
    }  
    
    setIsProcessing(true)  
    setUploadStatus("Extracting text...")  

    try {  
      // Create a FormData object to send the image file
      const formData = new FormData();
      formData.append("image", assignmentImage);
      
      // Call the API route
      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to extract text");
      }
      
      const data = await response.json();
      setExtractedText(data.text);

      // Automatically proceed to generate feedback if subject and grade level are selected  
      if (subject && gradeLevel) {  
        await generateFeedback(data.text);  
      } else {  
        setUploadStatus("Text extracted. Please select subject and grade level for evaluation.");  
      }  
    } catch (error) {  
      console.error("Error extracting text:", error)  
      setUploadStatus("Error extracting text");  
    } finally {  
      setIsProcessing(false)  
    }  
  }  
  
  const generateFeedback = async (text: string) => {
    if (!subject || !gradeLevel) {
      alert("Please select both subject and grade level.")
      return
    }
    
    setIsProcessing(true)
    setUploadStatus("Generating feedback...")

    try {
      // Call the API route for generating feedback
      const response = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          subject,
          gradeLevel,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate feedback");
      }
      
      const data = await response.json();
      setAssignmentFeedback(data.feedback);
      setUploadStatus("Feedback generated");

      // Save feedback to the database (if needed)
      await saveFeedback(text, data.feedback);
    } catch (error) {
      console.error("Error generating feedback:", error)
      setAssignmentFeedback("An error occurred while generating feedback.")
      setUploadStatus("Error generating feedback")
    } finally {
      setIsProcessing(false)
    }
  }

  // Save feedback function
  const saveFeedback = async (input: string, feedback: string) => {
    try {
      const response = await fetch("/pages/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: input,
          feedback: feedback,
          subject: subject,
          gradeLevel: gradeLevel,
          type: "assignment",
        }),
      });

      if (!response.ok) {
        console.error("Failed to save feedback");
      }
    } catch (error) {
      console.error("Error saving feedback:", error);
    }
  }

  // Download PDF function
  const downloadPDF = () => {
    const doc = new jsPDF()

    // Set margins and font
    const margin = 15
    const lineHeight = 7
    const pageWidth = 180
    let yPos = margin

    // Add title
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(51, 65, 255) // Purple
    doc.text(`${subject} Assignment Feedback (${gradeLevel})`, margin, yPos)
    yPos += lineHeight * 2

    // Add date
    const currentDate = new Date().toLocaleDateString()
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 100, 100) // Gray
    doc.text(`Generated on: ${currentDate}`, margin, yPos)
    yPos += lineHeight * 2

    // Add feedback content
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0) // Black
    const feedback = assignmentFeedback

    // Parse feedback for better formatting
    feedback.split("\n").forEach((line) => {
      if (line.startsWith("**") || line.startsWith("#")) {
        // Heading
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(51, 65, 255) // Purple
        const headingLines = doc.splitTextToSize(line.replace(/\*\*|#/g, "").trim(), pageWidth)
        headingLines.forEach((headingLine) => {
          // Check if we need a new page
          if (yPos > 280) {
            doc.addPage()
            yPos = margin
          }
          doc.text(headingLine, margin, yPos)
          yPos += lineHeight
        })
      } else if (line.startsWith("* ") || line.startsWith("- ")) {
        // Bullet point
        doc.setFontSize(12)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(0, 0, 0) // Black
        const bulletLines = doc.splitTextToSize(`• ${line.replace(/\* |- /g, "")}`, pageWidth)
        bulletLines.forEach((bulletLine) => {
          // Check if we need a new page
          if (yPos > 280) {
            doc.addPage()
            yPos = margin
          }
          doc.text(bulletLine, margin, yPos)
          yPos += lineHeight
        })
      } else if (line.trim()) {
        // Paragraph
        doc.setFontSize(12)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(0, 0, 0) // Black
        const lines = doc.splitTextToSize(line, pageWidth)
        lines.forEach((line) => {
          // Check if we need a new page
          if (yPos > 280) {
            doc.addPage()
            yPos = margin
          }
          doc.text(line, margin, yPos)
          yPos += lineHeight
        })
      }
    })

    // Save the PDF
    doc.save(`${subject.toLowerCase().replace(/\s/g, "-")}-assignment-feedback.pdf`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-indigo-600">Assignment Evaluation</h1>

      {/* Subject and Grade Level Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjectOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
          <Select value={gradeLevel} onValueChange={setGradeLevel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {gradeLevelOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-medium mb-4">Upload Assignment Image</h2>
        
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              isProcessing ? 'bg-yellow-500 animate-pulse' : 
              imageUrl ? 'bg-green-500' : 'bg-blue-500'
            }`}></div>
            <span>{uploadStatus}</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
          <div className="relative">
            <Button variant="outline" className="flex items-center w-full sm:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              Select Image
            </Button>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          
          <Button 
            variant="default" 
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
            onClick={extractText}
            disabled={isProcessing || !imageUrl}
          >
            <Image className="mr-2 h-4 w-4" />
            {isProcessing ? "Processing..." : "Extract Text"}
          </Button>
          
          {extractedText && !assignmentFeedback && (
            <Button 
              variant="default" 
              className="flex items-center bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              onClick={() => generateFeedback(extractedText)}
              disabled={isProcessing || !subject || !gradeLevel}
            >
              Generate Feedback
            </Button>
          )}
        </div>
        
        {/* Image Preview */}
        {imageUrl && (
          <div className="mt-4 border rounded-lg overflow-hidden max-w-md mx-auto">
            <img 
              src={imageUrl} 
              alt="Assignment Preview" 
              className="w-full h-auto object-contain"
            />
          </div>
        )}
        
        {/* Extracted Text (Optional) */}
        {extractedText && (
          <div className="mt-4 p-3 border rounded bg-white">
            <h3 className="text-sm font-medium mb-2">Extracted Text:</h3>
            <pre className="text-xs whitespace-pre-wrap">{extractedText}</pre>
          </div>
        )}
      </div>

      {/* Feedback Display */}
      {assignmentFeedback ? (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg w-full mt-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-indigo-900">Assignment Feedback</CardTitle>
            <CardDescription className="text-gray-600">
              AI feedback for {subject} assignment ({gradeLevel})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none">
              {assignmentFeedback.split("\n").map((line, index) => {
                if (line.startsWith("**") || line.startsWith("#")) {
                  return (
                    <h3 key={index} className="text-xl font-semibold text-indigo-800 mt-4 mb-2">
                      {line.replace(/\*\*|#/g, "").trim()}
                    </h3>
                  )
                } else if (line.startsWith("* ") || line.startsWith("- ")) {
                  return (
                    <ul key={index} className="list-disc list-inside text-gray-700">
                      <li>{line.replace(/\* |- /g, "")}</li>
                    </ul>
                  )
                } else if (line.trim()) {
                  return (
                    <p key={index} className="text-gray-700 mb-2">{line}</p>
                  )
                } else {
                  return null
                }
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-indigo-800">Assignment Feedback</h2>
          <div className="w-20 h-20 mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-indigo-200"></div>
          </div>
          <p className="text-gray-500 text-lg">No Feedback Generated Yet</p>
        </div>
      )}

      {/* Download Button */}
      {assignmentFeedback && (
        <div className="flex justify-center mt-6">
          <Button 
            onClick={downloadPDF} 
            className="flex items-center bg-indigo-600 hover:bg-indigo-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF Report
          </Button>
        </div>
      )}
    </div>
  )
}