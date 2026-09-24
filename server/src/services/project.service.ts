import { Project, type ProjectDoc } from '../models/Project';
import { AIRun } from '../models/AIRun';
import { emptyBrandDNA, type BrandDNA } from '../types/brandDNA';
import { ApiError, assertObjectId, notFound } from '../utils/http';
import { parseIdea, capitalize } from '../ai/fallback/ideaParser';
import { EDITABLE_FIELDS, addUnique, isSelectionField, setPath } from './brandDNA.service';

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

export async function createProject(rawIdea: string) {
  validateIdea(rawIdea);
  return Project.create({
    name: draftName(rawIdea),
    rawIdea: rawIdea.trim(),
    currentStage: 'understand',
    brandDNA: emptyBrandDNA(rawIdea.trim()),
  });
}

export async function listProjects() {
  const docs = await Project.find({}, { name: 1, rawIdea: 1, currentStage: 1, updatedAt: 1, createdAt: 1, 'brandDNA.messaging.tagline': 1 })
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

export function serialize(doc: ProjectDoc) {
  return {
    _id: String(doc._id),
    name: doc.name,
    rawIdea: doc.rawIdea,
    currentStage: doc.currentStage,
    brandDNA: doc.brandDNA,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export interface ProjectPatch {
  name?: string;
  edits?: { path: string; value: unknown }[];
  accept?: string[];
}

/** Applies human edits. Edited values become the source of truth for every later AI call. */
export async function patchProject(id: string, patch: ProjectPatch) {
  const doc = await getProjectDoc(id);
  const dna = doc.brandDNA;

  if (patch.name) doc.name = patch.name;

  for (const edit of patch.edits ?? []) {
    const schema = EDITABLE_FIELDS[edit.path];
    if (!schema) throw new ApiError(400, 'VALIDATION_ERROR', `“${edit.path}” cannot be edited.`);
    const parsed = schema.safeParse(edit.value);
    if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', `Invalid value for ${edit.path}.`);
    setPath(dna, edit.path, parsed.data);

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

export async function deleteProject(id: string) {
  assertObjectId(id);
  const doc = await Project.findByIdAndDelete(id);
  if (!doc) throw notFound();
  await AIRun.deleteMany({ projectId: doc._id });
}

export async function listRuns(id: string) {
  assertObjectId(id);
  return AIRun.find({ projectId: id }, { stage: 1, task: 1, status: 1, duration: 1, attempts: 1, provider: 1, createdAt: 1, error: 1 })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
}
