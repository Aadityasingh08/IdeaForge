import { Schema, model, Types } from 'mongoose';

export type AIRunStatus = 'running' | 'success' | 'failed';

export interface AIRunAttrs {
  projectId: Types.ObjectId;
  stage: string;
  task: string;
  input: unknown;
  output?: unknown;
  model: string;
  provider: string;
  status: AIRunStatus;
  error?: string;
  attempts: number;
  duration?: number;
  createdAt: Date;
}

const AIRunSchema = new Schema<AIRunAttrs>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    stage: { type: String, required: true },
    task: { type: String, required: true },
    input: { type: Schema.Types.Mixed },
    output: { type: Schema.Types.Mixed },
    model: { type: String, required: true },
    provider: { type: String, required: true },
    status: { type: String, enum: ['running', 'success', 'failed'], default: 'running' },
    error: { type: String },
    attempts: { type: Number, default: 1 },
    duration: { type: Number },
  },
  { timestamps: { createdAt: true, updatedAt: false }, minimize: false },
);

export const AIRun = model<AIRunAttrs>('AIRun', AIRunSchema);
