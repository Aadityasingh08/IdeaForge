import { useState } from 'react';
import { Send, Users, ThumbsUp } from 'lucide-react';
import type { BrandDNA } from '../../lib/types';
import { Card, Badge } from '../ui/primitives';
import { Button } from '../ui/Button';

interface Message {
  sender: 'user' | 'persona';
  text: string;
  sentiment?: 'excited' | 'curious' | 'skeptical';
  score?: number;
  tip?: string;
}

interface Persona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  archetype: string;
  quote: string;
  initialPrompt: string;
}

export function AudienceSimulator({ dna }: { dna: BrandDNA }) {
  const brandName = dna.naming?.selectedName || dna.brandKit?.name || 'IdeaForge';
  const tagline = dna.messaging?.tagline || dna.brandKit?.tagline || 'Turn your idea into a brand';
  const valueProp = dna.positioning?.valueProposition || 'AI brand intelligence workspace';
  const primaryAudience = dna.idea?.targetAudience?.primary || 'Founders, Creators and Builders';

  const personas: Persona[] = [
    {
      id: 'skeptic',
      name: 'Rohan Sharma',
      role: 'Senior Tech Lead & Founder',
      avatar: '👨‍💻',
      archetype: 'The Critical Pragmatist',
      quote: "Show me real proof and workflow speed, not just fancy AI marketing buzzwords.",
      initialPrompt: "I've seen lots of generic AI tools fail. Why is your brand any different?",
    },
    {
      id: 'champion',
      name: 'Maya Chen',
      role: 'Growth Marketer & Creator',
      avatar: '🚀',
      archetype: 'The Early-Adopter Champion',
      quote: "I love bold visual identity, speed, and things that make me look 10x more professional.",
      initialPrompt: "Does this brand feel modern enough to stand out on Product Hunt and Twitter/X?",
    },
    {
      id: 'buyer',
      name: 'Aditya Kapoor',
      role: 'Small Business Owner',
      avatar: '💼',
      archetype: 'The Practical Decision-Maker',
      quote: "I need simplicity. Will this save me time and money without a huge learning curve?",
      initialPrompt: "If I spend 15 minutes with your tool, what concrete result do I walk away with?",
    },
  ];

  const [activePersona, setActivePersona] = useState<Persona>(personas[0]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    skeptic: [
      {
        sender: 'persona',
        text: `Hey, I'm Rohan. Looking at "${brandName}". Honestly, most AI brand tools just hallucinate random names and ugly palettes. Why should I trust your strategy?`,
        sentiment: 'skeptical',
        score: 62,
        tip: 'Emphasize your 5-stage reasoning engine and evidence-based Challenge Critic.',
      },
    ],
    champion: [
      {
        sender: 'persona',
        text: `Hey! Love the tagline "${tagline}". Does ${brandName} generate full launch mockups and social assets so I can post immediately?`,
        sentiment: 'curious',
        score: 88,
        tip: 'Highlight that BrandDNA exports print-ready Brand Books and full SVG assets.',
      },
    ],
    buyer: [
      {
        sender: 'persona',
        text: `Hi there! I am part of your target audience (${primaryAudience}). Can I really use ${brandName} without hiring an expensive branding agency?`,
        sentiment: 'curious',
        score: 79,
        tip: 'Stress the end-to-end BrandDNA persistence and surgical human-in-the-loop control.',
      },
    ],
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const currentChat = messages[activePersona.id] || [];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { sender: 'user', text };
    const nextList = [...currentChat, userMsg];

    setMessages((prev) => ({ ...prev, [activePersona.id]: nextList }));
    setInput('');
    setIsTyping(true);

    // Simulate persona intelligent response based on BrandDNA
    setTimeout(() => {
      let reply: Message;
      const lower = text.toLowerCase();

      if (activePersona.id === 'skeptic') {
        if (lower.includes('tagline') || lower.includes('pitch')) {
          reply = {
            sender: 'persona',
            text: `"${tagline}" is crisp and punchy. It doesn't use cliché startup fluff like "revolutionary". If the app actually delivers on this promise, I'd recommend it to our cohort.`,
            sentiment: 'excited',
            score: 91,
            tip: 'Keep the tagline grounded in concrete outcome rather than abstract claims.',
          };
        } else if (lower.includes('price') || lower.includes('cost') || lower.includes('agency')) {
          reply = {
            sender: 'persona',
            text: `Traditional agencies charge $5,000–$15,000 for what your workspace generates in 10 minutes. If the BrandDNA is truly coherent across all 5 stages, that is an obvious no-brainer.`,
            sentiment: 'excited',
            score: 94,
            tip: 'Contrast your speed and price directly against agency retainers.',
          };
        } else {
          reply = {
            sender: 'persona',
            text: `That makes a lot of sense. The fact that ${brandName} lets me challenge decisions and refine individual sections without blowing up the whole brand kit gives me real confidence.`,
            sentiment: 'excited',
            score: 89,
            tip: 'The human-in-the-loop editing is a major trust anchor for technical founders.',
          };
        }
      } else if (activePersona.id === 'champion') {
        reply = {
          sender: 'persona',
          text: `Wow, yes! The visual identity (${dna.visual?.colors[0]?.name || 'Teal'} palette + ${dna.visual?.typography.heading || 'modern'} font) looks super premium. This would easily hit Top 3 on Product Hunt!`,
          sentiment: 'excited',
          score: 96,
          tip: 'Use your launch headline and social card previews for immediate viral distribution.',
        };
      } else {
        reply = {
          sender: 'persona',
          text: `"${valueProp}" sounds exactly like what I need. Being able to export a complete PDF brand book in one click saves me weeks of back-and-forth. Count me in as a beta user!`,
          sentiment: 'excited',
          score: 93,
          tip: 'Showcase the PDF brand book download on the landing page hero section.',
        };
      }

      setMessages((prev) => ({
        ...prev,
        [activePersona.id]: [...nextList, reply],
      }));
      setIsTyping(false);
    }, 700);
  };

  const quickQuestions = [
    `Test our tagline: "${tagline}"`,
    `Would you pay for ${brandName}?`,
    `What is our biggest advantage over alternatives?`,
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone="mint">
              <Users className="mr-1 size-3" /> Audience Simulator
            </Badge>
            <span className="text-xs font-semibold text-muted">Real-Time Persona Testing</span>
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-ink">
            Test Your Brand with AI Customer Personas
          </h3>
          <p className="text-sm text-body">
            Simulate real customer reactions to your positioning, tagline, and value proposition before launching.
          </p>
        </div>
      </div>

      {/* Persona Selectors */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {personas.map((p) => {
          const isActive = activePersona.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePersona(p)}
              className={`flex items-start gap-3 rounded-2xl p-4 text-left transition-all ${
                isActive
                  ? 'bg-white shadow-lift ring-2 ring-teal-500 border-transparent'
                  : 'bg-white/70 border border-line hover:bg-white hover:border-slate-300'
              }`}
            >
              <span className="text-3xl">{p.avatar}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-ink truncate">{p.name}</h4>
                  {isActive && <span className="size-2 rounded-full bg-teal-500" />}
                </div>
                <p className="text-xs font-medium text-teal-700">{p.role}</p>
                <p className="mt-1 text-[11px] text-muted line-clamp-2 italic">"{p.quote}"</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Chat Window */}
      <Card className="overflow-hidden border border-line shadow-soft">
        <div className="flex items-center justify-between border-b border-line bg-slate-50 px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{activePersona.avatar}</span>
            <div>
              <p className="text-sm font-bold text-ink">{activePersona.name}</p>
              <p className="text-[11px] text-muted">{activePersona.archetype}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Live Persona Status:</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Feedback
            </span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="h-80 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-slate-50/50">
          {currentChat.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-teal-600 text-white rounded-br-xs'
                    : 'bg-white text-ink border border-line rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>

              {m.sender === 'persona' && m.sentiment && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      m.sentiment === 'excited'
                        ? 'bg-emerald-100 text-emerald-800'
                        : m.sentiment === 'curious'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <ThumbsUp className="size-2.5" /> Resonance Score: {m.score}%
                  </span>

                  {m.tip && (
                    <span className="text-[11px] text-slate-500 font-medium italic">
                      💡 Strategy tip: {m.tip}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="size-2 rounded-full bg-teal-500 animate-bounce" />
              <span>{activePersona.name} is evaluating your brand...</span>
            </div>
          )}
        </div>

        {/* Quick Test Prompt Chips */}
        <div className="border-t border-line bg-slate-50/80 px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-semibold text-muted shrink-0">Quick Tests:</span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-body border border-line hover:border-teal-500 hover:text-teal-700 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="border-t border-line bg-white p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${activePersona.name} anything about your brand...`}
              className="flex-1 rounded-xl border border-line bg-slate-50/60 px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-teal-500 focus:bg-white focus:outline-none"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!input.trim() || isTyping}
              className="shrink-0"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
