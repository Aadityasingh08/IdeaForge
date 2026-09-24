import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Trash2 } from 'lucide-react';
import type { ProjectSummary } from '../../lib/types';
import { STAGES, STAGE_LABEL } from '../../lib/stages';
import { timeAgo, truncate } from '../../lib/format';
import { Badge } from '../ui/primitives';
import { IconButton } from '../ui/Button';
import { Sparkle } from '../ui/Logo';

export function ProjectCard({ project, onDelete }: { project: ProjectSummary; onDelete: (p: ProjectSummary) => void }) {
  const complete = project.currentStage === 'complete';
  const idx = complete ? STAGES.length : STAGES.findIndex((s) => s.key === project.currentStage);

  return (
    <article className="card group relative flex h-full flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#e6fffb] to-[#e0f2fe] ring-1 ring-[#ccfbf1]">
          <Sparkle className="size-5" />
        </span>
        <IconButton
          size="sm"
          label={`Delete ${project.name}`}
          onClick={() => onDelete(project)}
          className="relative z-10 opacity-100 hover:!text-danger sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        >
          <Trash2 className="size-4" />
        </IconButton>
      </div>

      <h2 className="mt-4 text-lg font-bold tracking-tight text-ink">
        <Link to={`/workspace/${project._id}`} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
          {project.name}
        </Link>
      </h2>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-body">“{truncate(project.tagline ?? project.rawIdea, 110)}”</p>

      <div className="mt-5" aria-label={`Progress: ${idx} of ${STAGES.length} stages`}>
        <div className="flex gap-1" aria-hidden>
          {STAGES.map((s, i) => (
            <span key={s.key} className={`h-1 flex-1 rounded-full ${i < idx ? 'bg-mint' : i === idx ? 'bg-mint-light' : 'bg-[#eef2f6]'}`} />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Badge tone={complete ? 'success' : 'mint'}>{complete ? 'Brand Kit' : STAGE_LABEL[project.currentStage]}</Badge>
          <span className="inline-flex items-center gap-1 truncate text-xs text-muted">
            <Clock className="size-3" aria-hidden /> Updated {timeAgo(project.updatedAt)}
          </span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-mint-dark transition-transform group-hover:translate-x-0.5" aria-hidden>
          Continue <ArrowRight className="size-3.5" />
        </span>
      </div>
    </article>
  );
}
