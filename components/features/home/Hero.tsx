"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const HERO_SLIDES = [
  {
    headline: "Premium Quality\nAWS Student Community",
    tagline: "Innovation • Student Entrepreneurs",
    description: "Join a community where students learn by building—through hands-on workshops, hackathons, mentorship, and real AWS projects that prepare you for the future.",
    primaryBtn: "Join Group",
    secondaryBtn: "About Us",
    stats: [
      { value: "50+", label: "Active Members" },
      { value: "6", label: "Builder Wings" },
      { value: "Premium", label: "AWS Learning" }
    ]
  },
  {
    headline: "Your Trusted\nCloud Learning Companion",
    tagline: "Hands-on • Real Projects • Certified",
    description: "Build your cloud career with expert-led workshops, industry mentorship, and AWS certification programs designed for students at Tulas University.",
    primaryBtn: "Join Group",
    secondaryBtn: "About Us",
    stats: [
      { value: "100%", label: "Free Access" },
      { value: "AWS", label: "Certified" },
      { value: "2026", label: "Cohort" }
    ]
  },
  {
    headline: "Empowering Student\nCloud Builders",
    tagline: "Learn • Build • Deploy",
    description: "Transform your ideas into reality with AWS cloud technologies. Get hands-on experience with real-world projects and connect with industry professionals.",
    primaryBtn: "Join Group",
    secondaryBtn: "About Us",
    stats: [
      { value: "All Years", label: "Welcome" },
      { value: "24/7", label: "Support" },
      { value: "Expert", label: "Mentorship" }
    ]
  }
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    if (index !== currentSlide) {
      setCurrentSlide(index);
    }
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section id="top" className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0A0A0F] via-[#1a0b2e] to-[#0A0A0F] text-white flex flex-col justify-center select-none pt-24 pb-12 sm:pt-28 sm:pb-16">
      
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute top-20 right-10 w-[400px] h-[400px] rounded-full bg-primary/20 blur-[100px] animate-float-slow" />
      <div className="pointer-events-none absolute bottom-20 left-10 w-[300px] h-[300px] rounded-full bg-accent/15 blur-[80px] animate-float-slower" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      {/* Hero Main Content */}
      <div className="relative z-10 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Static User Avatars & Social Proof Badge */}
        <div className="flex items-center justify-center mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center -space-x-1.5 shrink-0">
              <img 
                src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100" 
                alt="Student 1"
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[#0A0A0F] object-cover"
              />
              <img 
                src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100" 
                alt="Student 2"
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[#0A0A0F] object-cover"
              />
              <img 
                src="https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=100" 
                alt="Student 3"
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-[#0A0A0F] object-cover"
              />
            </div>
            <div className="flex items-center shrink-0">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="#FCD34D">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="#FCD34D">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="#FCD34D">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-white/90 whitespace-nowrap">Trusted by 50+ Students</span>
          </div>
        </div>
        
        {/* Content with smooth cross-fade */}
        <div key={currentSlide} className="animate-fade-in">
          {/* Main Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-4 sm:mb-5">
            {slide.headline.split('\n').map((line, i) => (
              <span
                key={i}
                className="block text-transparent bg-clip-text pb-1 animate-aurora"
                style={{ backgroundImage: "linear-gradient(90deg, #7C3AED, #C084FC, #06B6D4, #A78BFA, #7C3AED)" }}
              >
                {line}
              </span>
            ))}
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-white/80 font-medium mb-5 sm:mb-6">
            {slide.tagline}
          </p>


          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12">
            <a
              href="https://www.meetup.com/tulas-university-dehradun/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-primary via-purple-600 to-accent text-white font-bold text-sm rounded-full transition-all duration-300 shadow-[0_0_30px_-5px_rgba(124,58,237,0.6)] hover:shadow-[0_0_45px_-5px_rgba(124,58,237,0.9)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center overflow-hidden animate-cta-shimmer"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                </svg>
                {slide.primaryBtn}
              </span>
            </a>

            <a
              href="/about"
              className="group relative w-full sm:w-auto px-10 py-4 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-full border-2 border-white/20 hover:border-primary/50 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
            >
              <span className="flex items-center gap-2">
                {slide.secondaryBtn}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </a>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-center mb-8">
            {slide.stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-4 sm:gap-8">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-white/70">{stat.label}</div>
                </div>
                {index < slide.stats.length - 1 && (
                  <div className="hidden sm:block w-px h-12 bg-white/30"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "rounded-full transition-all duration-500 ease-out",
                currentSlide === index 
                  ? "bg-primary w-8 h-2" 
                  : "bg-white/30 hover:bg-white/50 w-2 h-2"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
