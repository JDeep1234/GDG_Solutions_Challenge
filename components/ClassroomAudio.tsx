
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mic, MicOff, Play, Square, Headphones, Upload } from 'lucide-react';
import GlassCard from './GlassCard';
import FadeInSection from './FadeInSection';
import { SUBJECTS, GRADES, getStoredApiKey, getGoogleSpeechApiKey } from '@/utils/api';
import { transcribeAudio, analyzeClassroomTranscription } from '@/utils/audioApi';
import { toast } from '@/components/ui/use-toast';
import DownloadPdfButton from './DownloadPdfButton';

const ClassroomAudio = () => {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setAudioBlob(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
      }, 1000);
      
      toast({
        title: "Recording Started",
        description: "Your classroom audio is now being recorded"
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Unable to access microphone. Please check permissions."
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop all tracks on the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast({
        title: "Recording Stopped",
        description: `Recorded ${formatTime(recordingTime)} of audio`
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if it's an audio file
    if (!file.type.startsWith('audio/')) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload an audio file (MP3, WAV, etc.)"
      });
      return;
    }
    
    // Create a URL for the audio file
    const url = URL.createObjectURL(file);
    setAudioURL(url);
    setAudioBlob(file);
    
    toast({
      title: "Recording Uploaded",
      description: `Uploaded: ${file.name}`
    });
    
    // Reset the input so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) {
      toast({
        variant: "destructive",
        title: "No Recording",
        description: "Please record audio or upload an audio file first"
      });
      return;
    }

    // Check for Google Speech API key
    const googleSpeechApiKey = getGoogleSpeechApiKey();
    if (!googleSpeechApiKey) {
      toast({
        variant: "destructive",
        title: "API Key Missing",
        description: "Please provide a Google Speech-to-Text API key at the top of the page"
      });
      return;
    }

    setIsTranscribing(true);
    setTranscription('');
    setFeedback('');

    try {
      const result = await transcribeAudio(audioBlob);
      setTranscription(result);
      
      toast({
        title: "Transcription Complete",
        description: "Your classroom audio has been transcribed"
      });
    } catch (error) {
      console.error("Error transcribing audio:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAnalyzeClass = async () => {
    if (!transcription) {
      toast({
        variant: "destructive",
        title: "No Transcription",
        description: "Please transcribe the audio first"
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

    // Check for Gemini API key
    const geminiApiKey = getStoredApiKey();
    if (!geminiApiKey || geminiApiKey === "YOUR_GEMINI_API_KEY") {
      toast({
        variant: "destructive",
        title: "API Key Missing",
        description: "Please provide a Gemini API key at the top of the page"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await analyzeClassroomTranscription(transcription, subject, grade);
      setFeedback(result);
      
      toast({
        title: "Analysis Complete",
        description: "Classroom teaching feedback has been generated"
      });
    } catch (error) {
      console.error("Error analyzing classroom:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderMarkdownText = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    return text.replace(boldRegex, '<strong>$1</strong>');
  };

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-6">
      <FadeInSection className="w-full">
        <GlassCard>
          <h2 className="text-2xl font-semibold mb-6">Classroom Audio Analysis</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="audio-subject">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger id="audio-subject">
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
                <Label htmlFor="audio-grade">Grade Level</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger id="audio-grade">
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
              <Label htmlFor="classroom-audio">Record or Upload Classroom Audio</Label>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 rounded-md bg-secondary/30">
                  <div className="flex items-center gap-2">
                    {isRecording ? (
                      <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                    ) : (
                      <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                    )}
                    <span>{isRecording ? 'Recording...' : 'Ready to record'}</span>
                  </div>
                  <div className="text-sm font-mono">
                    {formatTime(recordingTime)}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {!isRecording ? (
                    <Button 
                      onClick={startRecording}
                      variant="default"
                      className="flex-1 min-w-[140px]"
                    >
                      <Mic className="mr-2 h-4 w-4" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopRecording}
                      variant="destructive"
                      className="flex-1 min-w-[140px]"
                    >
                      <Square className="mr-2 h-4 w-4" />
                      Stop Recording
                    </Button>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  
                  <Button
                    variant="outline"
                    onClick={handleUploadClick}
                    className="flex-1 min-w-[140px]"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Recording
                  </Button>
                  
                  <Button
                    variant="outline"
                    disabled={!audioURL}
                    onClick={() => {
                      const audio = new Audio(audioURL || '');
                      audio.play();
                    }}
                    className="flex-1 min-w-[140px]"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Play Recording
                  </Button>
                </div>
              </div>
            </div>
            
            {audioURL && (
              <div className="space-y-4">
                <audio src={audioURL} controls className="w-full mt-2" />
                
                <Button
                  onClick={handleTranscribe}
                  disabled={!audioBlob || isTranscribing}
                  className="w-full"
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Transcribing...
                    </>
                  ) : (
                    <>
                      <Headphones className="mr-2 h-4 w-4" />
                      Transcribe Audio
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {transcription && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="transcription">Transcription</Label>
                  <div 
                    className="mt-1 p-4 rounded-md bg-white/50 text-sm h-[200px] overflow-auto border"
                  >
                    {transcription}
                  </div>
                </div>
                
                <Button
                  onClick={handleAnalyzeClass}
                  disabled={!transcription || !subject || !grade || isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Classroom...
                    </>
                  ) : (
                    'Generate Teaching Feedback'
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
            <h2 className="text-2xl font-semibold">Teaching Feedback</h2>
            {feedback && (
              <DownloadPdfButton 
                content={feedback} 
                filename={`${subject}-${grade}-teaching-feedback.pdf`} 
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
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-primary/30" />
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2">No Feedback Generated Yet</h3>
              <p className="text-muted-foreground max-w-md">
                Record your classroom session, transcribe the audio, and click "Generate Teaching Feedback" to receive detailed pedagogical analysis.
              </p>
            </div>
          )}
        </GlassCard>
      </FadeInSection>
    </div>
  );
};

export default ClassroomAudio;
