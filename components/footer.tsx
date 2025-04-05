"use client"

import Link from "next/link"
import { 
  BookOpen, 
  GraduationCap, 
  ClipboardCheck, 
  Mic,
  FileText,
  ExternalLink
} from "lucide-react"

export default function Footer() {
  const quickLinks = [
    { href: "/", label: "Home", icon: <FileText size={16} className="text-gray-500" /> },
    { href: "/ai-feedback", label: "Generate Lesson Plan", icon: <BookOpen size={16} className="text-gray-500" /> },
    { href: "/classroom-audio", label: "Audio", icon: <Mic size={16} className="text-gray-500" /> },
    { href: "/training-hub", label: "Training", icon: <GraduationCap size={16} className="text-gray-500" /> },
  ]
  
  const resourceLinks = [
    { href: "/ncert-resources", label: "NCERT Resources", icon: <FileText size={16} className="text-gray-500" /> },
    { href: "/gemini-docs", label: "Gemini API Docs", icon: <ExternalLink size={16} className="text-gray-500" /> },
  ]

  return (
    <footer className="bg-gradient-to-r from-blue-50 to-indigo-50 py-10 text-gray-600 text-sm">
      <div className="container mx-auto px-4 flex flex-col items-center space-y-6 md:flex-row md:justify-between md:space-y-0">
        <div className="text-center md:text-left md:w-1/3">
          <Link 
            href="/" 
            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center md:justify-start"
          >
            <span className="text-blue-600 mr-1">🎓</span>
            Shikshak_Saathi
          </Link>
          <p className="mt-2 max-w-sm text-gray-600">
            Empowering educators with AI-assisted lesson planning and feedback to enhance teaching outcomes.
          </p>
        </div>
        
        <div className="text-center md:w-1/3">
          <h2 className="text-gray-800 font-semibold mb-3">Quick Links</h2>
          <ul className="space-y-2">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href} 
                  className="group hover:text-blue-600 transition-colors flex items-center justify-center md:justify-start gap-2"
                >
                  {link.icon}
                  <span className="group-hover:text-blue-600">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="text-center md:w-1/3">
          <h2 className="text-gray-800 font-semibold mb-3">Resources</h2>
          <ul className="space-y-2">
            {resourceLinks.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href} 
                  className="group hover:text-blue-600 transition-colors flex items-center justify-center md:justify-start gap-2"
                >
                  {link.icon}
                  <span className="group-hover:text-blue-600">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-8 pt-6 border-t border-blue-100 text-center md:flex md:justify-between md:items-center">
        <p>&copy; 2025 Shikshak Saathi. All rights reserved.</p>
        <div className="mt-4 md:mt-0 space-x-6">
          <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}