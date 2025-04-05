"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Menu, 
  X, 
  BookOpen, 
  GraduationCap, 
  BarChart2, 
  ClipboardCheck, 
  Mic, 
  UserCircle, 
  Globe,
  ArrowRight
} from "lucide-react"
import { useState } from "react"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState("/ai-feedback") // Default active link

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const navigationLinks = [
    { href: "/ai-feedback", label: "Chatbot", icon: <BookOpen className="group-hover:text-blue-500 transition-colors" /> },
    { href: "/training-hub", label: "Training", icon: <GraduationCap className="group-hover:text-blue-500 transition-colors" /> },
    { href: "/insights", label: "Insights", icon: <BarChart2 className="group-hover:text-blue-500 transition-colors" /> },
    { href: "/eval", label: "Evaluation", icon: <ClipboardCheck className="group-hover:text-blue-500 transition-colors" /> },
    { href: "/classroom-audio", label: "Audio", icon: <Mic className="group-hover:text-blue-500 transition-colors" /> },
    { href: "/profile", label: "Profile", icon: <UserCircle className="group-hover:text-blue-500 transition-colors" /> }
  ]

  return (
    <header className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center shrink-0"
        >
          <span className="text-blue-600 mr-1">🎓</span>
          Shikshak_Saathi
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2 flex-grow justify-center">
          {navigationLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`group px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                ${activeLink === link.href 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}
              onClick={() => setActiveLink(link.href)}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Language and Start Training Section */}
        <div className="hidden md:flex items-center space-x-4 shrink-0">
          <Select>
            <SelectTrigger className="w-[120px] text-sm border-blue-200 bg-white/80 rounded-lg">
              <Globe size={16} className="text-blue-500 mr-2" />
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="ta">Tamil</SelectItem>
              <SelectItem value="bn">Bengali</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium px-4 py-2 transition-all duration-300 transform hover:scale-105 flex items-center gap-1"
          >
            <Link href="/start-training" className="flex items-center">
              Start Training
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button 
            onClick={toggleMobileMenu} 
            className="text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gradient-to-b from-white to-blue-50 z-40 pt-20 overflow-y-auto">
          <div className="flex flex-col items-center space-y-6 px-6 pb-8">
            {/* Mobile Navigation Links */}
            <div className="w-full space-y-3 text-center">
              {navigationLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`block py-3 text-lg rounded-xl transition-all duration-200 flex items-center justify-center gap-3
                    ${activeLink === link.href 
                      ? "bg-blue-100 text-blue-700" 
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
                  onClick={() => {
                    setActiveLink(link.href);
                    toggleMobileMenu();
                  }}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* Mobile Language and Start Training Section */}
            <div className="w-full max-w-xs space-y-4 mt-4">
              <Select>
                <SelectTrigger className="w-full border-blue-200 bg-white/80 rounded-lg">
                  <Globe size={16} className="text-blue-500 mr-2" />
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                  <SelectItem value="bn">Bengali</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg py-3">
                <Link href="/start-training" className="flex items-center justify-center">
                  Start Training
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
