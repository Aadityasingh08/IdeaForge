import { describe, expect, it } from 'vitest';
import bcrypt from 'bcryptjs';
import { LoginBody, SignupBody, password } from '../src/schemas/request.schemas';
import { hashPassword, sha256 } from '../src/services/auth.service';

describe('account validation', () => {
  it.each([
    ['short1', false],
    ['onlyletters', false],
    ['12345678', false],
    ['forge2026ok', true],
  ])('password “%s” valid=%s', (pw, valid) => {
    expect(password.safeParse(pw).success).toBe(valid);
  });

  it('normalises emails so logins are case-insensitive', () => {
    const parsed = SignupBody.parse({ name: ' Bhawna ', email: '  Bhawna@Example.COM ', password: 'forge2026ok' });
    expect(parsed.email).toBe('bhawna@example.com');
    expect(parsed.name).toBe('Bhawna');
  });

  it('rejects malformed emails', () => {
    expect(LoginBody.safeParse({ email: 'not-an-email', password: 'x' }).success).toBe(false);
  });
});

describe('credential storage', () => {
  it('stores bcrypt hashes, never the password', async () => {
    const hash = await hashPassword('forge2026ok');
    expect(hash).not.toContain('forge2026ok');
    expect(hash.startsWith('$2')).toBe(true);
    expect(await bcrypt.compare('forge2026ok', hash)).toBe(true);
    expect(await bcrypt.compare('wrong', hash)).toBe(false);
  });

  it('stores only a SHA-256 digest of session and reset tokens', () => {
    expect(sha256('token')).toMatch(/^[a-f0-9]{64}$/);
    expect(sha256('token')).toBe(sha256('token'));
  });
});
