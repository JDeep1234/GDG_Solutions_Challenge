"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, MessageCircle, BarChart, ChevronRight, Shield, Zap, Play, Clock, CheckCircle, Brain, Stars, Lightbulb } from "lucide-react"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxOffset = (element) => {
    return scrollY * element * 0.1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] to-[#112240] text-white overflow-hidden">
      {/* Animated Background with Apple-inspired subtle movements */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full filter blur-3xl"
          style={{ transform: `translate3d(${Math.sin(scrollY * 0.001) * 20}px, ${Math.cos(scrollY * 0.001) * 20}px, 0)` }}
        ></div>
        <div 
          className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/10 rounded-full filter blur-3xl"
          style={{ transform: `translate3d(${Math.cos(scrollY * 0.001) * 20}px, ${Math.sin(scrollY * 0.001) * 20}px, 0)` }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl"
          style={{ transform: `translate3d(${Math.sin(scrollY * 0.002) * 15}px, ${Math.cos(scrollY * 0.002) * 15}px, 0)` }}
        ></div>
      </div>

      <main className="container mx-auto px-6 pt-24 relative z-10">
        {/* Hero Section - Apple-inspired clean typography and animations */}
        <section className="grid md:grid-cols-2 gap-12 items-center min-h-[90vh] mb-24">
          <div 
            className="space-y-8 transition-all duration-1000"
            style={{ 
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <div className="inline-flex items-center bg-emerald-400/10 text-emerald-400 px-4 py-2 rounded-full text-sm space-x-2 backdrop-blur-sm border border-emerald-400/20">
              <Zap className="w-4 h-4" />
              <span>AI-Powered Education Platform</span>
            </div>
            <h1 className="text-6xl font-bold leading-tight tracking-tight">
              <span className="block text-white">Intelligent.</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 animate-gradient">Adaptive.</span>
              <span className="block text-white">Revolutionary.</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
              Shikshak Saathi uses advanced AI to analyze teaching patterns, provide real-time insights, and help educators create more engaging and effective learning experiences.
            </p>
            <div className="flex space-x-4 pt-4">
              <Link href="https://auth-ss-eight.vercel.app/">
                <Button 
                  size="lg" 
                  className="bg-white text-[#0a192f] hover:bg-gray-100 flex items-center group shadow-lg transition-all duration-300 px-8 py-6"
                  aria-label="Get Started"
                >
                  Get Started 
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="https://drive.google.com/file/d/1aFG0BzJVJTF2R1qXLcd6EbSb8wHELvbW/view?usp=sharing">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/30 text-black hover:bg-white/10 flex items-center backdrop-blur-sm transition-all duration-300 px-8 py-6"
                  aria-label="Watch Demo"
                >
                  <Play className="mr-2 text-emerald-400 w-4 h-4" /> Watch Demo
                </Button>
              </Link>
            </div>
            
            {/* Usage Stats - Clean and Apple-inspired */}
            
          </div>

          <div 
            className="relative"
            style={{ 
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1000ms ease, transform 1000ms ease',
              transitionDelay: '300ms'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl filter blur-md"></div>
            <div 
              className="absolute inset-0 bg-[#0a192f]/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
              style={{ transform: `perspective(1000px) rotateY(${Math.sin(scrollY * 0.001) * 3}deg) rotateX(${Math.cos(scrollY * 0.001) * 3}deg)` }}
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
            </div>
            <img 
              src="/Screenshot 2025-02-24 230833.png" 
              alt="Shikshak Saathi Interface" 
              className="w-full h-auto rounded-xl shadow-2xl border-2 border-white/10 relative z-10"
              style={{ 
                padding: "1rem",
                transform: `perspective(1000px) rotateY(${Math.sin(scrollY * 0.001) * 3}deg) rotateX(${Math.cos(scrollY * 0.001) * 3}deg)` 
              }}
            />
           
          </div>
        </section>

      {/* Innovation Highlight - Apple-inspired product feature highlight */}  
<section className="py-24 relative overflow-hidden">  
  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 rounded-3xl z-0"></div>  
  
  <div   
    className="max-w-3xl mx-auto text-center mb-16 relative z-10"  
    style={{   
      opacity: 1 - Math.max(0, Math.min(1, (scrollY - 500) / 300)), // Adjusted starting point for opacity  
      transform: `translateY(${Math.max(0, Math.min(50, (scrollY - 500) / 10))}px)`, // Adjusted for smoother entry  
      transition: 'opacity 300ms ease, transform 300ms ease', // Smooth transition  
      transitionDelay: '300ms' // Added delay for visual smoothness  
    }}  
  >  
    <h2 className="text-5xl font-bold tracking-tight">  
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">AI-Powered Insight Engine</span>  
    </h2>  
    <p className="text-xl text-gray-300 mt-6 max-w-2xl mx-auto">  
      Leveraging advanced machine learning algorithms to analyze teaching patterns and provide actionable insights in real-time.  
    </p>  
  </div>  
  
  <div className="relative h-96 mt-16">  
    <div   
      className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"  
      style={{   
        transform: `perspective(1000px) rotateX(${Math.max(10, Math.min(20, 20 - (scrollY - 400) / 30))}deg) scale(${Math.max(0.8, Math.min(1, 0.8 + (scrollY - 400) / 1000))})`,  
        opacity: Math.max(0, Math.min(1, (scrollY - 400) / 300))  
      }}  
    >  
      <div className="absolute inset-0 bg-gradient-to-br from-[#112240] to-[#0a192f] opacity-95"></div>  
      <div className="absolute inset-0 grid grid-cols-3 gap-4 p-6">  
        {[  
          { icon: <Brain className="w-8 h-8 text-emerald-400" />, title: "Neural Processing", subtitle: "Advanced pattern recognition" },  
          { icon: <Lightbulb className="w-8 h-8 text-blue-400" />, title: "Intelligent Suggestions", subtitle: "Contextual teaching insights" },  
          { icon: <BarChart className="w-8 h-8 text-purple-400" />, title: "Performance Analytics", subtitle: "Comprehensive data analysis" }  
        ].map((item, i) => (  
          <div   
            key={i}   
            className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col backdrop-blur-sm"  
            style={{   
              opacity: Math.max(0, Math.min(1, (scrollY - 400 - i * 100) / 300)),  
              transform: `translateY(${Math.max(0, Math.min(20, 20 - (scrollY - 400 - i * 100) / 15))}px)`  
            }}  
          >  
            <div className="p-3 bg-[#0a192f] rounded-xl border border-white/10 w-fit mb-4">  
              {item.icon}  
            </div>  
            <h3 className="text-lg font-medium text-white">{item.title}</h3>  
            <p className="text-sm text-gray-400 mt-1">{item.subtitle}</p>  
          </div>  
        ))}  
      </div>  
    </div>  
  </div>  
</section>  
{/* Features Section - Animated and Enhanced UI */}  
<section className="py-24 bg-gradient-to-b from-[#0a192f] to-[#112240] overflow-hidden">  
  <div className="container mx-auto px-6">  
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 relative inline-block">
        <span className="relative z-10">Key Features</span>
        <span className="absolute -bottom-2 left-0 w-full h-2 bg-blue-500 rounded-full opacity-70"></span>
      </h2>
      <p className="text-blue-200 text-lg max-w-2xl mx-auto">
        Discover how our platform revolutionizes the educational experience
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">  
      {[  
        {  
          title: "User-Centric Design",  
          description: "Automated administrative and repetitive tasks to streamline teacher workflows.",  
          number: "01",
          icon: "📚",
          color: "bg-blue-600",  
        },  
        {  
          title: "OCR-Based Grading",  
          description: "Efficient assessment evaluation using advanced optical character recognition technology.",  
          number: "02", 
          icon: "🎓", 
          color: "bg-purple-600",  
        },  
        {  
          title: "AI-Driven Feedback",  
          description: "Personalized artificial intelligence-powered feedback for comprehensive student assessments.",  
          number: "03",
          icon: "🤖",  
          color: "bg-green-600",  
        },  
        {  
          title: "NCERT-Aligned Chatbot",  
          description: "Intelligent assistant for creating lesson plans and generating curriculum-aligned assessments.",  
          number: "04",
          icon: "💬",  
          color: "bg-red-700",  
        },  
        {  
          title: "Multilingual Capabilities",  
          description: "Multilingual capabilities for diverse student needs.",  
          number: "05",
          icon: "🌐",  
          color: "bg-blue-500",  
        },  
        {  
          title: "Tailored Learning Pathways",  
          description: "Personalized post-training support with adaptive learning experiences.",  
          number: "06",
          icon: "🧩",  
          color: "bg-pink-600",  
        },  
        {  
          title: "Gamified Classroom Analytics",  
          description: "Interactive quizzes and comprehensive classroom management tools with advanced analytics.",  
          number: "07",
          icon: "🎮",  
          color: "bg-teal-600",  
        },  
        {  
          title: "Collaborative Platform",  
          description: "Seamless teacher networking and resource sharing ecosystem.",  
          number: "08",
          icon: "👥",  
          color: "bg-amber-600",  
        },  
        {  
          title: "Rural Areas Accessibility",  
          description: "Comprehensive support for low-bandwidth regions with offline learning capabilities.",  
          number: "09",
          icon: "🏡",  
          color: "bg-cyan-600",  
        }  
      ].map((feature, index) => (  
        <div   
          key={index}   
          className={`feature-card relative rounded-xl ${feature.color} p-6 transition-all duration-500 shadow-lg hover:shadow-xl hover:-translate-y-2 hover:scale-105`}   
          style={{   
            opacity: 0,
            transform: "translateY(48px)",
            transitionDelay: `${index * 100}ms`
          }}  
        >  
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white bg-opacity-20 text-2xl">
                {feature.icon}
              </div>
              <div className="text-4xl font-bold text-white opacity-30">
                {feature.number}
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
            <p className="text-blue-100">{feature.description}</p>
          </div>
          
          <div className="absolute top-0 right-0 w-full h-full overflow-hidden rounded-xl pointer-events-none">
            <div className="absolute -right-4 -top-4 w-24 h-24 opacity-20 rounded-full bg-white blur-xl"></div>
          </div>
        </div>  
      ))}  
    </div>  
  </div>  

  {/* Add this script to handle scroll animations without styled-jsx */}
  <script dangerouslySetInnerHTML={{
    __html: `
      document.addEventListener('DOMContentLoaded', function() {
        const observerOptions = {
          root: null,
          rootMargin: "0px",
          threshold: 0.1
        };

        const observerCallback = (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = "1";
              entry.target.style.transform = "translateY(0)";
            }
          });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        
        document.querySelectorAll('.feature-card').forEach(card => {
          observer.observe(card);
        });
      });
    `
  }} />
</section>

        {/* Features Section - Clean, focused with Apple-like animations */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute left-0 right-0 h-1/2 bg-gradient-to-b from-transparent to-[#101e36] z-0"></div>
          
          <div className="text-center mb-20 relative z-10">
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500">
              Transformative Teaching Tools
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-blue-500 mx-auto mt-6"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {[
              {
                icon: <MessageCircle className="w-10 h-10 text-emerald-400" />,
                title: "Real-Time Feedback",
                description: "Instant analysis of teaching methodologies with specific, actionable recommendations.",
                color: "emerald"
              },
              {
                icon: <BookOpen className="w-10 h-10 text-blue-400" />,
                title: "Adaptive Learning Paths",
                description: "Personalized professional development resources that evolve with your teaching style.",
                color: "blue"
              },
              {
                icon: <BarChart className="w-10 h-10 text-purple-400" />,
                title: "Advanced Analytics",
                description: "Comprehensive data visualization of student engagement and learning outcomes.",
                color: "purple"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className={`bg-[#0a192f]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 
                  transition-all duration-500 overflow-hidden relative
                  group`}
                style={{ 
                  opacity: Math.max(0, Math.min(1, (scrollY - 800 - index * 100) / 300)),
                  transform: `translateY(${Math.max(0, Math.min(30, 30 - (scrollY - 800 - index * 100) / 10))}px)`
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl ${
                  feature.color === "emerald" ? "from-emerald-400 to-emerald-600" :
                  feature.color === "blue" ? "from-blue-400 to-blue-600" :
                  "from-purple-400 to-purple-600"
                }`}></div>
                
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative
                  border border-white/10 bg-[#112240] group-hover:scale-110 transition-all duration-300
                `}>
                  {feature.icon}
                  <div className={`absolute inset-0 bg-gradient-to-br rounded-2xl ${
                    feature.color === "emerald" ? "from-emerald-400/10 to-emerald-600/5" :
                    feature.color === "blue" ? "from-blue-400/10 to-blue-600/5" :
                    "from-purple-400/10 to-purple-600/5"
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </div>
                
                <h3 className={`text-xl font-semibold mb-4 ${
                  feature.color === "emerald" ? "text-emerald-300" :
                  feature.color === "blue" ? "text-blue-300" :
                  "text-purple-300"
                }`}>{feature.title}</h3>
                
                <p className="text-gray-300">{feature.description}</p>
                
                <div className={`mt-6 flex items-center text-sm font-medium
                  ${
                    feature.color === "emerald" ? "text-emerald-400" :
                    feature.color === "blue" ? "text-blue-400" :
                    "text-purple-400"
                  } group-hover:translate-x-1 transition-transform duration-300
                `}>
                  Learn more <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works - Clean, Apple-inspired process section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#0a192f]/30 rounded-3xl backdrop-blur-sm z-0"></div>
          
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Seamless Integration
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-blue-500 mx-auto mt-6 mb-8"></div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience a simple onboarding process designed with educators in mind.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-emerald-500/50 via-blue-500/50 to-purple-500/50 transform -translate-y-1/2"></div>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
              {[
                {
                  icon: <Play className="w-8 h-8 text-white" />,
                  title: "Connect",
                  description: "Set up your profile and connect your teaching materials in minutes.",
                  color: "emerald"
                },
                {
                  icon: <Brain className="w-8 h-8 text-white" />,
                  title: "Analyze",
                  description: "Our AI engine processes your materials and teaching style.",
                  color: "blue"
                },
                {
                  icon: <CheckCircle className="w-8 h-8 text-white" />,
                  title: "Optimize",
                  description: "Implement personalized suggestions and track improvements.",
                  color: "purple"
                }
              ].map((step, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center text-center relative"
                  style={{ 
                    opacity: Math.max(0, Math.min(1, (scrollY - 1200 - index * 100) / 300)),
                    transform: `translateY(${Math.max(0, Math.min(30, 30 - (scrollY - 1200 - index * 100) / 10))}px)`
                  }}
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 relative z-10
                    bg-gradient-to-br ${
                      step.color === "emerald" ? "from-emerald-500 to-emerald-700" :
                      step.color === "blue" ? "from-blue-500 to-blue-700" :
                      "from-purple-500 to-purple-700"
                    } shadow-lg
                  `}>
                    {step.icon}
                  </div>
                  
                  <h3 className="text-2xl font-semibold mb-4 text-white">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section - Clean, minimal Apple-inspired CTA */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 rounded-3xl z-0"></div>
          
          <div 
            className="max-w-4xl mx-auto text-center relative z-10"
            style={{ 
              opacity: Math.max(0, Math.min(1, (scrollY - 1600) / 300)),
              transform: `translateY(${Math.max(0, Math.min(30, 30 - (scrollY - 1600) / 10))}px)`
            }}
          >
            <h2 className="text-5xl font-bold mb-6 text-white">
              Ready to elevate your teaching?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              Join the community of educators using advanced AI to create more effective and engaging learning experiences.
            </p>
            <div className="inline-flex items-center">
              <Link href="https://auth-ss-eight.vercel.app/">
                <Button 
                  size="lg" 
                  className="bg-white text-[#0a192f] hover:bg-gray-100 flex items-center group shadow-lg transition-all duration-300 text-lg px-10 py-7"
                  aria-label="Get Started"
                >
                  Get Started Free
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <p className="text-gray-400 mt-4">Already have an account? <Link href="https://auth-ss-eight.vercel.app/sign-in" className="text-white hover:underline">Sign In</Link></p>
          </div>
        </section>
      </main>

      {/* Add a style tag for custom animations */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
