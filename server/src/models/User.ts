import { Schema, model, type HydratedDocument } from 'mongoose';

export interface UserAttrs {
  name: string;
  email: string;
  passwordHash: string;
  /** SHA-256 of an outstanding password-reset token (never the token itself). */
  resetTokenHash?: string;
  resetTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserAttrs>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 254 },
    passwordHash: { type: String, required: true },
    resetTokenHash: { type: String, index: true, sparse: true },
    resetTokenExpiresAt: { type: Date },
  },
  { timestamps: true },
);

export const User = model<UserAttrs>('User', UserSchema);
export type UserDoc = HydratedDocument<UserAttrs>;

export const publicUser = (u: UserDoc) => ({ id: String(u._id), name: u.name, email: u.email, createdAt: u.createdAt });
