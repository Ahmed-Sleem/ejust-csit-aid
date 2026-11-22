export type FishPreset = 'none' | 'terminal' | 'koi-tiles' | 'dither' | 'halftone' | 'mosaic' | 'cyber' | 'gameboy' | 'amber';

export const PRESETS: readonly { id: FishPreset; label: string; icon: string }[] = [
  { id: 'none', label: 'None', icon: '○' },
  { id: 'terminal', label: 'Terminal', icon: '>_' },
  { id: 'koi-tiles', label: 'Koi tiles', icon: '鯉' },
  { id: 'dither', label: '1-bit', icon: '░' },
  { id: 'halftone', label: 'Halftone', icon: '●' },
  { id: 'mosaic', label: 'Mosaic', icon: '■' },
  { id: 'cyber', label: 'Cyber', icon: '▦' },
  { id: 'gameboy', label: 'Gameboy', icon: '▤' },
  { id: 'amber', label: 'Amber', icon: 'Aa' },
];

const sampleCanvas = document.createElement('canvas');
const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
const glyphs = ' .:-=+*#%@';

const luminance = (r: number, g: number, b: number): number => (r * .299 + g * .587 + b * .114) / 255;

function bayer(x: number, y: number): number {
  const matrix = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  return (matrix[y % 4][x % 4] + .5) / 16;
}

function paletteColor(preset: FishPreset, light: number): string {
  if (preset === 'terminal') return `rgb(6 ${Math.round(64 + light * 191)} ${Math.round(26 + light * 80)})`;
  if (preset === 'amber') return `rgb(${Math.round(74 + light * 181)} ${Math.round(38 + light * 143)} 0)`;
  if (preset === 'gameboy') return ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'][Math.min(3, Math.floor(light * 4))];
  if (preset === 'cyber') return light > .55 ? '#2be8ff' : '#ff2bd6';
  return light > .5 ? '#f8f8f5' : '#1c1c1b';
}

export function applyFishEffect(
  source: HTMLCanvasElement,
  destination: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  preset: FishPreset,
  cellSize: number,
): void {
  destination.save();
  destination.setTransform(dpr, 0, 0, dpr, 0, 0);
  destination.clearRect(0, 0, width, height);
  if (preset === 'none') {
    destination.drawImage(source, 0, 0, width, height);
    destination.restore();
    return;
  }

  const cell = Math.max(4, Math.round(cellSize));
  const columns = Math.ceil(width / cell), rows = Math.ceil(height / cell);
  sampleCanvas.width = columns; sampleCanvas.height = rows;
  sampleContext?.clearRect(0, 0, columns, rows);
  sampleContext?.drawImage(source, 0, 0, columns, rows);
  const pixels = sampleContext?.getImageData(0, 0, columns, rows).data;
  if (!pixels) { destination.restore(); return; }
  destination.textAlign = 'center'; destination.textBaseline = 'middle';

  for (let y = 0; y < rows; y += 1) for (let x = 0; x < columns; x += 1) {
    const offset = (y * columns + x) * 4, alpha = pixels[offset + 3] / 255;
    if (alpha < .08) continue;
    const r = pixels[offset], g = pixels[offset + 1], b = pixels[offset + 2], light = luminance(r, g, b);
    const px = x * cell, py = y * cell, centerX = px + cell / 2, centerY = py + cell / 2;

    if (preset === 'dither') {
      if (light * alpha < bayer(x, y)) continue;
      destination.fillStyle = '#20201f'; destination.fillRect(px, py, cell, cell); continue;
    }
    if (preset === 'halftone') {
      destination.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      destination.beginPath(); destination.arc(centerX, centerY, Math.sqrt(light * alpha) * cell * .48, 0, Math.PI * 2); destination.fill(); continue;
    }
    if (preset === 'mosaic') {
      destination.fillStyle = `rgba(${r},${g},${b},${alpha})`; destination.fillRect(px + 1, py + 1, cell - 2, cell - 2); continue;
    }
    if (preset === 'koi-tiles') {
      destination.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      destination.beginPath(); destination.roundRect(px + 1, py + 1, cell - 2, cell - 2, cell * .2); destination.fill();
      destination.fillStyle = light > .6 ? 'rgba(0,0,0,.42)' : 'rgba(255,255,255,.72)';
      destination.font = `700 ${cell * .58}px ui-monospace,monospace`; destination.fillText('鯉', centerX, centerY + 1); continue;
    }

    destination.fillStyle = paletteColor(preset, light);
    const glyph = preset === 'gameboy' ? '■' : preset === 'cyber' ? (light > .55 ? '▦' : '▪') : glyphs[Math.min(glyphs.length - 1, Math.round(light * (glyphs.length - 1)))];
    destination.globalAlpha = alpha;
    destination.font = `700 ${cell * .9}px ui-monospace,Menlo,monospace`;
    destination.fillText(glyph, centerX, centerY + 1);
    destination.globalAlpha = 1;
  }
  destination.restore();
}
