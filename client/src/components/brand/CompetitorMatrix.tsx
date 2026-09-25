import { useState } from 'react';
import { Crosshair, Shield, Swords, Sparkles, Zap } from 'lucide-react';
import type { BrandDNA } from '../../lib/types';
import { Card, Badge } from '../ui/primitives';

interface Competitor {
  name: string;
  tagline: string;
  quadrant: 'legacy' | 'niche' | 'complex' | 'leader';
  x: number; // 0 to 100
  y: number; // 0 to 100
  marketShare: string;
  weakness: string;
  ourAdvantage: string;
  attackVector: string;
}

export function CompetitorMatrix({ dna }: { dna: BrandDNA }) {
  const brandName = dna.naming?.selectedName || dna.brandKit?.name || 'Our Brand';
  const category = dna.positioning?.category || 'Category';
  const differentiator = dna.positioning?.differentiator || dna.positioning?.competitiveAngle || 'Unique strategic differentiation';
  const primaryColor = dna.visual?.colors[0]?.hex || '#0f766e';

  // Derive smart contextual competitors based on the category/problem
  const competitors: Competitor[] = [
    {
      name: 'Legacy Giants',
      tagline: 'Traditional, slow, bloated enterprise solutions',
      quadrant: 'legacy',
      x: 25,
      y: 35,
      marketShare: 'High but decaying',
      weakness: 'Expensive, outdated UX, 6-month onboarding, generic one-size-fits-all.',
      ourAdvantage: '10x faster execution, modern AI-native workflow, intuitive consumer-grade UI.',
      attackVector: 'Highlight speed, modern simplicity, and frictionless onboarding.',
    },
    {
      name: 'Niche Point-Tools',
      tagline: 'Single-feature utilities with no holistic brand ecosystem',
      quadrant: 'niche',
      x: 75,
      y: 28,
      marketShare: 'Fragmented',
      weakness: 'Solves only 1 piece of the puzzle, forces user to juggle 5 subscriptions.',
      ourAdvantage: 'End-to-end unified brand intelligence workspace with single source of truth.',
      attackVector: 'Position as the all-in-one replacement that eliminates tool fatigue.',
    },
    {
      name: 'Generic AI Generators',
      tagline: 'One-shot random text & logo slot machines',
      quadrant: 'complex',
      x: 35,
      y: 72,
      marketShare: 'Viral / Low retention',
      weakness: 'Hallucinates generic names, zero strategic reasoning, no brand consistency.',
      ourAdvantage: 'Multi-stage reasoning, Evidence-based Challenge Critic, persisted BrandDNA.',
      attackVector: 'Showcase that we are an AI Strategist, not a slot machine.',
    },
    {
      name: brandName,
      tagline: dna.messaging?.tagline || 'The next-generation category leader',
      quadrant: 'leader',
      x: 82,
      y: 84,
      marketShare: 'Breakout Challenger',
      weakness: 'New market entrant (mitigated by viral launch & superior value prop).',
      ourAdvantage: differentiator,
      attackVector: 'Category definition and brand-led unfair advantage.',
    },
  ];

  const [selected, setSelected] = useState<Competitor>(competitors[3]);
  const xAxis = { low: 'Fragmented Utility', high: 'Holistic Intelligence' };
  const yAxis = { low: 'Legacy / Generic', high: 'AI-Native & Strategic' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="mint">
              <Crosshair className="mr-1 size-3" /> Market Radar
            </Badge>
            <span className="text-xs font-semibold text-muted">2x2 Positioning Matrix</span>
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-ink">
            Competitive Landscape & Market Moat
          </h3>
          <p className="text-sm text-body">
            Visualizing where <strong>{brandName}</strong> captures high-value market whitespace against existing incumbents.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-muted">Focus:</span>
          <span className="rounded-lg bg-white px-2.5 py-1 font-semibold text-ink shadow-sm ring-1 ring-line">
            {category}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 2x2 Matrix Grid */}
        <div className="lg:col-span-7">
          <Card className="relative overflow-hidden p-6 sm:p-8">
            <div className="relative mx-auto aspect-square w-full max-w-[440px] rounded-2xl border border-line bg-gradient-to-br from-slate-50 via-white to-teal-50/30 p-8 shadow-inner">
              {/* Axes Labels */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[11px] font-bold tracking-wide text-ink/70 uppercase">
                ▲ {yAxis.high}
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-muted uppercase">
                ▼ {yAxis.low}
              </div>
              <div className="absolute top-1/2 right-2 -translate-y-1/2 text-right text-[11px] font-bold tracking-wide text-ink/70 uppercase">
                {xAxis.high} ▶
              </div>
              <div className="absolute top-1/2 left-2 -translate-y-1/2 text-[11px] font-semibold text-muted uppercase">
                ◀ {xAxis.low}
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-x-8 top-1/2 h-px -translate-y-1/2 bg-dashed border-t border-dashed border-slate-300" />
              <div className="absolute inset-y-8 left-1/2 w-px -translate-x-1/2 bg-dashed border-l border-dashed border-slate-300" />

              {/* Target Winning Quadrant Glow */}
              <div className="absolute top-8 right-8 bottom-1/2 left-1/2 rounded-tr-xl bg-teal-500/10 pointer-events-none border-t border-r border-teal-500/20" />
              <span className="absolute top-10 right-10 rounded-md bg-teal-600/10 px-2 py-0.5 text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                Winning Whitespace
              </span>

              {/* Competitor Nodes */}
              {competitors.map((comp) => {
                const isUs = comp.name === brandName;
                const isSelected = selected.name === comp.name;

                return (
                  <button
                    key={comp.name}
                    type="button"
                    onClick={() => setSelected(comp)}
                    style={{ left: `${comp.x}%`, top: `${100 - comp.y}%` }}
                    className={`group absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 focus:outline-none ${
                      isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10'
                    }`}
                  >
                    <div
                      className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-md transition-all ${
                        isUs
                          ? 'ring-2 ring-teal-500 text-white shadow-teal-500/25 ring-offset-2'
                          : isSelected
                          ? 'bg-ink text-white ring-2 ring-ink ring-offset-1'
                          : 'bg-white text-ink border border-line hover:border-ink/40'
                      }`}
                      style={isUs ? { backgroundColor: primaryColor } : undefined}
                    >
                      {isUs ? (
                        <Sparkles className="size-3.5 animate-pulse text-amber-300" />
                      ) : (
                        <span className="size-2 rounded-full bg-slate-400" />
                      )}
                      <span>{comp.name}</span>
                    </div>

                    {isUs && (
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-teal-700">
                        ★ You are here
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-center text-xs text-muted">
              Click any competitor node to inspect their Battlecard and Attack Vector.
            </p>
          </Card>
        </div>

        {/* Selected Competitor Battlecard */}
        <div className="lg:col-span-5 flex flex-col">
          <Card className="flex-1 p-6 transition-all border-teal-500/30 shadow-soft">
            <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
              <div>
                <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
                  {selected.name === brandName ? 'Our Brand Position' : 'Competitor Battlecard'}
                </span>
                <h4 className="text-xl font-bold text-ink mt-0.5">{selected.name}</h4>
                <p className="text-xs text-muted mt-0.5">{selected.tagline}</p>
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                {selected.marketShare}
              </span>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-xl bg-red-50/70 p-3.5 border border-red-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 uppercase">
                  <Shield className="size-3.5 text-red-500" /> Vulnerability & Pain Point
                </div>
                <p className="mt-1 text-xs leading-relaxed text-red-900 font-medium">
                  {selected.weakness}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase">
                  <Zap className="size-3.5 text-emerald-600" /> Our Unfair Advantage
                </div>
                <p className="mt-1 text-xs leading-relaxed text-emerald-950 font-semibold">
                  {selected.ourAdvantage}
                </p>
              </div>

              <div className="rounded-xl bg-slate-900 p-4 text-white shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400 uppercase">
                  <Swords className="size-3.5 text-teal-400" /> Winning Attack Vector
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
                  {selected.attackVector}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-line flex items-center justify-between text-xs text-muted">
              <span>Positioning Rationale:</span>
              <span className="font-semibold text-ink truncate max-w-[200px]">
                {dna.positioning?.competitiveAngle || 'High Value Differentiation'}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
