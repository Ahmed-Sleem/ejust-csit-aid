import { expect, test } from '@playwright/test';

test('integrates the EJUST identity and configured koi intro', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.hero-logo')).toBeVisible();
  await expect(page.locator('.hero-logo')).toHaveAttribute('src', './ejust-logo.png');
  const canvas = page.locator('#hero-koi');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('data-preset', 'koi-tiles');
  await expect(canvas).toHaveAttribute('data-cell-size', '5');
  await expect(canvas).toHaveAttribute('data-fish-count', '3');
  await expect(canvas).toHaveAttribute('data-fish-size', '12%');
  await page.waitForTimeout(600);
  const alphaPixels = await canvas.evaluate((element: HTMLCanvasElement) => {
    const context = element.getContext('2d'); if (!context) return 0;
    const data = context.getImageData(0, 0, element.width, element.height).data;
    let count = 0; for (let index = 3; index < data.length; index += 4) if (data[index]) count += 1;
    return count;
  });
  expect(alphaPixels).toBeGreaterThan(50);
  expect(errors).toEqual([]);
});

test('keeps koi limited to the intro and preserves site interactions', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('.hero #hero-koi')).toHaveCount(1);
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await expect(page.locator('#projects')).toBeVisible();
  await page.locator('#people').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Students' }).click();
  await expect(page.locator('#plist .hc')).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
