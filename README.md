# IdeaForge

> **Turn your idea into a brand.**

IdeaForge is an AI brand intelligence workspace. It takes a rough startup, product, community or creator idea and turns it into a coherent, launch-ready brand system — by **understanding, strategising, challenging and refining**, not just generating.

---

## What is IdeaForge?

A full-stack web app (React + Express + MongoDB) that walks a founder through five AI stages:

`Understand → Strategy → Challenge → Visual → Brand Kit`

Every stage has its own AI responsibility, reads the stored **BrandDNA** from earlier stages, returns validated structured JSON, and hands decisions back to the human.

## Problem

Early founders usually have an idea, not a brand. Generic AI tools will happily produce a name, a tagline and a palette in one shot — but the output is often generic, internally inconsistent, and impossible to reason about. Nobody pushes back on weak decisions.

## Solution

IdeaForge behaves like a strategist, not a slot machine:

- It **analyses** the idea before branding anything.
- It builds **strategy** on that analysis (positioning, value proposition, personality, naming territories, messaging).
- A separate **Challenge engine** critiques the strategy — with evidence — and proposes specific fixes.
- The **human decides**: accept, edit, generate alternatives, or keep the original.
- Only the affected decision is **refined**; nothing is silently overwritten.
- Visual identity is **derived from the strategy**, then checked for consistency.
- A **Consistency Guardian** verifies the final kit before you download it.

## Key Features

- **Five-stage AI workflow** with a separate prompt, schema and responsibility per stage
- **BrandDNA** — one persisted source of truth; every stage builds on it
- **Challenge engine** — evidence-based critique; can return *no issues* when the brand is strong
- **Accept / Edit / Regenerate / Challenge / Keep original** on important decisions
- **"Why this?"** explanations for AI decisions
- **Section-level regeneration** (regenerating positioning never touches naming or visuals)
- **Human edits are the source of truth** — later AI calls are told which fields you edited
- **Visual identity** with palette (click-to-copy HEX), live Google-Fonts typography preview, mood, imagery, shapes, composition and CSS/SVG illustrations
- **Consistency report + Brand Health** — derived only from checks the AI actually ran (no fake scores)
- **Brand Kit** with launch-page preview, copy buttons everywhere, **Markdown + JSON download**
- **Logo generator** — four SVG logo concepts (monogram, spark, orbit, wordmark) built from the brand's name, palette and heading font
- **Launch mockups** — landing page, Instagram post, business card and app icon rendered in the brand's colours and fonts
- **PDF brand book** — a designed, print-ready multi-page brand book (Save as PDF)
- **Live strategy progress** — positioning, personality, naming and messaging appear one by one as each finishes
- **Out-of-date detection** — change the strategy after generating visuals or the kit and IdeaForge tells you what changed and offers a rebuild
- **Version history** — a snapshot before every change; restore any point (restores are undoable too)
- **Shareable brand page** — publish a read-only public page at `/b/:projectId`
- **Private per browser** — projects are scoped to an anonymous browser id (not a login)
- **Rate limiting** on the API, with a stricter limit on paid AI endpoints
- **Automated tests** (Vitest) and a **prompt-quality eval** (`npm run eval`)
- **Persistence** — refresh anytime; every decision is saved in MongoDB
- **AI run history** (`AIRun` collection) with status, attempts and duration for every call
- **Resilient**: Zod validation, one repair retry for malformed output, one retry for transient failures, friendly Retry / Continue-manually states, partial progress never lost
- **Demo mode** — a deterministic fallback provider runs the *same* workflow without an API key
- Responsive from 390px to 1440px+, keyboard accessible, reduced-motion aware

## AI Workflow

```
RAW IDEA
   ↓
UNDERSTAND   extract problem, audience, need, context, opportunity, assumptions
   ↓
STRATEGY     positioning → personality + naming territories → messaging
   ↓
CHALLENGE    critical review of the stored strategy, with evidence
   ↓
HUMAN DECISION   accept · edit · alternatives · keep original
   ↓
REFINE       update only the affected BrandDNA field
   ↓
VISUAL       translate the final strategy into a visual direction (+ lightweight visual check)
   ↓
CONSISTENCY  verify name, tagline, positioning, personality, voice, visuals and launch copy cohere
   ↓
BRAND KIT    compile the launch-ready system from the final BrandDNA
```

| Stage | Why it exists |
|---|---|
| **Understand** | Separates what the founder *said* from what the AI *assumes*, so branding starts from the real problem. |
| **Strategy** | Makes the strategic decisions (four focused calls: positioning, personality, naming, messaging), each building on the last. |
| **Challenge** | A different role — the critic. Finds generic language, weak differentiation, broad audiences, contradictions. |
| **Human decision** | The founder stays in control; every resolution is stored (`accepted`, `alternative`, `edited`, `kept_original`). |
| **Refine** | Surgical updates: only the challenged field changes. |
| **Visual** | Converts personality + positioning into colour, type and imagery, and explains the link. |
| **Consistency** | An independent coherence check across every brand element. |
| **Brand Kit** | Compiles, never reinvents: launch headline, CTA, social post, summary. |

### Why not one prompt?

The app intentionally avoids `userInput → giantPrompt → giantResponse`. Each stage has a different job, so each has its own prompt, context window and schema:

- **Understand** — extract context
- **Strategy** — make strategic decisions
- **Challenge** — critique decisions
- **Visual** — translate strategy into visual language
- **Consistency** — verify coherence
- **Brand Kit** — compile the final output

Separating them makes outputs smaller and more reliable, lets the human intervene between steps, allows surgical regeneration, and makes every decision traceable in the AI run history.

## Architecture

```
React client (Vite)
   ↓  fetch /api  (VITE_API_BASE_URL)
Express REST API
   ↓
Controllers        HTTP in/out, request validation (Zod)
   ↓
Services           project + BrandDNA business logic
   ↓
AIOrchestrator     per-stage calls, context selection, retries, AIRun logging
   ↓
Stage prompts      server/src/ai/prompts/*
   ↓
AIProvider         LLMProvider (Claude)  |  DevelopmentFallbackProvider
   ↓
Structured JSON → Zod validation → BrandDNA update → MongoDB → response
```

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Lucide icons |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB + Mongoose |
| AI | Anthropic Claude via `@anthropic-ai/sdk` (structured outputs), provider abstraction |
| Validation | Zod (requests and every AI response) |

## Folder Structure

```
IdeaForge/
├─ package.json            # root scripts: dev / client / server / build
├─ render.yaml             # backend deployment blueprint
├─ server/
│  ├─ .env.example
│  └─ src/
│     ├─ index.ts / app.ts           # bootstrap, CORS, error handler
│     ├─ config/                     # env + Mongo connection
│     ├─ routes/ controllers/        # HTTP layer
│     ├─ services/                   # project + BrandDNA logic (edits, whitelists)
│     ├─ models/                     # Project, AIRun (Mongoose)
│     ├─ schemas/                    # Zod: AI outputs + request bodies
│     ├─ types/brandDNA.ts           # the BrandDNA type
│     └─ ai/
│        ├─ AIOrchestrator.ts        # the workflow engine
│        ├─ prompts/                 # one file per stage
│        ├─ providers/               # AIProvider, LLMProvider, FallbackProvider
│        └─ fallback/ideaParser.ts   # deterministic idea parsing for demo mode
└─ client/
   ├─ .env.example, vercel.json, public/_redirects
   └─ src/
      ├─ lib/                        # api client, types, stages, export, formatting
      ├─ state/ProjectContext.tsx    # project cache + AI operation state
      ├─ components/ui/              # Logo, Button, Modal, Toast, Tooltip, CopyButton, states…
      ├─ components/brand/           # AIInsightCard, WhyThis, AIChallengeCard, ColorSwatch…
      ├─ components/workspace/       # WorkspaceLayout, stage navigation, Brand DNA panel
      └─ pages/                      # Landing, Projects, workspace/<stage>
```

## Environment Variables

**server/.env** (copy from `server/.env.example`)

| Variable | Description |
|---|---|
| `PORT` | API port (default `5000`) |
| `MONGODB_URI` | MongoDB connection string (local or Atlas) |
| `AI_PROVIDER` | `llm` for real AI, `fallback` for demo mode |
| `AI_API_KEY` | Anthropic API key — **server only**, never sent to the browser |
| `AI_MODEL` | Model id (default `claude-opus-5`) |
| `AI_EFFORT` | Optional reasoning effort: `low`/`medium`/`high`/`xhigh`/`max` (default `medium`) |
| `AI_TIMEOUT_MS` | Optional per-call timeout (default `120000`) |
| `CLIENT_URL` | Allowed browser origin(s) for CORS, comma-separated |
| `API_RATE_LIMIT` / `AI_RATE_LIMIT` | Requests per minute per IP for the API / AI endpoints (defaults 300 / 30) |
| `AI_SIMULATE_FAILURE` | Dev only — comma-separated tasks to force-fail (e.g. `challenge`) to demo Retry |

**client/.env** (copy from `client/.env.example`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | API base URL. `/api` in development (proxied by Vite); your deployed API URL in production |
| `VITE_SHOW_AI_STATUS` | `true` to show the small "AI: Connected / Demo Mode" indicator in production builds |

## Local Setup

Requirements: Node.js 20+, MongoDB 6+ (local service or Atlas).

```bash
npm run install:all
```

```bash
cp server/.env.example server/.env
```

```bash
npm run dev
```

Open http://localhost:5173. `npm run dev` starts the API (port 5000) and the web app (port 5173) together.

## Running Frontend

```bash
npm run client
```

## Running Backend

```bash
npm run server
```

Production build of both:

```bash
npm run build
```

## MongoDB Setup

- **Local:** install MongoDB Community Server and keep the default `MONGODB_URI=mongodb://127.0.0.1:27017/ideaforge`.
- **Atlas:** create a free cluster, add a database user and your IP, and set `MONGODB_URI` to the `mongodb+srv://…` string.

Collections are created automatically: `projects` (with the BrandDNA document) and `airuns` (AI history). Runs interrupted by a server restart are marked `failed` on the next boot.

## AI Setup

1. Create an Anthropic API key.
2. In `server/.env` set `AI_PROVIDER=llm` and `AI_API_KEY=<your key>` (optionally `AI_MODEL`).
3. Restart the server — the log prints `AI provider: LLM (claude-opus-5)`.

The provider is selected on the server only; clients can never choose a model or provider. If `AI_PROVIDER=llm` but no key is set, the server logs a warning and falls back to demo mode.

## Fallback Mode

With `AI_PROVIDER=fallback` (the default) the **DevelopmentFallbackProvider** runs the *exact same* workflow: it parses the raw idea (audience, job-to-be-done, product type, domain), generates deterministic structured JSON for every stage, and passes it through the same Zod schemas, orchestrator, AIRun logging and persistence. The Challenge stage genuinely inspects the stored BrandDNA (e.g. category-style value propositions, stock phrases like "made simple", unselected names) — accept a fix and re-run it, and those issues disappear. The UI is identical in both modes; in development a small badge shows **AI: Demo Mode**.

## API Endpoints

Every request except `/health` and `/share` sends an `X-IdeaForge-Owner` header — an anonymous id the client keeps in localStorage. It keeps each browser's projects private; it is not authentication.

All responses use `{ "success": true, "data": … }` or `{ "success": false, "error": { "code", "message" } }`.
Errors: `400` validation · `404` not found · `409` stage prerequisite missing · `502` AI failure · `500` database/internal.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Status, database and AI mode |
| POST | `/api/projects` | Create a project `{ rawIdea }` |
| GET | `/api/projects` | List projects |
| GET | `/api/projects/:id` | Get a project with BrandDNA |
| PATCH | `/api/projects/:id` | Human edits `{ edits: [{ path, value }], accept: [...] }` (whitelisted paths) |
| DELETE | `/api/projects/:id` | Delete project and its AI runs |
| GET | `/api/projects/:id/runs` | AI run history |
| GET | `/api/projects/:id/versions` | Version snapshots |
| POST | `/api/projects/:id/versions/:versionId/restore` | Restore a snapshot |
| GET | `/api/share/:id` | Public read-only brand (only when sharing is on) |
| POST | `/api/ai/understand` | `{ projectId, rawIdea? }` |
| POST | `/api/ai/strategy` | `{ projectId, section?, mode? }` — omit section for the full strategy; `mode: "fill"` generates one missing section (live progress); otherwise regenerates that section |
| POST | `/api/ai/challenge` | `{ projectId }` |
| POST | `/api/ai/challenge/apply` | `{ action: "accept", projectId, recommendation: { challengeId?, source, target, value } }` or `{ action: "keep_original", projectId, challengeId }` |
| POST | `/api/ai/challenge/alternatives` | `{ projectId, challengeId }` → exactly 3 strategically different options |
| POST | `/api/ai/visual` | `{ projectId }` — visual identity + visual consistency check |
| POST | `/api/ai/consistency` | `{ projectId }` — Consistency Guardian |
| POST | `/api/ai/brand-kit` | `{ projectId }` — final kit; sets `currentStage = "complete"` |

## BrandDNA Schema

Defined in `server/src/types/brandDNA.ts` (mirrored in `client/src/lib/types.ts`):

```ts
interface BrandDNA {
  idea: { rawIdea; problem; targetAudience: { primary; secondary? }; userNeed; context?; opportunity;
          keyInsights[]; assumptions[]; openQuestions[] };
  positioning?: { category; audience; problem; differentiator; valueProposition; competitiveAngle;
                  statement; rationale; valuePropositionRationale };
  personality?: { traits: { name; reason; audienceFit }[]; traitsToAvoid[]; rationale };
  naming?: { territories: { name; concept; rationale; examples[]; risks[] }[]; selectedTerritory?; selectedName? };
  messaging?: { tagline; oneLinePitch; shortDescription; voice[]; tone; principles[]; rationale };
  visual?: { colors: { name; hex; usage }[]; typography: { heading; body; rationale };
             mood[]; imagery[]; shapes[]; composition[]; principles[]; avoid[]; rationale };
  visualCheck?: { consistent; issues[] };
  challenges: { id; type; severity; title; description; evidence; recommendation; target; suggestedValue;
                resolved; resolution?; originalValue?; appliedValue?; alternatives? }[];
  challengeSummary?: { overallAssessment; recommendedDirection | null };
  consistency?: { consistent; checks[]; health[]; recommendations[] };
  brandKit?: { name; tagline; oneLinePitch; brandSummary; …; launchHeadline; cta; socialLaunchPost };
  finalBrand?: { name; tagline; summary };
  decisions: { edited: string[]; accepted: string[] };   // human decisions — AI must respect these
}
```

## AI Prompt Architecture

- `prompts/context.ts` builds each stage's context from **only the BrandDNA sections it needs**, and appends the list of human-edited / accepted fields as the source of truth.
- Each stage prompt defines one role and one responsibility, and asks for JSON only.
- Output is constrained with the stage's Zod schema (`output_config.format`) and **re-validated with Zod**.
- Malformed output → one **repair retry** with the validation errors included. Transient failures (timeouts, 429, 5xx) → one plain retry. Still failing → `502` with a friendly message; BrandDNA is untouched.
- Regeneration adds an explicit "offer a meaningfully different take" instruction and touches one section only.

## Challenge Engine

The reviewer analyses ten failure modes: generic language, weak differentiation, audience too broad, unclear value proposition, contradictory positioning, personality mismatch, naming weakness, messaging inconsistency, clichéd startup language and visual conflicts.

For each issue it must quote **evidence** from BrandDNA, name the **target field** it would change (from a fixed whitelist) and propose a concrete **suggested value**. It is explicitly told not to manufacture criticism — an empty `issues` array is a valid, celebrated result.

User actions:
- **Accept improvement** → writes only the target field, records `originalValue` / `appliedValue`, logs an AIRun.
- **Edit** the suggestion before accepting.
- **Generate alternatives** → exactly three strategically different options (outcome-, identity- and contrast-led).
- **Keep original** → no BrandDNA change; stored as `resolution: "kept_original"`.

## Export System

Built in the browser from the final BrandDNA (`client/src/lib/export.ts`):

- **IdeaForge-Brand-Kit.md** — Brand name, tagline, overview, problem, audience, positioning, value proposition, differentiator, personality, naming, voice, visual identity, colour palette, typography, imagery, messaging, launch assets and the consistency report.
- **IdeaForge-Brand-Kit.json** — the complete structured BrandDNA.

Copy-to-clipboard is available for the tagline, positioning, value proposition, pitch, descriptions, launch headline, CTA, social post and every HEX colour.

## Demo Flow

1. Open IdeaForge and enter: *"I want to build a platform that helps college students find teammates for hackathons."*
2. Press **Enter** → the project is created and **Understand** runs (problem, audience, need, opportunity, insights, open questions).
3. **Continue to Strategy** → positioning, value proposition, personality, naming territories and messaging.
4. **Continue to Challenge** → the reviewer flags that the positioning *describes the category but not the difference*.
5. It proposes **"Find the missing skill your next winning team needs."** → click **Accept improvement**; BrandDNA updates.
6. Resolve the other issues (pick a name, keep or change the tagline).
7. **Build visual identity** → colours, typography, mood, imagery and style, with a visual consistency check.
8. **Complete brand** → the kit is compiled and the Consistency Guardian runs.
9. Review Brand Health and the consistency report, copy assets, and **Download Brand Kit** (Markdown or JSON).
10. Refresh at any point — everything is restored from MongoDB.

To demo failure handling, start the server with `AI_SIMULATE_FAILURE=challenge` and use **Retry**.

## Deployment

- **Frontend (Vercel / Netlify):** root `client/`, build `npm run build`, output `dist/`. Set `VITE_API_BASE_URL=https://<your-api>/api`. SPA rewrites are included (`vercel.json`, `public/_redirects`).
- **Backend (Render / Railway):** root `server/`, build `npm install && npm run build`, start `npm start`, health check `/api/health`. `render.yaml` is included. Set `MONGODB_URI`, `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, and `CLIENT_URL` (your frontend origin).
- **Database:** MongoDB Atlas.

No URLs are hard-coded; everything is configured through environment variables.

## Testing & Prompt Evaluation

```bash
npm --prefix server test
```

Unit tests cover idea parsing, AI output validation, BrandDNA editing rules, the challenge engine (including that it returns **no** issues for a strong brand) and the orchestrator's repair/retry logic.

```bash
npm --prefix server run eval
```

Runs the whole pipeline on five sample ideas and scores the Challenge engine: are issues **grounded** in quoted BrandDNA text, **actionable**, does the brand **converge** after applying the fixes, and are the alternatives **distinct**. Run it with `AI_PROVIDER=llm` and your key to tune the prompts in `server/src/ai/prompts/` against the real model (this uses API credits). Reports are written to `server/eval-results/`.

## Future Improvements

- Real accounts (Google sign-in) and team workspaces with comments on decisions
- Competitor research with web search grounding in the Understand and Challenge stages (needs an API key)
- Side-by-side comparison of two or three competing brand directions
- Downloadable SVG/PNG logo files and a social-asset pack
- Token-level streaming for long AI stages
