import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { contrastRatio, wcagLevel } from '@/lib/contrast';
import { parseTokens } from '@/lib/parseTokens';
import DsButtons from './DsButtons';
import DsButtonPlayground from './DsButtonPlayground';
import DsSwatches from './DsSwatches';
import styles from './page.module.css';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t('designSystem') };
}

// Documented straight from the source of truth — never drifts from globals.css.
const TOKENS = parseTokens(readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8'));

const primitives = TOKENS.filter((t) => t.value.startsWith('#'));
const semantic = TOKENS.filter(
  (t) => t.value.startsWith('var(') || t.value.startsWith('color-mix')
);
const spacing = TOKENS.filter((t) => t.name.startsWith('--space-'));
const radii = TOKENS.filter((t) => t.name.startsWith('--radius'));
const shadows = TOKENS.filter((t) => t.name.startsWith('--shadow-'));
const fonts = TOKENS.filter((t) => t.name.startsWith('--font-'));
const motion = TOKENS.filter(
  (t) => t.name.startsWith('--duration-') || t.name.startsWith('--ease')
);

const primitiveSections = [...new Set(primitives.map((t) => t.section))];

const SCALE = ['2.25rem', '1.5rem', '1.25rem', '1rem', '0.875rem', '0.75rem'];

const CONTRAST: { theme: string; fg: string; bg: string; label: string }[] = [
  { theme: 'light', fg: '#171717', bg: '#ffffff', label: '--foreground / --surface' },
  { theme: 'light', fg: '#6b7280', bg: '#ffffff', label: '--text-subtle / --surface' },
  { theme: 'light', fg: '#ffffff', bg: '#16a34a', label: 'white / --green-600' },
  { theme: 'dark', fg: '#ededed', bg: '#0f172a', label: '--foreground / --surface' },
  { theme: 'dark', fg: '#cbd5e1', bg: '#0f172a', label: '--surface-text / --surface' },
];

export default async function DesignSystemPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('designSystem')}</h1>
        <p className={styles.intro}>{t('dsIntro')}</p>
      </header>

      {/* Base palette */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('dsPalette')}</h2>
        {primitiveSections.map((section) => (
          <div key={section || 'base'}>
            <p className={styles.groupLabel}>{section || 'base'}</p>
            <DsSwatches tokens={primitives.filter((tk) => tk.section === section)} />
          </div>
        ))}
      </section>

      {/* Semantic tokens */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('dsSemantic')}</h2>
        <p className={styles.note}>{t('dsSemanticNote')}</p>
        <DsSwatches tokens={semantic} semantic />
      </section>

      {/* Contrast */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('dsContrast')}</h2>
        <div className={styles.contrastGrid}>
          {CONTRAST.map((pair) => {
            const ratio = contrastRatio(pair.fg, pair.bg);
            const level = wcagLevel(ratio);
            return (
              <div key={pair.theme + pair.label} className={styles.contrastCard}>
                <div
                  className={styles.contrastSample}
                  style={{ background: pair.bg, color: pair.fg }}
                >
                  Aa · {ratio.toFixed(2)}:1
                </div>
                <div className={styles.contrastMeta}>
                  <span className={styles.contrastPair}>
                    {pair.theme} · {pair.label}
                  </span>
                  <span className={styles.wcag} data-level={level}>
                    {level}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Typography */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('dsTypography')}</h2>
        <div className={styles.fontRow}>
          {fonts.map((font) => (
            <div
              key={font.name}
              className={`${styles.fontCard} ${font.name === '--font-mono' ? styles.fontMono : styles.fontSans}`}
            >
              <div className={styles.fontSample}>Aa Bb Cc 123</div>
              <div className={styles.fontStack}>{font.name}</div>
            </div>
          ))}
        </div>

        <p className={styles.groupLabel}>{t('dsScale')}</p>
        {SCALE.map((size) => (
          <div key={size} className={styles.scaleRow}>
            <span className={styles.scaleLabel}>{size}</span>
            <span className={styles.scaleSample} style={{ fontSize: size }}>
              Design System
            </span>
          </div>
        ))}
      </section>

      {/* Spacing */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('dsSpacing')}</h2>
        <div className={styles.spaceCol}>
          {spacing.map((tk) => (
            <div key={tk.name} className={styles.spaceItem}>
              <span className={styles.spaceBar} style={{ width: tk.value }} />
              <span className={styles.spaceMeta}>
                {tk.name} · {tk.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Radii, shadows, motion */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('dsRadii')}</h2>
        <div className={styles.boxRow}>
          {radii.map((tk) => (
            <div key={tk.name} className={styles.boxItem}>
              <div className={styles.radiusBox} style={{ borderRadius: tk.value }} />
              <div className={styles.boxLabel}>
                {tk.name} · {tk.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('dsShadows')}</h2>
        <div className={styles.boxRow}>
          {shadows.map((tk) => (
            <div key={tk.name} className={styles.boxItem}>
              <div className={styles.shadowBox} style={{ boxShadow: tk.value }} />
              <div className={styles.boxLabel}>{tk.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('dsMotion')}</h2>
        <div className={styles.boxRow}>
          <div className={styles.boxItem}>
            <div className={styles.motionDemo}>{t('dsMotionHover')}</div>
            <div className={styles.boxLabel}>--duration-base · --ease</div>
          </div>
          <div className={styles.spaceCol} style={{ justifyContent: 'center' }}>
            {motion.map((tk) => (
              <span key={tk.name} className={styles.spaceMeta}>
                {tk.name} · {tk.value}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Components */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('dsComponents')}</h2>

        <div className={styles.compBlock}>
          <p className={styles.compTitle}>{t('dsButtons')}</p>
          <DsButtons />
        </div>

        <div className={styles.compBlock}>
          <p className={styles.compTitle}>{t('dsStates')}</p>
          <div className={styles.stateRow}>
            {[
              ['normal', styles.stateBtn],
              ['hover', `${styles.stateBtn} ${styles.stateBtnHover}`],
              ['focus', `${styles.stateBtn} ${styles.stateBtnFocus}`],
              ['disabled', `${styles.stateBtn} ${styles.stateBtnDisabled}`],
            ].map(([label, cls]) => (
              <div key={label} className={styles.stateItem}>
                <div className={cls}>Button</div>
                <div className={styles.boxLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.compBlock}>
          <p className={styles.compTitle}>{t('dsPlayground')}</p>
          <DsButtonPlayground />
        </div>

        <div className={styles.compBlock}>
          <p className={styles.compTitle}>{t('dsFields')}</p>
          <div className={styles.compRow}>
            <input
              className={styles.field}
              type="text"
              defaultValue="Text input"
              aria-label="Text input"
            />
            <select className={styles.field} aria-label="Select" defaultValue="a">
              <option value="a">Select option</option>
            </select>
          </div>
        </div>

        <div className={styles.compBlock}>
          <p className={styles.compTitle}>{t('dsBadges')}</p>
          <div className={styles.compRow}>
            <span className={styles.badge}>
              <span style={{ color: 'var(--accent)' }}>●</span> Badge
            </span>
            <span className={styles.tag}>Next.js</span>
            <span className={styles.tag}>TypeScript</span>
            <span className={styles.tag}>PostgreSQL</span>
          </div>
        </div>

        <div className={styles.compBlock}>
          <p className={styles.compTitle}>{t('dsDualTheme')}</p>
          <div className={styles.previewRow}>
            {[styles.previewLight, styles.previewDark].map((themeCls, i) => (
              <div key={i} className={themeCls}>
                <div className={styles.previewCard}>
                  <span className={styles.previewTag}>{i === 0 ? 'light' : 'dark'}</span>
                  <p className={styles.previewTitle}>
                    <span className={styles.previewDot} /> Surface card
                  </p>
                  <p className={styles.previewText}>
                    --surface · --foreground · --accent · --surface-border
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
