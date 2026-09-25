import { useState, useEffect } from 'react';
import { Play, Square, Mic, Radio } from 'lucide-react';
import type { BrandDNA } from '../../lib/types';
import { Card, Badge } from '../ui/primitives';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

export function AudioVoiceStudio({ dna }: { dna: BrandDNA }) {
  const brandName = dna.naming?.selectedName || dna.brandKit?.name || 'IdeaForge';
  const tagline = dna.messaging?.tagline || dna.brandKit?.tagline || 'Turn your idea into a brand';
  const pitch = dna.messaging?.oneLinePitch || dna.brandKit?.oneLinePitch || 'The AI brand intelligence workspace';
  const cta = dna.brandKit?.cta || 'Build your brand today at IdeaForge dot com';
  const tone = dna.messaging?.tone || 'Bold, visionary, and sharp';
  const toast = useToast();

  const [activeFormat, setActiveFormat] = useState<'15s' | '30s'>('30s');
  const [isPlaying, setIsPlaying] = useState(false);

  const scripts = {
    '15s': {
      label: '15-Second High-Impact Radio / Podcast Pre-Roll',
      soundEffects: '[Sound: Modern electronic synth whoosh starts, upbeat tempo]',
      voiceover: `Most startups don't have a brand, they just have an idea. Meet ${brandName}. ${tagline}. Turn your rough concept into an investor-ready brand kit in 10 minutes. ${cta}.`,
    },
    '30s': {
      label: '30-Second Narrative Story Commercial',
      soundEffects: '[Sound: Ambient keyboard typing, then bold cinematic crescendo]',
      voiceover: `Picture this: You have a game-changing product idea. But naming, positioning, and visual design take weeks of agonizing doubt. What if your brand had an AI strategist that challenges weak decisions and builds your entire brand system? That's ${brandName}. ${pitch}. ${cta}.`,
    },
  };

  const currentScript = scripts[activeFormat];

  // Stop speech if unmounting
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlayVoice = () => {
    if (!('speechSynthesis' in window)) {
      toast('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // clear previous
    const utterance = new SpeechSynthesisUtterance(currentScript.voiceover);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David'))
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    toast(`Playing ${activeFormat} audio ad with voiceover! 🎙️`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="mint">
              <Radio className="mr-1 size-3 text-cyan-600" /> Audio Ad & Voice Studio
            </Badge>
            <span className="text-xs font-semibold text-muted">Radio & Podcast Commercials</span>
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-ink">
            Listen to {brandName}'s Audio Brand Commercial
          </h3>
          <p className="text-sm text-body">
            Professional broadcast ad scripts with live browser voiceover audio synthesis.
          </p>
        </div>

        {/* Duration Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              if (isPlaying) window.speechSynthesis.cancel();
              setIsPlaying(false);
              setActiveFormat('15s');
            }}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              activeFormat === '15s' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
            }`}
          >
            15s Pre-Roll
          </button>
          <button
            type="button"
            onClick={() => {
              if (isPlaying) window.speechSynthesis.cancel();
              setIsPlaying(false);
              setActiveFormat('30s');
            }}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
              activeFormat === '30s' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
            }`}
          >
            30s Spot
          </button>
        </div>
      </div>

      <Card className="overflow-hidden border border-line shadow-soft p-8 bg-gradient-to-br from-slate-900 via-ink to-slate-950 text-white">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              {currentScript.label}
            </span>
            <h4 className="text-2xl font-black text-white">{brandName} Audio Commercial</h4>
            <p className="text-xs text-slate-300">
              Director's Tone Cue: <strong className="text-teal-200">{tone}</strong>
            </p>
          </div>

          {/* Audio Play Trigger */}
          <Button
            variant="primary"
            size="lg"
            onClick={handlePlayVoice}
            className="shrink-0 shadow-lift bg-teal-500 hover:bg-teal-400"
          >
            {isPlaying ? <Square className="size-4 fill-white" /> : <Play className="size-4 fill-white" />}
            {isPlaying ? 'Stop Audio' : 'Listen to Ad Voiceover'}
          </Button>
        </div>

        {/* Audio Visualizer Wave Effect */}
        {isPlaying && (
          <div className="my-6 flex items-center justify-center gap-1.5 py-4 bg-teal-950/40 rounded-2xl border border-teal-500/20">
            {[40, 75, 90, 55, 80, 100, 65, 85, 45, 95, 60, 30, 85, 50].map((h, i) => (
              <span
                key={i}
                className="w-1.5 bg-teal-400 rounded-full animate-bounce"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                }}
              />
            ))}
            <span className="ml-3 text-xs font-mono font-bold text-teal-300 animate-pulse">
              VOICEOVER STREAMING...
            </span>
          </div>
        )}

        {/* Script Teleprompter Box */}
        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-white/5 p-4 border border-white/10 text-xs text-amber-300 font-mono">
            {currentScript.soundEffects}
          </div>

          <div className="rounded-2xl bg-white/10 p-6 border border-white/15 text-base sm:text-lg leading-relaxed text-slate-100 font-medium">
            "{currentScript.voiceover}"
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Mic className="size-3.5 text-teal-400" /> Recorded for Spotify, Apple Podcasts & YouTube Audio
          </span>
          <span className="font-mono text-teal-300">Format: 192kbps Broadcast Stereo</span>
        </div>
      </Card>
    </div>
  );
}
