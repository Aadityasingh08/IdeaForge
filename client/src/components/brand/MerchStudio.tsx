import { useState } from 'react';
import { Package, Sun, Moon, Coffee, Shirt, Lightbulb, Image } from 'lucide-react';
import type { BrandDNA } from '../../lib/types';
import { Card, Badge } from '../ui/primitives';

export function MerchStudio({ dna }: { dna: BrandDNA }) {
  const brandName = dna.naming?.selectedName || dna.brandKit?.name || 'IdeaForge';
  const tagline = dna.messaging?.tagline || dna.brandKit?.tagline || 'Turn your idea into a brand';
  const headingFont = dna.visual?.typography.heading || 'Inter';
  const primaryColor = dna.visual?.colors[0]?.hex || '#0f766e';
  const secondaryColor = dna.visual?.colors[1]?.hex || '#06b6d4';

  const [activeItem, setActiveItem] = useState<'mug' | 'hoodie' | 'neon' | 'billboard'>('mug');
  const [isNightMode, setIsNightMode] = useState(true);
  const [hoodieColor, setHoodieColor] = useState<'black' | 'cream' | 'brand'>('black');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="mint">
              <Package className="mr-1 size-3" /> Merch & 3D Packaging Studio
            </Badge>
            <span className="text-xs font-semibold text-muted">Physical World Brand Mockups</span>
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-ink">
            See {brandName} in the Real World
          </h3>
          <p className="text-sm text-body">
            High-fidelity realistic previews: ceramic coffee mugs, streetwear hoodies, glowing neon signs, and urban billboards.
          </p>
        </div>

        {/* Studio Controls */}
        <div className="flex items-center gap-2">
          {/* Day/Night Lighting Toggle */}
          <button
            type="button"
            onClick={() => setIsNightMode(!isNightMode)}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-xs hover:bg-slate-50 transition-colors"
          >
            {isNightMode ? <Moon className="size-3.5 text-indigo-500" /> : <Sun className="size-3.5 text-amber-500" />}
            <span>{isNightMode ? 'Night Studio' : 'Day Studio'}</span>
          </button>

          {/* Item Selector Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveItem('mug')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                activeItem === 'mug' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
              }`}
            >
              <Coffee className="size-3" /> Mug
            </button>
            <button
              type="button"
              onClick={() => setActiveItem('hoodie')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                activeItem === 'hoodie' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
              }`}
            >
              <Shirt className="size-3" /> Hoodie
            </button>
            <button
              type="button"
              onClick={() => setActiveItem('neon')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                activeItem === 'neon' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
              }`}
            >
              <Lightbulb className="size-3" /> Neon Sign
            </button>
            <button
              type="button"
              onClick={() => setActiveItem('billboard')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                activeItem === 'billboard' ? 'bg-white text-ink shadow-xs' : 'text-slate-600 hover:text-ink'
              }`}
            >
              <Image className="size-3" /> Billboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Showcase Stage */}
      <Card
        className={`relative overflow-hidden p-8 sm:p-12 transition-all duration-500 border ${
          isNightMode ? 'bg-slate-950 border-slate-800' : 'bg-gradient-to-br from-slate-100 via-white to-slate-200 border-line'
        }`}
      >
        <div className="mx-auto flex min-h-[380px] max-w-2xl items-center justify-center">
          {/* ITEM 1: CERAMIC COFFEE MUG */}
          {activeItem === 'mug' && (
            <div className="relative flex flex-col items-center animate-scale-in">
              {/* Mug Body */}
              <div className="relative flex items-center">
                {/* Ceramic Mug Cylinder */}
                <div
                  className="relative h-64 w-48 rounded-b-3xl border-t-8 border-slate-300 shadow-2xl flex flex-col items-center justify-center p-4 overflow-hidden"
                  style={{
                    background: `linear-gradient(90deg, #1e293b 0%, #334155 35%, #0f172a 75%, #020617 100%)`,
                  }}
                >
                  {/* Ceramic Gloss Highlight */}
                  <div className="absolute inset-y-0 left-6 w-5 bg-gradient-to-r from-white/20 to-transparent blur-xs pointer-events-none" />

                  {/* Brand Monogram & Name */}
                  <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                    <div
                      className="size-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lift ring-2 ring-white/20"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {brandName[0]}
                    </div>
                    <p
                      className="text-lg font-black tracking-tight text-white"
                      style={{ fontFamily: headingFont }}
                    >
                      {brandName}
                    </p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-300 max-w-[120px] truncate">
                      {tagline}
                    </p>
                  </div>
                </div>

                {/* Mug Handle */}
                <div className="relative -ml-2 h-36 w-16 rounded-r-3xl border-8 border-l-0 border-slate-700 shadow-lg" />
              </div>

              {/* Mug Shadow Grounding */}
              <div className="mt-2 h-4 w-56 rounded-full bg-black/40 blur-md" />
              <span className={`mt-4 text-xs font-semibold ${isNightMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Matte Black Ceramic Tumbler · 350ml
              </span>
            </div>
          )}

          {/* ITEM 2: MINIMALIST HOODIE */}
          {activeItem === 'hoodie' && (
            <div className="relative flex flex-col items-center animate-scale-in w-full max-w-md">
              {/* Hoodie Color Picker Chips */}
              <div className="mb-4 flex items-center gap-2">
                <span className={`text-xs font-medium ${isNightMode ? 'text-slate-400' : 'text-slate-600'}`}>Fabric:</span>
                <button
                  type="button"
                  onClick={() => setHoodieColor('black')}
                  className={`size-6 rounded-full border-2 bg-slate-900 ${hoodieColor === 'black' ? 'ring-2 ring-teal-400' : 'border-line'}`}
                  title="Onyx Black"
                />
                <button
                  type="button"
                  onClick={() => setHoodieColor('cream')}
                  className={`size-6 rounded-full border-2 bg-stone-100 ${hoodieColor === 'cream' ? 'ring-2 ring-teal-400' : 'border-line'}`}
                  title="Natural Cream"
                />
                <button
                  type="button"
                  onClick={() => setHoodieColor('brand')}
                  className={`size-6 rounded-full border-2 ${hoodieColor === 'brand' ? 'ring-2 ring-teal-400' : 'border-line'}`}
                  style={{ backgroundColor: primaryColor }}
                  title="Brand Primary"
                />
              </div>

              {/* Minimalist Hoodie Visual Representation */}
              <div
                className="relative h-72 w-80 rounded-t-3xl rounded-b-xl p-8 shadow-2xl flex flex-col justify-between overflow-hidden border border-white/10"
                style={{
                  backgroundColor:
                    hoodieColor === 'black' ? '#0f172a' : hoodieColor === 'cream' ? '#f5f5f4' : primaryColor,
                  color: hoodieColor === 'cream' ? '#1c1917' : '#ffffff',
                }}
              >
                {/* Hoodie Neckline & Drawstrings */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {/* Left Chest Embroidered Badge */}
                    <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur flex items-center gap-1.5 shadow-xs">
                      <span className="font-black text-sm">{brandName[0]}</span>
                      <span className="font-bold text-xs" style={{ fontFamily: headingFont }}>{brandName}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono tracking-wider opacity-60">HEAVYWEIGHT 450GSM</span>
                </div>

                {/* Kangaroo Pocket Silhouette */}
                <div className="relative mt-auto border-t border-white/15 pt-4 flex items-center justify-between opacity-80">
                  <span className="text-[11px] font-semibold italic">"{tagline}"</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">EST. {new Date().getFullYear()}</span>
                </div>
              </div>

              <span className={`mt-4 text-xs font-semibold ${isNightMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Embroidered Left-Chest Minimalist Streetwear Hoodie
              </span>
            </div>
          )}

          {/* ITEM 3: GLOWING NEON SIGN */}
          {activeItem === 'neon' && (
            <div className="relative flex flex-col items-center animate-scale-in w-full text-center py-6">
              {/* Dark Brick Texture Simulation */}
              <div className="relative rounded-3xl p-10 border border-slate-800 bg-slate-950/90 shadow-2xl flex flex-col items-center justify-center space-y-4 max-w-lg w-full">
                <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

                {/* Neon Glowing Typography */}
                <div className="relative z-10 space-y-2">
                  <h3
                    className="text-5xl sm:text-6xl font-black tracking-tight"
                    style={{
                      fontFamily: headingFont,
                      color: '#ffffff',
                      textShadow: `0 0 5px #fff, 0 0 10px #fff, 0 0 20px ${primaryColor}, 0 0 35px ${primaryColor}, 0 0 55px ${primaryColor}`,
                    }}
                  >
                    {brandName}
                  </h3>

                  <p
                    className="text-sm sm:text-base font-bold uppercase tracking-widest pt-2"
                    style={{
                      color: secondaryColor,
                      textShadow: `0 0 4px ${secondaryColor}, 0 0 15px ${secondaryColor}`,
                    }}
                  >
                    {tagline}
                  </p>
                </div>

                {/* Neon Glow Reflection */}
                <div
                  className="size-48 rounded-full blur-3xl opacity-30 pointer-events-none absolute"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>

              <span className="mt-4 text-xs font-semibold text-slate-400">
                Custom Glass Tube Handcrafted Neon Sign (Wall Mounted)
              </span>
            </div>
          )}

          {/* ITEM 4: URBAN BILLBOARD */}
          {activeItem === 'billboard' && (
            <div className="relative flex flex-col items-center animate-scale-in w-full max-w-lg">
              {/* Billboard Outer Structure */}
              <div className="relative w-full rounded-2xl border-4 border-slate-700 bg-slate-800 p-2 shadow-2xl">
                {/* Billboard Display Surface */}
                <div
                  className="aspect-[2.2/1] w-full rounded-lg p-6 text-white flex flex-col justify-between overflow-hidden relative"
                  style={{
                    background: `linear-gradient(135deg, #090d16 0%, ${primaryColor}dd 100%)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="size-6 rounded-md bg-white text-ink flex items-center justify-center font-black text-xs">
                        {brandName[0]}
                      </div>
                      <span className="text-sm font-bold" style={{ fontFamily: headingFont }}>{brandName}</span>
                    </div>
                    <span className="rounded-full bg-white/20 backdrop-blur px-2.5 py-0.5 text-[10px] font-bold uppercase">
                      NOW LAUNCHING
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xl sm:text-2xl font-black leading-tight text-white" style={{ fontFamily: headingFont }}>
                      {dna.brandKit?.launchHeadline || tagline}
                    </p>
                    <p className="text-xs text-slate-200 line-clamp-1">
                      {dna.positioning?.valueProposition || 'Build your next brand in 10 minutes.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold pt-1 border-t border-white/20">
                    <span>{dna.brandKit?.cta || 'Start building free'} →</span>
                    <span className="font-mono text-slate-300">ideaforge.ai/{brandName.toLowerCase().replace(/\s+/g, '')}</span>
                  </div>
                </div>
              </div>

              {/* Billboard Pole Mount */}
              <div className="h-8 w-4 bg-slate-700 shadow-md" />
              <span className={`mt-2 text-xs font-semibold ${isNightMode ? 'text-slate-400' : 'text-slate-600'}`}>
                14x48ft Highway Digital Billboard Mockup
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
