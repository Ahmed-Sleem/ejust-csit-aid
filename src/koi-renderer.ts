// Fish-only Canvas2D renderer adapted from Nagomi's procedural Three.js koi geometry.
import { FISH, KOI_PALETTES, KOI_PATTERNS, SPINE_NODES, type KoiPalette } from './config';
import { Koi, SwimState } from './koi';
import { add, fromAngle, lerp, mul, normalize, perpendicular, sub, type Vec2 } from './math';
import { School } from './school';
import { applyFishEffect, type FishPreset } from './effects';

function pathTriangle(ctx: CanvasRenderingContext2D, a: Vec2, b: Vec2, c: Vec2): void {
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.closePath(); ctx.fill();
}

// Appearance remains stable while depth continues to influence movement.
const stableColor = (hex: string): string => hex;

export class KoiRenderer {
  private readonly displayContext: CanvasRenderingContext2D;
  private readonly sceneCanvas = document.createElement('canvas');
  private readonly context: CanvasRenderingContext2D;
  private dpr = 1;
  private preset: FishPreset = 'none';
  private cellSize = 10;

  public constructor(public readonly canvas: HTMLCanvasElement) {
    const displayContext = canvas.getContext('2d', { alpha: true });
    const context = this.sceneCanvas.getContext('2d', { alpha: true });
    if (!displayContext || !context) throw new Error('Canvas 2D is unavailable.');
    this.displayContext = displayContext;
    this.context = context;
  }

  public setEffect(preset: FishPreset, cellSize: number): void {
    this.preset = preset;
    this.cellSize = cellSize;
  }

  public resize(cssWidth: number, cssHeight: number, dpr: number): void {
    this.dpr = dpr;
    this.canvas.width = Math.round(cssWidth * dpr);
    this.canvas.height = Math.round(cssHeight * dpr);
    this.sceneCanvas.width = this.canvas.width;
    this.sceneCanvas.height = this.canvas.height;
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  public draw(school: School): void {
    const ctx = this.context;
    const dpr = this.canvas.width / Math.max(1, this.canvas.clientWidth);
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    for (let index = 0; index < school.count; index += 1) {
      const fish = school.fish[index];
      this.buildRenderSpine(fish);
      this.drawKoi(fish, KOI_PALETTES[index % KOI_PALETTES.length], index);
    }
    ctx.restore();
    applyFishEffect(
      this.sceneCanvas,
      this.displayContext,
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      this.dpr,
      this.preset,
      this.cellSize,
    );
  }

  private buildRenderSpine(fish: Koi): void {
    fish.renderSpine[0] = { ...fish.spine[0] };
    for (let node = 1; node < SPINE_NODES; node += 1) {
      const t = node / (SPINE_NODES - 1);
      const previous = Math.max(0, node - 1), next = Math.min(SPINE_NODES - 1, node + 1);
      const tangent = normalize(sub(fish.spine[previous], fish.spine[next]), fromAngle(fish.heading));
      const wave = Math.sin(fish.swimPhase - t * 6.1) * fish.bodyWidth * 1.15 * Math.pow(t, 1.72) * (.08 + fish.tailEffort * .92);
      fish.renderSpine[node] = add(fish.spine[node], mul(perpendicular(tangent), wave));
    }
  }

  private widthAt(fish: Koi, node: number): number {
    const t = node / (SPINE_NODES - 1);
    const profile = t < .18 ? .73 + t / .18 * .27 : Math.pow(Math.max(0, 1 - (t - .18) / .82), .72);
    return Math.max(.7, fish.bodyWidth * profile);
  }

  private drawKoi(fish: Koi, palette: KoiPalette, appearanceIndex: number): void {
    const ctx = this.context, left: Vec2[] = [], right: Vec2[] = [];
    const colors = {
      base: stableColor(palette.base), accent: stableColor(palette.accent),
      marking: stableColor(palette.marking), fin: stableColor(palette.fin), eye: stableColor(palette.eye),
    };
    for (let node = 0; node < SPINE_NODES; node += 1) {
      const previous = Math.max(0, node - 1), next = Math.min(SPINE_NODES - 1, node + 1);
      const tangent = normalize(sub(fish.renderSpine[previous], fish.renderSpine[next]), fromAngle(fish.heading));
      const normal = perpendicular(tangent), halfWidth = this.widthAt(fish, node);
      left[node] = add(fish.renderSpine[node], mul(normal, halfWidth)); right[node] = add(fish.renderSpine[node], mul(normal, -halfWidth));
    }

    const pectoralCenter = 4, pectoralTangent = normalize(sub(fish.renderSpine[3], fish.renderSpine[5]), fromAngle(fish.heading));
    const pectoralNormal = perpendicular(pectoralTangent), gulp = Math.sin(Math.PI * fish.gulpAnimation / Math.max(FISH.feeding.animationDurationSeconds, .001)) * .85;
    const paddle = (fish.state === SwimState.Hover ? 1 : fish.state === SwimState.Pivot ? .85 : .45) + gulp;
    const pulse = .82 + paddle * .25 * Math.sin(fish.swimPhase * .64 + fish.phaseOffset), reach = fish.bodyWidth * (.55 + paddle * .25) * pulse;
    ctx.fillStyle = colors.fin;
    const leftFin = add(add(left[pectoralCenter], mul(pectoralNormal, reach)), mul(pectoralTangent, -fish.bodyWidth * .22));
    const rightFin = add(add(right[pectoralCenter], mul(pectoralNormal, -reach)), mul(pectoralTangent, -fish.bodyWidth * .22));
    pathTriangle(ctx, left[3], leftFin, left[6]); pathTriangle(ctx, right[3], right[6], rightFin);

    const pelvicTangent = normalize(sub(fish.renderSpine[7], fish.renderSpine[9]), fromAngle(fish.heading)), pelvicNormal = perpendicular(pelvicTangent), pelvicReach = fish.bodyWidth * (.28 + .05 * pulse);
    pathTriangle(ctx, left[7], add(left[8], mul(pelvicNormal, pelvicReach)), left[9]);
    pathTriangle(ctx, right[7], right[9], add(right[8], mul(pelvicNormal, -pelvicReach)));

    ctx.fillStyle = colors.base; ctx.beginPath(); ctx.moveTo(left[0].x, left[0].y);
    for (let node = 1; node < SPINE_NODES; node += 1) ctx.lineTo(left[node].x, left[node].y);
    for (let node = SPINE_NODES - 1; node >= 0; node -= 1) ctx.lineTo(right[node].x, right[node].y);
    ctx.closePath(); ctx.fill();

    const headForward = normalize(sub(fish.renderSpine[0], fish.renderSpine[1]), fromAngle(fish.heading)), headNormal = perpendicular(headForward);
    const nose = add(fish.renderSpine[0], mul(headForward, fish.bodyWidth * .43)), noseWidth = this.widthAt(fish, 0) * .72;
    ctx.beginPath(); ctx.arc(nose.x, nose.y, Math.max(1, noseWidth * .72), 0, Math.PI * 2); ctx.fill();

    const tailNode = SPINE_NODES - 1, tailForward = normalize(sub(fish.renderSpine[tailNode - 1], fish.renderSpine[tailNode]), fromAngle(fish.heading));
    const tailNormal = perpendicular(tailForward), backward = mul(tailForward, -1), spread = fish.bodyWidth * (.58 + .08 * Math.sin(fish.swimPhase - .8));
    const upper = add(add(fish.renderSpine[tailNode], mul(backward, fish.bodyWidth * 1.38)), mul(tailNormal, spread));
    const lower = add(add(fish.renderSpine[tailNode], mul(backward, fish.bodyWidth * 1.38)), mul(tailNormal, -spread));
    const notch = add(fish.renderSpine[tailNode], mul(backward, fish.bodyWidth * .86)); ctx.fillStyle = colors.fin;
    pathTriangle(ctx, fish.renderSpine[tailNode], upper, notch); pathTriangle(ctx, fish.renderSpine[tailNode], notch, lower);

    for (const patch of KOI_PATTERNS[appearanceIndex % KOI_PATTERNS.length]) {
      const spinePosition = patch.position * (SPINE_NODES - 1), node = Math.min(SPINE_NODES - 2, Math.floor(spinePosition)), amount = spinePosition - node;
      const center = lerp(fish.renderSpine[node], fish.renderSpine[node + 1], amount), previous = Math.max(0, node - 1), next = Math.min(SPINE_NODES - 1, node + 2);
      const forward = normalize(sub(fish.renderSpine[previous], fish.renderSpine[next]), fromAngle(fish.heading)), normal = perpendicular(forward);
      const localWidth = this.widthAt(fish, node) * (1 - amount) + this.widthAt(fish, node + 1) * amount, patchCenter = add(center, mul(normal, localWidth * patch.offset));
      ctx.save(); ctx.translate(patchCenter.x, patchCenter.y); ctx.rotate(Math.atan2(forward.y, forward.x)); ctx.fillStyle = patch.color === 'accent' ? colors.accent : colors.marking;
      ctx.beginPath(); ctx.ellipse(0, 0, fish.bodyLength * patch.length, localWidth * patch.width, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }

    const eyeAnchor = add(fish.renderSpine[0], mul(headForward, fish.bodyWidth * .08)), eyeOffset = this.widthAt(fish, 0) * .58, eyeRadius = Math.max(.58, fish.bodyWidth * .11); ctx.fillStyle = colors.eye;
    for (const side of [-1, 1]) { const eye = add(eyeAnchor, mul(headNormal, eyeOffset * side)); ctx.beginPath(); ctx.arc(eye.x, eye.y, eyeRadius, 0, Math.PI * 2); ctx.fill(); }
  }
}
