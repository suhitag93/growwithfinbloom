import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useXP } from "@/hooks/useXP";
import { useMissions } from "@/hooks/useMissions";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface GrowthEvent {
  id: string;
  type: "flower" | "pond" | "tree" | "weed" | "butterfly" | "sun";
  emoji: string;
  message: string;
}

interface GardenData {
  emergencyMonths: number;
  savingsRate: number;
  debtLevel: number;
  investmentGrowth: number;
  habitStreak: number;
}

type GardenStage = "seed" | "sprout" | "bloom" | "thrive" | "flourish" | "legacy";

const STAGE_MAP: Record<number, GardenStage> = {
  0: "seed",
  1: "sprout",
  2: "bloom",
  3: "thrive",
  4: "flourish",
  5: "legacy",
};

interface TapDetail {
  title: string;
  subtitle: string;
  emoji: string;
  detail: string;
}

// ─── Sky & Atmosphere ────────────────────────────────────────────────────────

const Sky = ({ stage }: { stage: GardenStage }) => {
  const warmth = ["seed", "sprout"].includes(stage) ? 0 : stage === "bloom" ? 0.3 : stage === "thrive" ? 0.5 : 0.8;
  return (
    <>
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={`hsl(${205 - warmth * 15}, ${40 + warmth * 15}%, ${90 - warmth * 5}%)`} />
          <stop offset="60%" stopColor={`hsl(${170 - warmth * 20}, ${25 + warmth * 10}%, ${92 - warmth * 3}%)`} />
          <stop offset="100%" stopColor={`hsl(${152}, 20%, 88%)`} />
        </linearGradient>
        <radialGradient id="sunGlow" cx="85%" cy="12%" r="30%">
          <stop offset="0%" stopColor="hsl(43, 90%, 88%)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(43, 90%, 88%)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pondGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(200, 55%, 78%)" />
          <stop offset="100%" stopColor="hsl(200, 45%, 68%)" />
        </linearGradient>
        <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(25, 30%, 38%)" />
          <stop offset="50%" stopColor="hsl(30, 35%, 45%)" />
          <stop offset="100%" stopColor="hsl(25, 25%, 35%)" />
        </linearGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="waterBlur">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>
      <rect width="400" height="320" fill="url(#skyGrad)" />
      {warmth > 0.2 && <rect width="400" height="320" fill="url(#sunGlow)" />}
    </>
  );
};

const Clouds = ({ stage }: { stage: GardenStage }) => {
  if (["seed"].includes(stage)) return null;
  const count = stage === "sprout" ? 1 : stage === "bloom" ? 2 : 3;
  const clouds = [
    { x: 60, y: 30, rx: 35, ry: 12, dur: 45, delay: 0 },
    { x: 220, y: 18, rx: 28, ry: 10, dur: 55, delay: 5 },
    { x: 340, y: 40, rx: 22, ry: 8, dur: 50, delay: 12 },
  ];
  return (
    <g opacity={0.5}>
      {clouds.slice(0, count).map((c, i) => (
        <motion.g
          key={i}
          animate={{ x: [0, 15, 0] }}
          transition={{ duration: c.dur, repeat: Infinity, ease: "easeInOut", delay: c.delay }}
        >
          <ellipse cx={c.x} cy={c.y} rx={c.rx} ry={c.ry} fill="white" opacity={0.7} />
          <ellipse cx={c.x - c.rx * 0.5} cy={c.y + 3} rx={c.rx * 0.65} ry={c.ry * 0.8} fill="white" opacity={0.5} />
          <ellipse cx={c.x + c.rx * 0.4} cy={c.y + 2} rx={c.rx * 0.5} ry={c.ry * 0.7} fill="white" opacity={0.6} />
        </motion.g>
      ))}
    </g>
  );
};

// ─── Landscape Layers ────────────────────────────────────────────────────────

const DistantHills = ({ stage }: { stage: GardenStage }) => {
  const stageIdx = Object.values(STAGE_MAP).indexOf(stage);
  if (stageIdx < 1) return null;
  const opacity = Math.min(0.15 + stageIdx * 0.08, 0.5);
  return (
    <g opacity={opacity}>
      {/* Far hills */}
      <path d="M-10,220 Q60,170 130,200 Q200,175 270,195 Q340,165 410,210 L410,240 L-10,240Z"
        fill="hsl(152, 25%, 72%)" />
      {/* Mid hills */}
      <path d="M-10,235 Q50,200 120,220 Q180,195 250,215 Q320,190 410,225 L410,260 L-10,260Z"
        fill="hsl(152, 22%, 65%)" opacity={0.8} />
    </g>
  );
};

const Ground = ({ stage }: { stage: GardenStage }) => {
  const stageIdx = Object.values(STAGE_MAP).indexOf(stage);
  const richness = Math.min(stageIdx / 5, 1);
  return (
    <g>
      {/* Main ground */}
      <path
        d="M-10,265 Q50,255 100,260 Q200,250 300,258 Q370,252 410,260 L410,320 L-10,320Z"
        fill={`hsl(${90 + richness * 62}, ${15 + richness * 20}%, ${55 - richness * 12}%)`}
      />
      {/* Foreground soil/grass */}
      <path
        d="M-10,280 Q80,272 160,278 Q240,270 320,276 Q380,271 410,275 L410,320 L-10,320Z"
        fill={`hsl(${100 + richness * 52}, ${18 + richness * 18}%, ${48 - richness * 10}%)`}
        opacity={0.9}
      />
      {/* Grass blades */}
      {stageIdx >= 1 && (
        <g opacity={0.4 + richness * 0.5}>
          {[30, 55, 85, 115, 150, 185, 215, 250, 280, 315, 350, 375].map((x, i) => (
            <motion.path
              key={i}
              d={`M${x},${275 - (i % 3) * 2} q${2 + (i % 2)},${-8 - (i % 4)} ${(i % 2 === 0 ? -3 : 4)},${-14 - (i % 3) * 2}`}
              stroke={`hsl(${130 + richness * 22}, ${30 + richness * 15}%, ${45 + (i % 3) * 5}%)`}
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
              animate={{ rotate: [0, (i % 2 === 0 ? 3 : -3), 0] }}
              transition={{ duration: 3 + (i % 2), repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
              style={{ transformOrigin: `${x}px 275px` }}
            />
          ))}
        </g>
      )}
    </g>
  );
};

// ─── Sun ─────────────────────────────────────────────────────────────────────

const Sun = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  return (
    <motion.g
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 1.5 }}
    >
      {/* Warm halo */}
      <motion.circle
        cx="355" cy="35" r="30"
        fill="hsl(43, 90%, 85%)"
        opacity={0.2}
        animate={{ r: [28, 34, 28], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Sun body */}
      <circle cx="355" cy="35" r="16" fill="hsl(43, 92%, 78%)" opacity={0.6} />
      <circle cx="355" cy="35" r="10" fill="hsl(43, 95%, 85%)" opacity={0.8} />
      {/* Soft rays */}
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((angle, i) => (
        <motion.line
          key={i}
          x1={355 + Math.cos((angle * Math.PI) / 180) * 20}
          y1={35 + Math.sin((angle * Math.PI) / 180) * 20}
          x2={355 + Math.cos((angle * Math.PI) / 180) * (30 + (i % 3) * 5)}
          y2={35 + Math.sin((angle * Math.PI) / 180) * (30 + (i % 3) * 5)}
          stroke="hsl(43, 85%, 75%)"
          strokeWidth="1"
          strokeLinecap="round"
          opacity={0.35}
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </motion.g>
  );
};

// ─── Water / Pond ────────────────────────────────────────────────────────────

const Pond = ({ months, onTap, isNew }: { months: number; onTap: () => void; isNew?: boolean }) => {
  if (months < 1) return null;
  const size = months < 3 ? 0.55 : months < 6 ? 0.8 : 1;
  const hasFlow = months >= 6;

  return (
    <g onClick={onTap} className="cursor-pointer" role="button" aria-label="Emergency fund details">
      {/* Shadow */}
      <ellipse cx="310" cy="274" rx={48 * size} ry={13 * size} fill="hsl(200, 20%, 50%)" opacity={0.1} />
      {/* Water body */}
      <motion.ellipse
        cx="310" cy="270" rx={44 * size} ry={12 * size}
        fill="url(#pondGrad)"
        opacity={0.75}
        initial={{ scale: 0 }}
        animate={{ scale: isNew ? [0, 1.15, 1] : 1 }}
        transition={{ delay: 0.8, duration: isNew ? 0.8 : 0.6, type: "spring" }}
      />
      {/* Surface highlight */}
      <motion.ellipse
        cx="308" cy="268" rx={28 * size} ry={6 * size}
        fill="hsl(200, 60%, 88%)"
        opacity={0.45}
        animate={{ rx: [28 * size, 30 * size, 28 * size] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Ripples */}
      {hasFlow && (
        <>
          <motion.ellipse
            cx="310" cy="270" rx={18} ry={5}
            fill="none" stroke="hsl(200, 50%, 85%)" strokeWidth="0.6"
            animate={{ rx: [12, 32, 12], ry: [3, 8, 3], opacity: [0.6, 0.1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.ellipse
            cx="310" cy="270" rx={10} ry={3}
            fill="none" stroke="hsl(200, 55%, 82%)" strokeWidth="0.4"
            animate={{ rx: [8, 24, 8], ry: [2, 6, 2], opacity: [0.4, 0.05, 0.4] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </>
      )}
      {/* Reeds near pond */}
      {size > 0.7 && (
        <g opacity={0.5}>
          {[{x: 310 - 38 * size, h: 18}, {x: 310 - 42 * size, h: 14}, {x: 310 + 40 * size, h: 16}].map((r, i) => (
            <motion.line
              key={i}
              x1={r.x} y1={270} x2={r.x + 1} y2={270 - r.h}
              stroke="hsl(130, 25%, 50%)" strokeWidth="1" strokeLinecap="round"
              animate={{ x2: [r.x + 1, r.x - 1, r.x + 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </g>
      )}
      {/* New growth glow */}
      {isNew && (
        <motion.ellipse
          cx="310" cy="270" rx={50 * size} ry={16 * size}
          fill="none" stroke="hsl(200, 60%, 70%)" strokeWidth="2" filter="url(#softGlow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0], scale: [0.8, 1.3, 1.5] }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
      )}
    </g>
  );
};

// ─── Flowers ─────────────────────────────────────────────────────────────────

const Flower = ({ x, y, color, delay, onTap, size = 1, isNew, variant = 0 }: {
  x: number; y: number; color: string; delay: number; onTap: () => void;
  size?: number; isNew?: boolean; variant?: number;
}) => {
  const petalCount = variant === 0 ? 6 : variant === 1 ? 5 : 7;
  const petalRx = variant === 1 ? 3.5 : 4;
  const petalRy = variant === 1 ? 7 : 6;

  return (
    <g onClick={onTap} className="cursor-pointer" role="button" aria-label="Savings details">
      <motion.g
        initial={{ scale: 0, originX: `${x}px`, originY: `${y + 18}px` }}
        animate={{ scale: isNew ? [0, 1.3, size] : size }}
        transition={{ delay, duration: isNew ? 0.8 : 0.6, type: "spring" }}
      >
        {/* Stem */}
        <motion.path
          d={`M${x},${y + 18} Q${x + (variant % 2 === 0 ? 1 : -1)},${y + 8} ${x},${y + 2}`}
          stroke="hsl(140, 32%, 45%)" strokeWidth="1.8" fill="none" strokeLinecap="round"
          animate={{ d: [
            `M${x},${y + 18} Q${x + 1},${y + 8} ${x},${y + 2}`,
            `M${x},${y + 18} Q${x - 1},${y + 8} ${x + 0.5},${y + 2}`,
            `M${x},${y + 18} Q${x + 1},${y + 8} ${x},${y + 2}`,
          ] }}
          transition={{ duration: 4 + variant, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Leaves */}
        <ellipse cx={x + 6} cy={y + 12} rx="5" ry="2.5" fill="hsl(140, 35%, 50%)" opacity={0.7}
          transform={`rotate(-35, ${x + 6}, ${y + 12})`} />
        {variant !== 1 && (
          <ellipse cx={x - 5} cy={y + 15} rx="4" ry="2" fill="hsl(140, 30%, 55%)" opacity={0.6}
            transform={`rotate(30, ${x - 5}, ${y + 15})`} />
        )}
        {/* Petals */}
        {Array.from({ length: petalCount }).map((_, i) => {
          const angle = (360 / petalCount) * i;
          return (
            <motion.ellipse
              key={i}
              cx={x + Math.cos((angle * Math.PI) / 180) * 5}
              cy={y + Math.sin((angle * Math.PI) / 180) * 5}
              rx={petalRx} ry={petalRy}
              fill={color} opacity={0.8}
              transform={`rotate(${angle}, ${x + Math.cos((angle * Math.PI) / 180) * 5}, ${y + Math.sin((angle * Math.PI) / 180) * 5})`}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.4 + delay * 0.5 }}
            />
          );
        })}
        {/* Center */}
        <circle cx={x} cy={y} r="3" fill="hsl(43, 85%, 65%)" />
        <circle cx={x - 0.8} cy={y - 0.8} r="1.5" fill="hsl(43, 90%, 75%)" opacity={0.6} />
        {/* Bloom sparkle */}
        {isNew && (
          <motion.g filter="url(#softGlow)">
            <motion.circle
              cx={x} cy={y} r="14"
              fill="none" stroke="hsl(43, 90%, 70%)" strokeWidth="1.5"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.5, 2] }}
              transition={{ duration: 1.2, delay: delay + 0.3 }}
            />
          </motion.g>
        )}
      </motion.g>
    </g>
  );
};

// ─── Trees ───────────────────────────────────────────────────────────────────

const Tree = ({ x, y, height, onTap, isNew, variant = 0 }: {
  x: number; y: number; height: number; onTap: () => void; isNew?: boolean; variant?: number;
}) => {
  const trunkH = 35 + height * 45;
  const canopyR = 16 + height * 22;
  const leafShade = variant === 0 ? 152 : 140;

  return (
    <g onClick={onTap} className="cursor-pointer" role="button" aria-label="Investment details">
      {/* Shadow on ground */}
      <ellipse cx={x + 8} cy={y + 2} rx={canopyR * 0.6} ry={4} fill="hsl(152, 15%, 35%)" opacity={0.12} />
      {/* Trunk */}
      <motion.rect
        x={x - 5} y={y - trunkH} width={10} height={trunkH}
        rx="4"
        fill="url(#trunkGrad)"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: isNew ? [0, 1.06, 1] : 1 }}
        style={{ transformOrigin: `${x}px ${y}px` }}
        transition={{ delay: 0.6, duration: isNew ? 1 : 0.8, ease: "easeOut" }}
      />
      {/* Branch detail */}
      <motion.path
        d={`M${x},${y - trunkH * 0.6} Q${x + 12},${y - trunkH * 0.7} ${x + 18},${y - trunkH * 0.65}`}
        stroke="hsl(30, 30%, 42%)" strokeWidth="2" fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      />
      {/* Canopy layers */}
      <motion.ellipse
        cx={x - canopyR * 0.3} cy={y - trunkH + 5} rx={canopyR * 0.7} ry={canopyR * 0.6}
        fill={`hsl(${leafShade}, 28%, 52%)`} opacity={0.75}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 1.1, duration: 0.5, type: "spring" }}
      />
      <motion.ellipse
        cx={x + canopyR * 0.25} cy={y - trunkH - canopyR * 0.15} rx={canopyR * 0.85} ry={canopyR * 0.75}
        fill={`hsl(${leafShade}, 30%, 48%)`} opacity={0.85}
        initial={{ scale: 0 }} animate={{ scale: isNew ? [0, 1.1, 1] : 1 }}
        transition={{ delay: 1.2, duration: 0.6, type: "spring" }}
      />
      <motion.ellipse
        cx={x} cy={y - trunkH - canopyR * 0.5} rx={canopyR} ry={canopyR * 0.8}
        fill={`hsl(${leafShade}, 32%, 45%)`} opacity={0.9}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 1.3, duration: 0.5, type: "spring" }}
      />
      {/* Light spot on canopy */}
      <ellipse
        cx={x - canopyR * 0.2} cy={y - trunkH - canopyR * 0.6}
        rx={canopyR * 0.35} ry={canopyR * 0.25}
        fill={`hsl(${leafShade}, 35%, 58%)`} opacity={0.4}
      />
      {/* Gentle sway */}
      <motion.ellipse
        cx={x + canopyR * 0.5} cy={y - trunkH - canopyR * 0.3}
        rx={canopyR * 0.5} ry={canopyR * 0.4}
        fill={`hsl(${leafShade + 8}, 25%, 55%)`} opacity={0.5}
        animate={{ cx: [x + canopyR * 0.5, x + canopyR * 0.52, x + canopyR * 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Growth ring */}
      {isNew && (
        <motion.circle
          cx={x} cy={y - trunkH - canopyR * 0.4} r={canopyR + 12}
          fill="none" stroke="hsl(152, 50%, 60%)" strokeWidth="2" filter="url(#softGlow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.2, 1.5] }}
          transition={{ duration: 1.5, delay: 1.4 }}
        />
      )}
    </g>
  );
};

// ─── Weeds ───────────────────────────────────────────────────────────────────

const Weed = ({ x, y, opacity, isDisappearing }: { x: number; y: number; opacity: number; isDisappearing?: boolean }) => {
  if (opacity <= 0) return null;
  return (
    <motion.g
      initial={{ opacity: isDisappearing ? opacity + 0.3 : 0 }}
      animate={{ opacity: isDisappearing ? 0 : opacity }}
      transition={{ delay: isDisappearing ? 0 : 0.5, duration: isDisappearing ? 1.5 : 0.4 }}
    >
      <path
        d={`M${x},${y} Q${x - 3},${y - 10} ${x - 7},${y - 16} M${x},${y} Q${x + 2},${y - 9} ${x + 5},${y - 14}`}
        stroke="hsl(50, 25%, 55%)" strokeWidth="1.2" fill="none" strokeLinecap="round"
      />
      <circle cx={x - 7} cy={y - 17} r="1.3" fill="hsl(50, 20%, 60%)" />
      <circle cx={x + 5} cy={y - 15} r="1" fill="hsl(50, 20%, 60%)" />
      {isDisappearing && (
        <motion.g>
          {[0, 1, 2].map(i => (
            <motion.circle
              key={i}
              cx={x + (i - 1) * 4} cy={y - 8}
              r="2"
              fill="hsl(152, 40%, 75%)"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 0.7, 0], y: [-5, -20], x: [(i - 1) * 2, (i - 1) * 6] }}
              transition={{ duration: 1, delay: i * 0.15 }}
            />
          ))}
        </motion.g>
      )}
    </motion.g>
  );
};

// ─── Butterflies ─────────────────────────────────────────────────────────────

const Butterfly = ({ delay, color = 0 }: { delay: number; color?: number }) => {
  const hue1 = color === 0 ? 245 : color === 1 ? 310 : 190;
  const hue2 = color === 0 ? 330 : color === 1 ? 35 : 260;
  return (
    <motion.g
      initial={{ opacity: 0, x: 40, y: 130 }}
      animate={{
        opacity: [0, 1, 1, 1, 0],
        x: [40, 100, 200, 300, 370],
        y: [130, 80, 100, 60, 40],
      }}
      transition={{ delay, duration: 12, repeat: Infinity, repeatDelay: 8, ease: "easeInOut" }}
    >
      <motion.path
        d={`M0,-3.5 Q-9,-11 -5.5,-3.5 Q-9,4 0,3.5 Z`}
        fill={`hsl(${hue1}, 35%, 72%)`}
        opacity={0.75}
        animate={{ d: ["M0,-3.5 Q-9,-11 -5.5,-3.5 Q-9,4 0,3.5 Z", "M0,-1.5 Q-5,-5 -3,-1.5 Q-5,2.5 0,1.5 Z"] }}
        transition={{ duration: 0.25, repeat: Infinity, repeatType: "reverse" }}
      />
      <motion.path
        d={`M0,-3.5 Q9,-11 5.5,-3.5 Q9,4 0,3.5 Z`}
        fill={`hsl(${hue2}, 40%, 74%)`}
        opacity={0.75}
        animate={{ d: ["M0,-3.5 Q9,-11 5.5,-3.5 Q9,4 0,3.5 Z", "M0,-1.5 Q5,-5 3,-1.5 Q5,2.5 0,1.5 Z"] }}
        transition={{ duration: 0.25, repeat: Infinity, repeatType: "reverse" }}
      />
      <circle cx="0" cy="0" r="0.8" fill="hsl(0,0%,30%)" />
    </motion.g>
  );
};

// ─── Ambient Particles ───────────────────────────────────────────────────────

const FloatingParticles = ({ stage }: { stage: GardenStage }) => {
  const stageIdx = Object.values(STAGE_MAP).indexOf(stage);
  if (stageIdx < 2) return null;
  const count = Math.min(stageIdx, 5);
  const particles = [
    { x: 50, y: 200, endY: 120, dur: 7 },
    { x: 180, y: 220, endY: 140, dur: 9 },
    { x: 300, y: 190, endY: 100, dur: 8 },
    { x: 120, y: 210, endY: 130, dur: 10 },
    { x: 350, y: 195, endY: 110, dur: 7.5 },
  ];
  return (
    <g>
      {particles.slice(0, count).map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x} cy={p.y} r="1.5"
          fill="hsl(43, 80%, 80%)"
          opacity={0}
          animate={{
            cy: [p.y, p.endY, p.y],
            cx: [p.x, p.x + 15, p.x],
            opacity: [0, 0.5, 0],
          }}
          transition={{ duration: p.dur, repeat: Infinity, delay: i * 2 + 1, ease: "easeInOut" }}
        />
      ))}
    </g>
  );
};

// ─── Seed Scene ──────────────────────────────────────────────────────────────

const SeedScene = () => (
  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
    {/* Soil mound */}
    <ellipse cx="200" cy="272" rx="35" ry="10" fill="hsl(30, 28%, 48%)" opacity={0.5} />
    <ellipse cx="200" cy="270" rx="25" ry="7" fill="hsl(30, 32%, 42%)" opacity={0.6} />
    {/* Seed */}
    <motion.g
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <ellipse cx="200" cy="264" rx="4" ry="6" fill="hsl(30, 38%, 40%)" />
      {/* Tiny sprout hint */}
      <motion.path
        d="M200,258 Q200,252 201,248"
        stroke="hsl(130, 40%, 55%)" strokeWidth="1" fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1] }}
        transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
      />
    </motion.g>
    <text x="200" y="240" textAnchor="middle" fontSize="8" fill="hsl(152, 20%, 60%)" opacity={0.5} fontFamily="DM Sans, sans-serif">
      Your journey begins…
    </text>
  </motion.g>
);

// ─── Small Ground Flowers (ambient) ──────────────────────────────────────────

const SmallFlowers = ({ stage }: { stage: GardenStage }) => {
  const stageIdx = Object.values(STAGE_MAP).indexOf(stage);
  if (stageIdx < 3) return null;
  const flowers = [
    { x: 170, y: 272, color: "hsl(350, 45%, 78%)" },
    { x: 230, y: 275, color: "hsl(280, 35%, 76%)" },
    { x: 280, y: 270, color: "hsl(20, 50%, 80%)" },
    { x: 370, y: 274, color: "hsl(330, 40%, 75%)" },
  ];
  const count = stageIdx >= 5 ? 4 : stageIdx >= 4 ? 3 : 2;
  return (
    <g>
      {flowers.slice(0, count).map((f, i) => (
        <motion.g
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.5 + i * 0.2, type: "spring" }}
        >
          <line x1={f.x} y1={f.y} x2={f.x} y2={f.y + 6} stroke="hsl(140, 30%, 50%)" strokeWidth="0.8" />
          {[0, 72, 144, 216, 288].map((angle, j) => (
            <circle
              key={j}
              cx={f.x + Math.cos((angle * Math.PI) / 180) * 2.5}
              cy={f.y + Math.sin((angle * Math.PI) / 180) * 2.5}
              r="1.8" fill={f.color} opacity={0.7}
            />
          ))}
          <circle cx={f.x} cy={f.y} r="1.2" fill="hsl(43, 80%, 65%)" />
        </motion.g>
      ))}
    </g>
  );
};

// ─── Growth Event Banner ─────────────────────────────────────────────────────

const GrowthEventBanner = ({ event, onDismiss }: { event: GrowthEvent | null; onDismiss: () => void }) => (
  <AnimatePresence>
    {event && (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="absolute top-3 left-3 right-3 z-20"
        onClick={onDismiss}
      >
        <div className="bg-card/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-primary/20">
          <div className="flex items-center justify-center gap-2">
            <motion.span
              className="text-xl"
              animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {event.emoji}
            </motion.span>
            <p className="text-sm font-semibold text-foreground">{event.message}</p>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Detail Popover ──────────────────────────────────────────────────────────

const DetailPopover = ({ detail, onClose }: { detail: TapDetail | null; onClose: () => void }) => (
  <AnimatePresence>
    {detail && (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.25, type: "spring" }}
        className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-md border border-border/40 rounded-2xl p-4 shadow-lg z-10"
        onClick={onClose}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{detail.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{detail.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{detail.subtitle}</p>
            <p className="text-xs text-foreground/80 mt-2 leading-relaxed">{detail.detail}</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-center mt-2">Tap to dismiss</p>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const FinancialGarden = () => {
  const { currentLevel, totalXP, nextLevel, progress, earnedBadges, streakDays } = useXP();
  const { completedMissions } = useMissions();
  const [activeDetail, setActiveDetail] = useState<TapDetail | null>(null);
  const [growthEvent, setGrowthEvent] = useState<GrowthEvent | null>(null);
  const [recentGrowth, setRecentGrowth] = useState<Set<string>>(new Set());

  const prevValuesRef = useRef({
    level: currentLevel.id,
    badgeCount: earnedBadges.length,
    completedCount: completedMissions.length,
    xp: totalXP,
  });

  const data: GardenData = useMemo(() => ({
    emergencyMonths: Math.min(Math.floor(currentLevel.id * 1.5), 6),
    savingsRate: Math.min(20 + earnedBadges.filter(b => b.category === "savings").length * 10, 50),
    debtLevel: Math.max(60 - earnedBadges.filter(b => b.category === "debt").length * 20, 10),
    investmentGrowth: Math.min(currentLevel.id * 15 + earnedBadges.filter(b => b.category === "investing").length * 20, 100),
    habitStreak: streakDays,
  }), [currentLevel.id, earnedBadges, streakDays]);

  const stage = STAGE_MAP[currentLevel.id] ?? "seed";
  const stageIndex = currentLevel.id;

  // ─── Growth Event Detection ───────────────────────────────────────────────
  const checkForGrowthEvents = useCallback(() => {
    const prev = prevValuesRef.current;
    const events: GrowthEvent[] = [];

    if (currentLevel.id > prev.level) {
      events.push({ id: `level-${currentLevel.id}`, type: "tree", emoji: "🌳", message: `Level up! You reached ${currentLevel.title}!` });
      setRecentGrowth(s => new Set(s).add("tree"));
    }

    if (earnedBadges.length > prev.badgeCount) {
      const newBadge = earnedBadges[earnedBadges.length - 1];
      const isDebt = newBadge?.category === "debt";
      events.push({
        id: `badge-${newBadge?.id}`, type: isDebt ? "weed" : "flower",
        emoji: isDebt ? "🌿" : "🌸",
        message: isDebt ? "A weed disappeared! Debt milestone reached!" : `A new flower bloomed! ${newBadge?.title ?? "Badge"} earned!`,
      });
      setRecentGrowth(s => new Set(s).add(isDebt ? "weed" : "flower"));
    }

    if (completedMissions.length > prev.completedCount) {
      events.push({ id: `mission-${Date.now()}`, type: "butterfly", emoji: "🦋", message: "Mission complete! A butterfly visits your garden!" });
      setRecentGrowth(s => new Set(s).add("butterfly"));
    }

    const prevMilestone = Math.floor(prev.xp / 500);
    const currentMilestone = Math.floor(totalXP / 500);
    if (currentMilestone > prevMilestone && currentMilestone > 0) {
      events.push({ id: `xp-${currentMilestone}`, type: "pond", emoji: "💧", message: `${currentMilestone * 500} XP reached! Your pond expands!` });
      setRecentGrowth(s => new Set(s).add("pond"));
    }

    prevValuesRef.current = { level: currentLevel.id, badgeCount: earnedBadges.length, completedCount: completedMissions.length, xp: totalXP };

    if (events.length > 0) {
      setGrowthEvent(events[0]);
      events.slice(1).forEach((e, i) => {
        setTimeout(() => toast(e.message, { icon: e.emoji, duration: 4000 }), (i + 1) * 2500);
      });
      setTimeout(() => setRecentGrowth(new Set()), 3000);
    }
  }, [currentLevel, earnedBadges, completedMissions, totalXP]);

  useEffect(() => {
    const timeout = setTimeout(checkForGrowthEvents, 500);
    return () => clearTimeout(timeout);
  }, [checkForGrowthEvents]);

  useEffect(() => {
    if (growthEvent) {
      const timer = setTimeout(() => setGrowthEvent(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [growthEvent]);

  const details: Record<string, TapDetail> = useMemo(() => ({
    pond: {
      title: "Emergency Fund",
      subtitle: `${data.emergencyMonths} months coverage`,
      emoji: "💧",
      detail: data.emergencyMonths >= 6
        ? "Excellent! Your safety net is strong with 6+ months of expenses covered."
        : `You're at ${data.emergencyMonths} months. Aim for 6 months of expenses saved.`,
    },
    flowers: {
      title: "Savings Progress",
      subtitle: `${data.savingsRate}% savings rate`,
      emoji: "🌸",
      detail: data.savingsRate >= 20
        ? `Great savings rate! You're saving ${data.savingsRate}% of your income.`
        : `Your savings rate is ${data.savingsRate}%. Try to reach 20% for healthy growth.`,
    },
    trees: {
      title: "Investment Growth",
      subtitle: `${data.investmentGrowth}% toward milestone`,
      emoji: "🌳",
      detail: "Your investments are growing steadily. Keep contributing regularly for compound growth.",
    },
    weeds: {
      title: "Debt Health",
      subtitle: data.debtLevel > 50 ? "Needs attention" : "Looking good",
      emoji: "🌿",
      detail: data.debtLevel > 50
        ? "Focus on paying down high-interest debt first to clear the weeds."
        : "Your debt is well-managed. Keep it up!",
    },
  }), [data]);

  const showPond = stageIndex >= 1 && data.emergencyMonths >= 1;
  const flowerCount = stageIndex >= 2 ? Math.min(Math.ceil(data.savingsRate / 12), 5) : stageIndex >= 1 ? 1 : 0;
  const treeCount = stageIndex >= 3 ? (stageIndex >= 4 ? 2 : 1) : 0;
  const weedOpacity = Math.min(data.debtLevel / 100, 0.7);
  const showButterflies = stageIndex >= 2 && data.habitStreak >= 3;
  const showSun = stageIndex >= 3 && data.habitStreak >= 7;

  const flowerPositions = [
    { x: 90, y: 252, color: "hsl(340, 50%, 75%)", variant: 0 },
    { x: 145, y: 248, color: "hsl(280, 38%, 74%)", variant: 1 },
    { x: 205, y: 250, color: "hsl(355, 52%, 77%)", variant: 2 },
    { x: 255, y: 254, color: "hsl(305, 35%, 72%)", variant: 0 },
    { x: 115, y: 257, color: "hsl(22, 55%, 76%)", variant: 1 },
  ];

  const hasRecentGrowth = recentGrowth.size > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl bg-card border border-border/40 shadow-lg overflow-hidden"
    >
      <GrowthEventBanner event={growthEvent} onDismiss={() => setGrowthEvent(null)} />

      {/* Header */}
      <div className="px-4 pt-4 pb-2 md:px-6 md:pt-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-lg font-semibold text-foreground">Your Garden</h3>
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/8 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            {currentLevel.emoji} {currentLevel.title}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Tap any element to explore your progress
        </p>
      </div>

      {/* Garden SVG */}
      <div className="relative px-1 md:px-3">
        <svg
          viewBox="0 0 400 310"
          className="w-full h-auto"
          style={{ maxHeight: "300px" }}
          aria-label="Financial garden visualization"
        >
          <Sky stage={stage} />
          <Clouds stage={stage} />
          <DistantHills stage={stage} />
          <Sun visible={showSun} />
          <Ground stage={stage} />
          <FloatingParticles stage={stage} />

          {stageIndex === 0 && <SeedScene />}

          {/* Weeds */}
          {stageIndex >= 1 && (
            <g onClick={() => setActiveDetail(details.weeds)} className="cursor-pointer">
              <Weed x={345} y={273} opacity={weedOpacity} isDisappearing={recentGrowth.has("weed")} />
              <Weed x={55} y={275} opacity={weedOpacity * 0.7} />
              {weedOpacity > 0.5 && <Weed x={160} y={276} opacity={weedOpacity * 0.5} />}
            </g>
          )}

          {/* Pond */}
          {showPond && (
            <Pond
              months={data.emergencyMonths}
              onTap={() => setActiveDetail(details.pond)}
              isNew={recentGrowth.has("pond")}
            />
          )}

          {/* Flowers */}
          {flowerPositions.slice(0, flowerCount).map((f, i) => (
            <Flower
              key={i} x={f.x} y={f.y} color={f.color}
              delay={0.5 + i * 0.12}
              onTap={() => setActiveDetail(details.flowers)}
              size={stageIndex >= 4 ? 1.15 : 1}
              isNew={recentGrowth.has("flower") && i === flowerCount - 1}
              variant={f.variant}
            />
          ))}

          {/* Small ambient ground flowers */}
          <SmallFlowers stage={stage} />

          {/* Trees */}
          {treeCount >= 1 && (
            <Tree
              x={65} y={272}
              height={data.investmentGrowth / 100}
              onTap={() => setActiveDetail(details.trees)}
              isNew={recentGrowth.has("tree")}
            />
          )}
          {treeCount >= 2 && (
            <Tree
              x={355} y={272}
              height={data.investmentGrowth / 100 * 0.7}
              onTap={() => setActiveDetail(details.trees)}
              variant={1}
            />
          )}

          {/* Butterflies */}
          {showButterflies && <Butterfly delay={recentGrowth.has("butterfly") ? 0.3 : 2} color={0} />}
          {stageIndex >= 4 && <Butterfly delay={6} color={1} />}
          {stageIndex >= 5 && <Butterfly delay={10} color={2} />}
        </svg>

        <DetailPopover detail={activeDetail} onClose={() => setActiveDetail(null)} />
      </div>

      {/* Bottom progress bar */}
      <div className="px-4 pb-4 pt-2 md:px-6 md:pb-5">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-foreground">
                {currentLevel.emoji} {currentLevel.title}
                <span className="text-muted-foreground font-normal"> → </span>
                {nextLevel?.emoji ?? "👑"} {nextLevel?.title ?? "Max"}
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {totalXP.toLocaleString()} / {nextLevel?.xpRequired.toLocaleString() ?? "∞"} XP
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, hsl(152, 45%, 50%), hsl(152, 55%, 42%), hsl(140, 50%, 45%))",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
              />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={hasRecentGrowth ? "grew" : "static"}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className={`text-[11px] text-center mt-3 font-medium ${
              hasRecentGrowth ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {hasRecentGrowth ? "Your garden grew today! 🌸✨" : "Keep growing — every good habit counts 🌱"}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FinancialGarden;
