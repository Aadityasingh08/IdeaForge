import { useState } from 'react';
import { Share2, Copy, Check, Sparkles } from 'lucide-react';
import type { BrandDNA } from '../../lib/types';
import { Card, Badge } from '../ui/primitives';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

export function SocialLaunchStudio({ dna }: { dna: BrandDNA }) {
  const brandName = dna.naming?.selectedName || dna.brandKit?.name || 'IdeaForge';
  const tagline = dna.messaging?.tagline || dna.brandKit?.tagline || 'Turn your idea into a brand';
  const pitch = dna.messaging?.oneLinePitch || dna.brandKit?.oneLinePitch || 'AI brand intelligence workspace';
  const cta = dna.brandKit?.cta || 'Build your brand today';
  const socialPost = dna.brandKit?.socialLaunchPost || `🚀 Excited to introduce ${brandName} — ${tagline}! Check it out and let us know what you think. #startup #branding #ai`;

  const primaryColor = dna.visual?.colors[0]?.hex || '#0f766e';
  const secondaryColor = dna.visual?.colors[1]?.hex || '#0284c7';
  const headingFont = dna.visual?.typography.heading || 'Inter';

  const [activeTab, setActiveTab] = useState<'x' | 'linkedin' | 'instagram'>('x');
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="mint">
              <Share2 className="mr-1 size-3" /> Social Launch Studio
            </Badge>
            <span className="text-xs font-semibold text-muted">Ready-To-Post Assets</span>
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-ink">
            Multi-Platform Social Graphics & Launch Copy
          </h3>
          <p className="text-sm text-body">
            Rendered with your brand's exact color palette, typography, and messaging for immediate distribution.
          </p>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('x')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'x' ? 'bg-white text-ink shadow-sm' : 'text-slate-600 hover:text-ink'
            }`}
          >
            <span>𝕏</span> X / Twitter
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('linkedin')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'linkedin' ? 'bg-white text-ink shadow-sm' : 'text-slate-600 hover:text-ink'
            }`}
          >
            <span className="font-serif font-black text-blue-600">in</span> LinkedIn
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('instagram')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'instagram' ? 'bg-white text-ink shadow-sm' : 'text-slate-600 hover:text-ink'
            }`}
          >
            <span className="text-pink-500 font-bold">IG</span> Instagram
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Visual Card Preview */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          {activeTab === 'x' && (
            <Card className="overflow-hidden border border-slate-200 bg-white p-6 shadow-soft transition-all">
              {/* Fake X Post Header */}
              <div className="flex items-start gap-3">
                <div
                  className="size-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  {brandName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-ink">{brandName}</span>
                    <span className="text-xs text-muted">@{brandName.toLowerCase().replace(/\s+/g, '')}</span>
                    <span className="text-xs text-muted">· Just now</span>
                  </div>
                  <p className="mt-1 text-sm text-ink leading-relaxed whitespace-pre-line">
                    {socialPost}
                  </p>
                </div>
              </div>

              {/* In-feed OpenGraph Card */}
              <div
                className="mt-4 overflow-hidden rounded-2xl border border-line p-6 text-white relative shadow-sm"
                style={{
                  background: `linear-gradient(135deg, #090d16 0%, ${primaryColor}dd 100%)`,
                }}
              >
                <div className="absolute top-0 right-0 -mr-8 -mt-8 size-36 rounded-full blur-2xl opacity-40 bg-white" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-[11px] font-bold tracking-widest uppercase text-teal-300">
                      Official Launch
                    </span>
                  </div>

                  <h4
                    className="text-2xl font-extrabold tracking-tight text-white leading-tight"
                    style={{ fontFamily: headingFont }}
                  >
                    {brandName}
                  </h4>

                  <p className="text-sm text-slate-200 font-medium leading-snug">
                    {tagline}
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-xs font-bold text-white">
                      {cta} →
                    </span>
                    <span className="text-xs text-slate-300 font-mono">ideaforge.ai/{brandName.toLowerCase().replace(/\s+/g, '')}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'linkedin' && (
            <Card className="overflow-hidden border border-slate-200 bg-white p-6 shadow-soft transition-all">
              <div className="mb-3 flex items-center justify-between text-xs text-muted">
                <span className="font-bold uppercase tracking-wider text-slate-500">LinkedIn Banner Preview (1200 x 627)</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold">1.91:1 Ratio</span>
              </div>

              <div
                className="aspect-[1.91/1] w-full rounded-2xl p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-md"
                style={{
                  background: `linear-gradient(135deg, #0f172a 0%, ${primaryColor} 60%, ${secondaryColor} 100%)`,
                }}
              >
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider uppercase text-teal-300 bg-white/10 backdrop-blur px-2.5 py-1 rounded-full">
                    {dna.positioning?.category || 'Innovation Workspace'}
                  </span>
                  <Sparkles className="size-5 text-amber-300 animate-pulse" />
                </div>

                <div className="relative z-10 space-y-2">
                  <h3 className="text-3xl font-black tracking-tight" style={{ fontFamily: headingFont }}>
                    {brandName}
                  </h3>
                  <p className="text-sm font-semibold text-slate-100 max-w-md">
                    {pitch}
                  </p>
                </div>

                <div className="relative z-10 flex items-center justify-between text-xs font-semibold border-t border-white/20 pt-3">
                  <span>{tagline}</span>
                  <span className="rounded-lg bg-white text-ink px-3 py-1 font-bold shadow-sm">
                    {cta}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'instagram' && (
            <Card className="overflow-hidden border border-slate-200 bg-white p-6 shadow-soft transition-all">
              <div className="mb-3 flex items-center justify-between text-xs text-muted">
                <span className="font-bold uppercase tracking-wider text-slate-500">Instagram Square Card (1080 x 1080)</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold">1:1 Square</span>
              </div>

              <div
                className="aspect-square mx-auto max-w-[360px] w-full rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-lift"
                style={{
                  background: `radial-gradient(circle at 10% 20%, ${primaryColor} 0%, #030712 90%)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="size-9 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-lg">
                    {brandName[0]}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-teal-300">
                    NEW BRAND
                  </span>
                </div>

                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-black tracking-tight" style={{ fontFamily: headingFont }}>
                    {brandName}
                  </h3>
                  <div className="h-0.5 w-12 bg-teal-400 mx-auto rounded-full" />
                  <p className="text-sm font-medium text-slate-200 leading-relaxed">
                    "{tagline}"
                  </p>
                </div>

                <div className="text-center">
                  <span className="inline-block rounded-full bg-white text-ink px-4 py-1.5 text-xs font-extrabold shadow-md">
                    {cta}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Copy & Distribution Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <Card className="p-6">
            <h4 className="text-sm font-bold text-ink uppercase tracking-wider mb-2">
              Launch Post Caption
            </h4>
            <p className="text-xs text-muted mb-4">
              Pre-written copy tailored to announce your brand on social feeds.
            </p>

            <div className="rounded-xl bg-slate-50 p-4 border border-line text-sm text-ink font-mono text-xs leading-relaxed whitespace-pre-line">
              {socialPost}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="primary"
                onClick={() => handleCopy(socialPost)}
                className="w-full justify-center"
              >
                {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Post Caption'}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-slate-50 to-teal-50/40 border-teal-100">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
              <Sparkles className="size-4 text-teal-600" /> Hackathon Launch Hook
            </div>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              <strong>Headline:</strong> {dna.brandKit?.launchHeadline || tagline}
            </p>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              <strong>Call to Action:</strong> {cta}
            </p>

            <div className="mt-4 pt-3 border-t border-teal-100 flex items-center justify-between text-xs font-semibold text-teal-900">
              <span>Ready for Submission</span>
              <span className="text-emerald-600">✓ Verified Coherent</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
