// Big-koi-only constants extracted from Nagomi's settings defaults.

export const CANVAS = { width: 960, height: 600 } as const;
export let CANVAS_WIDTH: number = CANVAS.width;
export let CANVAS_HEIGHT: number = CANVAS.height;
export const SPINE_NODES = 14;
export const MAX_FISH = 3;
export const TAU = Math.PI * 2;
export const FIXED_STEP = 1 / 60;

export function setCanvasSize(width: number, height: number): void {
  CANVAS_WIDTH = Math.max(1, width);
  CANVAS_HEIGHT = Math.max(1, height);
}

export const FISH = {
  initialCount: 3,
  tinyEvery: 99,
  regularLength: [58, 72] as const,
  tinyLength: [58, 72] as const,
  regularWidthRatio: [0.17, 0.2] as const,
  tinyWidthRatio: [0.17, 0.2] as const,
  eyeColor: '#171815',
  depth: {
    initialRange: [0.05, 0.18] as const,
    shallowRange: [0.04, 0.22] as const,
    deepRange: [0.45, 0.75] as const,
    surfaceDurationSeconds: [8, 22] as const,
    deepDurationSeconds: [4, 10] as const,
    changeProbability: 0.72,
    transitionSeconds: [2, 5] as const,
    callRiseDepth: 0.035,
    callRiseSeconds: 2.4,
    visualStart: 0.1,
    visualEnd: 0.72,
    deepBrightness: 0.59,
    deepSaturation: 0.76,
    deepWaterTint: [0.66, 0.84, 0.8] as const,
  },
  feeding: {
    intervalSeconds: [1, 4] as const,
    retryDelaySeconds: [0.55, 1.35] as const,
    eligibleDepth: 0.23,
    eligibleSpeedFraction: 0.62,
    mouthForwardOffset: 0.66,
    animationDurationSeconds: 0.24,
  },
  callResponse: {
    minimumDelaySeconds: 0.04,
    distanceAtMaximumDelay: 360,
    maximumDistanceDelaySeconds: 1.05,
    distanceExponent: 1.5,
    randomJitterSeconds: 0.18,
    temperamentDelaySeconds: 0.22,
    targetLifetimeSeconds: 1.2,
    chaseBoostSeconds: 2.6,
    chaseSpeedMultiplier: 2.3,
    initialExtraSpeedMultiplier: 0.34,
  },
} as const;

export interface KoiPalette {
  name: string;
  base: string;
  accent: string;
  marking: string;
  fin: string;
  eye: string;
}

export const KOI_PALETTES: readonly KoiPalette[] = [
  { name: 'Kohaku', base: '#f1eadb', accent: '#dc4b2f', marking: '#27251f', fin: '#e6ddca', eye: FISH.eyeColor },
  { name: 'Sanke', base: '#f2ebdc', accent: '#df5032', marking: '#20211f', fin: '#e7dece', eye: FISH.eyeColor },
  { name: 'Ogon', base: '#e7aa31', accent: '#cf7626', marking: '#78431f', fin: '#d9922a', eye: FISH.eyeColor },
] as const;

export interface KoiPatch {
  position: number;
  length: number;
  width: number;
  offset: number;
  color: 'accent' | 'marking';
}

export const KOI_PATTERNS: readonly (readonly KoiPatch[])[] = [
  [
    { position: 0.17, length: 0.09, width: 0.74, offset: 0.04, color: 'accent' },
    { position: 0.48, length: 0.115, width: 0.69, offset: -0.12, color: 'accent' },
    { position: 0.76, length: 0.085, width: 0.62, offset: 0.16, color: 'accent' },
  ],
  [
    { position: 0.19, length: 0.095, width: 0.7, offset: 0.04, color: 'accent' },
    { position: 0.58, length: 0.105, width: 0.66, offset: -0.14, color: 'accent' },
    { position: 0.38, length: 0.045, width: 0.3, offset: 0.38, color: 'marking' },
    { position: 0.79, length: 0.04, width: 0.28, offset: -0.36, color: 'marking' },
  ],
  [],
] as const;
