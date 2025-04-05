
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import FadeInSection from './FadeInSection';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-[90vh] flex flex-col items-center justify-center px-6 py-24 md:py-32">
      <div className="max-w-5xl mx-auto text-center">
        <FadeInSection>
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Powered by Gemini AI
          </div>
        </FadeInSection>

        <FadeInSection delay={100}>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            Create Perfect Lesson Plans with AI
          </h1>
        </FadeInSection>

        <FadeInSection delay={200}>
          <p className="text-xl mb-10 text-muted-foreground max-w-3xl mx-auto text-balance">
            Generate tailored lesson plans based on NCERT curriculum and receive feedback to enhance your teaching methods.
          </p>
        </FadeInSection>

        <FadeInSection delay={300}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate('/generate')}
            >
              Generate Lesson Plan
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/50 hover:bg-white/80 backdrop-blur-sm border border-gray-200 font-medium px-8 py-6 rounded-xl transition-all"
              onClick={() => navigate('/feedback')}
            >
              Get Feedback
            </Button>
          </div>
        </FadeInSection>
      </div>

      <FadeInSection delay={400} direction="none" className="mt-16 w-full max-w-5xl">
        <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-2/3 glass-morphism rounded-lg shadow-lg flex items-center justify-center">
              <div className="w-5/6 h-4/5 bg-white/80 backdrop-blur rounded-lg shadow-inner p-6 flex flex-col">
                <div className="h-2 w-1/2 bg-blue-200 rounded-full mb-3"></div>
                <div className="h-2 w-3/4 bg-blue-100 rounded-full mb-6"></div>
                <div className="flex-grow grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-blue-50/80 rounded-md flex flex-col p-3">
                    <div className="h-2 w-1/3 bg-blue-200 rounded-full mb-2"></div>
                    <div className="h-2 w-1/2 bg-blue-100 rounded-full mb-2"></div>
                    <div className="h-2 w-1/4 bg-blue-100 rounded-full"></div>
                  </div>
                  <div className="bg-blue-50/80 rounded-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeInSection>
    </div>
  );
};

export default Hero;
