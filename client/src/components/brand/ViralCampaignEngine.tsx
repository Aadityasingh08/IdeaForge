import { useState } from 'react';
import { Flame, Copy, Check, Video, Rocket, Smile, Sparkles } from 'lucide-react';
import type { BrandDNA } from '../../lib/types';
import { Card, Badge } from '../ui/primitives';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

export function ViralCampaignEngine({ dna }: { dna: BrandDNA }) {
  const brandName = dna.naming?.selectedName || dna.brandKit?.name || 'IdeaForge';
  const tagline = dna.messaging?.tagline || dna.brandKit?.tagline || 'Turn your idea into a brand';
  const category = dna.positioning?.category || 'Startup Intelligence';
  const differentiator = dna.positioning?.differentiator || 'Multi-stage AI strategy engine';
  const problem = dna.idea?.problem || 'Founders waste weeks trying to brand their startup without guidance';

  const [activeTab, setActiveTab] = useState<'hooks' | 'producthunt' | 'memes'>('hooks');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const toast = useToast();

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast('Copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const viralHooks = [
    {
      title: 'The Contrarian Pattern-Interrupt',
      format: 'Reels / TikTok (15-30s)',
      hook: `Stop paying $10,000 to branding agencies when the real problem is: "${problem}".`,
      body: `Here is the dirty secret: most agencies give you generic names and random color codes that don't differentiate you. Instead, we used ${brandName}'s ${differentiator} to run a 5-stage strategic critique on our idea. Look at what happened...`,
      cta: `Link in bio to test your idea in 10 minutes.`,
    },
    {
      title: 'The Behind-The-Scenes "Secret Tool"',
      format: 'Shorts / TikTok (30s)',
      hook: `I built a launch-ready brand with an investor pitch deck in literally 8 minutes.`,
      body: `Most people think branding is picking a font. But ${brandName} actually challenged my positioning, caught weak differentiation, and built our complete BrandDNA with a 2x2 competitive matrix.`,
      cta: `Try it free before your next hackathon or launch.`,
    },
    {
      title: 'The Relatable Founder Struggle',
      format: 'LinkedIn / X Story (45s)',
      hook: `Every founder has an idea, but 99% never launch because they don't look like a real brand.`,
      body: `We were stuck for weeks on naming and positioning. "${tagline}". When we ran ${brandName}, it separated what we assumed from what users actually need. Here is the exact playbook we used...`,
      cta: `Drop a comment and I'll send you our complete brand book.`,
    },
  ];

  const memes = [
    {
      setup: 'Hiring a traditional agency for $15,000:',
      punchline: 'Gets a PowerPoint with 3 stock photos after 6 weeks.',
      ourAlternative: `Using ${brandName}: Complete BrandDNA, 10-slide Pitch Deck, and SVG logos in 10 minutes.`,
    },
    {
      setup: 'Asking ChatGPT for a brand name:',
      punchline: '"SynergyCloud AI Solutions 360"',
      ourAlternative: `Using ${brandName}: Contextual naming territories based on real audience psychology.`,
    },
    {
      setup: 'Pitching to investors with no brand identity:',
      punchline: '"Trust me bro, the tech is cool."',
      ourAlternative: `Pitching with ${brandName}: Coherent 2x2 market radar, clear value prop, and print-ready brand book.`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="mint">
              <Flame className="mr-1 size-3 text-red-500" /> Viral Launch Engine
            </Badge>
            <span className="text-xs font-semibold text-muted">Growth Hacking & Distribution</span>
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-ink">
            Viral Hooks, Product Hunt Playbook & Brand Memes
          </h3>
          <p className="text-sm text-body">
            Battle-tested distribution collateral engineered to drive top-of-funnel viral attention for {brandName}.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('hooks')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'hooks' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
            }`}
          >
            <Video className="size-3.5" /> 3-Sec Hooks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('producthunt')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'producthunt' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
            }`}
          >
            <Rocket className="size-3.5" /> Product Hunt
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('memes')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'memes' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
            }`}
          >
            <Smile className="size-3.5" /> Brand Memes
          </button>
        </div>
      </div>

      {/* TAB 1: VIRAL REELS / TIKTOK HOOKS */}
      {activeTab === 'hooks' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {viralHooks.map((h, i) => (
            <Card key={i} className="flex flex-col justify-between p-6 shadow-soft hover:shadow-lift transition-all">
              <div>
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <span className="text-xs font-bold text-teal-700 uppercase">{h.format}</span>
                  <span className="text-[11px] font-semibold text-muted">Hook #{i + 1}</span>
                </div>

                <div className="mt-4 rounded-xl bg-red-50/80 p-3.5 border border-red-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                    ⚡ 3-Second Pattern Interrupt
                  </span>
                  <p className="mt-1 text-sm font-extrabold text-red-950">
                    "{h.hook}"
                  </p>
                </div>

                <div className="mt-4 space-y-2 text-xs leading-relaxed text-slate-700">
                  <p className="font-bold text-slate-900 uppercase text-[10px]">Video Script Body:</p>
                  <p className="rounded-lg bg-slate-50 p-3 border border-line">{h.body}</p>
                </div>

                <div className="mt-3 text-xs">
                  <span className="font-bold text-teal-800">CTA:</span>{' '}
                  <span className="italic text-slate-600 font-medium">{h.cta}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-line">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={() => handleCopy(`${h.hook}\n\n${h.body}\n\n${h.cta}`, i)}
                >
                  {copiedIndex === i ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  {copiedIndex === i ? 'Copied Script!' : 'Copy Video Script'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: PRODUCT HUNT LAUNCH PLAYBOOK */}
      {activeTab === 'producthunt' && (
        <Card className="p-8 shadow-soft">
          <div className="flex items-center justify-between border-b border-line pb-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl font-black shadow-md">
                P
              </div>
              <div>
                <h4 className="text-xl font-bold text-ink">{brandName} — Product Hunt Launch Kit</h4>
                <p className="text-xs text-muted">Ready-to-submit metadata for #1 Product of the Day.</p>
              </div>
            </div>

            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
              Launch Checklist
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Tagline (&lt; 60 characters)</span>
                <p className="mt-1 text-base font-bold text-ink bg-slate-50 p-3 rounded-xl border border-line">
                  {tagline.length > 58 ? tagline.substring(0, 55) + '...' : tagline}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Primary Category</span>
                <p className="mt-1 text-sm font-semibold text-ink bg-slate-50 p-2.5 rounded-xl border border-line">
                  {category} · Artificial Intelligence · Branding
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">First Maker Comment (The Launch Story)</span>
                <div className="mt-1 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-line leading-relaxed whitespace-pre-line font-mono">
                  {`👋 Hey Product Hunt! I'm Aditya, creator of ${brandName}.\n\n` +
                    `Most founders start with an idea, but spend weeks guessing brand names, palettes, and taglines with generic slot-machine AI.\n\n` +
                    `We built ${brandName} to act as an AI strategist: it understands, critiques, and compiles your complete BrandDNA + 10-slide Pitch Deck.\n\n` +
                    `Would love your honest feedback!`}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50/60 p-6 border border-orange-200">
                <span className="text-xs font-bold uppercase text-orange-800 flex items-center gap-1">
                  <Sparkles className="size-3.5 text-orange-600" /> Launch Day Growth Hacks
                </span>
                <ul className="mt-3 space-y-2.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">1.</span>
                    Launch at 12:01 AM PST to maximize the 24-hour voting window.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">2.</span>
                    Share your live Pitch Deck and Social cards directly on X/Twitter with the hashtag #buildinpublic.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">3.</span>
                    Reply to every single Product Hunt comment within 10 minutes to trigger algorithm boost.
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-md">
                <span className="text-xs font-bold uppercase text-teal-400">Offer to Early Adopters</span>
                <p className="mt-2 text-sm text-slate-200 leading-snug">
                  "Special Product Hunt launch discount: free export of complete Brand Kit + Investor Pitch Deck."
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: BRAND MEME GENERATOR */}
      {activeTab === 'memes' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {memes.map((m, i) => (
            <Card key={i} className="p-6 flex flex-col justify-between shadow-soft hover:shadow-lift transition-all">
              <div>
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-md">
                  Meme #{i + 1}
                </span>

                <div className="mt-4 rounded-xl bg-slate-100 p-4 border border-line">
                  <p className="text-xs font-bold text-slate-500 uppercase">The Struggle:</p>
                  <p className="text-sm font-bold text-ink mt-0.5">{m.setup}</p>
                  <p className="text-xs italic text-red-600 font-medium mt-1">"{m.punchline}"</p>
                </div>

                <div className="mt-4 rounded-xl bg-teal-50 p-4 border border-teal-200">
                  <p className="text-xs font-bold text-teal-800 uppercase">The {brandName} Way:</p>
                  <p className="text-xs font-bold text-teal-950 mt-1 leading-relaxed">{m.ourAlternative}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-line">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={() => handleCopy(`${m.setup}\n${m.punchline}\n\nvs\n\n${m.ourAlternative}`, 10 + i)}
                >
                  {copiedIndex === 10 + i ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  {copiedIndex === 10 + i ? 'Copied Meme Text!' : 'Copy Meme Format'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
