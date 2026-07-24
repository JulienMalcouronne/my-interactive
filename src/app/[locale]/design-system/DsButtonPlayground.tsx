'use client';

import { useState } from 'react';
import Button from '@/components/global/button/button';
import styles from './page.module.css';

const COLORS = ['green', 'blue', 'red', 'default'] as const;
type Color = (typeof COLORS)[number];

// A tiny Storybook-lite playground: tweak the Button props and see it live.
export default function DsButtonPlayground() {
  const [bgColor, setBgColor] = useState<Color>('green');
  const [disabled, setDisabled] = useState(false);
  const [label, setLabel] = useState('Button');

  const text = label || 'Button';
  const code = `<Button bgColor="${bgColor}"${disabled ? ' disabled' : ''}>${text}</Button>`;

  return (
    <div className={styles.playground}>
      <div className={styles.controls}>
        <label className={styles.control}>
          bgColor
          <select
            className={styles.field}
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value as Color)}
          >
            {COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.control}>
          label
          <input
            className={styles.field}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>
        <label className={styles.controlCheck}>
          <input
            type="checkbox"
            checked={disabled}
            onChange={(e) => setDisabled(e.target.checked)}
          />
          disabled
        </label>
      </div>

      <div className={styles.playgroundPreview}>
        <Button bgColor={bgColor} disabled={disabled} onClick={() => {}}>
          {text}
        </Button>
      </div>

      <code className={styles.playgroundCode}>{code}</code>
    </div>
  );
}
