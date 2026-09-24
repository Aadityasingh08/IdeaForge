import type { Project } from './types';
import { STAGE_LABEL } from './stages';

const list = (items?: string[]) => (items?.length ? items.map((i) => `- ${i}`).join('\n') : '_Not defined yet._');
const val = (v?: string) => (v && v.trim() ? v : '_Not defined yet._');

/** Builds the Markdown brand kit entirely from the project's final BrandDNA. */
export function buildMarkdown(project: Project): string {
  const d = project.brandDNA;
  const kit = d.brandKit;
  const name = kit?.name ?? d.naming?.selectedName ?? project.name;
  const tagline = kit?.tagline ?? d.messaging?.tagline ?? '';

  const sections = [
    `# ${name}`,
    tagline ? `> ${tagline}` : '',
    `_Generated with IdeaForge · ${new Date().toLocaleDateString()} · Stage: ${STAGE_LABEL[project.currentStage]}_`,

    `## Brand Overview\n\n${val(kit?.brandSummary)}\n\n**One-line pitch:** ${val(kit?.oneLinePitch ?? d.messaging?.oneLinePitch)}\n\n**Original idea:** ${d.idea.rawIdea}`,
    `## Problem\n\n${val(d.positioning?.problem ?? d.idea.problem)}`,
    `## Target Audience\n\n**Primary:** ${val(d.positioning?.audience ?? d.idea.targetAudience?.primary)}${
      d.idea.targetAudience?.secondary ? `\n\n**Secondary:** ${d.idea.targetAudience.secondary}` : ''
    }${d.idea.userNeed ? `\n\n**User need:** ${d.idea.userNeed}` : ''}`,
    `## Positioning\n\n**${val(d.positioning?.statement)}**\n\n| | |\n|---|---|\n| Category | ${d.positioning?.category ?? '—'} |\n| Competitive angle | ${
      d.positioning?.competitiveAngle ?? '—'
    } |\n\n${d.positioning?.rationale ? `_Why:_ ${d.positioning.rationale}` : ''}`,
    `## Value Proposition\n\n${val(d.positioning?.valueProposition)}`,
    `## Differentiator\n\n${val(d.positioning?.differentiator)}`,
    `## Personality\n\n${
      d.personality?.traits.map((t) => `- **${t.name}** — ${t.reason}`).join('\n') ?? '_Not defined yet._'
    }\n\n**Traits to avoid:** ${d.personality?.traitsToAvoid.join(', ') ?? '—'}`,
    `## Naming\n\n**Selected name:** ${name}${d.naming?.selectedTerritory ? ` (territory: ${d.naming.selectedTerritory})` : ''}\n\n${
      d.naming?.territories
        .map((t) => `### ${t.name}\n${t.concept}\n\n- Examples: ${t.examples.join(', ')}\n- Risks: ${t.risks.join('; ') || '—'}`)
        .join('\n\n') ?? ''
    }`,
    `## Voice\n\n${list(kit?.voice ?? d.messaging?.voice)}\n\n**Tone:** ${val(d.messaging?.tone)}`,
    `## Visual Identity\n\n${val(kit?.visualSummary)}\n\n**Mood:** ${d.visual?.mood.join(', ') ?? '—'}\n\n${d.visual?.rationale ?? ''}`,
    `## Color Palette\n\n${
      d.visual?.colors.length
        ? `| Name | HEX | Usage |\n|---|---|---|\n${d.visual.colors.map((c) => `| ${c.name} | \`${c.hex}\` | ${c.usage} |`).join('\n')}`
        : '_Not defined yet._'
    }`,
    `## Typography\n\n- **Heading:** ${d.visual?.typography.heading ?? '—'}\n- **Body:** ${d.visual?.typography.body ?? '—'}\n\n${
      d.visual?.typography.rationale ?? ''
    }`,
    `## Imagery\n\n${list(d.visual?.imagery)}\n\n**Shapes**\n\n${list(d.visual?.shapes)}\n\n**Composition**\n\n${list(
      d.visual?.composition,
    )}\n\n**Visual principles**\n\n${list(d.visual?.principles)}\n\n**Avoid**\n\n${list(d.visual?.avoid)}`,
    `## Messaging\n\n**Tagline:** ${val(tagline)}\n\n**One-line pitch:** ${val(d.messaging?.oneLinePitch)}\n\n**Short description:** ${val(
      kit?.shortDescription ?? d.messaging?.shortDescription,
    )}\n\n**Messaging principles**\n\n${list(d.messaging?.principles)}`,
    `## Launch Assets\n\n**Landing page headline:** ${val(kit?.launchHeadline)}\n\n**Landing page description:** ${val(
      kit?.launchDescription,
    )}\n\n**CTA:** ${val(kit?.cta)}\n\n**Social launch post**\n\n${kit?.socialLaunchPost ? kit.socialLaunchPost.split('\n').map((l) => `> ${l}`).join('\n') : '_Not defined yet._'}`,
    `## Consistency Report\n\n${
      d.consistency
        ? `${d.consistency.consistent ? 'Overall: **consistent**' : 'Overall: **needs attention**'}\n\n| Area | Status | Notes |\n|---|---|---|\n${d.consistency.checks
            .map((c) => `| ${c.area} | ${c.status.toUpperCase()} | ${c.explanation} |`)
            .join('\n')}${d.consistency.recommendations.length ? `\n\n**Recommendations**\n\n${list(d.consistency.recommendations)}` : ''}`
        : '_Consistency check not run yet._'
    }`,
  ];
  return sections.filter(Boolean).join('\n\n') + '\n';
}

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const downloadMarkdown = (p: Project) => downloadFile('IdeaForge-Brand-Kit.md', buildMarkdown(p), 'text/markdown;charset=utf-8');

export const downloadJSON = (p: Project) =>
  downloadFile(
    'IdeaForge-Brand-Kit.json',
    JSON.stringify({ project: { id: p._id, name: p.name, currentStage: p.currentStage, updatedAt: p.updatedAt }, brandDNA: p.brandDNA }, null, 2),
    'application/json',
  );
