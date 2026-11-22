import { CANVAS_HEIGHT, CANVAS_WIDTH, FIXED_STEP, setCanvasSize } from './config';
import { KoiRenderer } from './koi-renderer';
import { School } from './school';

const heroElement = document.querySelector<HTMLElement>('.hero');
const canvasElement = document.querySelector<HTMLCanvasElement>('#hero-koi');
if (!heroElement || !canvasElement) throw new Error('Missing koi intro.');
const hero: HTMLElement = heroElement;
const canvas: HTMLCanvasElement = canvasElement;

const school = new School();
const renderer = new KoiRenderer(canvas);
renderer.setEffect('koi-tiles', 5);
canvas.dataset.preset = 'koi-tiles';
canvas.dataset.cellSize = '5';
canvas.dataset.fishCount = '3';
canvas.dataset.fishSize = '12%';

let width = CANVAS_WIDTH, height = CANVAS_HEIGHT;
let last = performance.now(), elapsed = 0, accumulator = 0, frame = 0;
let visible = true, positioned = false;

function positionIntroKoi(): void {
  const anchors = [[.16, .3], [.5, .37], [.82, .28]] as const;
  school.fish.forEach((fish, index) => {
    const next = { x: width * anchors[index][0], y: height * anchors[index][1] };
    const shift = { x: next.x - fish.position.x, y: next.y - fish.position.y };
    fish.position = next;
    for (const node of fish.spine) { node.x += shift.x; node.y += shift.y; }
    for (const node of fish.renderSpine) { node.x += shift.x; node.y += shift.y; }
  });
  positioned = true;
}

function resize(): void {
  const oldWidth = width, oldHeight = height;
  const bounds = hero.getBoundingClientRect();
  width = Math.max(1, bounds.width); height = Math.max(1, bounds.height);
  setCanvasSize(width, height);
  school.resize(width / Math.max(1, oldWidth), height / Math.max(1, oldHeight));
  // Each koi is approximately 12% of the intro width, with practical caps
  // supplied by School so mobile and ultrawide layouts remain usable.
  school.setFishScale((width * .12) / 65);
  renderer.resize(width, height, Math.min(devicePixelRatio || 1, 2));
  if (!positioned) positionIntroKoi();
}

function heroPoint(event: PointerEvent): { x: number; y: number } {
  const bounds = hero.getBoundingClientRect();
  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
}

hero.addEventListener('pointermove', event => school.follow(heroPoint(event)), { passive: true });
hero.addEventListener('pointerdown', event => school.follow(heroPoint(event)), { passive: true });
hero.addEventListener('pointerleave', () => school.releaseTarget());
addEventListener('resize', resize, { passive: true });

new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  last = performance.now(); accumulator = 0;
}, { threshold: .01 }).observe(hero);

document.addEventListener('visibilitychange', () => { last = performance.now(); accumulator = 0; });

function animate(now: number): void {
  frame = requestAnimationFrame(animate);
  if (!visible || document.hidden) return;
  accumulator += Math.min(.1, Math.max(0, (now - last) / 1000)); last = now;
  while (accumulator >= FIXED_STEP) {
    elapsed += FIXED_STEP; school.update(FIXED_STEP, elapsed); accumulator -= FIXED_STEP;
  }
  renderer.draw(school);
}

resize();
frame = requestAnimationFrame(animate);
if (import.meta.hot) import.meta.hot.dispose(() => cancelAnimationFrame(frame));
