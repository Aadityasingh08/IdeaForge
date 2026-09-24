import { Project, type ProjectDoc } from '../models/Project';
import { AIRun } from '../models/AIRun';
import { emptyBrandDNA, type BrandDNA } from '../types/brandDNA';
import { ApiError, assertObjectId, notFound } from '../utils/http';
import { parseIdea, capitalize } from '../ai/fallback/ideaParser';
import { EDITABLE_FIELDS, addUnique, isSelectionField, setPath, touch } from './brandDNA.service';
import { checkpoint, deleteVersions } from './version.service';

export function draftName(rawIdea: string): string {
  const { action, keywords } = parseIdea(rawIdea);
  const words = (action || keywords.join(' ')).split(' ').slice(0, 5).join(' ');
  return capitalize(words).replace(/[,.;:]+$/, '').slice(0, 60) || 'Untitled idea';
}

export function validateIdea(rawIdea: string) {
  const words = rawIdea.trim().split(/\s+/).filter((w) => /[a-z]/i.test(w));
  if (rawIdea.trim().length < 12 || words.length < 3) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Tell us a little more about your idea — a sentence or two is perfect.');
  }
}

export async function createProject(rawIdea: string, ownerId: string) {
  validateIdea(rawIdea);
  return Project.create({
    name: draftName(rawIdea),
    rawIdea: rawIdea.trim(),
    currentStage: 'understand',
    brandDNA: emptyBrandDNA(rawIdea.trim()),
    ownerId,
  });
}

export async function listProjects(ownerId: string) {
  // Projects created before ownership existed are adopted by the first browser that lists them.
  await Project.updateMany({ ownerId: { $exists: false } }, { $set: { ownerId } });
  const docs = await Project.find({ ownerId }, { name: 1, rawIdea: 1, currentStage: 1, updatedAt: 1, createdAt: 1, 'brandDNA.messaging.tagline': 1 })
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean();
  return docs.map((d) => ({
    _id: String(d._id),
    name: d.name,
    rawIdea: d.rawIdea,
    currentStage: d.currentStage,
    tagline: (d.brandDNA as Partial<BrandDNA> | undefined)?.messaging?.tagline ?? null,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));
}

export async function getProjectDoc(id: string): Promise<ProjectDoc> {
  assertObjectId(id);
  const doc = await Project.findById(id);
  if (!doc) throw notFound();
  // Older or partially-written documents always get the full container shape.
  doc.brandDNA.challenges ??= [];
  doc.brandDNA.decisions ??= { edited: [], accepted: [] };
  return doc;
}

/** Loads a project and checks it belongs to this browser. Other owners get a plain 404. */
export async function getOwnedProject(id: string, ownerId: string): Promise<ProjectDoc> {
  const doc = await getProjectDoc(id);
  if (!doc.ownerId) {
    doc.ownerId = ownerId;
    await doc.save();
  } else if (doc.ownerId !== ownerId) {
    throw notFound();
  }
  return doc;
}

export function serialize(doc: ProjectDoc) {
  return {
    _id: String(doc._id),
    name: doc.name,
    rawIdea: doc.rawIdea,
    currentStage: doc.currentStage,
    shared: !!doc.shared,
    brandDNA: doc.brandDNA,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export interface ProjectPatch {
  name?: string;
  shared?: boolean;
  edits?: { path: string; value: unknown }[];
  accept?: string[];
}

/** Applies human edits. Edited values become the source of truth for every later AI call. */
export async function patchProject(doc: ProjectDoc, patch: ProjectPatch) {
  const dna = doc.brandDNA;

  if (patch.name) doc.name = patch.name;
  if (patch.shared !== undefined) {
    if (patch.shared && !dna.brandKit) throw new ApiError(409, 'PRECONDITION_FAILED', 'Complete your brand kit before sharing it.');
    doc.shared = patch.shared;
  }

  const edits = patch.edits ?? [];
  if (edits.some((e) => !isSelectionField(e.path))) {
    await checkpoint(doc, `Before editing ${edits.map((e) => e.path.split('.').pop()).join(', ')}`);
  }

  for (const edit of edits) {
    const schema = EDITABLE_FIELDS[edit.path];
    if (!schema) throw new ApiError(400, 'VALIDATION_ERROR', `“${edit.path}” cannot be edited.`);
    const parsed = schema.safeParse(edit.value);
    if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', `Invalid value for ${edit.path}.`);
    setPath(dna, edit.path, parsed.data);
    touch(dna, edit.path);

    const selection = isSelectionField(edit.path);
    if (selection) {
      if (edit.path === 'naming.selectedName') doc.name = parsed.data as string;
      dna.decisions.accepted = addUnique(dna.decisions.accepted, edit.path);
    } else {
      dna.decisions.edited = addUnique(dna.decisions.edited, edit.path);
    }
    // A human decision on a field resolves any open challenge on that exact field.
    for (const c of dna.challenges) {
      if (!c.resolved && c.target === edit.path) {
        c.resolved = true;
        c.resolution = selection ? 'accepted' : 'edited';
        c.appliedValue = String(parsed.data);
        c.resolvedAt = new Date().toISOString();
      }
    }
  }

  for (const key of patch.accept ?? []) {
    if (!/^[a-z]+(\.[a-zA-Z]+)*$/.test(key)) throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid accept key.');
    dna.decisions.accepted = addUnique(dna.decisions.accepted, key);
  }

  doc.markModified('brandDNA');
  await doc.save();
  return serialize(doc);
}

export async function deleteProject(doc: ProjectDoc) {
  await Project.deleteOne({ _id: doc._id });
  await AIRun.deleteMany({ projectId: doc._id });
  await deleteVersions(doc._id);
}

export async function listRuns(doc: ProjectDoc) {
  return AIRun.find({ projectId: doc._id }, { stage: 1, task: 1, status: 1, duration: 1, attempts: 1, provider: 1, createdAt: 1, error: 1 })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
}

/** Public, read-only view of a finished brand. Only available when the owner turned sharing on. */
export async function getSharedBrand(id: string) {
  assertObjectId(id);
  const doc = await Project.findById(id).lean();
  if (!doc || !doc.shared || !doc.brandDNA?.brandKit) throw notFound('Shared brand');
  const d = doc.brandDNA;
  return {
    name: doc.name,
    brandDNA: {
      positioning: d.positioning,
      personality: d.personality,
      messaging: d.messaging,
      visual: d.visual,
      logo: d.logo,
      brandKit: d.brandKit,
      consistency: d.consistency,
    },
  };
}
