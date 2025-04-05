import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertTriangle } from 'lucide-react';
import GlassCard from './GlassCard';
import { SUBJECTS, GRADES, getSampleTopics, generateLessonPlan, hasApiKeys } from '@/utils/api';
import FadeInSection from './FadeInSection';
import DownloadPdfButton from './DownloadPdfButton';
import { toast } from '@/components/ui/use-toast';

const LessonForm = () => {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [objectives, setObjectives] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessonPlan, setLessonPlan] = useState('');
  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubjectChange = (value: string) => {
    setSubject(value);
    setTopicSuggestions(getSampleTopics(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!hasApiKeys()) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please add your Gemini API key in src/utils/api.ts"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const result = await generateLessonPlan({
        subject,
        grade,
        topic,
        duration,
        objectives
      });
      
      setLessonPlan(result);
      toast({
        title: "Lesson Plan Generated",
        description: "Your lesson plan has been successfully created"
      });
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      setError(error instanceof Error ? error.message : "Failed to generate lesson plan");
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate lesson plan"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTopicSuggestionClick = (suggestion: string) => {
    setTopic(suggestion);
  };

  const renderMarkdownText = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    return text.replace(boldRegex, '<strong>$1</strong>');
  };

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-6">
      <FadeInSection className="w-full">
        <GlassCard>
          <h2 className="text-2xl font-semibold mb-6">Generate Lesson Plan</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select 
                  value={subject} 
                  onValueChange={handleSubjectChange}
                  required
                >
                  <SelectTrigger id="subject" className="w-full">
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
                <Label htmlFor="grade">Grade Level</Label>
                <Select 
                  value={grade} 
                  onValueChange={setGrade}
                  required
                >
                  <SelectTrigger id="grade" className="w-full">
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
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, Fractions, Poetry Analysis"
                required
              />
              {topicSuggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">Suggested topics based on NCERT curriculum:</p>
                  <div className="flex flex-wrap gap-2">
                    {topicSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="text-xs bg-secondary px-3 py-1 rounded-full text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => handleTopicSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Lesson Duration</Label>
              <Input
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 45 minutes, 1 hour, 2 class periods"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">Learning Objectives</Label>
              <Textarea
                id="objectives"
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="Enter the main learning objectives for this lesson"
                className="min-h-[100px]"
                required
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Lesson Plan...
                </>
              ) : (
                'Generate Lesson Plan'
              )}
            </Button>
          </form>
        </GlassCard>
      </FadeInSection>

      <FadeInSection delay={200} className="w-full">
        <GlassCard className="h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Your Lesson Plan</h2>
            {lessonPlan && (
              <DownloadPdfButton content={lessonPlan} filename={`${subject}-${topic}-lesson-plan.pdf`} />
            )}
          </div>
          
          {lessonPlan ? (
            <div className="prose prose-blue max-w-none">
              <div className="whitespace-pre-line rounded-md bg-white/50 p-6 text-foreground overflow-auto max-h-[700px]">
                {lessonPlan.split('\n').map((line, index) => {
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
              <h3 className="text-xl font-medium mb-2">No Lesson Plan Generated Yet</h3>
              <p className="text-muted-foreground max-w-md">
                Fill out the form and click "Generate Lesson Plan" to create a customized lesson plan using Google's Gemini AI.
              </p>
            </div>
          )}
        </GlassCard>
      </FadeInSection>
    </div>
  );
};

export default LessonForm;
