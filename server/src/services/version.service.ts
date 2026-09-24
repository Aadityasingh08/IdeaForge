import type { Types } from 'mongoose';
import { ProjectVersion } from '../models/ProjectVersion';
import type { ProjectDoc } from '../models/Project';
import { hasFullIdea } from '../types/brandDNA';
import { ApiError, assertObjectId } from '../utils/http';

const KEEP = 40;

/**
 * Saves the project's current state before it changes, so any decision can be undone.
 * Empty projects (idea not analysed yet) are not worth a snapshot.
 */
export async function checkpoint(doc: ProjectDoc, label: string) {
  if (!hasFullIdea(doc.brandDNA.idea)) return;
  await ProjectVersion.create({
    projectId: doc._id,
    label,
    name: doc.name,
    currentStage: doc.currentStage,
    brandDNA: JSON.parse(JSON.stringify(doc.brandDNA)),
  });
  const stale = await ProjectVersion.find({ projectId: doc._id }, { _id: 1 }).sort({ createdAt: -1 }).skip(KEEP).lean();
  if (stale.length) await ProjectVersion.deleteMany({ _id: { $in: stale.map((s) => s._id) } });
}

export function listVersions(projectId: string) {
  return ProjectVersion.find({ projectId }, { label: 1, name: 1, currentStage: 1, createdAt: 1 }).sort({ createdAt: -1 }).limit(KEEP).lean();
}

/** Restores a snapshot. The state being replaced is itself checkpointed, so restores are undoable. */
export async function restoreVersion(doc: ProjectDoc, versionId: string) {
  assertObjectId(versionId);
  const version = await ProjectVersion.findOne({ _id: versionId, projectId: doc._id }).lean();
  if (!version) throw new ApiError(404, 'NOT_FOUND', 'Version not found.');
  await checkpoint(doc, 'Before restoring a version');
  doc.brandDNA = version.brandDNA;
  doc.name = version.name;
  doc.currentStage = version.currentStage;
  doc.markModified('brandDNA');
  await doc.save();
}

export function deleteVersions(projectId: Types.ObjectId) {
  return ProjectVersion.deleteMany({ projectId });
}
