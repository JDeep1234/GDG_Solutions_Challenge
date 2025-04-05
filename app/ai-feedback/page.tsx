"use client"  

import React, { useState, useEffect } from "react"  
import { Button } from "@/components/ui/button"  
import { Textarea } from "@/components/ui/textarea"  
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"  
import { Upload, Download, Book, PenTool, FileText, Loader2, Search } from "lucide-react"  
import { jsPDF } from "jspdf"  
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"  
import { Input } from "@/components/ui/input"

const { GoogleGenerativeAI } = require("@google/generative-ai")  

export default function AIFeedback() {  
  const [textInput, setTextInput] = useState("")  
  const [audioFile, setAudioFile] = useState(null)  
  const [textFeedback, setTextFeedback] = useState("")  
  const [audioFeedback, setAudioFeedback] = useState("")  
  const [assessmentInput, setAssessmentInput] = useState("")  
  const [assessmentFeedback, setAssessmentFeedback] = useState("")  
  const [isProcessing, setIsProcessing] = useState(false)  
  const [subject, setSubject] = useState("")  
  const [gradeLevel, setGradeLevel] = useState("")  
  const [uploadedReferences, setUploadedReferences] = useState([])  
  const [uploading, setUploading] = useState(false)  
  const [activeTab, setActiveTab] = useState("lesson-planning") 
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [selectedDocuments, setSelectedDocuments] = useState([])
  const [fetchingDocument, setFetchingDocument] = useState(false)

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })  

  // Function to fetch document content
  const fetchDocumentContent = async (documentId, documentName) => {
    setFetchingDocument(true);
    
    try {
      const response = await fetch("/api/fetch-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: documentId,
        }),
      });

      if (!response.ok) {
        setFetchingDocument(false);
        return;
      }

      const data = await response.json();
      
      // Check if this document is already selected
      const isAlreadySelected = selectedDocuments.some(doc => doc.id === documentId);
      
      if (!isAlreadySelected) {
        const newDocument = {
          id: documentId,
          name: documentName,
          context: data.content,
        };
        
        setSelectedDocuments(prev => [...prev, newDocument]);
        
        // Also add to uploadedReferences for compatibility with existing code
        setUploadedReferences(prev => [...prev, {
          name: documentName,
          context: data.content,
        }]);
      }
    } catch (error) {
      // Log to console but don't show to user
      console.error("Error fetching document:", error);
    } finally {
      setFetchingDocument(false);
    }
  };

  // Function to remove a selected document
  const removeSelectedDocument = (documentId) => {
    setSelectedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    setUploadedReferences(prev => prev.filter(doc => doc.id !== documentId));
  };

  const handleTextSubmit = async (e) => {  
    e.preventDefault()  
    setIsProcessing(true)  

    try {  
      let enhancedPrompt = textInput  
      
      if (uploadedReferences.length > 0) {  
        // Base prompt structure
        enhancedPrompt = `Using the following NCERT reference materials as context:
${uploadedReferences.map(ref => 
  `- ${ref.name}: ${ref.context.substring(0, 500)}...`).join('\n\n')}

Generate a detailed, standards-aligned lesson plan for ${subject || "the subject"} for grade ${gradeLevel || "level"} on the topic: ${textInput}

`

        // Add subject-specific guidance
        if (subject === "mathematics") {
          enhancedPrompt += `For this mathematics lesson, include:
- Age-appropriate mathematical concepts and vocabulary
- Step-by-step examples and demonstrations
- Opportunities for students to practice calculations and problem-solving
- Visual representations or models of mathematical concepts
- Real-world applications of the mathematical concepts
`
        } else if (subject === "science") {
          enhancedPrompt += `For this science lesson, include:
- Key scientific vocabulary and concepts
- A hands-on experiment or demonstration if applicable
- Scientific method application
- Safety considerations if relevant
- Connections to real-world phenomena
`
        } else if (subject === "english") {
          enhancedPrompt += `For this English lesson, include:
- Key literacy skills being targeted
- Vocabulary development activities
- Reading comprehension strategies
- Writing components with clear prompts
- Speaking and listening opportunities
`
        } else if (subject === "history") {
          enhancedPrompt += `For this history lesson, include:
- Historical context and background information
- Primary and secondary source examination
- Timeline or chronological elements
- Cultural and societal impacts
- Connections to contemporary issues if relevant
`
        } else if (subject === "art") {
          enhancedPrompt += `For this art lesson, include:
- Key art concepts, techniques, and vocabulary
- Visual examples or demonstrations
- Creative expression opportunities
- Art history connections if relevant
- Materials list with alternatives if possible
`
        } else if (subject === "music") {
          enhancedPrompt += `For this music lesson, include:
- Key musical concepts and terminology
- Listening examples if applicable
- Performance or practice components
- Music theory elements appropriate for the grade level
- Cultural or historical context of the music
`
        } else if (subject === "physical_education") {
          enhancedPrompt += `For this physical education lesson, include:
- Clear skills development focus
- Warm-up and cool-down activities
- Safety considerations and modifications
- Equipment needs and alternatives
- Connection to physical fitness concepts
`
        }

        // Add grade-level appropriate guidance
        if (gradeLevel === "kindergarten" || gradeLevel === "1" || gradeLevel === "2") {
          enhancedPrompt += `For this early elementary grade level:
- Keep activities hands-on and concrete
- Limit direct instruction to 10-15 minutes
- Include movement and transitions
- Use visual aids and manipulatives
- Focus on foundational skills
`
        } else if (gradeLevel === "3" || gradeLevel === "4" || gradeLevel === "5") {
          enhancedPrompt += `For this upper elementary grade level:
- Balance concrete and abstract concepts
- Include cooperative learning opportunities
- Develop independent work skills
- Incorporate graphic organizers
- Build on prior knowledge from earlier grades
`
        } else if (gradeLevel === "6" || gradeLevel === "7" || gradeLevel === "8") {
          enhancedPrompt += `For this middle school grade level:
- Support development of abstract thinking
- Include collaborative problem-solving
- Address multiple learning styles
- Connect content to students' lives and interests
- Incorporate critical thinking and analysis
`
        } else if (gradeLevel === "9" || gradeLevel === "10" || gradeLevel === "11" || gradeLevel === "12") {
          enhancedPrompt += `For this high school grade level:
- Focus on higher-order thinking skills
- Include independent research components
- Develop discipline-specific analytical skills
- Prepare students for college/career readiness
- Encourage student-led inquiry
`
        } else if (gradeLevel === "college") {
          enhancedPrompt += `For this college level:
- Design for advanced critical thinking
- Include research-based approaches
- Develop professional and scholarly skills
- Incorporate discussion-based learning
- Connect to career and real-world applications
`
        }

        // Standard lesson plan components for all subjects/grades
        enhancedPrompt += `
The lesson plan should include:
1. Clear learning objectives and outcomes
2. A hook or engaging introduction activity (5-7 minutes)
3. Main instructional content with step-by-step teaching procedures
4. At least 2 interactive student activities
5. Differentiation strategies for various learning styles and abilities
6. Formative assessment methods to check understanding
7. Closure activity
8. Required materials and resources
9. Estimated time for each section
10. Homework or extension activities (if appropriate)

Format the lesson plan with clear headings for each section and use bullet points where appropriate for readability.`
      }  

      const result = await model.generateContent(enhancedPrompt)  
      const response = await result.response  
      const feedback = response.text()  
      setTextFeedback(feedback)  

      await saveFeedback(textInput, feedback, "text")  
    } catch (error) {  
      // Just log the error to console, don't show to user
      console.error("Error processing text input:", error)  
      // Set an empty string instead of an error message
      setTextFeedback("")  
    } finally {  
      setIsProcessing(false)  
    }  
  }  

  const handleAssessmentSubmit = async (e) => {  
    e.preventDefault()  
    setIsProcessing(true)  

    try {  
      let enhancedAssessmentPrompt = assessmentInput  
      
      if (uploadedReferences.length > 0) {  
        // Base assessment prompt
        enhancedAssessmentPrompt = `Using the following NCERT reference materials as context:
${uploadedReferences.map(ref => 
  `- ${ref.name}: ${ref.context.substring(0, 500)}...`).join('\n\n')}

Generate a comprehensive, standards-aligned assessment for ${subject || "the subject"} for grade ${gradeLevel || "level"} on the topic: ${assessmentInput}

`

        // Add subject-specific assessment guidance
        if (subject === "mathematics") {
          enhancedAssessmentPrompt += `For this mathematics assessment, include:
- Computational problems with clear work space
- Word problems applying concepts to real-world scenarios
- Questions testing conceptual understanding, not just procedures
- Visual or spatial reasoning problems
- Questions requiring mathematical justification or explanation
`
        } else if (subject === "science") {
          enhancedAssessmentPrompt += `For this science assessment, include:
- Questions on scientific vocabulary and concepts
- Data interpretation from charts, graphs, or tables
- Scenario-based questions applying scientific principles
- Questions about experimental design or the scientific method
- Questions connecting concepts to real-world applications
`
        } else if (subject === "english") {
          enhancedAssessmentPrompt += `For this English assessment, include:
- Reading comprehension questions with appropriate text excerpts
- Vocabulary assessment in context
- Grammar and mechanics questions
- Writing prompts with clear expectations
- Speaking/listening components if applicable
`
        } else if (subject === "history") {
          enhancedAssessmentPrompt += `For this history assessment, include:
- Questions about key events, people, and concepts
- Primary source analysis questions
- Chronology and causation questions
- Compare/contrast questions exploring different perspectives
- Questions connecting historical events to broader themes
`
        } else if (subject === "art") {
          enhancedAssessmentPrompt += `For this art assessment, include:
- Art technique and vocabulary questions
- Art analysis and interpretation components
- Creative production tasks
- Art history connections if relevant
- Self-reflection or critique elements
`
        } else if (subject === "music") {
          enhancedAssessmentPrompt += `For this music assessment, include:
- Music theory and terminology questions
- Listening and analysis components
- Performance evaluation criteria if applicable
- Music history or cultural context questions
- Creative or composition elements if appropriate
`
        } else if (subject === "physical_education") {
          enhancedAssessmentPrompt += `For this physical education assessment, include:
- Skills performance evaluation criteria
- Knowledge of rules and safety procedures
- Understanding of fitness concepts
- Self-assessment components
- Goal-setting or personal improvement elements
`
        }

        // Add grade-level appropriate assessment guidance
        if (gradeLevel === "kindergarten" || gradeLevel === "1" || gradeLevel === "2") {
          enhancedAssessmentPrompt += `For this early elementary assessment:
- Use simple, clear language with minimal text
- Include visual supports and picture-based questions
- Focus on basic recall and simple application
- Keep assessment brief (20-30 minutes total)
- Include performance-based assessment components
`
        } else if (gradeLevel === "3" || gradeLevel === "4" || gradeLevel === "5") {
          enhancedAssessmentPrompt += `For this upper elementary assessment:
- Balance text and visual elements
- Include a mix of basic recall and application questions
- Add some questions requiring short written responses
- Keep assessment to 30-45 minutes total
- Include at least one multi-step problem
`
        } else if (gradeLevel === "6" || gradeLevel === "7" || gradeLevel === "8") {
          enhancedAssessmentPrompt += `For this middle school assessment:
- Increase text complexity appropriately
- Include higher-order thinking questions
- Add questions requiring evidence-based responses
- Design for 45-60 minutes completion time
- Include more extended response options
`
        } else if (gradeLevel === "9" || gradeLevel === "10" || gradeLevel === "11" || gradeLevel === "12") {
          enhancedAssessmentPrompt += `For this high school assessment:
- Focus on analysis, evaluation, and synthesis
- Include complex, multi-part questions
- Require evidence-based argumentation
- Design for 60-90 minutes completion time
- Include college/career readiness skill application
`
        } else if (gradeLevel === "college") {
          enhancedAssessmentPrompt += `For this college level assessment:
- Design for advanced critical analysis
- Include comprehensive, research-based questions
- Require scholarly argumentation and citations
- Include application to professional scenarios
- Design for deep conceptual understanding assessment
`
        }

        // Standard assessment components for all subjects/grades
        enhancedAssessmentPrompt += `
The assessment should include:
1. A variety of question types (multiple choice, short answer, essay, etc.)
2. Questions that assess different cognitive levels (knowledge, comprehension, application, analysis, evaluation)
3. Clear instructions for students
4. Point values for each question
5. An answer key with detailed explanations
6. Rubrics for scoring open-ended questions
7. Total points possible and estimated time required
8. At least one higher-order thinking question that requires critical thinking

Format the assessment with clear sections, numbering, and appropriate spacing. Include a teacher's guide section at the end with assessment objectives and suggestions for implementation.`
      }  

      const result = await model.generateContent(enhancedAssessmentPrompt)  
      const response = await result.response  
      const feedback = response.text()  
      setAssessmentFeedback(feedback)  

      await saveFeedback(assessmentInput, feedback, "assessment")  
    } catch (error) {  
      // Just log the error to console, don't show to user
      console.error("Error processing assessment input:", error)  
      // Set an empty string instead of an error message
      setAssessmentFeedback("")  
    } finally {  
      setIsProcessing(false)  
    }  
  }  

  const saveFeedback = async (input, feedback, type) => {  
    try {  
      const response = await fetch("/api/feedback", {  
        method: "POST",  
        headers: {  
          "Content-Type": "application/json",  
        },  
        body: JSON.stringify({  
          input: input,  
          feedback: feedback,  
          type: type,  
        }),  
      })  

      if (!response.ok) {  
        // Silent fail
        console.error("Failed to save feedback")
        return
      }  

      const result = await response.json()  
      console.log("Feedback saved:", result)  
    } catch (error) {  
      // Just log the error to console, don't show to user
      console.error("Error saving feedback:", error)  
    }  
  }  

  const downloadAsPDF = (content, filename) => {
    try {
      const doc = new jsPDF();
      
      // Add title with proper formatting
      doc.setFontSize(18);
      doc.setFont("times", "bold");
      doc.text(filename, 20, 20);
      
      // Process content to handle markdown-like formatting for PDF
      let processedContent = content;
      // Remove markdown bold syntax for PDF as we'll use font settings instead
      processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '$1');
      
      // Add content with word wrapping and proper font
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      
      // Split text into paragraphs
      const paragraphs = processedContent.split('\n\n');
      let yPosition = 30;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      
      // Process each paragraph
      paragraphs.forEach(paragraph => {
        // Handle bullet points and numbered lists
        const lines = paragraph.split('\n');
        
        lines.forEach(line => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          const splitLine = doc.splitTextToSize(line, maxWidth);
          
          // Check if this is a heading
          if (line.startsWith('#')) {
            doc.setFont("times", "bold");
            doc.setFontSize(14);
            const headingText = line.replace(/^#+\s+/, '');
            doc.text(headingText, margin, yPosition);
            yPosition += 8;
            doc.setFont("times", "normal");
            doc.setFontSize(12);
          } else {
            // Check if this is bold text
            if (line.includes('**')) {
              doc.setFont("times", "bold");
            }
            
            doc.text(splitLine, margin, yPosition);
            yPosition += (splitLine.length * 7);
            
            // Reset to normal font
            doc.setFont("times", "normal");
          }
        });
        
        // Add space between paragraphs
        yPosition += 5;
      });
      
      // Save the PDF with the appropriate name
      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Silent fail - don't show error to user
    }
  };

  // Function to format the content with proper styling for the web display
  const formatContentWithMarkdown = (content) => {
    if (!content) return "";
    
    // Process the content to handle markdown-like formatting
    // Replace ** with strong tags for bold text
    let formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle line breaks properly
    formattedContent = formattedContent.replace(/\n/g, '<br />');
    
    return formattedContent;
  };

  return (  
    <div className="container mx-auto px-6 py-10 bg-gray-50 min-h-screen">  
      <h1 className="text-4xl font-bold text-center mb-8">NCERT CHATBOT For Lesson Planning and Assessment Generation</h1>  
      
      
      <Tabs defaultValue="lesson-planning" onValueChange={setActiveTab}>  
        <TabsList className="w-full mb-8">  
          <TabsTrigger value="lesson-planning" className="flex items-center">  
            <PenTool className="w-4 h-4 mr-2" />  
            Lesson Planning  
          </TabsTrigger>  
          <TabsTrigger value="assessment" className="flex items-center">  
            <Book className="w-4 h-4 mr-2" />  
            Assessment Generation  
          </TabsTrigger>  
        </TabsList>  

        {/* Lesson Planning Section */}  
        <TabsContent value="lesson-planning">  
          <Card className="mb-8 shadow-lg rounded-lg">  
            <CardHeader>  
              <CardTitle className="text-2xl font-semibold">Generate Lesson Plan</CardTitle>  
              <CardDescription className="text-gray-600">  
                Fill in the details below  
                {uploadedReferences.length > 0 && ` (Using ${uploadedReferences.length} reference materials)`}  
              </CardDescription>  
            </CardHeader>  
            <CardContent>  
              <form onSubmit={handleTextSubmit} className="space-y-6">  
                <div className="space-y-2">  
                  <label htmlFor="subject" className="block font-medium">Subject</label>  
                  <select   
                    id="subject"  
                    value={subject}  
                    onChange={e => setSubject(e.target.value)}  
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300"  
                  >  
                    <option value="">Select subject</option>  
                    <option value="mathematics">Mathematics</option>  
                    <option value="science">Science</option>  
                    <option value="english">English</option>  
                    <option value="history">History</option>  
                    <option value="art">Art</option>  
                    <option value="music">Music</option>  
                    <option value="physical_education">Physical Education</option>  
                  </select>  
                </div>  

                <div className="space-y-2">  
                  <label htmlFor="grade" className="block font-medium">Grade Level</label>  
                  <select   
                    id="grade"  
                    value={gradeLevel}  
                    onChange={e => setGradeLevel(e.target.value)}  
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300"  
                  >  
                    <option value="">Select grade</option>  
                    <option value="kindergarten">Kindergarten</option>  
                    <option value="1">1st Grade</option>  
                    <option value="2">2nd Grade</option>  
                    <option value="3">3rd Grade</option>  
                    <option value="4">4th Grade</option>  
                    <option value="5">5th Grade</option>  
                    <option value="6">6th Grade</option>  
                    <option value="7">7th Grade</option>  
                    <option value="8">8th Grade</option>  
                    <option value="9">9th Grade</option>  
                    <option value="10">10th Grade</option>  
                    <option value="11">11th Grade</option>  
                    <option value="12">12th Grade</option>  
                    <option value="college">College</option>  
                  </select>  
                </div>  

                <Textarea  
                  placeholder="e.g., Photosynthesis, Fractions, Poetry Analysis"  
                  value={textInput}  
                  onChange={(e) => setTextInput(e.target.value)}  
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300"  
                  rows={4}  
                />  

                <Button type="submit" disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700">  
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : "Generate Lesson Plan"}  
                </Button>  
              </form>  
            </CardContent>  
          </Card>  

          <Card className="shadow-lg rounded-lg">  
            <CardHeader>  
              <CardTitle className="text-2xl font-semibold">Your Lesson Plan</CardTitle>  
              <CardDescription className="text-gray-600">  
                {textFeedback ? " Lesson Plan" : "No Lesson Plan Generated Yet"}  
              </CardDescription>  
            </CardHeader>  
            <CardContent>  
              <div className="text-gray-700">  
                {textFeedback ? (  
                  <>
                    <div 
                      className="whitespace-pre-wrap mb-6 font-serif text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatContentWithMarkdown(textFeedback) }}
                    ></div>  
                    <Button 
                      onClick={() => downloadAsPDF(textFeedback, `Lesson_Plan_${subject || 'Subject'}_Grade_${gradeLevel || 'Level'}`)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      Download as PDF
                    </Button>
                  </>
                ) : (  
                  <p>Fill out the form above and click "Generate Lesson Plan" to create a customized lesson plan.</p>  
                )}  
              </div>  
            </CardContent>  
          </Card>  
        </TabsContent>  

        {/* Assessment Generation Section */}  
        <TabsContent value="assessment">  
          <Card className="mb-8 shadow-lg rounded-lg">  
            <CardHeader>  
              <CardTitle className="text-2xl font-semibold">Generate Assessment</CardTitle>  
              <CardDescription className="text-gray-600">  
                Provide the details below to generate an assessment.  
                {uploadedReferences.length > 0 && ` (Using ${uploadedReferences.length} reference materials)`}
              </CardDescription>  
            </CardHeader>  
            <CardContent>  
              <form onSubmit={handleAssessmentSubmit} className="space-y-6">  
                <div className="space-y-2">  
                  <label htmlFor="assessment-subject" className="block font-medium">Subject</label>  
                  <select   
                    id="assessment-subject"  
                    value={subject}  
                    onChange={e => setSubject(e.target.value)}  
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300"  
                  >  
                    <option value="">Select subject</option>  
                    <option value="mathematics">Mathematics</option>  
                    <option value="science">Science</option>  
                    <option value="english">English</option>  
                    <option value="history">History</option>  
                    <option value="art">Art</option>  
                    <option value="music">Music</option>  
                    <option value="physical_education">Physical Education</option>  
                  </select>  
                </div>  

                <div className="space-y-2">  
                  <label htmlFor="assessment-grade" className="block font-medium">Grade Level</label>  
                  <select   
                    id="assessment-grade"  
                    value={gradeLevel}  
                    onChange={e => setGradeLevel(e.target.value)}  
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300"  
                  >  
                    <option value="">Select grade</option>  
                    <option value="kindergarten">Kindergarten</option>  
                    <option value="1">1st Grade</option>  
                    <option value="2">2nd Grade</option>  
                    <option value="3">3rd Grade</option>  
                    <option value="4">4th Grade</option>  
                    <option value="5">5th Grade</option>  
                    <option value="6">6th Grade</option>  
                    <option value="7">7th Grade</option>  
                    <option value="8">8th Grade</option>  
                    <option value="9">9th Grade</option>  
                    <option value="10">10th Grade</option>  
                    <option value="11">11th Grade</option>  
                    <option value="12">12th Grade</option>  
                    <option value="college">College</option>  
                  </select>  
                </div> 

                <Textarea  
                  placeholder="e.g., Questions about Photosynthesis, Fractions, Poetry Analysis"  
                  value={assessmentInput}  
                  onChange={(e) => setAssessmentInput(e.target.value)}  
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300"  
                  rows={4}  
                />  
                
                <Button type="submit" disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700">  
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : "Generate Assessment"}  
                </Button>  
              </form>  
            </CardContent>  
          </Card>  

          <Card className="shadow-lg rounded-lg">  
            <CardHeader>  
              <CardTitle className="text-2xl font-semibold">Your Assessment</CardTitle>  
              <CardDescription className="text-gray-600">  
                {assessmentFeedback ? "Generated Assessment" : "No Assessment Generated Yet"}  
              </CardDescription>  
            </CardHeader>  
            <CardContent>  
              <div className="text-gray-700">  
                {assessmentFeedback ? (  
                  <>
                    <div 
                      className="whitespace-pre-wrap mb-6 font-serif text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatContentWithMarkdown(assessmentFeedback) }}
                    ></div>  
                    <Button 
                      onClick={() => downloadAsPDF(assessmentFeedback, `Assessment_${subject || 'Subject'}_Grade_${gradeLevel || 'Level'}`)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      Download as PDF
                    </Button>
                  </>
                ) : (  
                  <p>Fill out the form above and click "Generate Assessment" to create a customized assessment.</p>  
                )}  
              </div>  
            </CardContent>  
          </Card>  
        </TabsContent>  
      </Tabs>  
    </div>  
  )  
}
