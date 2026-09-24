import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { AIOutputError, validateOutput } from '../src/ai/providers/AIProvider';
import { VisualSchema } from '../src/schemas/ai.schemas';
import { EDITABLE_FIELDS, getPath, setPath, touch } from '../src/services/brandDNA.service';
import { emptyBrandDNA } from '../src/types/brandDNA';

describe('AI output validation', () => {
  const schema = z.object({ tagline: z.string().min(1) });

  it('accepts JSON wrapped in markdown fences', () => {
    expect(validateOutput(schema, '```json\n{"tagline":"Hi"}\n```')).toEqual({ tagline: 'Hi' });
  });

  it('rejects non-JSON with a repairable error', () => {
    expect(() => validateOutput(schema, 'Sure! Here is your tagline.')).toThrow(AIOutputError);
  });

  it('lists every schema problem so the repair prompt can fix them', () => {
    try {
      validateOutput(VisualSchema, JSON.stringify({ colors: [{ name: 'Teal', hex: 'teal', usage: 'x' }] }));
      expect.unreachable();
    } catch (err) {
      const issues = (err as AIOutputError).issues.join('\n');
      expect(issues).toMatch(/colors/);
      expect(issues).toMatch(/typography/);
    }
  });
});

describe('BrandDNA editing', () => {
  it('creates a blank section so “Continue manually” works', () => {
    const dna = emptyBrandDNA('An idea about things');
    setPath(dna, 'positioning.valueProposition', 'Manual value');
    expect(getPath(dna, 'positioning.valueProposition')).toBe('Manual value');
    expect(dna.positioning?.category).toBe('');
  });

  it('only allows whitelisted fields with valid values', () => {
    expect(EDITABLE_FIELDS['visual.colors']).toBeUndefined();
    expect(EDITABLE_FIELDS['logo.concept'].safeParse('spark').success).toBe(true);
    expect(EDITABLE_FIELDS['logo.concept'].safeParse('clipart').success).toBe(false);
    expect(EDITABLE_FIELDS['naming.selectedName'].safeParse('').success).toBe(false);
  });

  it('records when a section changes', () => {
    const dna = emptyBrandDNA('An idea about things');
    touch(dna, 'messaging.tagline');
    touch(dna, 'challenges');
    expect(dna.meta?.updatedAt.messaging).toBeTruthy();
    expect(Object.keys(dna.meta!.updatedAt)).toEqual(['messaging']);
  });
});
