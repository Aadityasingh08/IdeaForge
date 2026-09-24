import { Schema, model, Types } from 'mongoose';

/**
 * A login session. The browser holds a random token in an httpOnly cookie;
 * only its SHA-256 hash is stored, so a database leak cannot be replayed.
 */
export interface SessionAttrs {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  createdAt: Date;
  lastSeenAt: Date;
}

const SessionSchema = new Schema<SessionAttrs>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    // MongoDB removes expired sessions automatically.
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    userAgent: { type: String, maxlength: 300 },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Session = model<SessionAttrs>('Session', SessionSchema);
