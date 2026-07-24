// Parses CSS custom properties out of a stylesheet so the design-system page
// can document them straight from the source — it never drifts from globals.css.

export interface CssToken {
  name: string; // e.g. "--green-600"
  value: string; // e.g. "#16a34a", "var(--white)", "color-mix(…)"
  section: string; // nearest single-line /* comment */ label above it
}

const TOKEN_RE = /\/\*+\s*([^*]+?)\s*\*+\/|(--[\w-]+)\s*:\s*([^;]+);/g;

export function parseTokens(css: string): CssToken[] {
  const tokens: CssToken[] = [];
  const seen = new Set<string>();
  let section = '';

  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(css))) {
    if (match[1] !== undefined) {
      // Only single-line comments act as section labels (skip banner blocks).
      if (!match[0].includes('\n')) section = match[1].trim();
    } else if (match[2] && !seen.has(match[2])) {
      // First definition wins, so light values are kept over their dark overrides.
      seen.add(match[2]);
      tokens.push({ name: match[2], value: match[3].trim(), section });
    }
  }

  return tokens;
}
