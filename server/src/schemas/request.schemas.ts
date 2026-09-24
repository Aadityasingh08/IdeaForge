import { z } from 'zod';
import { CHALLENGE_TARGETS } from './ai.schemas';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'must be a valid project id');
const idea = z.string().trim().min(1, 'Tell us a little about your idea first.').max(2000);

export const CreateProjectBody = z.object({ rawIdea: idea });

export const PatchProjectBody = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    shared: z.boolean().optional(),
    edits: z.array(z.object({ path: z.string().max(80), value: z.unknown() })).max(20).optional(),
    accept: z.array(z.string().max(80)).max(20).optional(),
  })
  .strict();

export const ProjectIdBody = z.object({ projectId: objectId });

export const UnderstandBody = z.object({ projectId: objectId, rawIdea: idea.optional() });

export const StrategyBody = z.object({
  projectId: objectId,
  section: z.enum(['positioning', 'personality', 'naming', 'messaging']).optional(),
  mode: z.enum(['regenerate', 'fill']).optional(),
});

const challengeRef = z.union([z.string().uuid(), z.literal('direction')]);

export const ApplyBody = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('accept'),
    projectId: objectId,
    recommendation: z.object({
      challengeId: z.string().uuid().optional(),
      source: z.enum(['issue', 'direction', 'alternative']),
      target: z.enum(CHALLENGE_TARGETS),
      value: z.string().max(600),
    }),
  }),
  z.object({ action: z.literal('keep_original'), projectId: objectId, challengeId: challengeRef }),
]);

export const AlternativesBody = z.object({ projectId: objectId, challengeId: challengeRef });

/** Anonymous per-browser owner id sent in the X-IdeaForge-Owner header. */
export const OwnerHeader = z.string().uuid();

// ---------- Accounts
const email = z.string().trim().toLowerCase().email('Enter a valid email address.').max(254);
export const password = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .max(128, 'Use at most 128 characters.')
  .refine((p) => /[a-z]/i.test(p) && /\d/.test(p), 'Include at least one letter and one number.');

export const SignupBody = z.object({ name: z.string().trim().min(1, 'Tell us your name.').max(60), email, password, remember: z.boolean().optional() });
export const LoginBody = z.object({ email, password: z.string().min(1, 'Enter your password.').max(128), remember: z.boolean().optional() });
export const ForgotBody = z.object({ email });
export const ResetBody = z.object({ token: z.string().min(20).max(200), password });
export const ProfileBody = z.object({ name: z.string().trim().min(1).max(60) });
export const ChangePasswordBody = z.object({ current: z.string().min(1).max(128), next: password });
export const DeleteAccountBody = z.object({ password: z.string().min(1).max(128) });
