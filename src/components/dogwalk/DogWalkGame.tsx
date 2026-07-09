'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  DOGS,
  SOCIABILITY_MAX,
  UPGRADE_MAX,
  canBuy,
  collectionRadius,
  collide,
  getLevelConfig,
  isWalkComplete,
  isWalkOver,
  nearMissReward,
  nextDogIndex,
  payout,
  sociabilityDecay,
  upgradeCost,
  type DogBreed,
  type EntityKind,
  type LevelConfig,
  type UpgradeState,
  type WalkStats,
} from '@/lib';
import { useUser } from '@/components/global/UserProvider';
import { sfx, setSfxMuted } from './sfx';
import styles from './DogWalkGame.module.css';

type Phase = 'intro' | 'playing' | 'paid' | 'gameover';

interface Entity {
  id: number;
  kind: EntityKind;
  x: number; // normalized 0..1
  y: number; // px
  born: number; // elapsed seconds at spawn (for boss movement)
  missed?: boolean; // near-miss already rewarded
}

interface Pop {
  x: number;
  y: number;
  text: string;
  color: string;
  t: number;
}

interface GameRef {
  entities: Entity[];
  pops: Pop[];
  nextId: number;
  spawnTimer: number;
  elapsed: number;
  stats: WalkStats;
  dogX: number;
  targetX: number;
  dog: DogBreed;
  cfg: LevelConfig | null;
  upgrades: UpgradeState;
  immuneUntil: number;
  slowUntil: number;
  comboUntil: number;
  shakeT: number;
  bestCombo: number;
  running: boolean;
  raf: number;
  lastTs: number;
  frame: number;
  w: number;
  h: number;
}

const EMOJI: Record<EntityKind, string> = {
  poop: '💩',
  treat: '🦴',
  niceDog: '🐕',
  meanDog: '😡',
  catcher: '🚓',
  ball: '🎾',
  bag: '🛍️',
  goldenBone: '🌟',
};

const ENTITY_R = 22;
const CATCHER_R = 34;
const DOG_R = 26;
const DOG_Y_RATIO = 0.82;
const PATH_LEFT = 0.16;
const PATH_RIGHT = 0.84;
const SHAKE_DURATION = 0.25;
const POP_LIFETIME = 0.9;

const emptyHud = {
  sociability: 0,
  money: 0,
  combo: 0,
  immune: false,
  slow: false,
  comboActive: false,
};

const pushPop = (g: GameRef, x: number, y: number, text: string, color: string) => {
  g.pops.push({ x, y, text, color, t: 0 });
};

export default function DogWalkGame() {
  const t = useTranslations();
  const { bumpScore } = useUser();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [dogIndex, setDogIndex] = useState(0);
  const [level, setLevel] = useState(1);
  const [earned, setEarned] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [top, setTop] = useState<{ name: string; best_walk: number }[]>([]);
  const [lastPayout, setLastPayout] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  // Wallet and upgrades live in ONE state so a purchase is a single pure,
  // atomic transition — side effects inside setState updaters get
  // double-invoked by StrictMode and previously double-charged the wallet.
  const [shop, setShop] = useState<{ wallet: number; upgrades: UpgradeState }>({
    wallet: 0,
    upgrades: { leash: 0, calm: 0 },
  });
  const [hud, setHud] = useState(emptyHud);

  const dog = DOGS[dogIndex];
  const earnedRef = useRef(0);
  useEffect(() => {
    earnedRef.current = earned;
  }, [earned]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dogwalk-muted') === '1';
      setMuted(stored);
      setSfxMuted(stored);
    } catch {
      // storage unavailable — keep sound on
    }
  }, []);

  const game = useRef<GameRef>({
    entities: [],
    pops: [],
    nextId: 1,
    spawnTimer: 0,
    elapsed: 0,
    stats: { sociability: 0, money: 0, treats: 0, combo: 0 },
    dogX: 0.5,
    targetX: 0.5,
    dog: DOGS[0],
    cfg: null,
    upgrades: { leash: 0, calm: 0 },
    immuneUntil: 0,
    slowUntil: 0,
    comboUntil: 0,
    shakeT: 0,
    bestCombo: 0,
    running: false,
    raf: 0,
    lastTs: 0,
    frame: 0,
    w: 0,
    h: 0,
  });

  const endLevel = useCallback(() => {
    const g = game.current;
    g.running = false;
    cancelAnimationFrame(g.raf);
    const pay = payout(g.stats, g.cfg!.level);
    setLastPayout(pay);
    setShop((s) => ({ ...s, wallet: s.wallet + pay }));
    setEarned((e) => e + pay);
    bumpScore(pay); // feed the global leaderboard score
    sfx.win();
    setPhase('paid');
  }, [bumpScore]);

  const endGame = useCallback(async () => {
    const g = game.current;
    g.running = false;
    cancelAnimationFrame(g.raf);
    setBestCombo(g.bestCombo);
    setPhase('gameover');
    sfx.over();
    try {
      const res = await fetch('/api/dog-walk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: earnedRef.current }),
      });
      if (res.ok) setBest((await res.json()).best);
      const topRes = await fetch('/api/dog-walk');
      if (topRes.ok) setTop(await topRes.json());
    } catch {
      // best-effort high-score persistence
    }
  }, []);

  const loop = useCallback(
    (ts: number) => {
      const g = game.current;
      const canvas = canvasRef.current;
      if (!g.running || !canvas || !g.cfg) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(rect.width * dpr))
        canvas.width = Math.round(rect.width * dpr);
      if (canvas.height !== Math.round(rect.height * dpr))
        canvas.height = Math.round(rect.height * dpr);
      g.w = rect.width;
      g.h = rect.height;

      const dt = g.lastTs ? Math.min(0.05, (ts - g.lastTs) / 1000) : 0;
      g.lastTs = ts;
      g.elapsed += dt;

      const immune = g.elapsed < g.immuneUntil;
      const comboActive = g.elapsed < g.comboUntil;
      const slow = g.elapsed < g.slowUntil;

      const ramp = 1 + Math.min(g.elapsed / 45, 1) * 0.6;
      const speed = g.cfg.speed * ramp * (slow ? 0.5 : 1);

      g.targetX = Math.max(PATH_LEFT, Math.min(PATH_RIGHT, g.targetX));
      g.dogX += (g.targetX - g.dogX) * Math.min(1, dt * 12);

      g.spawnTimer += dt * 1000;
      if (g.spawnTimer >= g.cfg.spawnInterval) {
        g.spawnTimer = 0;
        let kind: EntityKind;
        if (g.cfg.hasBoss && Math.random() < 0.07) {
          kind = 'catcher';
        } else {
          const r = Math.random();
          if (r < 0.4) kind = 'treat';
          else if (r < 0.66) kind = 'poop';
          else if (r < 0.76) {
            const p = Math.random();
            kind = p < 0.4 ? 'ball' : p < 0.7 ? 'bag' : 'goldenBone';
          } else kind = Math.random() < g.cfg.meanDogChance ? 'meanDog' : 'niceDog';
        }
        g.entities.push({
          id: g.nextId++,
          kind,
          x: PATH_LEFT + Math.random() * (PATH_RIGHT - PATH_LEFT),
          y: -30,
          born: g.elapsed,
        });
      }

      const dogYpx = g.h * DOG_Y_RATIO;
      const dogXpx = g.dogX * g.w;
      const dogR = collectionRadius(DOG_R, g.upgrades.leash);
      const kept: Entity[] = [];
      for (const e of g.entities) {
        const prevY = e.y;
        e.y += speed * dt;
        if (e.kind === 'catcher') {
          e.x = 0.5 + Math.sin((g.elapsed - e.born) * 1.8) * (PATH_RIGHT - 0.5);
        }
        const entR = e.kind === 'catcher' ? CATCHER_R : ENTITY_R;
        const dx = e.x * g.w - dogXpx;
        const dy = e.y - dogYpx;

        if (dx * dx + dy * dy < (entR + dogR) ** 2) {
          const before = g.stats.sociability;
          const res = collide(e.kind, g.stats, g.dog, { immune, comboActive });
          g.stats = res.stats;
          if (g.stats.combo > g.bestCombo) g.bestCombo = g.stats.combo;

          const delta = Math.round(g.stats.sociability - before);
          if (res.powerUp) {
            if (res.powerUp === 'slow') g.slowUntil = g.elapsed + 3.5;
            if (res.powerUp === 'immunity') g.immuneUntil = g.elapsed + 4;
            if (res.powerUp === 'combo') g.comboUntil = g.elapsed + 6;
            pushPop(g, e.x * g.w, e.y, EMOJI[e.kind], '#f59e0b');
            sfx.power();
          } else if (delta > 0) {
            pushPop(g, e.x * g.w, e.y, `+${delta}`, '#16a34a');
            sfx.treat();
          } else if (delta < 0) {
            pushPop(g, e.x * g.w, e.y, `${delta}`, '#dc2626');
            g.shakeT = SHAKE_DURATION;
            sfx.bad();
          } else {
            pushPop(g, e.x * g.w, e.y, '🛡️', '#16a34a'); // poop blocked by the bag
          }
          continue;
        }

        // Near miss: a poop crossed the dog's line close by without hitting.
        if (
          e.kind === 'poop' &&
          !e.missed &&
          prevY <= dogYpx &&
          e.y > dogYpx &&
          Math.abs(dx) < entR + dogR + 34
        ) {
          e.missed = true;
          g.stats = nearMissReward(g.stats);
          pushPop(g, dogXpx, dogYpx - 44, '😅 +2', '#f59e0b');
        }

        if (e.y < g.h + 40) kept.push(e);
      }
      g.entities = kept;

      // Check for completion right after collisions, before decay shaves the
      // gauge back down — otherwise a treat that fills it to exactly 100 would
      // never be seen at the cap by the check below.
      if (isWalkComplete(g.stats.sociability)) return endLevel();

      // The gauge drains over time — stay active to keep it climbing.
      g.stats = {
        ...g.stats,
        sociability: Math.max(0, g.stats.sociability - sociabilityDecay(g.cfg.level) * dt),
      };

      // Render
      const ctx = canvas.getContext('2d');
      if (ctx) {
        let ox = 0;
        let oy = 0;
        if (g.shakeT > 0) {
          g.shakeT = Math.max(0, g.shakeT - dt);
          const magnitude = 7 * (g.shakeT / SHAKE_DURATION);
          ox = (Math.random() * 2 - 1) * magnitude;
          oy = (Math.random() * 2 - 1) * magnitude;
        }
        ctx.setTransform(dpr, 0, 0, dpr, ox * dpr, oy * dpr);
        ctx.fillStyle = g.cfg.zone.sky;
        ctx.fillRect(-10, -10, g.w + 20, g.h + 20);
        ctx.fillStyle = g.cfg.zone.ground;
        ctx.fillRect(PATH_LEFT * g.w, -10, (PATH_RIGHT - PATH_LEFT) * g.w, g.h + 20);

        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 4;
        ctx.setLineDash([20, 24]);
        ctx.lineDashOffset = -((g.elapsed * speed) % 44);
        ctx.beginPath();
        ctx.moveTo(g.w / 2, 0);
        ctx.lineTo(g.w / 2, g.h);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (const e of g.entities) {
          ctx.font = `${(e.kind === 'catcher' ? CATCHER_R : ENTITY_R) * 1.8}px serif`;
          ctx.fillText(EMOJI[e.kind], e.x * g.w, e.y);
        }
        // A shield ring while immune.
        if (immune) {
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(dogXpx, dogYpx, dogR + 6, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.font = `${DOG_R * 1.8}px serif`;
        ctx.fillText(g.dog.emoji, dogXpx, dogYpx);

        // Floating feedback popups.
        for (const p of g.pops) {
          p.t += dt;
          p.y -= 34 * dt;
        }
        g.pops = g.pops.filter((p) => p.t < POP_LIFETIME);
        ctx.font = '700 16px system-ui, sans-serif';
        for (const p of g.pops) {
          ctx.globalAlpha = Math.max(0, 1 - p.t / POP_LIFETIME);
          ctx.fillStyle = p.color;
          ctx.fillText(p.text, p.x, p.y);
        }
        ctx.globalAlpha = 1;
      }

      g.frame++;
      if (g.frame % 5 === 0) {
        setHud({
          sociability: g.stats.sociability,
          money: g.stats.money,
          combo: g.stats.combo,
          immune,
          slow,
          comboActive,
        });
      }

      if (isWalkOver(g.stats.sociability)) return void endGame();

      g.raf = requestAnimationFrame(loop);
    },
    [endGame, endLevel]
  );

  const start = useCallback(
    (lvl: number, dogI: number, ups: UpgradeState) => {
      const d = DOGS[dogI];
      const g = game.current;
      g.entities = [];
      g.pops = [];
      g.nextId = 1;
      g.spawnTimer = 0;
      g.elapsed = 0;
      g.stats = { sociability: d.startSociability, money: 0, treats: 0, combo: 0 };
      g.dogX = 0.5;
      g.targetX = 0.5;
      g.dog = d;
      g.upgrades = ups;
      g.cfg = getLevelConfig(lvl, d, ups);
      g.immuneUntil = 0;
      g.slowUntil = 0;
      g.comboUntil = 0;
      g.shakeT = 0;
      g.lastTs = 0;
      g.frame = 0;
      g.running = true;
      setPaused(false);
      setHud({ ...emptyHud, sociability: d.startSociability });
      setPhase('playing');
      g.raf = requestAnimationFrame(loop);
    },
    [loop]
  );

  const pause = useCallback(() => {
    const g = game.current;
    if (!g.running) return;
    g.running = false;
    cancelAnimationFrame(g.raf);
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    const g = game.current;
    if (g.running || !g.cfg) return;
    g.running = true;
    g.lastTs = 0;
    setPaused(false);
    g.raf = requestAnimationFrame(loop);
  }, [loop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') game.current.targetX -= 0.08;
      if (e.key === 'ArrowRight') game.current.targetX += 0.08;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'p' && e.key !== 'P') return;
      if (phase !== 'playing') return;
      if (paused) resume();
      else pause();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, paused, pause, resume]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden' && phase === 'playing' && !paused) pause();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [phase, paused, pause]);

  useEffect(() => {
    const g = game.current;
    return () => cancelAnimationFrame(g.raf);
  }, []);

  const onPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    game.current.targetX = (e.clientX - rect.left) / rect.width;
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setSfxMuted(next);
    try {
      localStorage.setItem('dogwalk-muted', next ? '1' : '0');
    } catch {
      // storage unavailable
    }
  };

  const buyUpgrade = (id: keyof UpgradeState) =>
    setShop((s) => {
      const currentLevel = s.upgrades[id];
      if (!canBuy(s.wallet, currentLevel)) return s;
      return {
        wallet: s.wallet - upgradeCost(currentLevel),
        upgrades: { ...s.upgrades, [id]: currentLevel + 1 },
      };
    });

  const startNextDog = () => {
    const lvl = level + 1;
    const di = nextDogIndex(dogIndex);
    setLevel(lvl);
    setDogIndex(di);
    start(lvl, di, shop.upgrades);
  };

  const restart = () => {
    setLevel(1);
    setDogIndex(0);
    setEarned(0);
    setBest(null);
    setTop([]);
    setShop({ wallet: 0, upgrades: { leash: 0, calm: 0 } });
    game.current.bestCombo = 0;
    setBestCombo(0);
    start(1, 0, { leash: 0, calm: 0 });
  };

  const socPercent = Math.round((hud.sociability / SOCIABILITY_MAX) * 100);
  const cfg = getLevelConfig(level, dog, shop.upgrades);

  return (
    <div className={styles.wrap}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onPointerMove={onPointer}
        onPointerDown={onPointer}
      />

      {phase === 'playing' && (
        <div className={styles.hud}>
          <div className={styles.hudRow}>
            <span className={styles.badge}>
              {t('hudLevel')} {level} {cfg.weather.emoji}
            </span>
            <span className={styles.badge}>
              {dog.emoji} {dog.name}
            </span>
            <span className={styles.badge}>💶 {hud.money}</span>
            {hud.combo > 1 && <span className={styles.combo}>🔥 x{hud.combo}</span>}
            <span className={styles.hudBtns}>
              <button
                className={styles.hudBtn}
                onClick={toggleMute}
                aria-label={muted ? t('unmute') : t('mute')}
              >
                {muted ? '🔇' : '🔊'}
              </button>
              <button className={styles.hudBtn} onClick={pause} aria-label={t('pause')}>
                ⏸
              </button>
            </span>
          </div>
          <div className={styles.socBar}>
            <div className={styles.socFill} style={{ width: `${socPercent}%` }} />
          </div>
          <div className={styles.powerRow}>
            {hud.immune && <span className={styles.power}>🛍️</span>}
            {hud.slow && <span className={styles.power}>🎾</span>}
            {hud.comboActive && <span className={styles.power}>🌟</span>}
          </div>
        </div>
      )}

      {phase === 'playing' && paused && (
        <div className={styles.overlay}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t('paused')}</h2>
            <button className={styles.button} onClick={resume}>
              {t('resume')}
            </button>
          </div>
        </div>
      )}

      {phase !== 'playing' && (
        <div className={styles.overlay}>
          <div className={styles.card}>
            {phase === 'intro' && (
              <>
                <h2 className={styles.cardTitle}>{t('dogWalkTitle')}</h2>
                <p className={styles.dogPreview}>
                  {dog.emoji} {dog.name}
                </p>
                <p className={styles.controls}>{t('dogWalkControls')}</p>
                <button
                  className={styles.button}
                  onClick={() => start(level, dogIndex, shop.upgrades)}
                >
                  {t('dogWalkStart')}
                </button>
              </>
            )}

            {phase === 'paid' && (
              <>
                <h2 className={styles.cardTitle}>{t('levelComplete')}</h2>
                <p className={styles.payout}>
                  +{lastPayout} 💶 · {t('wallet')} {shop.wallet} 💶
                </p>

                <div className={styles.shop}>
                  <p className={styles.shopTitle}>{t('shopTitle')}</p>
                  {(['leash', 'calm'] as const).map((id) => (
                    <button
                      key={id}
                      className={styles.shopItem}
                      disabled={!canBuy(shop.wallet, shop.upgrades[id])}
                      onClick={() => buyUpgrade(id)}
                    >
                      <span>
                        {id === 'leash' ? '🐾' : '🧘'}{' '}
                        {t(id === 'leash' ? 'upgradeLeash' : 'upgradeCalm')} ({shop.upgrades[id]}/
                        {UPGRADE_MAX})
                      </span>
                      <span>
                        {shop.upgrades[id] >= UPGRADE_MAX
                          ? '✔'
                          : `${upgradeCost(shop.upgrades[id])} 💶`}
                      </span>
                    </button>
                  ))}
                </div>

                <button className={styles.button} onClick={startNextDog}>
                  {t('nextDog')} ({DOGS[nextDogIndex(dogIndex)].emoji})
                </button>
              </>
            )}

            {phase === 'gameover' && (
              <>
                <h2 className={styles.cardTitle}>{t('gameOver', { name: dog.name })}</h2>
                <p className={styles.controls}>{t('gameOverSub')}</p>
                <p className={styles.payout}>
                  {t('runScore')} {earned} 💶
                  {bestCombo > 1 && (
                    <>
                      <br />
                      🔥 {t('bestCombo')} x{bestCombo}
                    </>
                  )}
                  {best !== null && (
                    <>
                      <br />
                      <span className={styles.best}>
                        🏆 {t('bestScore')} {best} 💶
                      </span>
                    </>
                  )}
                </p>

                {top.length > 0 && (
                  <div className={styles.topList}>
                    <p className={styles.shopTitle}>{t('topWalkers')}</p>
                    {top.map((row, i) => (
                      <div key={i} className={styles.topRow}>
                        <span>
                          {['🥇', '🥈', '🥉'][i] ?? `${i + 1}.`} {row.name}
                        </span>
                        <span>{row.best_walk} 💶</span>
                      </div>
                    ))}
                  </div>
                )}

                <button className={styles.button} onClick={restart}>
                  {t('restart')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
