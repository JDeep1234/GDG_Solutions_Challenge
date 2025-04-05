"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, Mic, Play, AlertCircle } from "lucide-react"
import { jsPDF } from "jspdf"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ClassroomFeedback() {
  // State variables
  const [subject, setSubject] = useState("")
  const [gradeLevel, setGradeLevel] = useState("")
  const [audioFile, setAudioFile] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState("00:00")
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioFeedback, setAudioFeedback] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingStatus, setRecordingStatus] = useState("Ready to record")
  const [error, setError] = useState("")

  // References
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  
  // Cleanup effect for audio recording
  useEffect(() => {
    return () => {
      // Clean up media recorder and audio stream when component unmounts
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
        if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }
      }
      
      // Clean up timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      // Clean up audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

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

  // Start recording function
  const startRecording = async () => {
    try {
      setError("")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Reset recording status
      setRecordingStatus("Recording...")
      audioChunksRef.current = []
      
      // Create new MediaRecorder with proper MIME type
      const options = { mimeType: 'audio/webm' }
      
      try {
        mediaRecorderRef.current = new MediaRecorder(stream, options)
      } catch (e) {
        // Fallback if the specified MIME type isn't supported
        console.warn("audio/webm is not supported, using default MIME type")
        mediaRecorderRef.current = new MediaRecorder(stream)
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        // Make sure we have audio chunks before creating a blob
        if (audioChunksRef.current.length === 0) {
          setError("No audio data captured. Please try recording again.")
          setRecordingStatus("Recording failed")
          return
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        
        // Clean up previous URL if it exists
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl)
        }
        
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        setAudioFile(audioBlob)
        setRecordingStatus("Recording complete")
      }

      // Start recording with a proper timeslice (e.g., collect data every second)
      mediaRecorderRef.current.start(1000)
      setIsRecording(true)
      
      // Start timer
      startTimeRef.current = Date.now()
      timerRef.current = setInterval(updateRecordingTime, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setError("Could not access microphone. Please check your browser permissions.")
      setRecordingStatus("Error accessing microphone")
    }
  }

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
      setIsRecording(false)
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  // Update recording time
  const updateRecordingTime = () => {
    if (!startTimeRef.current) return;
    
    const currentTime = Date.now()
    const elapsedTime = Math.floor((currentTime - startTimeRef.current) / 1000)
    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0')
    const seconds = (elapsedTime % 60).toString().padStart(2, '0')
    setRecordingTime(`${minutes}:${seconds}`)
  }

  // Handle file upload
  const handleFileUpload = (e) => {
    setError("")
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setError("Please upload an audio file.")
        return
      }

      // Clean up previous URL if it exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      
      setAudioFile(file)
      setAudioUrl(URL.createObjectURL(file))
      setRecordingStatus("Audio file uploaded")
    }
  }

  // Play recording
  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play().catch(err => {
        console.error("Error playing audio:", err)
        setError("Failed to play audio. The file might be corrupted.")
      })
    }
  }

  // Process audio for feedback
  const analyzeRecording = async () => {
    if (!audioFile) {
      setError("Please record or upload an audio file first.")
      return
    }
    
    if (!subject || !gradeLevel) {
      setError("Please select both subject and grade level.")
      return
    }
    
    setIsProcessing(true)
    setError("")
    setAudioFeedback("") // Clear previous feedback

    try {
      // Step 1: Create a proper FormData object
      const formData = new FormData()
      formData.append("file", audioFile)
      formData.append("subject", subject)
      formData.append("gradeLevel", gradeLevel)

      // Step 1: Transcribe the audio using API route
      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header when using FormData
      })

      // Check if the request was successful
      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${transcribeResponse.status}`)
      }

      const transcribeResult = await transcribeResponse.json()
      
      // Validate transcription result
      if (!transcribeResult.transcription || transcribeResult.transcription.trim() === "") {
        throw new Error("Could not transcribe audio. Please ensure the recording has clear speech.")
      }

      // Step 2: Analyze the transcription using API route
      const analyzeResponse = await fetch("/api/analyze-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcription: transcribeResult.transcription,
          subject,
          gradeLevel,
          language: transcribeResult.language || 'English'
        }),
      });

      // Check if the request was successful
      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json().catch(() => ({}))
        throw new Error(errorData.error || `Analysis error: ${analyzeResponse.status}`)
      }

      const data = await analyzeResponse.json()
      
      // Validate feedback
      if (!data.feedback || data.feedback.trim() === "") {
        throw new Error("Could not generate feedback from the transcription.")
      }
      
      // Set the feedback
      setAudioFeedback(data.feedback)

      // Save feedback to the database (if needed)
      try {
        await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: transcribeResult.transcription,
            feedback: data.feedback,
            subject: subject,
            gradeLevel: gradeLevel,
            type: "classroom",
            timestamp: new Date().toISOString()
          }),
        })
        // Successful save doesn't need to change UI state
      } catch (saveError) {
        console.error("Error saving feedback:", saveError)
        // We continue even if saving fails - it's non-critical
      }
    } catch (error) {
      console.error("Error processing audio:", error)
      setError(error.message || "An error occurred while processing the audio.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Download PDF function
  const downloadPDF = () => {
    if (!audioFeedback) return
    
    try {
      const doc = new jsPDF()

      // Set margins and font
      const margin = 15
      const lineHeight = 7
      const pageWidth = 180
      let yPos = margin

      // Add title and date
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(0, 0, 128) // Dark blue
      doc.text(`${subject} Teaching Feedback (${gradeLevel})`, margin, yPos)
      yPos += lineHeight * 1.5
      
      // Add date
      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(100, 100, 100) // Gray
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPos)
      yPos += lineHeight * 2

      // Add feedback content
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(0, 0, 0) // Black
      const feedback = audioFeedback

      // Parse feedback for better formatting
      feedback.split("\n").forEach((line) => {
        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage()
          yPos = margin
        }
        
        if (line.startsWith("**") || line.startsWith("#")) {
          // Heading
          doc.setFontSize(14)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(0, 0, 128) // Dark blue
          const headingLines = doc.splitTextToSize(line.replace(/\*\*|#/g, "").trim(), pageWidth)
          headingLines.forEach((headingLine) => {
            doc.text(headingLine, margin, yPos)
            yPos += lineHeight
          })
          yPos += lineHeight * 0.5 // Add space after heading
        } else if (line.startsWith("* ") || line.startsWith("- ")) {
          // Bullet point
          doc.setFontSize(12)
          doc.setFont("helvetica", "normal")
          doc.setTextColor(0, 0, 0) // Black
          const bulletLines = doc.splitTextToSize(`• ${line.replace(/\* |- /g, "")}`, pageWidth - 5)
          bulletLines.forEach((bulletLine, idx) => {
            doc.text(bulletLine, idx === 0 ? margin : margin + 5, yPos)
            yPos += lineHeight
          })
        } else if (line.trim()) {
          // Paragraph
          doc.setFontSize(12)
          doc.setFont("helvetica", "normal")
          doc.setTextColor(0, 0, 0) // Black
          const lines = doc.splitTextToSize(line, pageWidth)
          lines.forEach((textLine) => {
            doc.text(textLine, margin, yPos)
            yPos += lineHeight
          })
        } else if (line === "") {
          // Empty line - add some space
          yPos += lineHeight * 0.5
        }
      })

      // Add footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.setTextColor(150, 150, 150)
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, 287, { align: 'center' })
      }

      // Save the PDF
      doc.save(`${subject.toLowerCase().replace(/\s/g, "-")}-teaching-feedback-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      setError("Failed to generate PDF. Please try again.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI-Powered Teaching Feedback</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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

      {/* Recording Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Record or Upload Classroom Audio</h2>
        
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
            <span>{recordingStatus}</span>
          </div>
          <div className="ml-auto font-mono">{recordingTime}</div>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <Button 
            variant={isRecording ? "destructive" : "default"}
            className="flex items-center" 
            onClick={isRecording ? stopRecording : startRecording}
          >
            <Mic className="mr-2 h-4 w-4" />
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
          
          <div className="relative">
            <Button variant="outline" className="flex items-center">
              <Upload className="mr-2 h-4 w-4" />
              Upload Recording
            </Button>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          
          <Button 
            variant="secondary" 
            className="flex items-center"
            onClick={playRecording}
            disabled={!audioUrl}
          >
            <Play className="mr-2 h-4 w-4" />
            Play Recording
          </Button>
        </div>
        
        {audioFile && (
          <div className="mt-4">
            <Button 
              variant="default" 
              className="w-full"
              onClick={analyzeRecording}
              disabled={isProcessing || !subject || !gradeLevel}
            >
              {isProcessing ? "Analyzing... This may take a moment" : "Generate Teaching Feedback"}
            </Button>
          </div>
        )}
      </div>

      {/* Feedback Display */}
      {audioFeedback ? (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg w-full mt-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-900">Teaching Feedback</CardTitle>
            <CardDescription className="text-gray-600">
              AI feedback for your {subject} class ({gradeLevel})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none">
              {audioFeedback.split("\n").map((line, index) => {
                if (line.startsWith("**") || line.startsWith("#")) {
                  return (
                    <h3 key={index} className="text-xl font-semibold text-blue-800 mt-4 mb-2">
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
                  return <br key={index} />
                }
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Teaching Feedback</h2>
          <div className="w-20 h-20 mb-6 rounded-full bg-blue-100 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-200"></div>
          </div>
          <p className="text-gray-500 text-lg">No Feedback Generated Yet</p>
          <p className="text-gray-400 text-sm mt-2">Record or upload a classroom audio session to get AI-powered feedback</p>
        </div>
      )}

      {/* Download Button */}
      {audioFeedback && (
        <div className="flex justify-center mt-6">
          <Button onClick={downloadPDF} className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Download PDF Report
          </Button>
        </div>
      )}
    </div>
  )
}