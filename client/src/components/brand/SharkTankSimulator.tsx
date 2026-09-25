import { useState, useEffect } from 'react';
import { DollarSign, Flame, Play, RotateCcw, CheckCircle2, HelpCircle } from 'lucide-react';
import type { BrandDNA } from '../../lib/types';
import { Card, Badge } from '../ui/primitives';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

interface Shark {
  id: string;
  name: string;
  moniker: string;
  avatar: string;
  bio: string;
  status: 'listening' | 'deliberating' | 'in' | 'out';
  offer?: { amount: string; equity: string; condition: string };
  critique: string;
  diligenceQuestion: string;
}

export function SharkTankSimulator({ dna }: { dna: BrandDNA }) {
  const brandName = dna.naming?.selectedName || dna.brandKit?.name || 'IdeaForge';
  const tagline = dna.messaging?.tagline || dna.brandKit?.tagline || 'Turn your idea into a brand';
  const valueProp = dna.positioning?.valueProposition || 'Category defining platform';
  const category = dna.positioning?.category || 'Innovation Workspace';
  const toast = useToast();

  const [pitchTime, setPitchTime] = useState(60);
  const [pitching, setPitching] = useState(false);
  const [pitched, setPitched] = useState(false);
  const [deliberating, setDeliberating] = useState(false);

  const initialSharks: Shark[] = [
    {
      id: 'kevin',
      name: 'Mr. Royalty (The Financer)',
      moniker: 'Margin & Cash-Flow Hawk',
      avatar: '🧐',
      bio: 'Looks for 80%+ software margins, recurring subscription revenue, and immediate monetization.',
      status: 'listening',
      offer: {
        amount: '$150,000',
        equity: '8% Equity',
        condition: '+ $2 royalty per generated brand until $300k is recouped.',
      },
      critique: `Your positioning in ${category} has insane gross margins. If customer acquisition cost stays low, this is a literal cash machine.`,
      diligenceQuestion: 'What is your estimated customer acquisition cost on social, and how long does a subscriber stay active?',
    },
    {
      id: 'sara',
      name: 'Sara Brand (The Cult-Builder)',
      moniker: 'Consumer Brand & Viral Guru',
      avatar: '✨',
      bio: 'Obsessed with brand aesthetic, emotional resonance, organic word-of-mouth, and community retention.',
      status: 'listening',
      offer: {
        amount: '$250,000',
        equity: '12% Equity',
        condition: 'Includes direct advisory on influencer partnerships & Product Hunt #1 campaign.',
      },
      critique: `I love the tagline "${tagline}". The visual identity feels so fresh and premium. People will proudly post this on Twitter and LinkedIn.`,
      diligenceQuestion: 'How do you turn your initial 1,000 early adopters into evangelists who invite their entire network?',
    },
    {
      id: 'mark',
      name: 'Mark Scale (The Tech Titan)',
      moniker: 'AI Moat & Enterprise Bull',
      avatar: '🚀',
      bio: 'Invests in unfair technological moats, multi-stage proprietary engines, and exponential scalability.',
      status: 'listening',
      offer: {
        amount: '$500,000',
        equity: '15% Equity',
        condition: 'Full round backing to expand into enterprise agency brand systems.',
      },
      critique: `The 5-stage Challenge Engine and persisted BrandDNA is your real moat. Generic single-prompt tools cannot touch this level of coherence.`,
      diligenceQuestion: 'Can large agencies white-label your BrandDNA intelligence engine for their own enterprise clients?',
    },
  ];

  const [sharks, setSharks] = useState<Shark[]>(initialSharks);

  // Countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (pitching && pitchTime > 0) {
      interval = setInterval(() => setPitchTime((t) => t - 1), 1000);
    } else if (pitchTime === 0 && pitching) {
      setPitching(false);
      concludePitch();
    }
    return () => clearInterval(interval);
  }, [pitching, pitchTime]);

  const startPitch = () => {
    setPitchTime(60);
    setPitching(true);
    setPitched(false);
    setDeliberating(false);
    setSharks(initialSharks.map((s) => ({ ...s, status: 'listening' })));
    toast('60-second elevator pitch started! Present your brand.');
  };

  const concludePitch = () => {
    setPitching(false);
    setDeliberating(true);
    toast('Pitch complete! The investors are evaluating your brand...');

    setTimeout(() => {
      setSharks((prev) =>
        prev.map((s) => ({
          ...s,
          status: 'in',
        }))
      );
      setDeliberating(false);
      setPitched(true);
      toast('Shark Tank Decision Ready: Offers on the table!');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="mint">
              <Flame className="mr-1 size-3 text-amber-500" /> Shark Tank VC Simulator
            </Badge>
            <span className="text-xs font-semibold text-muted">Investor Pitch & Valuation Room</span>
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-ink">
            Pitch {brandName} to Virtual Venture Capitalists
          </h3>
          <p className="text-sm text-body">
            Test your brand's investability score, receive term sheet offers, and prepare for tough boardroom diligence.
          </p>
        </div>

        {/* 60s Pitch Drill Controller */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white shadow-sm font-mono">
            <span className="text-xs text-slate-400">PITCH CLOCK:</span>
            <span className={`text-base font-bold ${pitchTime <= 10 && pitching ? 'text-red-400 animate-ping' : 'text-teal-400'}`}>
              00:{pitchTime < 10 ? `0${pitchTime}` : pitchTime}
            </span>
          </div>

          {!pitching && !pitched && (
            <Button variant="primary" onClick={startPitch}>
              <Play className="size-4" /> Start 60s Pitch
            </Button>
          )}

          {pitching && (
            <Button variant="danger" onClick={concludePitch}>
              End & Deliberate
            </Button>
          )}

          {pitched && (
            <Button variant="ghost" onClick={startPitch}>
              <RotateCcw className="size-4" /> Re-pitch
            </Button>
          )}
        </div>
      </div>

      {/* Valuation & Investability Scorecard (Visible when pitched) */}
      {pitched && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Implied Pre-Money Valuation
            </span>
            <p className="mt-1 text-3xl font-black text-emerald-950">$3,200,000</p>
            <p className="mt-1 text-xs text-emerald-800">
              Based on software gross margin + category differentiation score.
            </p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-200">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
              Investability Index
            </span>
            <p className="mt-1 text-3xl font-black text-blue-950">92 / 100</p>
            <p className="mt-1 text-xs text-blue-800">
              Top 3% percentile in brand coherence and value proposition clarity.
            </p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-purple-50 to-pink-50/50 border-purple-200">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
              Total Offers On Table
            </span>
            <p className="mt-1 text-3xl font-black text-purple-950">3 Offers ($900K)</p>
            <p className="mt-1 text-xs text-purple-800">
              Competitive syndicated round available.
            </p>
          </Card>
        </div>
      )}

      {/* The 3 Investors Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {sharks.map((shark) => {
          const hasOffer = pitched && shark.status === 'in' && shark.offer;

          return (
            <Card
              key={shark.id}
              className={`flex flex-col justify-between p-6 transition-all duration-300 shadow-soft ${
                hasOffer ? 'border-teal-500/50 ring-1 ring-teal-500/20' : 'border-line'
              }`}
            >
              <div>
                {/* Shark Profile Header */}
                <div className="flex items-start gap-3 border-b border-line pb-4">
                  <span className="text-4xl">{shark.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-ink truncate">{shark.name}</h4>
                    </div>
                    <p className="text-xs font-semibold text-teal-700">{shark.moniker}</p>
                    <p className="mt-1 text-[11px] text-muted line-clamp-2">{shark.bio}</p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted">Investor Status:</span>
                  {deliberating && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 animate-pulse">
                      Evaluating BrandDNA...
                    </span>
                  )}
                  {!deliberating && !pitched && (
                    <span className="text-xs text-slate-500 font-medium">Ready for Pitch</span>
                  )}
                  {hasOffer && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="size-3 text-emerald-600" /> I'M IN (Made Offer)
                    </span>
                  )}
                </div>

                {/* Term Sheet Offer (When pitched) */}
                {hasOffer && (
                  <div className="mt-4 rounded-2xl bg-gradient-to-br from-slate-900 to-ink p-4 text-white shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                        Term Sheet Offer
                      </span>
                      <DollarSign className="size-4 text-teal-400" />
                    </div>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">{shark.offer?.amount}</span>
                      <span className="text-sm font-semibold text-teal-300">for {shark.offer?.equity}</span>
                    </div>

                    <p className="mt-1.5 text-[11px] text-slate-300 leading-snug">
                      {shark.offer?.condition}
                    </p>
                  </div>
                )}

                {/* VC Critique */}
                <div className="mt-4 rounded-xl bg-slate-50 p-3.5 border border-line text-xs leading-relaxed text-ink">
                  <p className="font-bold text-slate-700 mb-1">Investor Take:</p>
                  <p className="italic text-slate-600">
                    "{pitched ? shark.critique : `Show me why ${brandName} solves ${valueProp} better than incumbents.`}"
                  </p>
                </div>

                {/* Diligence Question */}
                {pitched && (
                  <div className="mt-3 rounded-xl bg-amber-50/70 p-3.5 border border-amber-200/60 text-xs leading-relaxed">
                    <p className="font-bold text-amber-900 mb-1 flex items-center gap-1">
                      <HelpCircle className="size-3 text-amber-600" /> Boardroom Diligence Question:
                    </p>
                    <p className="text-amber-800 font-medium">
                      "{shark.diligenceQuestion}"
                    </p>
                  </div>
                )}
              </div>

              {/* Offer Actions */}
              {hasOffer && (
                <div className="mt-5 pt-4 border-t border-line flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 justify-center"
                    onClick={() => toast(`Deal Accepted with ${shark.name}! 🎉`)}
                  >
                    Accept Offer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 justify-center text-xs"
                    onClick={() => toast(`Counter-offer submitted to ${shark.name}!`)}
                  >
                    Counter 8%
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
