import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Printer,
  Sparkles,
  Target,
  Users,
  Lightbulb,
  Crosshair,
  Palette,
  Megaphone,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';
import { useWorkspace } from '../state/ProjectContext';
import { loadGoogleFont } from '../lib/format';
import { Sparkle } from '../components/ui/Logo';

export default function PitchDeck() {
  const { projectId = '' } = useParams();
  const { project } = useWorkspace(projectId);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const dna = project?.brandDNA;
  const brandName = dna?.naming?.selectedName || dna?.brandKit?.name || project?.name || 'IdeaForge Brand';
  const tagline = dna?.messaging?.tagline || dna?.brandKit?.tagline || 'Turn your idea into a brand';
  const headingFont = dna?.visual?.typography.heading || 'Inter';
  const primaryColor = dna?.visual?.colors[0]?.hex || '#0f766e';
  const secondaryColor = dna?.visual?.colors[1]?.hex || '#0284c7';

  useEffect(() => {
    if (headingFont) loadGoogleFont(headingFont);
  }, [headingFont]);

  const totalSlides = 10;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlide(totalSlides - 1);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isFullscreen, totalSlides]);

  if (!project || !dna) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <Sparkle className="size-10 text-teal-400" animated />
      </div>
    );
  }

  const slides = [
    // Slide 1: Cover & Vision
    {
      title: 'Vision & Brand Identity',
      icon: <Sparkles className="size-6 text-teal-400" />,
      content: (
        <div className="flex h-full flex-col justify-between py-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-teal-300 backdrop-blur">
              {dna.positioning?.category || 'Startup Brand Deck'}
            </span>
            <span className="text-xs text-slate-400 font-mono">Confidential Pitch Deck</span>
          </div>

          <div className="space-y-4 my-auto">
            <div
              className="inline-flex size-16 items-center justify-center rounded-2xl text-3xl font-black text-white shadow-lift ring-2 ring-white/20"
              style={{ backgroundColor: primaryColor }}
            >
              {brandName[0]}
            </div>

            <h1
              className="text-5xl font-black tracking-tight text-white sm:text-6xl"
              style={{ fontFamily: headingFont }}
            >
              {brandName}
            </h1>

            <p className="text-2xl font-semibold text-teal-200 sm:text-3xl max-w-2xl leading-snug">
              {tagline}
            </p>

            <p className="text-base text-slate-300 max-w-xl leading-relaxed">
              {dna.messaging?.oneLinePitch || dna.brandKit?.oneLinePitch}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
            <span>Powered by IdeaForge Brand Intelligence</span>
            <span>Slide 01 / 10</span>
          </div>
        </div>
      ),
    },

    // Slide 2: The Problem
    {
      title: 'The Core Problem',
      icon: <Target className="size-6 text-red-400" />,
      content: (
        <div className="flex h-full flex-col justify-between py-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-red-400">Pain Point & Market Friction</span>
            <h2 className="mt-2 text-4xl font-black text-white sm:text-5xl" style={{ fontFamily: headingFont }}>
              What Breaks Today?
            </h2>
          </div>

          <div className="my-auto grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h3 className="text-lg font-bold text-red-300 mb-2">The Problem Statement</h3>
              <p className="text-base text-slate-200 leading-relaxed">
                {dna.idea?.problem || 'Current solutions are fragmented, generic, and fail to provide coherent brand intelligence.'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h3 className="text-lg font-bold text-amber-300 mb-2">Real User Friction</h3>
              <p className="text-base text-slate-200 leading-relaxed">
                {dna.idea?.userNeed || 'Users waste hundreds of hours and thousands of dollars on disconnected tools without cohesive guidance.'}
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 text-xs text-slate-400 flex justify-between">
            <span>Context: {dna.idea?.context || 'Emerging Market Dynamics'}</span>
            <span>Slide 02 / 10</span>
          </div>
        </div>
      ),
    },

    // Slide 3: Target Audience
    {
      title: 'Target Audience & Personas',
      icon: <Users className="size-6 text-blue-400" />,
      content: (
        <div className="flex h-full flex-col justify-between py-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Market Segment</span>
            <h2 className="mt-2 text-4xl font-black text-white sm:text-5xl" style={{ fontFamily: headingFont }}>
              Who Needs This Most?
            </h2>
          </div>

          <div className="my-auto grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-teal-500/30 bg-teal-950/30 p-6 backdrop-blur">
              <span className="rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-bold text-teal-300">
                Primary Audience
              </span>
              <p className="mt-3 text-xl font-bold text-white leading-snug">
                {dna.idea?.targetAudience?.primary || 'Forward-thinking founders and builders'}
              </p>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                High-intent users looking for immediate strategic clarity, rapid iteration, and cohesive launch systems.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-slate-300">
                Secondary Audience
              </span>
              <p className="mt-3 text-xl font-bold text-white leading-snug">
                {dna.idea?.targetAudience?.secondary || 'Creators, Growth Teams and Agencies'}
              </p>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Expanding market seeking scalable brand workflows without traditional agency overhead.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 text-xs text-slate-400 flex justify-between">
            <span>Market Opportunity: {dna.idea?.opportunity || 'Significant whitespace in early brand formation'}</span>
            <span>Slide 03 / 10</span>
          </div>
        </div>
      ),
    },

    // Slide 4: The Solution
    {
      title: 'The Innovation & Solution',
      icon: <Lightbulb className="size-6 text-amber-400" />,
      content: (
        <div className="flex h-full flex-col justify-between py-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">The Solution</span>
            <h2 className="mt-2 text-4xl font-black text-white sm:text-5xl" style={{ fontFamily: headingFont }}>
              How We Solve It
            </h2>
          </div>

          <div className="my-auto space-y-6">
            <div className="rounded-3xl border border-teal-500/40 bg-gradient-to-r from-teal-950/60 to-slate-900/80 p-8 shadow-xl">
              <span className="text-xs font-bold tracking-wider uppercase text-teal-400">Core Value Proposition</span>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-white leading-snug">
                {dna.positioning?.valueProposition || dna.messaging?.oneLinePitch}
              </p>
              <p className="mt-3 text-base text-slate-300 leading-relaxed">
                {dna.positioning?.statement || dna.brandKit?.brandSummary}
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 text-xs text-slate-400 flex justify-between">
            <span>System: Multi-stage reasoning + Persisted BrandDNA</span>
            <span>Slide 04 / 10</span>
          </div>
        </div>
      ),
    },

    // Slide 5: Brand Positioning & Strategy
    {
      title: 'Brand Positioning & Moat',
      icon: <Crosshair className="size-6 text-emerald-400" />,
      content: (
        <div className="flex h-full flex-col justify-between py-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Strategy</span>
            <h2 className="mt-2 text-4xl font-black text-white sm:text-5xl" style={{ fontFamily: headingFont }}>
              Our Strategic Differentiator
            </h2>
          </div>

          <div className="my-auto grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <span className="text-xs font-bold uppercase text-slate-400">Category Definition</span>
              <p className="mt-1 text-xl font-bold text-teal-300">
                {dna.positioning?.category}
              </p>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Positioned explicitly to capture modern demand while challenging legacy paradigms.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6">
              <span className="text-xs font-bold uppercase text-emerald-400">Unfair Advantage</span>
              <p className="mt-1 text-xl font-bold text-white">
                {dna.positioning?.differentiator || dna.positioning?.competitiveAngle}
              </p>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                {dna.positioning?.rationale || 'Built upon evidence-based strategy and continuous critique.'}
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 text-xs text-slate-400 flex justify-between">
            <span>Angle: {dna.positioning?.competitiveAngle || 'High Differentiation'}</span>
            <span>Slide 05 / 10</span>
          </div>
        </div>
      ),
    },

    // Slide 6: Personality & Tone
    {
      title: 'Brand Personality & Voice',
      icon: <Zap className="size-6 text-purple-400" />,
      content: (
        <div className="flex h-full flex-col justify-between py-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Voice & Archetype</span>
            <h2 className="mt-2 text-4xl font-black text-white sm:text-5xl" style={{ fontFamily: headingFont }}>
              How The Brand Speaks
            </h2>
          </div>

          <div className="my-auto space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {dna.personality?.traits.slice(0, 3).map((t, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <span className="text-xs font-bold text-purple-300 uppercase">Trait {idx + 1}</span>
                  <p className="mt-1 text-xl font-bold text-white">{t.name}</p>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">{t.reason}</p>
                </div>
              ))}
            </div>

            {dna.messaging?.principles && (
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <span className="text-xs font-bold text-slate-400 uppercase">Voice Principles:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {dna.messaging.principles.map((pr, idx) => (
                    <span key={idx} className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                      • {pr}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-4 text-xs text-slate-400 flex justify-between">
            <span>Tone: {dna.messaging?.tone || 'Authoritative yet approachable'}</span>
            <span>Slide 06 / 10</span>
          </div>
        </div>
      ),
    },

    // Slide 7: Visual Identity System
    {
      title: 'Visual Identity System',
      icon: <Palette className="size-6 text-pink-400" />,
      content: (
        <div className="flex h-full flex-col justify-between py-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-pink-400">Design System</span>
            <h2 className="mt-2 text-4xl font-black text-white sm:text-5xl" style={{ fontFamily: headingFont }}>
              Visual Aesthetic & Design Language
            </h2>
          </div>

          <div className="my-auto space-y-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Brand Palette</span>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {dna.visual?.colors.slice(0, 4).map((c, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                    <div className="h-10 w-full rounded-xl shadow-inner mb-2" style={{ backgroundColor: c.hex }} />
                    <p className="text-sm font-bold text-white truncate">{c.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{c.hex}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="text-xs font-bold text-slate-400 uppercase">Typography</span>
                <p className="mt-1 text-2xl font-bold text-white" style={{ fontFamily: headingFont }}>
                  {headingFont} (Heading)
                </p>
                <p className="text-sm text-slate-400">Paired with {dna.visual?.typography.body || 'Inter'} for body copy</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="text-xs font-bold text-slate-400 uppercase">Design Mood</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {dna.visual?.mood.map((m, idx) => (
                    <span key={idx} className="rounded-md bg-white/10 px-2.5 py-0.5 text-xs text-teal-200">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 text-xs text-slate-400 flex justify-between">
            <span>Visual Consistency: Guardian Passed</span>
            <span>Slide 07 / 10</span>
          </div>
        </div>
      ),
    },

    // Slide 8: Competitive Moat
    {
      title: 'Competitive Moat',
      icon: <Award className="size-6 text-teal-400" />,
      content: (
        <div className="flex h-full flex-col justify-between py-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Market Matrix</span>
            <h2 className="mt-2 text-4xl font-black text-white sm:text-5xl" style={{ fontFamily: headingFont }}>
              Why We Win
            </h2>
          </div>

          <div className="my-auto grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-base font-bold text-red-300">vs Legacy Tools</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Legacy tools take months and cost tens of thousands. We deliver coherent strategic branding in 10 minutes.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-base font-bold text-amber-300">vs Random AI Prompts</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Generic LLMs hallucinate generic slogans. Our 5-stage architecture critiques and refines before building the kit.
              </p>
            </div>

            <div className="rounded-2xl border border-teal-500/40 bg-teal-950/40 p-6">
              <h3 className="text-base font-bold text-teal-300">Our Moat</h3>
              <p className="mt-2 text-sm text-white font-medium leading-relaxed">
                One persisted BrandDNA source of truth, automated consistency guardian, and launch-ready export assets.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 text-xs text-slate-400 flex justify-between">
            <span>Advantage: Strategic reasoning over generation</span>
            <span>Slide 08 / 10</span>
          </div>
        </div>
      ),
    },

    // Slide 9: Go-To-Market
    {
      title: 'Go-To-Market & Launch Plan',
      icon: <Megaphone className="size-6 text-cyan-400" />,
      content: (
        <div className="flex h-full flex-col justify-between py-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Traction Engine</span>
            <h2 className="mt-2 text-4xl font-black text-white sm:text-5xl" style={{ fontFamily: headingFont }}>
              Launch & Distribution Hook
            </h2>
          </div>

          <div className="my-auto space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <span className="text-xs font-bold uppercase text-cyan-300">Launch Headline</span>
              <p className="mt-1 text-2xl font-bold text-white">
                {dna.brandKit?.launchHeadline || tagline}
              </p>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                {dna.brandKit?.launchDescription || dna.messaging?.shortDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <span className="text-xs font-bold uppercase text-slate-400">Viral Call-to-Action</span>
                <p className="mt-1 text-lg font-bold text-teal-300">{dna.brandKit?.cta || 'Start building free'}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <span className="text-xs font-bold uppercase text-slate-400">Distribution Channels</span>
                <p className="mt-1 text-sm font-semibold text-white">Product Hunt · Twitter/X Build in Public · Founder Communities</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 text-xs text-slate-400 flex justify-between">
            <span>First Target: 1,000 active brand workspaces</span>
            <span>Slide 09 / 10</span>
          </div>
        </div>
      ),
    },

    // Slide 10: The Ask / Vision
    {
      title: 'The Ask & Closing Vision',
      icon: <TrendingUp className="size-6 text-emerald-400" />,
      content: (
        <div className="flex h-full flex-col justify-between py-6 text-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">The Next Frontier</span>
            <h2 className="mt-2 text-4xl font-black text-white sm:text-5xl" style={{ fontFamily: headingFont }}>
              Join the Journey with {brandName}
            </h2>
          </div>

          <div className="my-auto max-w-xl mx-auto space-y-6">
            <div
              className="inline-flex size-20 items-center justify-center rounded-3xl text-4xl font-black text-white shadow-lift ring-4 ring-white/10"
              style={{ backgroundColor: primaryColor }}
            >
              {brandName[0]}
            </div>

            <p className="text-2xl font-bold text-white">
              "{tagline}"
            </p>

            <p className="text-base text-slate-300 leading-relaxed">
              We are turning rough startup concepts into launch-ready brand systems in minutes.
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-6 py-3 text-base font-extrabold text-white shadow-lift hover:bg-teal-400 transition-colors">
                {dna.brandKit?.cta || 'Launch Your Brand'} →
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 text-xs text-slate-400 flex justify-between">
            <span>IdeaForge Hackathon Edition · {new Date().getFullYear()}</span>
            <span>Slide 10 / 10</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={`min-h-screen bg-slate-950 text-white flex flex-col ${isFullscreen ? 'p-0' : ''}`}>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 backdrop-blur print:hidden">
        <div className="flex items-center gap-3">
          <Link
            to={`/workspace/${projectId}/brand-kit`}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="size-4" /> Workspace
          </Link>
          <span className="h-4 w-px bg-white/20" />
          <span className="text-sm font-bold text-white truncate max-w-xs">{brandName} — Pitch Deck</span>
        </div>

        {/* Slide Counter & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1 text-xs font-mono text-slate-300">
            <span>Slide</span>
            <span className="font-bold text-white">{currentSlide + 1}</span>
            <span>/ {totalSlides}</span>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/20 transition-colors"
            title="Save as PDF / Print Slides"
          >
            <Printer className="size-4" /> Print / PDF
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-sm"
          >
            {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Present'}
          </button>
        </div>
      </header>

      {/* Main Slide Stage */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div
          className={`relative aspect-[16/9] w-full max-w-6xl rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-12 shadow-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 ${
            isFullscreen ? 'max-w-none h-full rounded-none border-none p-12' : ''
          }`}
          style={{
            backgroundImage: `radial-gradient(circle at 10% 10%, ${primaryColor}22 0%, transparent 40%), radial-gradient(circle at 90% 90%, ${secondaryColor}15 0%, transparent 40%)`,
          }}
        >
          {slides[currentSlide].content}

          {/* Next/Prev Hover Arrows */}
          <div className="absolute inset-y-0 left-2 flex items-center print:hidden">
            <button
              type="button"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/25 disabled:opacity-0 transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-6" />
            </button>
          </div>

          <div className="absolute inset-y-0 right-2 flex items-center print:hidden">
            <button
              type="button"
              onClick={nextSlide}
              disabled={currentSlide === totalSlides - 1}
              className="rounded-full bg-white/10 p-2 text-white backdrop-blur hover:bg-white/25 disabled:opacity-0 transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Thumbnail Strip */}
      <footer className="border-t border-white/10 bg-slate-950 px-6 py-4 print:hidden">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4">
          {/* Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {slides.map((s, idx) => {
              const active = idx === currentSlide;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`group relative flex h-10 w-16 shrink-0 flex-col justify-between rounded-lg border p-1 text-left transition-all ${
                    active
                      ? 'border-teal-400 bg-teal-950/60 ring-2 ring-teal-400/50'
                      : 'border-white/15 bg-white/5 hover:border-white/40'
                  }`}
                >
                  <span className="text-[9px] font-bold text-slate-400">{idx + 1}</span>
                  <span className="text-[8px] font-medium text-slate-300 truncate w-full">
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Keyboard tip */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 shrink-0 font-medium">
            <span>Use <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-white">←</kbd> <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-white">→</kbd> or <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-white">Space</kbd></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
