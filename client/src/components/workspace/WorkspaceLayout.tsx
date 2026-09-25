import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Check, FolderOpen, Menu, Presentation, X } from 'lucide-react';
import { useStore, useWorkspace } from '../../state/ProjectContext';
import { STAGES, completedCount, stageStatuses } from '../../lib/stages';
import type { Project } from '../../lib/types';
import { ApiError } from '../../lib/api';
import { Logo, Sparkle } from '../ui/Logo';
import { IconButton, ButtonLink } from '../ui/Button';
import { EmptyState, ErrorState } from '../ui/states';
import { Tooltip } from '../ui/primitives';
import { BrandDNAPanel } from './BrandDNAPanel';
import { VersionHistory } from './VersionHistory';
import { UserMenu } from '../UserMenu';

function StageNavigation({ project, onNavigate }: { project: Project; onNavigate?: () => void }) {
  const statuses = stageStatuses(project.brandDNA);
  const complete = project.currentStage === 'complete';
  return (
    <nav aria-label="Workflow stages">
      <p className="eyebrow mb-3 px-3">Workflow</p>
      <ol className="space-y-1">
        {statuses.map((s) => {
          const inner = (active: boolean) => (
            <>
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold transition-colors ${
                  s.complete ? 'bg-mint text-white' : active ? 'bg-ink text-white' : 'bg-[#eef2f6] text-muted'
                }`}
              >
                {s.complete ? <Check className="size-3.5" aria-hidden /> : s.num}
              </span>
              <span className="min-w-0 flex-1 truncate">{s.label}</span>
              {s.complete && <span className="sr-only">(completed)</span>}
            </>
          );
          return (
            <li key={s.key}>
              {s.available ? (
                <NavLink
                  to={`/workspace/${project._id}/${s.path}`}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                      isActive ? 'bg-white text-ink shadow-soft ring-1 ring-[#99f6e4]' : 'text-body hover:bg-white/70 hover:text-ink'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute -left-px top-2 bottom-2 w-[3px] rounded-full bg-mint" aria-hidden />}
                      {inner(isActive)}
                    </>
                  )}
                </NavLink>
              ) : (
                <Tooltip content="Complete the previous stage first">
                  <span className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#b6c2d1]" aria-disabled="true">
                    {inner(false)}
                  </span>
                </Tooltip>
              )}
            </li>
          );
        })}
      </ol>

      {complete && (
        <div className="mt-5 animate-scale-in rounded-2xl bg-ink p-4 text-white">
          <Sparkle className="size-5" />
          <p className="mt-2 text-sm font-semibold">Your brand is ready.</p>
          <p className="mt-0.5 text-xs text-[#94a3b8]">All five stages complete.</p>
          <div className="mt-3 flex flex-col gap-1.5">
            <Link
              to={`/pitch-deck/${project._id}`}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-500 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-400 transition-colors"
            >
              <Presentation className="size-3.5" /> Pitch Deck (Slides)
            </Link>
            <Link
              to={`/brand-book/${project._id}`}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
            >
              View Brand Book
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function ProgressPill({ project }: { project: Project }) {
  const done = completedCount(project.brandDNA);
  return (
    <div className="hidden items-center gap-2.5 sm:flex" aria-label={`${done} of 5 stages complete`}>
      <div className="flex gap-1" aria-hidden>
        {STAGES.map((s, i) => (
          <span key={s.key} className={`h-1.5 w-5 rounded-full transition-colors ${i < done ? 'bg-mint' : 'bg-[#e2e8f0]'}`} />
        ))}
      </div>
      <span className="text-xs font-semibold text-body">{done}/5</span>
    </div>
  );
}

/** Compact horizontal progress for small screens. */
function MobileStepper({ project }: { project: Project }) {
  const statuses = stageStatuses(project.brandDNA);
  const { pathname } = useLocation();
  const current = statuses.find((s) => pathname.endsWith(`/${s.path}`));
  return (
    <nav aria-label="Workflow stages" className="border-b border-line bg-white/80 px-4 py-2.5 backdrop-blur lg:hidden">
      <ol className="flex items-center gap-1.5">
        {statuses.map((s) => {
          const active = current?.key === s.key;
          const cls = `grid h-7 flex-1 place-items-center rounded-lg text-[11px] font-bold transition-all ${
            active ? 'bg-ink text-white' : s.complete ? 'bg-mint-50 text-mint-dark ring-1 ring-inset ring-[#99f6e4]' : 'bg-[#f1f5f9] text-muted'
          }`;
          return (
            <li key={s.key} className="flex flex-1">
              {s.available ? (
                <Link to={`/workspace/${project._id}/${s.path}`} className={cls} aria-current={active ? 'step' : undefined} aria-label={`${s.label}${s.complete ? ' (completed)' : ''}`}>
                  {s.complete && !active ? <Check className="size-3.5" aria-hidden /> : s.num}
                </Link>
              ) : (
                <span className={`${cls} opacity-60`} aria-label={`${s.label} (locked)`}>
                  {s.num}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {current && <p className="mt-1.5 text-center text-xs font-semibold text-ink">{current.label}</p>}
    </nav>
  );
}

function AIModeIndicator() {
  const { aiMode } = useStore();
  const show = import.meta.env.DEV || import.meta.env.VITE_SHOW_AI_STATUS === 'true';
  if (!show || !aiMode) return null;
  return (
    <span
      className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold md:inline-flex ${
        aiMode === 'connected' ? 'bg-[#ecfdf5] text-[#047857]' : 'bg-[#eff6ff] text-[#1d4ed8]'
      }`}
      title="Developer indicator"
    >
      <span className={`size-1.5 rounded-full ${aiMode === 'connected' ? 'bg-success' : 'bg-ice'}`} aria-hidden />
      AI: {aiMode === 'connected' ? 'Connected' : 'Demo Mode'}
    </span>
  );
}

export function WorkspaceLayout() {
  const { projectId = '' } = useParams();
  const { project, loadError, reload } = useWorkspace(projectId);
  const [drawer, setDrawer] = useState(false);
  useEffect(() => {
    if (project) document.title = `${project.name} · IdeaForge`;
  }, [project]);

  if (!project) {
    if (loadError) {
      const missing = loadError instanceof ApiError && loadError.status === 404;
      return (
        <div className="mx-auto max-w-xl px-4 py-24">
          {missing ? (
            <EmptyState
              title="We couldn’t find this project."
              description="It may have been deleted. Your other ideas are safe."
              action={
                <ButtonLink to="/projects" variant="primary">
                  Back to your ideas
                </ButtonLink>
              }
            />
          ) : (
            <ErrorState error={loadError} onRetry={() => reload()} />
          )}
        </div>
      );
    }
    return (
      <div className="grid min-h-screen place-items-center" role="status" aria-label="Loading project">
        <Sparkle className="size-10" animated />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-md">
        <div className="flex h-14 items-center gap-3 px-4 sm:h-16 sm:px-6">
          <IconButton label="Open stage navigation" className="lg:hidden" onClick={() => setDrawer(true)} aria-expanded={drawer}>
            <Menu className="size-5" />
          </IconButton>
          <div className="hidden sm:block">
            <Logo to="/projects" />
          </div>
          <div className="sm:hidden">
            <Logo to="/projects" compact />
          </div>
          <span className="hidden h-5 w-px bg-line sm:block" aria-hidden />
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink sm:text-[15px]">{project.name}</p>
          <AIModeIndicator />
          <ProgressPill project={project} />
          <Link
            to={`/pitch-deck/${project._id}`}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-500 transition-colors shadow-xs"
            title="Launch Investor Pitch Deck"
          >
            <Presentation className="size-3.5" /> Pitch Deck
          </Link>
          <VersionHistory project={project} />
          <UserMenu />
        </div>
      </header>

      <MobileStepper project={project} />

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Stage navigation">
          <div className="absolute inset-0 animate-fade-in bg-[rgb(15_23_42/0.3)]" onClick={() => setDrawer(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs animate-slide-up flex-col bg-canvas p-4 shadow-lift">
            <div className="mb-6 flex items-center justify-between">
              <Logo to="/projects" />
              <IconButton label="Close navigation" onClick={() => setDrawer(false)}>
                <X className="size-5" />
              </IconButton>
            </div>
            <StageNavigation project={project} onNavigate={() => setDrawer(false)} />
            <Link to="/projects" className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-body hover:bg-white">
              <FolderOpen className="size-4" aria-hidden /> All projects
            </Link>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-line px-3 py-6 lg:flex">
          <StageNavigation project={project} />
          <Link to="/projects" className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-body transition-colors hover:bg-white hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden /> All projects
          </Link>
        </aside>

        <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-10 xl:px-10">
          <div className="mx-auto max-w-4xl">
            <Outlet />
          </div>
        </main>

        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-80 shrink-0 overflow-y-auto border-l border-line px-5 py-6 min-[1400px]:block" aria-label="Brand DNA">
          <BrandDNAPanel project={project} />
        </aside>
      </div>
    </div>
  );
}

/** /workspace/:projectId → the first stage that still needs work (or the brand kit). */
export function WorkspaceIndex() {
  const { projectId = '' } = useParams();
  const { project } = useWorkspace(projectId);
  if (!project) return null;
  const next = stageStatuses(project.brandDNA).find((s) => !s.complete);
  return <Navigate to={`/workspace/${projectId}/${next?.path ?? 'brand-kit'}`} replace />;
}
