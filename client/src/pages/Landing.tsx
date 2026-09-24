import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Layers, Swords } from 'lucide-react';
import { Logo, Sparkle } from '../components/ui/Logo';
import { ButtonLink } from '../components/ui/Button';
import { useCreateProject } from '../components/NewIdea';

// Label centres (in %) around the crystal; anchored by centre so they never leave the frame.
const ORBIT = [
  { label: 'Understand', x: 24, y: 13 },
  { label: 'Strategize', x: 78, y: 12 },
  { label: 'Challenge', x: 84, y: 50 },
  { label: 'Create', x: 74, y: 88 },
  { label: 'Refine', x: 24, y: 87 },
  { label: 'Brand Kit', x: 15, y: 50 },
];

/** Abstract icy/mint faceted crystal sparkle — the hero visual. */
function Crystal() {
  const facets: [string, string][] = [
    ['M200 20 L232 168 L200 200 Z', 'url(#f1)'],
    ['M232 168 L380 200 L200 200 Z', 'url(#f2)'],
    ['M380 200 L232 232 L200 200 Z', 'url(#f3)'],
    ['M232 232 L200 380 L200 200 Z', 'url(#f2)'],
    ['M200 380 L168 232 L200 200 Z', 'url(#f4)'],
    ['M168 232 L20 200 L200 200 Z', 'url(#f1)'],
    ['M20 200 L168 168 L200 200 Z', 'url(#f3)'],
    ['M168 168 L200 20 L200 200 Z', 'url(#f4)'],
  ];
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full drop-shadow-[0_30px_60px_rgba(20,184,166,0.28)]" aria-hidden>
      <defs>
        <linearGradient id="f1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F0FDFA" />
          <stop offset="1" stopColor="#99F6E4" />
        </linearGradient>
        <linearGradient id="f2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5EEAD4" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>
        <linearGradient id="f3" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#CFFAFE" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id="f4" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14B8A6" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#22D3EE" stopOpacity=".45" />
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="190" fill="url(#glow)" />
      {facets.map(([d, fill]) => (
        <path key={d} d={d} fill={fill} stroke="#ffffff" strokeOpacity=".55" strokeWidth="1" />
      ))}
      <path d="M200 20 L232 168 L380 200 L232 232 L200 380 L168 232 L20 200 L168 168 Z" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="5" fill="#fff" />
      <g fill="#fff" opacity=".9">
        <path d="M318 76 l4 12 12 4 -12 4 -4 12 -4 -12 -12 -4 12 -4z" />
        <path d="M86 300 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" opacity=".7" />
      </g>
    </svg>
  );
}

const QUICK_STARTS = ['Hackathon teammates', 'Weeknight dinners', 'Freelance invoicing', 'Creator newsletter'];
const QUICK_IDEAS: Record<string, string> = {
  'Hackathon teammates': 'I want to build a platform that helps college students find teammates for hackathons.',
  'Weeknight dinners': 'An app that helps busy parents plan a week of healthy dinners in five minutes',
  'Freelance invoicing': 'A tool for freelancers to track invoices and get paid faster',
  'Creator newsletter': 'A newsletter that helps indie creators grow their first 1,000 subscribers',
};

function IdeaInput() {
  const [idea, setIdea] = useState('');
  const { create, creating, error, setError } = useCreateProject();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create(idea);
  };

  return (
    <form onSubmit={submit} noValidate className="w-full">
      <div
        className={`rounded-3xl border bg-white p-2 shadow-lift transition-shadow focus-within:shadow-glow ${error ? 'border-[#fecaca]' : 'border-line'}`}
      >
        <label htmlFor="idea" className="block px-4 pt-3 text-[13px] font-semibold text-ink">
          Tell us about your idea...
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="idea"
            rows={2}
            value={idea}
            maxLength={2000}
            onChange={(e) => {
              setIdea(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                create(idea);
              }
            }}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? 'idea-error' : 'idea-hint'}
            placeholder="e.g. An app that helps students find teammates for hackathons"
            className="min-h-[56px] flex-1 resize-none bg-transparent px-4 pb-3 pt-1.5 text-[16px] leading-relaxed text-ink placeholder:text-muted focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating}
            aria-label="Start building"
            className="mb-1.5 mr-1.5 grid size-12 shrink-0 place-items-center rounded-2xl bg-ink text-white shadow-soft transition-all hover:bg-mint-dark active:scale-95 disabled:opacity-70"
          >
            {creating ? <Sparkle className="size-5" animated /> : <ArrowRight className="size-5" />}
          </button>
        </div>
      </div>
      <p id={error ? 'idea-error' : 'idea-hint'} className={`mt-2.5 px-2 text-[13px] ${error ? 'font-medium text-danger' : 'text-muted'}`} role={error ? 'alert' : undefined}>
        {error ?? 'Press Enter to start — no sign-up needed.'}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
        <span className="text-xs font-medium text-muted">Try:</span>
        {QUICK_STARTS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              setIdea(QUICK_IDEAS[q]);
              setError(null);
              document.getElementById('idea')?.focus();
            }}
            className="rounded-full border border-line bg-white/80 px-3 py-1 text-xs font-semibold text-body transition-colors hover:border-mint hover:text-mint-dark"
          >
            {q}
          </button>
        ))}
      </div>
    </form>
  );
}

const FEATURES = [
  { icon: Brain, title: 'Strategic thinking', sub: 'not just generation' },
  { icon: Swords, title: 'AI challenges', sub: 'generic ideas' },
  { icon: Layers, title: 'Complete', sub: 'brand system' },
];

const STEPS = [
  { n: '01', t: 'Understand', d: 'AI unpacks the problem, audience, need and opportunity hidden in your rough idea.' },
  { n: '02', t: 'Strategy', d: 'Positioning, value proposition, personality, naming territories and messaging.' },
  { n: '03', t: 'Challenge', d: 'A critical reviewer stress-tests every decision for generic or weak thinking.' },
  { n: '04', t: 'Visual', d: 'Your strategy is translated into colour, typography, imagery and composition.' },
  { n: '05', t: 'Brand Kit', d: 'A consistency-checked, launch-ready brand system you can download.' },
];

const EXAMPLES = [
  'A platform that helps college students find teammates for hackathons',
  'An app that helps busy parents plan a week of dinners in five minutes',
  'A newsletter that helps indie creators grow their first 1,000 subscribers',
];

export default function Landing() {
  useEffect(() => {
    document.title = 'IdeaForge — Turn your idea into a brand';
  }, []);

  return (
    <div className="min-h-screen">
      <a href="#hero" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-transparent bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-8 text-sm font-medium text-body md:flex">
            <a href="#product" className="hover:text-ink">
              Product
            </a>
            <a href="#how" className="hover:text-ink">
              How it works
            </a>
            <a href="#examples" className="hover:text-ink">
              Examples
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/projects" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-body hover:text-ink sm:block">
              Your ideas
            </Link>
            <ButtonLink to="/projects" variant="primary" size="sm" iconRight={<ArrowRight className="size-3.5" />}>
              Get Started
            </ButtonLink>
          </div>
        </div>
      </header>

      <main>
        <section id="hero" className="relative overflow-hidden">
          <div className="hero-gradient absolute inset-x-0 top-0 h-[720px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]" aria-hidden />
          <div className="dot-grid absolute inset-x-0 top-0 h-[720px] opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" aria-hidden />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:pb-24">
            <div className="animate-slide-up">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#99f6e4] bg-white/70 px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-mint-dark">
                ✦ AI BRAND STRATEGIST
              </span>
              <h1 className="mt-6 text-[44px] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[64px] lg:text-[72px]">
                Turn your idea into a <span className="text-gradient">brand.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-body">
                From a rough idea to a launch-ready brand system.
                <br className="hidden sm:block" /> Guided by AI, refined with strategy.
              </p>

              <div className="mt-9 max-w-xl">
                <IdeaInput />
              </div>

              <ul className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3" id="product">
                {FEATURES.map(({ icon: Icon, title, sub }) => (
                  <li key={title} className="flex items-center gap-3 rounded-2xl bg-white/60 p-3 ring-1 ring-line/80">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-mint-50 text-mint-dark">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="text-[13px] leading-tight">
                      <span className="block font-semibold text-ink">{title}</span>
                      <span className="text-body">{sub}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[460px] animate-fade-in" aria-hidden>
              <div className="absolute inset-[14%]">
                <Crystal />
              </div>
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#99F6E4" strokeWidth=".3" strokeDasharray="1 1.5" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#BAE6FD" strokeWidth=".25" />
              </svg>
              {ORBIT.map((o) => (
                <span
                  key={o.label}
                  className="absolute inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-white bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-soft backdrop-blur sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[12px]"
                  style={{ left: `${o.x}%`, top: `${o.y}%` }}
                >
                  <Sparkle className="size-3" /> {o.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p className="eyebrow !text-mint-dark">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Five stages. Each one thinks before it creates.</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-body">
              IdeaForge isn’t one giant prompt. Every stage has its own AI responsibility, builds on stored context, and hands the decisions
              back to you.
            </p>
          </div>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <li key={s.n} className={`card p-5 ${i === 2 ? 'border-[#99f6e4] shadow-glow' : ''}`}>
                <span className="text-xs font-bold text-mint">{s.n}</span>
                <h3 className="mt-2 text-lg font-semibold text-ink">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="examples" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-24 sm:px-6">
          <div className="card relative overflow-hidden p-6 sm:p-10">
            <div className="hero-gradient absolute inset-0 opacity-60" aria-hidden />
            <div className="relative">
              <p className="eyebrow !text-mint-dark">Examples</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Start from something rough. That’s the point.</h2>
              <ul className="mt-6 grid gap-3 md:grid-cols-3">
                {EXAMPLES.map((e) => (
                  <li key={e} className="rounded-2xl bg-white/85 p-4 text-[15px] leading-relaxed text-ink shadow-soft ring-1 ring-white">
                    “{e}”
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
          <Logo />
          <p>Turn your idea into a brand.</p>
        </div>
      </footer>
    </div>
  );
}
