'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  bounceOffPaddle,
  clamp,
  cpuPaddleTarget,
  getTennisConfig,
  isMatchOver,
  matchWinner,
  moveToward,
  nextServeDirection,
  type Difficulty,
  type Side,
  type TennisConfig,
} from '@/lib';
import { useUser } from '@/components/global/UserProvider';
import { tennisSfx, setTennisMuted } from './sfx';
import styles from './TennisGame.module.css';

type Phase = 'intro' | 'playing' | 'over';

const LOGW = 800;
const LOGH = 450;
const PADDLE_W = 14;
const PADDLE_H = 92;
const PADDLE_SPEED = 500; // logical px/s for keyboard-controlled paddles
const BALL_R = 9;
const PLAYER_X = 24;
const CPU_X = LOGW - 24 - PADDLE_W;
const SHAKE_DURATION = 0.2;
const COUNTDOWN_START = 3;
const COUNTDOWN_POINT = 1.8;
const TRAIL_LENGTH = 12;

const WIN_REWARD: Record<Difficulty, number> = { easy: 5, normal: 20, unbeatable: 100 };

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Keys {
  w: boolean;
  s: boolean;
  up: boolean;
  down: boolean;
}

interface GameRef {
  ball: Ball;
  trail: { x: number; y: number }[];
  flash: { x: number; y: number; t: number } | null;
  playerY: number;
  cpuY: number;
  config: TennisConfig | null;
  twoPlayer: boolean;
  keys: Keys;
  countdown: number;
  pendingDir: number;
  goT: number;
  shakeT: number;
  reducedMotion: boolean;
  running: boolean;
  raf: number;
  lastTs: number;
  score: { player: number; cpu: number };
}

export default function TennisGame() {
  const t = useTranslations();
  const { bumpScore } = useUser();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [twoPlayer, setTwoPlayer] = useState(false);
  const [score, setScore] = useState({ player: 0, cpu: 0 });
  const [winner, setWinner] = useState<Side | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tennis-muted') === '1';
      setMuted(stored);
      setTennisMuted(stored);
    } catch {
      // storage unavailable — keep sound on
    }
  }, []);

  const game = useRef<GameRef>({
    ball: { x: LOGW / 2, y: LOGH / 2, vx: 0, vy: 0 },
    trail: [],
    flash: null,
    playerY: LOGH / 2,
    cpuY: LOGH / 2,
    config: null,
    twoPlayer: false,
    keys: { w: false, s: false, up: false, down: false },
    countdown: 0,
    pendingDir: 1,
    goT: 0,
    shakeT: 0,
    reducedMotion: false,
    running: false,
    raf: 0,
    lastTs: 0,
    score: { player: 0, cpu: 0 },
  });

  const beginServe = (dir: number, duration: number) => {
    const g = game.current;
    g.ball = { x: LOGW / 2, y: LOGH / 2, vx: 0, vy: 0 };
    g.trail = [];
    g.pendingDir = dir;
    g.countdown = duration;
  };

  const endMatch = useCallback(
    (win: Side, twoP: boolean, diff: Difficulty) => {
      const g = game.current;
      g.running = false;
      cancelAnimationFrame(g.raf);
      setWinner(win);
      setPhase('over');
      const humanWon = win === 'player' || twoP;
      if (win === 'player' && !twoP) bumpScore(WIN_REWARD[diff]);
      if (humanWon) tennisSfx.win();
      else tennisSfx.lose();
    },
    [bumpScore]
  );

  const loop = useCallback(
    (ts: number) => {
      const g = game.current;
      const canvas = canvasRef.current;
      if (!g.running || !canvas || !g.config) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(rect.width * dpr))
        canvas.width = Math.round(rect.width * dpr);
      if (canvas.height !== Math.round(rect.height * dpr))
        canvas.height = Math.round(rect.height * dpr);

      const dt = g.lastTs ? Math.min(0.04, (ts - g.lastTs) / 1000) : 0;
      g.lastTs = ts;
      const b = g.ball;

      // Paddle movement (keyboard). Left paddle = P1 (W/S, or arrows in 1P);
      // right paddle = P2 (arrows) in 2P, else the AI.
      const up1 = g.twoPlayer ? g.keys.w : g.keys.w || g.keys.up;
      const down1 = g.twoPlayer ? g.keys.s : g.keys.s || g.keys.down;
      if (up1) g.playerY -= PADDLE_SPEED * dt;
      if (down1) g.playerY += PADDLE_SPEED * dt;
      g.playerY = clamp(g.playerY, PADDLE_H / 2, LOGH - PADDLE_H / 2);

      if (g.twoPlayer) {
        if (g.keys.up) g.cpuY -= PADDLE_SPEED * dt;
        if (g.keys.down) g.cpuY += PADDLE_SPEED * dt;
        g.cpuY = clamp(g.cpuY, PADDLE_H / 2, LOGH - PADDLE_H / 2);
      } else {
        const target = cpuPaddleTarget(b.y, g.config.cpuTracking, LOGH);
        g.cpuY = clamp(
          moveToward(g.cpuY, target, g.config.cpuSpeed * dt),
          PADDLE_H / 2,
          LOGH - PADDLE_H / 2
        );
      }

      // Serve countdown: the ball waits at the centre before launching.
      if (g.countdown > 0) {
        g.countdown -= dt;
        if (g.countdown <= 0) {
          b.vx = g.pendingDir * g.config.ballSpeed;
          b.vy = (Math.random() * 2 - 1) * 140;
          g.goT = 0.5;
        }
      } else {
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Trail.
        g.trail.push({ x: b.x, y: b.y });
        if (g.trail.length > TRAIL_LENGTH) g.trail.shift();

        // Top / bottom walls.
        if (b.y < BALL_R) {
          b.y = BALL_R;
          b.vy = -b.vy;
          g.flash = { x: b.x, y: b.y, t: 0.25 };
          tennisSfx.wall();
        } else if (b.y > LOGH - BALL_R) {
          b.y = LOGH - BALL_R;
          b.vy = -b.vy;
          g.flash = { x: b.x, y: b.y, t: 0.25 };
          tennisSfx.wall();
        }

        // Player paddle (left).
        if (
          b.vx < 0 &&
          b.x - BALL_R <= PLAYER_X + PADDLE_W &&
          b.x > PLAYER_X &&
          Math.abs(b.y - g.playerY) <= PADDLE_H / 2 + BALL_R
        ) {
          const next = bounceOffPaddle(b.vx, b.vy, (b.y - g.playerY) / (PADDLE_H / 2), g.config);
          b.vx = next.vx;
          b.vy = next.vy;
          b.x = PLAYER_X + PADDLE_W + BALL_R;
          g.flash = { x: b.x, y: b.y, t: 0.25 };
          tennisSfx.hit();
        }

        // Right paddle (CPU / P2).
        if (
          b.vx > 0 &&
          b.x + BALL_R >= CPU_X &&
          b.x < CPU_X + PADDLE_W &&
          Math.abs(b.y - g.cpuY) <= PADDLE_H / 2 + BALL_R
        ) {
          const next = bounceOffPaddle(b.vx, b.vy, (b.y - g.cpuY) / (PADDLE_H / 2), g.config);
          b.vx = next.vx;
          b.vy = next.vy;
          b.x = CPU_X - BALL_R;
          g.flash = { x: b.x, y: b.y, t: 0.25 };
          tennisSfx.hit();
        }

        // Scoring.
        let scored: Side | null = null;
        if (b.x < -BALL_R) scored = 'cpu';
        else if (b.x > LOGW + BALL_R) scored = 'player';

        if (scored) {
          g.score = {
            player: g.score.player + (scored === 'player' ? 1 : 0),
            cpu: g.score.cpu + (scored === 'cpu' ? 1 : 0),
          };
          setScore(g.score);
          if (scored === 'player') tennisSfx.pointFor();
          else {
            tennisSfx.pointAgainst();
            if (!g.reducedMotion) g.shakeT = SHAKE_DURATION;
          }
          if (isMatchOver(g.score.player, g.score.cpu)) {
            return endMatch(matchWinner(g.score.player, g.score.cpu)!, g.twoPlayer, difficulty);
          }
          beginServe(nextServeDirection(scored), COUNTDOWN_POINT);
        }
      }

      // Render.
      const ctx = canvas.getContext('2d');
      if (ctx) {
        let ox = 0;
        if (g.shakeT > 0) {
          g.shakeT = Math.max(0, g.shakeT - dt);
          ox = (Math.random() * 2 - 1) * 6 * (g.shakeT / SHAKE_DURATION);
        }
        ctx.setTransform((rect.width / LOGW) * dpr, 0, 0, (rect.height / LOGH) * dpr, ox * dpr, 0);

        // Court.
        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, 0, LOGW, LOGH);
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 3;
        ctx.strokeRect(14, 14, LOGW - 28, LOGH - 28);
        ctx.setLineDash([12, 14]);
        ctx.beginPath();
        ctx.moveTo(LOGW / 2, 14);
        ctx.lineTo(LOGW / 2, LOGH - 14);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ball trail.
        for (let i = 0; i < g.trail.length; i++) {
          const p = g.trail[i];
          ctx.globalAlpha = ((i + 1) / g.trail.length) * 0.35;
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(p.x, p.y, BALL_R * ((i + 1) / g.trail.length), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Paddles.
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(PLAYER_X, g.playerY - PADDLE_H / 2, PADDLE_W, PADDLE_H);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(CPU_X, g.cpuY - PADDLE_H / 2, PADDLE_W, PADDLE_H);

        // Ball.
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
        ctx.fill();

        // Impact flash (expanding ring).
        if (g.flash) {
          g.flash.t -= dt;
          if (g.flash.t <= 0) g.flash = null;
          else {
            ctx.globalAlpha = g.flash.t / 0.25;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(g.flash.x, g.flash.y, BALL_R + (0.25 - g.flash.t) * 90, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }

        // Countdown / GO.
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (g.countdown > 0) {
          ctx.font = '800 90px system-ui, sans-serif';
          ctx.fillText(String(Math.ceil(g.countdown)), LOGW / 2, LOGH / 2 - 30);
        } else if (g.goT > 0) {
          g.goT -= dt;
          ctx.font = '800 64px system-ui, sans-serif';
          ctx.fillText(t('countdownGo'), LOGW / 2, LOGH / 2 - 30);
        }
      }

      g.raf = requestAnimationFrame(loop);
    },
    [difficulty, endMatch, t]
  );

  const startMatch = useCallback(
    (twoP: boolean, diff: Difficulty) => {
      // Two-player mode reuses the "normal" ball physics; only the right paddle
      // control differs (second human instead of the AI).
      const config = getTennisConfig(twoP ? 'normal' : diff);
      const g = game.current;
      g.config = config;
      g.twoPlayer = twoP;
      g.keys = { w: false, s: false, up: false, down: false };
      g.playerY = LOGH / 2;
      g.cpuY = LOGH / 2;
      g.score = { player: 0, cpu: 0 };
      g.flash = null;
      g.goT = 0;
      g.shakeT = 0;
      g.lastTs = 0;
      g.reducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      g.running = true;
      beginServe(Math.random() < 0.5 ? 1 : -1, COUNTDOWN_START);
      setDifficulty(diff);
      setTwoPlayer(twoP);
      setScore({ player: 0, cpu: 0 });
      setWinner(null);
      setPaused(false);
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
    if (g.running || !g.config) return;
    g.running = true;
    g.lastTs = 0;
    setPaused(false);
    g.raf = requestAnimationFrame(loop);
  }, [loop]);

  const movePlayer = (clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || game.current.twoPlayer) return;
    const rect = canvas.getBoundingClientRect();
    game.current.playerY = clamp(
      ((clientY - rect.top) / rect.height) * LOGH,
      PADDLE_H / 2,
      LOGH - PADDLE_H / 2
    );
  };

  useEffect(() => {
    const setKey = (key: string, down: boolean) => {
      const k = game.current.keys;
      if (key === 'w' || key === 'W') k.w = down;
      if (key === 's' || key === 'S') k.s = down;
      if (key === 'ArrowUp') k.up = down;
      if (key === 'ArrowDown') k.down = down;
    };
    const onDown = (e: KeyboardEvent) => {
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && phase === 'playing') e.preventDefault();
      if ((e.key === 'p' || e.key === 'P') && phase === 'playing') {
        if (paused) resume();
        else pause();
        return;
      }
      setKey(e.key, true);
    };
    const onUp = (e: KeyboardEvent) => setKey(e.key, false);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
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

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setTennisMuted(next);
    try {
      localStorage.setItem('tennis-muted', next ? '1' : '0');
    } catch {
      // storage unavailable
    }
  };

  const difficulties: Difficulty[] = ['easy', 'normal', 'unbeatable'];
  const diffLabel: Record<Difficulty, string> = {
    easy: t('difficultyEasy'),
    normal: t('difficultyNormal'),
    unbeatable: t('difficultyUnbeatable'),
  };
  const leftLabel = twoPlayer ? t('player1Label') : t('playerLabel');
  const rightLabel = twoPlayer ? t('player2Label') : t('cpuLabel');
  const winnerLabel = winner === 'player' ? leftLabel : rightLabel;

  return (
    <div className={styles.wrap}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onPointerMove={(e) => movePlayer(e.clientY)}
        onPointerDown={(e) => movePlayer(e.clientY)}
      />

      {phase === 'playing' && (
        <div className={styles.hud}>
          <span className={styles.score}>
            {leftLabel} {score.player} — {score.cpu} {rightLabel}
          </span>
          <span className={styles.diffBadge}>
            {twoPlayer ? t('twoPlayers') : diffLabel[difficulty]}
          </span>
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

      {phase === 'intro' && (
        <div className={styles.overlay}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🎾 {t('tennisTitle')}</h2>
            <p className={styles.controls}>{t('tennisControls')}</p>
            <p className={styles.choose}>{t('chooseDifficulty')}</p>
            <div className={styles.diffRow}>
              {difficulties.map((d) => (
                <button key={d} className={styles.diffBtn} onClick={() => startMatch(false, d)}>
                  {diffLabel[d]}
                </button>
              ))}
              <button className={styles.button} onClick={() => startMatch(true, difficulty)}>
                👥 {t('twoPlayers')}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'over' && (
        <div className={styles.overlay}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              {twoPlayer
                ? t('playerWins', { player: winnerLabel })
                : winner === 'player'
                  ? t('youWin')
                  : t('youLose')}
            </h2>
            <p className={styles.payout}>
              {leftLabel} {score.player} — {score.cpu} {rightLabel}
            </p>
            <div className={styles.diffRow}>
              <button className={styles.button} onClick={() => startMatch(twoPlayer, difficulty)}>
                {t('restart')}
              </button>
              <button className={styles.diffBtn} onClick={() => setPhase('intro')}>
                {t('changeDifficulty')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
