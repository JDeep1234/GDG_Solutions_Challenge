import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, FileText, Image as ImageIcon, Check, Settings, AlertTriangle } from 'lucide-react';
import GlassCard from './GlassCard';
import FadeInSection from './FadeInSection';

import { toast } from '@/components/ui/use-toast';
import DownloadPdfButton from './DownloadPdfButton';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const AssignmentOCR = () => {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const visionJsonFileInputRef = useRef<HTMLInputElement>(null);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const apiKey = getStoredApiKey();
    const googleCredentials = getGoogleSpeechCredentials();
    setGeminiApiKey(apiKey);
    setIsConfigured(!!apiKey && !!googleCredentials);
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image under 5MB"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      
      if (subject && grade && isConfigured) {
        await handleProcessImage(result);
      } else if (!isConfigured) {
        toast({
          variant: "default",
          title: "API Configuration Required",
          description: "Please configure Vision API and Gemini API credentials before processing"
        });
      } else if (!subject || !grade) {
        toast({
          variant: "default",
          title: "Missing Information",
          description: "Please select subject and grade before processing"
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProcessImage = async (imageSource?: string) => {
    const imageToProcess = imageSource || imagePreview;
    if (!imageToProcess) {
      toast({
        variant: "destructive",
        title: "No Image Selected",
        description: "Please upload an image first"
      });
      return;
    }

    if (!isConfigured) {
      toast({
        variant: "destructive",
        title: "API Configuration Required",
        description: "Please configure both Vision API and Gemini API credentials first"
      });
      return;
    }

    setIsProcessing(true);
    setExtractedText('');
    setFeedback('');

    try {
      const apiKey = getStoredApiKey();
      const result = await processImageOCR(imageToProcess, apiKey);
      setExtractedText(result.text);
      setConfidence(result.confidence);
      
      toast({
        title: "Text Extracted",
        description: `Extracted ${result.text.length} characters with ${Math.round(result.confidence * 100)}% confidence`
      });
      
      if (result.text && subject && grade) {
        await handleAnalyzeAssignment(result.text);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        variant: "destructive",
        title: "OCR Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process the image. Please check your Vision API credentials."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyzeAssignment = async (text?: string) => {
    const textToAnalyze = text || extractedText;
    if (!textToAnalyze) {
      toast({
        variant: "destructive",
        title: "No Text Extracted",
        description: "Please process an image first or enter text manually"
      });
      return;
    }

    if (!subject || !grade) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a subject and grade"
      });
      return;
    }

    if (!isConfigured) {
      toast({
        variant: "destructive",
        title: "API Configuration Required",
        description: "Please configure both Vision API and Gemini API credentials first"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const apiKey = getStoredApiKey();
      const result = await analyzeAssignment(textToAnalyze, subject, grade, apiKey);
      setFeedback(result);
      
      toast({
        title: "Analysis Complete",
        description: "Assignment feedback has been generated"
      });
    } catch (error) {
      console.error("Error analyzing assignment:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze the assignment. Please check your Gemini API key."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVisionJsonFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const jsonContent = await readJsonFile(file);
      
      const geminiKey = getStoredApiKey();
      setApiKeys(geminiKey, jsonContent);
      
      toast({
        title: "Vision API Configuration Updated",
        description: "Your Vision API credentials have been successfully uploaded and saved."
      });
      
      setIsConfigured(!!geminiKey && !!jsonContent);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid Credentials File",
        description: error instanceof Error ? error.message : "Failed to process the credentials file."
      });
    } finally {
      if (visionJsonFileInputRef.current) {
        visionJsonFileInputRef.current.value = '';
      }
    }
  };

  const handleGeminiApiKeyUpdate = () => {
    const trimmedKey = geminiApiKey.trim();
    if (!trimmedKey) {
      setApiKeyError("Please enter a valid Gemini API key");
      return;
    }
    
    setApiKeyError("");
    
    const googleCredentials = getGoogleSpeechCredentials();
    setApiKeys(trimmedKey, googleCredentials);
    
    toast({
      title: "Gemini API Key Updated",
      description: "Your Gemini API key has been successfully saved."
    });
    
    setIsConfigured(!!trimmedKey && !!googleCredentials);
  };

  const renderMarkdownText = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    return text.replace(boldRegex, '<strong>$1</strong>');
  };

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-6">
      <FadeInSection className="w-full">
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Assignment Analysis with OCR</h2>
            
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  title="Configure API credentials"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  API Settings
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>API Configuration</SheetTitle>
                  <SheetDescription>
                    Configure your Google Cloud Vision and Gemini API credentials.
                    These are required for OCR and assignment analysis.
                  </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-6 py-6">
                  <div className="space-y-3">
                    <h3 className="text-base font-medium flex items-center">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs mr-2">Required</span>
                      Gemini API
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your Gemini API key for assignment analysis and feedback.
                    </p>
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="gemini-api-key">Gemini API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="gemini-api-key"
                          type="text"
                          placeholder="Enter your Gemini API key"
                          value={geminiApiKey}
                          onChange={(e) => setGeminiApiKey(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={handleGeminiApiKeyUpdate}>
                          Save Key
                        </Button>
                      </div>
                      {apiKeyError && (
                        <p className="text-red-500 text-xs mt-1">{apiKeyError}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3 border-t pt-6">
                    <h3 className="text-base font-medium flex items-center">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs mr-2">Required</span>
                      Google Cloud Vision API
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload your Google Cloud Service Account JSON file with Vision API access enabled.
                    </p>
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="vision-json-file-upload">Service Account JSON File</Label>
                      <Input
                        id="vision-json-file-upload"
                        type="file"
                        accept=".json"
                        ref={visionJsonFileInputRef}
                        onChange={handleVisionJsonFileUpload}
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mt-6">
                    <p className="font-medium">Privacy Note:</p>
                    <p>Your API credentials are stored locally in your browser and are never sent to our servers.</p>
                  </div>

                  <div className="mt-4 p-3 rounded-md bg-gray-50">
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-2 ${isConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <p className="text-sm font-medium">
                        {isConfigured ? 'API Properly Configured' : 'Configuration Incomplete'}
                      </p>
                    </div>
                    {!isConfigured && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Please enter both your Gemini API key and upload your Google Cloud Vision credentials
                      </p>
                    )}
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    disabled={!isConfigured}
                    onClick={() => setIsSheetOpen(false)}
                  >
                    {isConfigured ? 'Close and Continue' : 'Complete Configuration First'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {!isConfigured && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-800" />
              <AlertTitle className="text-orange-800">API Configuration Required</AlertTitle>
              <AlertDescription className="text-orange-700">
                Please configure your Google Cloud Vision and Gemini API credentials by clicking the "API Settings" button.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ocr-subject">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger id="ocr-subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((subj) => (
                      <SelectItem key={subj} value={subj}>
                        {subj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ocr-grade">Grade Level</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger id="ocr-grade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignment-image">Upload Assignment Image</Label>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('assignment-image')?.click()}
                  className="w-full"
                  disabled={!subject || !grade}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select Image
                </Button>
                <input
                  id="assignment-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                <Button 
                  onClick={() => handleProcessImage()}
                  disabled={!imagePreview || isProcessing || !subject || !grade}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Extract & Evaluate
                    </>
                  )}
                </Button>
              </div>
              
              {(!subject || !grade) && (
                <p className="text-xs text-muted-foreground mt-1">
                  Please select both subject and grade before uploading an image.
                </p>
              )}
              
              {!isConfigured && (
                <p className="text-xs text-red-500 mt-1">
                  Please configure API credentials before proceeding.
                </p>
              )}
            </div>
            
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Image Preview:</p>
                <div className="rounded-md overflow-hidden border">
                  <img 
                    src={imagePreview} 
                    alt="Assignment preview" 
                    className="max-h-[300px] object-contain w-full bg-white/60"
                  />
                </div>
              </div>
            )}
            
            {extractedText && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="extracted-text">Extracted Text</Label>
                    <span className="text-xs text-muted-foreground">
                      Confidence: {Math.round(confidence * 100)}%
                    </span>
                  </div>
                  <Textarea 
                    id="extracted-text"
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    className="mt-1 h-[200px] font-mono text-sm bg-white/50"
                  />
                </div>
                
                <Button
                  onClick={() => handleAnalyzeAssignment()}
                  disabled={!extractedText || !subject || !grade || isAnalyzing || !isConfigured}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Assignment...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Evaluate Assignment
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </GlassCard>
      </FadeInSection>
      
      <FadeInSection delay={200} className="w-full">
        <GlassCard className="h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Assignment Feedback</h2>
            {feedback && (
              <DownloadPdfButton 
                content={feedback} 
                filename={`${subject}-${grade}-assignment-feedback.pdf`} 
              />
            )}
          </div>
          
          {feedback ? (
            <div className="prose prose-blue max-w-none">
              <div className="whitespace-pre-line rounded-md bg-white/50 p-6 text-foreground overflow-auto max-h-[700px]">
                {feedback.split('\n').map((line, index) => {
                  const processedLine = renderMarkdownText(line);
                  
                  if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold mt-0 mb-4">{processedLine.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-semibold mt-6 mb-3">{processedLine.substring(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-medium mt-4 mb-2">{processedLine.substring(4)}</h3>;
                  } else if (line.startsWith('- ')) {
                    return <li key={index} className="ml-5 list-disc" dangerouslySetInnerHTML={{ __html: processedLine.substring(2) }}></li>;
                  } else if (line === '') {
                    return <br key={index} />;
                  } else {
                    return <p key={index} className="my-2" dangerouslySetInnerHTML={{ __html: processedLine }}></p>;
                  }
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <FileText className="h-8 w-8 text-primary/70" />
              </div>
              <h3 className="text-xl font-medium mb-2">No Feedback Generated Yet</h3>
              <p className="text-muted-foreground max-w-md">
                Upload an assignment image and it will be automatically processed and evaluated.
              </p>
            </div>
          )}
        </GlassCard>
      </FadeInSection>
    </div>
  );
};

export default AssignmentOCR;
