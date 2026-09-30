import { test, expect } from '@playwright/test';
const encode = text => Buffer.from(text).toString('base64url');
test('Create a link and open the selected theme', async ({ page, context }) => {
  await page.goto('/'); await page.locator('#message').fill('¡Una sorpresa! 🎉');
  await page.locator('#date').fill('2035-04-12'); await page.locator('#time').fill('18:30'); await page.locator('#timezone').fill('America/Argentina/Buenos_Aires');
  for (const theme of ['paper','midnight','sage','rose','electric']) { await page.locator(`input[value="${theme}"]`).check(); await expect(page.locator('#preview')).toHaveAttribute('data-theme',theme); }
  await page.getByRole('button', { name: 'Crear mi enlace' }).click();
  const url = await page.locator('#generated-url').inputValue(); expect(url).not.toContain('sorpresa'); expect(new URL(url).searchParams.get('at')).toBe('2035-04-12T21:30:00Z');
  const viewer = await context.newPage(); await viewer.goto(url); await expect(viewer.locator('body')).toHaveAttribute('data-theme','electric'); await expect(viewer.locator('#timer')).toBeVisible(); await expect(viewer.locator('#reveal')).toBeEmpty();
  await page.locator('#message').fill('Cambio'); await expect(page.locator('#result')).toBeHidden();
});
test('Reveal at deadline, safely rendering text and keeping it on reload', async ({ page }) => {
  await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
  const msg = '¡Llegó! 🎉\n<script>window.hacked=true</script>';
  await page.goto(`/countdown.html?${new URLSearchParams({at:'2030-01-01T00:00:02Z',tz:'UTC',msg:encode(msg),theme:'rose'})}`);
  await expect(page.locator('#reveal')).toBeEmpty(); await page.clock.fastForward(2100);
  await expect(page.locator('#timer')).toBeHidden(); await expect(page.locator('#reveal')).toHaveText(msg); expect(await page.evaluate(() => window.hacked)).toBeUndefined();
  await page.reload(); await expect(page.locator('#reveal')).toHaveText(msg);
});
test('Invalid link and invalid creator data', async ({ page }) => {
  await page.goto('/countdown.html?at=bad'); await expect(page.locator('#link-error')).toBeVisible(); await expect(page.locator('#timer')).toBeHidden();
  await page.goto('/'); await page.locator('#message').fill('Hola'); await page.locator('#date').fill('2020-01-01'); await page.getByRole('button',{name:'Crear mi enlace'}).click(); await expect(page.locator('#form-error')).toContainText('futuras');
});
test('Mobile layout fits the screen', async ({ page }) => {
  await page.setViewportSize({width:375,height:812}); await page.goto('/'); expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await page.screenshot({path:'test-results/creator-mobile.png',fullPage:true});
  await page.goto(`/countdown.html?${new URLSearchParams({at:'2035-01-01T00:00:00Z',tz:'UTC',msg:encode('Hola')})}`); expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
test('Desktop preview', async ({ page }) => { await page.setViewportSize({width:1440,height:1000}); await page.goto('/'); await page.screenshot({path:'test-results/creator-desktop.png',fullPage:true}); });
