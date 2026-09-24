import { Schema, model, type HydratedDocument } from 'mongoose';
import { STAGES, type BrandDNA, type Stage } from '../types/brandDNA';

export interface ProjectAttrs {
  name: string;
  rawIdea: string;
  currentStage: Stage;
  brandDNA: BrandDNA;
  ownerId?: string;
  shared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<ProjectAttrs>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    rawIdea: { type: String, required: true, trim: true, maxlength: 2000 },
    currentStage: { type: String, enum: STAGES, default: 'understand' },
    // BrandDNA is validated by Zod before every write, so it is stored as a flexible document.
    brandDNA: { type: Schema.Types.Mixed, required: true },
    // Anonymous per-browser owner id — keeps projects private to the browser that made them.
    ownerId: { type: String, index: true },
    shared: { type: Boolean, default: false },
  },
  { timestamps: true, minimize: false },
);

ProjectSchema.index({ updatedAt: -1 });

export const Project = model<ProjectAttrs>('Project', ProjectSchema);
export type ProjectDoc = HydratedDocument<ProjectAttrs>;
