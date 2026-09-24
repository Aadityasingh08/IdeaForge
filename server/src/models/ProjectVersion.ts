import { Schema, model, Types } from 'mongoose';
import type { BrandDNA, Stage } from '../types/brandDNA';

/** A snapshot of a project's BrandDNA taken before every meaningful change. */
export interface ProjectVersionAttrs {
  projectId: Types.ObjectId;
  label: string;
  name: string;
  currentStage: Stage;
  brandDNA: BrandDNA;
  createdAt: Date;
}

const ProjectVersionSchema = new Schema<ProjectVersionAttrs>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    label: { type: String, required: true },
    name: { type: String, required: true },
    currentStage: { type: String, required: true },
    brandDNA: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, minimize: false },
);

export const ProjectVersion = model<ProjectVersionAttrs>('ProjectVersion', ProjectVersionSchema);
