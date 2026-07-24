'use client';

import { useState } from 'react';
import styles from './page.module.css';

interface Token {
  name: string;
  value: string;
}

// Click a swatch to copy its `var(--token)` reference to the clipboard.
export default function DsSwatches({ tokens, semantic }: { tokens: Token[]; semantic?: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (name: string) => {
    navigator.clipboard
      ?.writeText(`var(${name})`)
      .then(() => {
        setCopied(name);
        setTimeout(() => setCopied((c) => (c === name ? null : c)), 1200);
      })
      .catch(() => {});
  };

  return (
    <div className={styles.swatchGrid}>
      {tokens.map((tk) => (
        <button
          key={tk.name}
          type="button"
          className={styles.swatch}
          onClick={() => copy(tk.name)}
          title={`Copy var(${tk.name})`}
        >
          <span
            className={styles.chip}
            style={{ background: semantic ? `var(${tk.name})` : tk.value }}
          />
          <span className={styles.swatchMeta}>
            <span className={styles.swatchName}>{copied === tk.name ? '✓ copied' : tk.name}</span>
            {!semantic && <span className={styles.swatchHex}>{tk.value}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
