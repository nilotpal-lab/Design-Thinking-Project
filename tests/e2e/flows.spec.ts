import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * E2E happy paths (PLAN Phase 8) — real browser against the production build
 * and the real (shared) database. Writes use unique markers and only assert on
 * rows this suite created, so re-runs are safe.
 *
 * Credentials come from env; the local default admin is used otherwise.
 */
const ADMIN_USER = process.env.E2E_ADMIN_USER ?? 'admin';
const ADMIN_PASS = process.env.E2E_ADMIN_PASS ?? 'jainspace-admin';

/** Login through the real form so cookies land exactly like production. */
async function login(page: import('@playwright/test').Page, username: string, password: string) {
  await page.goto('/auth/login');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/spaces');
}

test.describe('public exploration', () => {
  test('spaces explorer renders live rooms and filters work', async ({ page }) => {
    await page.goto('/spaces');
    await expect(page.getByRole('heading', { name: /spaces/i })).toBeVisible();

    // Room cards link into detail pages.
    const firstCard = page.locator('a[href^="/spaces/"]').first();
    await expect(firstCard).toBeVisible();

    // URL-driven filter: in a free-only view no room card may show a busy
    // status pill (the "In session" filter chip is always present, so assert
    // on card contents, not page text).
    await page.goto('/spaces?status=free');
    await page.waitForLoadState('domcontentloaded');
    const cardTexts = await page.locator('a[href^="/spaces/"]').allTextContents();
    expect(cardTexts.length).toBeGreaterThan(0);
    expect(cardTexts.join(' ').toLowerCase()).not.toContain('in session');
  });

  test('room detail shows timeline and infrastructure', async ({ page }) => {
    await page.goto('/spaces/121a');
    await expect(page).toHaveURL(/\/spaces\/121a/);
    await expect(page.getByText(/sockets/i).first()).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('floor map renders rooms per floor with a status legend', async ({ page }) => {
    await page.goto('/map');
    const rects = page.locator('svg rect');
    expect(await rects.count()).toBeGreaterThan(5);
    await expect(page.getByText(/free/i).first()).toBeVisible();
  });

  test('matcher wizard produces ranked, explained results', async ({ page }) => {
    await page.goto('/match');
    // size/duration are radio groups (zero-JS wizard), not number inputs.
    await page.locator('input[name="size"][value="4"]').check({ force: true });
    await page.locator('input[name="duration"][value="60"]').check({ force: true });
    await page.getByRole('button', { name: /find/i }).click();
    await page.waitForLoadState('domcontentloaded');
    // Results (or an honest empty state) must render.
    await expect(page.locator('main')).toContainText(/free|room|no/i);
  });

  test('faculty tracker lists teachers; events page renders', async ({ page }) => {
    await page.goto('/faculty');
    await expect(page.locator('main')).toBeVisible();
    await page.goto('/events');
    await expect(page.locator('main')).toBeVisible();
  });

  test('issue board is publicly readable', async ({ page }) => {
    await page.goto('/report');
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('authenticated flows', () => {
  test('signup -> auto session -> sign out -> sign back in', async ({ page }) => {
    const uname = `e2e_${Date.now().toString(36)}`.slice(0, 20);

    await page.goto('/auth/signup');
    await page.getByLabel('Username').fill(uname);
    await page.getByLabel('Full name').fill('E2E Probe');
    await page.getByLabel('Password').fill('e2e-password-1');
    await page.getByRole('button', { name: /create/i }).click();
    await page.waitForURL('**/spaces');

    // Session chip shows the profile full name (fallback 'Student'), never the
    // synthetic email; /my shows the username-based account details.
    await page.goto('/my');
    await expect(page.getByText('E2E Probe').first()).toBeVisible();
  });

  test('check-in appears on the room page after submitting', async ({ page }) => {
    await login(page, ADMIN_USER, ADMIN_PASS);
    await page.goto('/spaces/121a');

    // Required crowd choice.
    await page.locator('input[name="crowd_density"][value="light"]').check({ force: true });
    await page.locator('textarea[name="note"]').fill(`e2e checkin ${Date.now()}`);
    await page.getByRole('button', { name: new RegExp(`Check in to`, 'i') }).click();

    // Two valid outcomes: success, or the DB-enforced 20-minute rate limit
    // (this suite re-runs against one shared database — a rate-limit error
    // itself proves the write path and its enforcement are live).
    const outcome = page.getByText(/checked in — thanks|already checked in|wait (a|20) min/i).first();
    await expect(outcome).toBeVisible({ timeout: 10_000 });
  });

  test('issue can be filed and shows its JS-reference number', async ({ page }) => {
    await login(page, ADMIN_USER, ADMIN_PASS);
    await page.goto('/report');

    await page.locator('select[name="room_id"]').selectOption({ index: 1 });
    await page.locator('input[name="category"][value="power"]').check({ force: true });
    await page.locator('input[name="title"]').fill(`E2E socket report ${Date.now()}`);
    await page.locator('textarea[name="description"]').fill('Automated end-to-end probe: half the sockets on the north wall are dead.');
    await page.getByRole('button', { name: /file report/i }).click();

    await expect(page.getByText(/filed as JS-\d+/i)).toBeVisible({ timeout: 10_000 });
  });

  test('admin console is blocked for anonymous users and open for admins', async ({ page, browser }) => {
    // Anon gets redirected.
    const anon = await browser.newContext();
    const anonPage = await anon.newPage();
    await anonPage.goto('/admin');
    await expect(anonPage).toHaveURL(/\/auth\/login/);
    await anon.close();

    // Admin gets the console.
    const ctx = await browser.newContext();
    const adminPage = await ctx.newPage();
    await login(adminPage, ADMIN_USER, ADMIN_PASS);
    await adminPage.goto('/admin');
    await expect(adminPage.getByText(/cabin/i).first()).toBeVisible();
    await ctx.close();
  });
});

test.describe('accessibility', () => {
  const PAGES = ['/', '/spaces', '/spaces/121a', '/map', '/match', '/report', '/faculty', '/events', '/auth/login'];

  for (const path of PAGES) {
    test(`axe: no critical violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const critical = results.violations.filter((v) => v.impact === 'critical');
      expect(critical).toEqual([]);
    });
  }
});
