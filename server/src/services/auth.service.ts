import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { User, type UserDoc } from '../models/User';
import { Session } from '../models/Session';
import { Project } from '../models/Project';
import { AIRun } from '../models/AIRun';
import { ProjectVersion } from '../models/ProjectVersion';
import { authConfig } from '../config/env';
import { ApiError } from '../utils/http';
import { logger } from '../utils/logger';

const BCRYPT_COST = 12;
// Compared against when an email is unknown so login timing does not reveal which accounts exist.
const DUMMY_HASH = bcrypt.hashSync('ideaforge-timing-guard', BCRYPT_COST);

export const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const newToken = () => randomBytes(32).toString('base64url');

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_COST);

// ---------------------------------------------------------------- sessions

export async function startSession(res: Response, req: Request, user: UserDoc, remember: boolean) {
  const token = newToken();
  const days = remember ? authConfig.rememberDays : authConfig.sessionDays;
  const expiresAt = new Date(Date.now() + days * 86_400_000);
  await Session.create({ userId: user._id, tokenHash: sha256(token), expiresAt, userAgent: req.header('user-agent')?.slice(0, 300) });
  res.cookie(authConfig.cookieName, token, {
    httpOnly: true, // not readable by JavaScript
    secure: authConfig.secure,
    sameSite: authConfig.sameSite,
    path: '/',
    // "Remember me" persists across browser restarts; otherwise it is a browser-session cookie.
    ...(remember ? { expires: expiresAt } : {}),
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(authConfig.cookieName, { httpOnly: true, secure: authConfig.secure, sameSite: authConfig.sameSite, path: '/' });
}

/** Resolves the session cookie to a user. Expired or revoked sessions are ignored. */
export async function userFromRequest(req: Request): Promise<{ user: UserDoc; hash: string } | null> {
  const token = req.cookies?.[authConfig.cookieName];
  if (typeof token !== 'string' || token.length < 20) return null;
  const hash = sha256(token);
  const session = await Session.findOne({ tokenHash: hash, expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const user = await User.findById(session.userId);
  if (!user) return null;
  if (Date.now() - session.lastSeenAt.getTime() > 5 * 60_000) {
    session.lastSeenAt = new Date();
    await session.save();
  }
  return { user, hash };
}

// ---------------------------------------------------------------- accounts

/** Moves projects made before signing in (this browser's anonymous id) into the account. */
async function claimProjects(userId: string, anonymousOwner?: string) {
  if (anonymousOwner) await Project.updateMany({ ownerId: anonymousOwner }, { $set: { ownerId: userId } });
}

export async function signup(input: { name: string; email: string; password: string }, anonymousOwner?: string) {
  const email = input.email.toLowerCase();
  if (await User.exists({ email })) {
    throw new ApiError(409, 'VALIDATION_ERROR', 'An account with this email already exists. Try logging in.');
  }
  const user = await User.create({ name: input.name, email, passwordHash: await hashPassword(input.password) });
  await claimProjects(String(user._id), anonymousOwner);
  return user;
}

export async function login(input: { email: string; password: string }, anonymousOwner?: string) {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  const ok = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw new ApiError(401, 'UNAUTHORIZED', 'Incorrect email or password.');
  await claimProjects(String(user._id), anonymousOwner);
  return user;
}

export async function logout(sessionHash?: string) {
  if (sessionHash) await Session.deleteOne({ tokenHash: sessionHash });
}

export async function logoutEverywhere(user: UserDoc) {
  await Session.deleteMany({ userId: user._id });
}

export async function changePassword(user: UserDoc, current: string, next: string, keepSessionHash?: string) {
  if (!(await bcrypt.compare(current, user.passwordHash))) throw new ApiError(400, 'VALIDATION_ERROR', 'Your current password is incorrect.');
  user.passwordHash = await hashPassword(next);
  await user.save();
  // Every other device is signed out.
  await Session.deleteMany({ userId: user._id, tokenHash: { $ne: keepSessionHash } });
}

export async function deleteAccount(user: UserDoc, password: string) {
  if (!(await bcrypt.compare(password, user.passwordHash))) throw new ApiError(400, 'VALIDATION_ERROR', 'Password is incorrect.');
  const projects = await Project.find({ ownerId: String(user._id) }, { _id: 1 }).lean();
  const ids = projects.map((p) => p._id);
  await Promise.all([
    AIRun.deleteMany({ projectId: { $in: ids } }),
    ProjectVersion.deleteMany({ projectId: { $in: ids } }),
    Project.deleteMany({ _id: { $in: ids } }),
    Session.deleteMany({ userId: user._id }),
  ]);
  await User.deleteOne({ _id: user._id });
}

// ---------------------------------------------------------------- password reset

/**
 * Creates a one-time reset link valid for 30 minutes. No email service is configured,
 * so the link is written to the server log. The response is identical whether or not
 * the email exists, so it cannot be used to discover accounts.
 */
export async function requestPasswordReset(email: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return;
  const token = newToken();
  user.resetTokenHash = sha256(token);
  user.resetTokenExpiresAt = new Date(Date.now() + 30 * 60_000);
  await user.save();
  logger.info(`Password reset link for ${user.email} (connect an email service to send this): ${authConfig.appUrl}/reset-password?token=${token}`);
}

export async function resetPassword(token: string, password: string) {
  const user = await User.findOne({ resetTokenHash: sha256(token), resetTokenExpiresAt: { $gt: new Date() } });
  if (!user) throw new ApiError(400, 'VALIDATION_ERROR', 'This reset link is invalid or has expired. Request a new one.');
  user.passwordHash = await hashPassword(password);
  user.resetTokenHash = undefined;
  user.resetTokenExpiresAt = undefined;
  await user.save();
  await Session.deleteMany({ userId: user._id });
  return user;
}
