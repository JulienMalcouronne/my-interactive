import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { parseTokens } from './parseTokens';

describe('parseTokens', () => {
  test('extracts name, value and section from single-line comments', () => {
    const css = `
      /* Grays */
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      /* Brand */
      --green-600: #16a34a;
    `;
    expect(parseTokens(css)).toEqual([
      { name: '--gray-100', value: '#f3f4f6', section: 'Grays' },
      { name: '--gray-200', value: '#e5e7eb', section: 'Grays' },
      { name: '--green-600', value: '#16a34a', section: 'Brand' },
    ]);
  });

  test('keeps the first definition (light wins over the dark override)', () => {
    const css = `
      /* Brand */
      --accent: var(--green-600);
      :root[data-theme='dark'] {
        --accent: var(--green-400);
      }
    `;
    const tokens = parseTokens(css);
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toEqual({ name: '--accent', value: 'var(--green-600)', section: 'Brand' });
  });

  test('ignores multi-line banner comments as section labels', () => {
    const css = `
      /* ============================
         Design tokens banner
         ============================ */
      --background: #ffffff;
    `;
    expect(parseTokens(css)).toEqual([{ name: '--background', value: '#ffffff', section: '' }]);
  });

  test('captures color-mix and var values', () => {
    const css = `/* Surfaces */\n--overlay: color-mix(in srgb, var(--black) 60%, transparent);`;
    expect(parseTokens(css)[0].value).toBe('color-mix(in srgb, var(--black) 60%, transparent)');
  });

  test('the real globals.css parses and contains the core tokens', () => {
    const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
    const names = parseTokens(css).map((t) => t.name);
    for (const expected of ['--green-600', '--surface', '--accent', '--radius', '--space-4']) {
      expect(names).toContain(expected);
    }
  });
});
