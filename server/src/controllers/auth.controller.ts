import type { Request, Response } from 'express';
import { ok, parseBody } from '../utils/http';
import { publicUser } from '../models/User';
import { OwnerHeader, ChangePasswordBody, DeleteAccountBody, ForgotBody, LoginBody, ProfileBody, ResetBody, SignupBody } from '../schemas/request.schemas';
import * as auth from '../services/auth.service';

/** The anonymous browser id, if sent — used once to move pre-login projects into the account. */
const anonymousOwner = (req: Request) => {
  const parsed = OwnerHeader.safeParse(req.header('x-ideaforge-owner'));
  return parsed.success ? parsed.data : undefined;
};

export const authController = {
  async signup(req: Request, res: Response) {
    const body = parseBody(SignupBody, req.body);
    const user = await auth.signup(body, anonymousOwner(req));
    await auth.startSession(res, req, user, body.remember ?? true);
    ok(res, publicUser(user), 201);
  },

  async login(req: Request, res: Response) {
    const body = parseBody(LoginBody, req.body);
    const user = await auth.login(body, anonymousOwner(req));
    await auth.startSession(res, req, user, body.remember ?? false);
    ok(res, publicUser(user));
  },

  async logout(req: Request, res: Response) {
    await auth.logout(req.sessionHash);
    auth.clearSessionCookie(res);
    ok(res, { loggedOut: true });
  },

  async logoutAll(req: Request, res: Response) {
    await auth.logoutEverywhere(req.user!);
    auth.clearSessionCookie(res);
    ok(res, { loggedOut: true });
  },

  async me(req: Request, res: Response) {
    ok(res, req.user ? publicUser(req.user) : null);
  },

  async updateProfile(req: Request, res: Response) {
    const { name } = parseBody(ProfileBody, req.body);
    req.user!.name = name;
    await req.user!.save();
    ok(res, publicUser(req.user!));
  },

  async changePassword(req: Request, res: Response) {
    const body = parseBody(ChangePasswordBody, req.body);
    await auth.changePassword(req.user!, body.current, body.next, req.sessionHash);
    ok(res, { changed: true });
  },

  async deleteAccount(req: Request, res: Response) {
    const { password } = parseBody(DeleteAccountBody, req.body);
    await auth.deleteAccount(req.user!, password);
    auth.clearSessionCookie(res);
    ok(res, { deleted: true });
  },

  async forgot(req: Request, res: Response) {
    const { email } = parseBody(ForgotBody, req.body);
    await auth.requestPasswordReset(email);
    ok(res, { message: 'If an account exists for that email, a reset link is on its way.' });
  },

  async reset(req: Request, res: Response) {
    const body = parseBody(ResetBody, req.body);
    const user = await auth.resetPassword(body.token, body.password);
    await auth.startSession(res, req, user, false);
    ok(res, publicUser(user));
  },
};
