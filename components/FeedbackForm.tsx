
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import GlassCard from './GlassCard';
import { FEEDBACK_AREAS, generateFeedback } from '@/utils/api';
import FadeInSection from './FadeInSection';

const FeedbackForm = () => {
  const [lessonPlan, setLessonPlan] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleAreaToggle = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lessonPlan.trim() === '') {
      return;
    }
    
    if (selectedAreas.length === 0) {
      // If no areas are selected, select all
      setSelectedAreas(FEEDBACK_AREAS);
    }
    
    setIsGenerating(true);
    
    try {
      const result = await generateFeedback({
        lessonPlan,
        areas: selectedAreas.length > 0 ? selectedAreas : FEEDBACK_AREAS
      });
      
      setFeedback(result);
    } catch (error) {
      console.error('Error generating feedback:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-6">
      <FadeInSection className="w-full">
        <GlassCard>
          <h2 className="text-2xl font-semibold mb-6">Get Expert Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="lessonPlan">Your Lesson Plan</Label>
              <Textarea
                id="lessonPlan"
                value={lessonPlan}
                onChange={(e) => setLessonPlan(e.target.value)}
                placeholder="Paste your lesson plan here..."
                className="min-h-[300px]"
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Areas for Feedback</Label>
              <p className="text-sm text-muted-foreground">Select specific areas you'd like feedback on:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {FEEDBACK_AREAS.map((area) => (
                  <div key={area} className="flex items-start space-x-2">
                    <Checkbox 
                      id={area} 
                      checked={selectedAreas.includes(area)}
                      onCheckedChange={() => handleAreaToggle(area)}
                      className="mt-1"
                    />
                    <Label 
                      htmlFor={area} 
                      className="text-sm font-normal leading-none cursor-pointer"
                    >
                      {area}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isGenerating || lessonPlan.trim() === ''}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Feedback...
                </>
              ) : (
                'Get Feedback'
              )}
            </Button>
          </form>
        </GlassCard>
      </FadeInSection>

      <FadeInSection delay={200} className="w-full">
        <GlassCard className="h-full">
          <h2 className="text-2xl font-semibold mb-6">Expert Feedback</h2>
          {feedback ? (
            <div className="prose prose-blue max-w-none">
              <div className="whitespace-pre-line rounded-md bg-white/50 p-6 text-foreground overflow-auto max-h-[700px]">
                {feedback.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold mt-0 mb-4">{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-semibold mt-6 mb-3">{line.substring(3)}</h2>;
                  } else if (line.startsWith('- ')) {
                    return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
                  } else if (line.startsWith('**') && line.includes(':**')) {
                    const parts = line.split(':**');
                    return (
                      <div key={index} className="mb-3">
                        <h3 className="text-lg font-medium my-1">{parts[0].replace('**', '')}</h3>
                        <p>{parts[1]}</p>
                      </div>
                    );
                  } else if (line === '') {
                    return <br key={index} />;
                  } else {
                    return <p key={index} className="my-2">{line}</p>;
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
                Paste your lesson plan and select areas for feedback, then click "Get Feedback" to receive expert insights.
              </p>
            </div>
          )}
        </GlassCard>
      </FadeInSection>
    </div>
  );
};

export default FeedbackForm;
