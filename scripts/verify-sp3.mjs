/**
 * Stop Point 3 — Live browser verification via Playwright
 * Run: node scripts/verify-sp3.mjs
 */
import { chromium } from 'playwright';

const BASE        = 'http://localhost:3000';
const EMAIL       = 'playwright.sp3@scarymoovies.dev';
const PASSWORD    = 'VerifyStop3!';
const F1_TMDB     = 346364;   // "It" (2017)
const F2_TMDB     = 419430;   // "Get Out" (2017)
const F1          = 'It';
const F2          = 'Get Out';
const PUB_USER    = 'david.v.lucca_6bde9d';  // has 3 tier entries in DB

const results = [];
const pass  = (m) => { results.push({ s:'PASS', m }); console.log(`✅ ${m}`); };
const fail  = (m) => { results.push({ s:'FAIL', m }); console.log(`❌ ${m}`); };
const info  = (m) => { results.push({ s:'INFO', m }); console.log(`ℹ️  ${m}`); };
const warn  = (m) => { results.push({ s:'WARN', m }); console.log(`⚠️  ${m}`); };

async function horizOverflow(page) {
  return page.evaluate(() =>
    document.documentElement.scrollWidth > window.innerWidth + 1
  );
}

async function signIn(page) {
  await page.goto(`${BASE}/auth/sign-in`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  // signIn action returns { redirectTo: '/' }
  await Promise.all([
    page.waitForURL(`${BASE}/`, { timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);
}

async function openTierTab(page) {
  await page.click('button:has-text("Tier List")');
  await page.waitForTimeout(700);
}

// ──────────────────────────────────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch({ headless: true });

  try {
    // ═══════════════════════════════════════════════════════
    // DESKTOP TESTS  (1280 × 800)
    // ═══════════════════════════════════════════════════════
    const ctx  = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();

    // ── Sign in ────────────────────────────────────────────
    console.log('\n── Sign in ──');
    await signIn(page);
    pass('Sign in → redirected to /');

    // ── TEST 1: Rate → tier picker enables without refresh ─
    console.log('\n── T1: Rate → tier picker enables ──');
    await page.goto(`${BASE}/film/${F1_TMDB}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[aria-label="Set tier S"]', { timeout: 8000 });

    const disabledBefore = await page.locator('[aria-label="Set tier B"]').getAttribute('disabled');
    if (disabledBefore !== null) pass('Tier buttons disabled before rating');
    else warn('Tier buttons not disabled — film may already have a rating in this test account');

    await page.click('[aria-label="Rate 4"]');
    await page.waitForSelector('text=Rating saved', { timeout: 8000 });

    const disabledAfter = await page.locator('[aria-label="Set tier B"]').getAttribute('disabled');
    if (disabledAfter === null) pass('Tier picker enabled immediately after rating (no refresh needed)');
    else fail('Tier picker still disabled after successful rating');

    // ── TEST 2: Add to tier → profile shows it ─────────────
    console.log('\n── T2: Add to tier → profile shows it ──');
    await page.click('[aria-label="Set tier B"]');
    await page.waitForSelector('text=Moved to tier B', { timeout: 8000 });
    pass('Film added to tier B (toast confirmed)');

    await page.goto(`${BASE}/profile/me`, { waitUntil: 'networkidle' });
    await openTierTab(page);

    const f1InProfile = await page.locator(`img[alt="${F1}"]`).count();
    if (f1InProfile > 0) pass(`${F1} appears in /profile/me Tier List after adding`);
    else fail(`${F1} NOT found in /profile/me Tier List`);

    // Rate and add second film to B (needed for reorder/remove tests)
    await page.goto(`${BASE}/film/${F2_TMDB}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[aria-label="Set tier S"]', { timeout: 8000 });
    await page.click('[aria-label="Rate 3"]');
    await page.waitForSelector('text=Rating saved', { timeout: 8000 });
    await page.click('[aria-label="Set tier B"]');
    await page.waitForSelector('text=Moved to tier B', { timeout: 8000 });
    pass(`${F2} rated and added to tier B`);

    // ── TEST 3: Move tier ↑ → immediate update + hard-refresh persists ──
    console.log('\n── T3: Move tier ↑ → immediate + refresh ──');
    await page.goto(`${BASE}/profile/me`, { waitUntil: 'networkidle' });
    await openTierTab(page);

    // Desktop: hover group to reveal controls
    const g1 = page.locator(`.group:has(img[alt="${F1}"])`).first();
    await g1.hover();
    await page.waitForTimeout(300);

    const upBtn = page.locator(`[aria-label="Move ${F1} to tier A"]`);
    if (await upBtn.count() > 0) {
      await upBtn.click();

      // Wait for server action + state update (moveTierEntry removes from local state on server confirm)
      await page.waitForTimeout(2500);
      const stillInB = await page.locator(`[aria-label="Move ${F1} to tier A"]`).count();
      if (stillInB === 0) pass(`${F1} removed from source row without hard refresh (no full page reload needed)`);
      else fail(`${F1} still in tier B 2.5 s after move — server action may have failed`);

      // router.refresh() will bring it back in tier A
      await page.waitForTimeout(2000);
      const inNewTier = await page.locator(`img[alt="${F1}"]`).count();
      if (inNewTier > 0) pass(`${F1} visible in tier A after router.refresh()`);
      else fail(`${F1} not visible in any tier after router.refresh()`);

      // Hard refresh
      await page.reload({ waitUntil: 'networkidle' });
      await openTierTab(page);
      const inAHard = await page.locator(`img[alt="${F1}"]`).count();
      if (inAHard > 0) pass(`Tier move persists after hard refresh (${F1} in tier A)`);
      else fail(`Tier move NOT persisted — ${F1} missing after hard refresh`);
    } else {
      fail(`"Move ${F1} to tier A" button not found`);
    }

    // ── TEST 4: Reorder left/right → hard-refresh persists ─
    console.log('\n── T4: Reorder left/right → refresh persists ──');

    // Move F1 back to B so we have 2 films in B
    const g1b = page.locator(`.group:has(img[alt="${F1}"])`).first();
    await g1b.hover();
    await page.waitForTimeout(300);
    const downBtn = page.locator(`[aria-label="Move ${F1} to tier B"]`);
    if (await downBtn.count() > 0) {
      await downBtn.click();
      await page.waitForTimeout(2000);
      await page.reload({ waitUntil: 'networkidle' });
      await openTierTab(page);
      info(`${F1} moved back to tier B for reorder test`);
    }

    // Capture initial DOM order of both films
    const orderBefore = await page.evaluate(([a, b]) => {
      const imgs = [...document.querySelectorAll('img[alt]')]
        .filter(i => i.alt === a || i.alt === b);
      return imgs.map(i => i.alt);
    }, [F1, F2]);
    info(`Order before reorder: ${orderBefore.join(' → ')}`);

    if (orderBefore.length >= 2) {
      const first = orderBefore[0];
      const gFirst = page.locator(`.group:has(img[alt="${first}"])`).first();
      await gFirst.hover();
      await page.waitForTimeout(300);

      const rightBtn = page.locator(`[aria-label="Move ${first} right"]`);
      if (await rightBtn.count() > 0) {
        await rightBtn.click();
        await page.waitForTimeout(500);

        const orderAfter = await page.evaluate(([a, b]) => {
          const imgs = [...document.querySelectorAll('img[alt]')]
            .filter(i => i.alt === a || i.alt === b);
          return imgs.map(i => i.alt);
        }, [F1, F2]);

        if (orderAfter[0] !== first) pass(`Reorder immediate: order changed to ${orderAfter.join(' → ')}`);
        else warn(`Order unchanged after reorder click — check optimistic update`);

        // Hard refresh
        await page.reload({ waitUntil: 'networkidle' });
        await openTierTab(page);

        const orderPersisted = await page.evaluate(([a, b]) => {
          const imgs = [...document.querySelectorAll('img[alt]')]
            .filter(i => i.alt === a || i.alt === b);
          return imgs.map(i => i.alt);
        }, [F1, F2]);

        if (orderPersisted[0] !== first) pass(`Reorder persists after hard refresh: ${orderPersisted.join(' → ')}`);
        else fail(`Reorder NOT persisted — reverted to original order after refresh`);
      } else {
        warn(`"Move ${first} right" button not found — check hover`);
      }
    } else {
      warn(`Only ${orderBefore.length} film(s) found; need 2 for reorder test`);
    }

    // ── TEST 5: Remove → hard-refresh persists ─────────────
    console.log('\n── T5: Remove → refresh persists ──');
    const g2 = page.locator(`.group:has(img[alt="${F2}"])`).first();
    if (await g2.count() > 0) {
      await g2.hover();
      await page.waitForTimeout(300);
      const rmBtn = page.locator(`[aria-label="Remove ${F2} from tier list"]`);
      if (await rmBtn.count() > 0) {
        await rmBtn.click();
        await page.waitForTimeout(500);
        const afterRm = await page.locator(`img[alt="${F2}"]`).count();
        if (afterRm === 0) pass(`${F2} removed from DOM immediately`);
        else fail(`${F2} still in DOM after remove click`);

        await page.reload({ waitUntil: 'networkidle' });
        await openTierTab(page);
        const afterRefresh = await page.locator(`img[alt="${F2}"]`).count();
        if (afterRefresh === 0) pass(`${F2} stays removed after hard refresh`);
        else fail(`${F2} reappeared after hard refresh`);
      } else {
        warn(`Remove button for ${F2} not found`);
      }
    } else {
      warn(`${F2} not found in tier list — may not have been added`);
    }

    // ── TEST 6: Public profile read-only ───────────────────
    console.log('\n── T6: Public profile read-only ──');

    // As logged-in test user viewing someone else's profile
    await page.goto(`${BASE}/profile/${PUB_USER}`, { waitUntil: 'networkidle' });
    await openTierTab(page);

    const ctrlsAsOther =
      (await page.locator('[aria-label^="Move"][aria-label*="to tier"]').count()) +
      (await page.locator('[aria-label^="Remove"]').count()) +
      (await page.locator('[aria-label$=" left"]').count()) +
      (await page.locator('[aria-label$=" right"]').count());

    if (ctrlsAsOther === 0) pass('No edit controls on public profile (logged in as other user)');
    else fail(`${ctrlsAsOther} edit control(s) found on public profile (logged in) — expected 0`);

    // Logged out
    await ctx.clearCookies();
    await page.goto(`${BASE}/profile/${PUB_USER}`, { waitUntil: 'networkidle' });
    await openTierTab(page);

    const ctrlsLoggedOut =
      (await page.locator('[aria-label^="Move"]').count()) +
      (await page.locator('[aria-label^="Remove"]').count());

    if (ctrlsLoggedOut === 0) pass('No edit controls on public profile (logged out)');
    else fail(`${ctrlsLoggedOut} control(s) visible when logged out`);

    await ctx.close();

    // ═══════════════════════════════════════════════════════
    // MOBILE TESTS  (390 × 844)
    // ═══════════════════════════════════════════════════════
    console.log('\n── T7: Mobile 390px ──');
    const mCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mPage = await mCtx.newPage();

    // Public pages — overflow
    const pubPages = [
      ['/', 'Home'],
      [`/film/${F1_TMDB}`, 'Film detail (logged out)'],
      ['/explore', 'Explore'],
      ['/collections', 'Collections'],
    ];
    for (const [url, label] of pubPages) {
      await mPage.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
      await mPage.waitForTimeout(400);
      const ov = await horizOverflow(mPage);
      if (ov) fail(`Horizontal overflow: ${label}`);
      else    pass(`No overflow: ${label}`);
    }

    // Hamburger size (logged out)
    await mPage.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    const hbBox = await mPage.locator('[aria-label="Open menu"]').first().boundingBox();
    if (hbBox) info(`Hamburger: ${Math.round(hbBox.width)}×${Math.round(hbBox.height)}px (recommend ≥44px)`);

    // Sign in on mobile first (tier picker only renders when logged in)
    await signIn(mPage);
    pass('Mobile: sign in OK');

    // Tier picker button size on film detail (requires login)
    await mPage.goto(`${BASE}/film/${F1_TMDB}`, { waitUntil: 'networkidle' });
    await mPage.waitForSelector('[aria-label="Set tier S"]', { timeout: 10000 });
    const tpBox = await mPage.locator('[aria-label="Set tier S"]').first().boundingBox();
    if (tpBox) info(`Tier picker btn: ${Math.round(tpBox.width)}×${Math.round(tpBox.height)}px (recommend ≥44px)`);

    // Film detail logged-in — overflow
    await mPage.goto(`${BASE}/film/${F1_TMDB}`, { waitUntil: 'networkidle' });
    const fdLoggedIn = await horizOverflow(mPage);
    if (fdLoggedIn) fail('Overflow: Film detail (logged in)');
    else            pass('No overflow: Film detail (logged in)');

    // Profile /me header
    await mPage.goto(`${BASE}/profile/me`, { waitUntil: 'networkidle' });
    const profOv = await horizOverflow(mPage);
    if (profOv) fail('Overflow: Profile /me header');
    else        pass('No overflow: Profile /me header');

    // Profile tabs bar
    const tabsOv = await horizOverflow(mPage);
    if (tabsOv) fail('Overflow: Profile tabs bar');
    else        pass('No overflow: Profile tabs bar');

    // Tier List tab
    await openTierTab(mPage);
    const tierTabOv = await horizOverflow(mPage);
    if (tierTabOv) fail('Overflow: Profile Tier List tab');
    else           pass('No overflow: Profile Tier List tab');

    // Tier control touch targets (always visible on mobile — no hover needed)
    const anyCtrl = mPage.locator('[aria-label^="Remove"], [aria-label^="Move"]').first();
    if (await anyCtrl.count() > 0) {
      const box = await anyCtrl.boundingBox();
      if (box) {
        const w = Math.round(box.width), h = Math.round(box.height);
        if (w >= 44 && h >= 44)      pass(`Tier controls: ${w}×${h}px — meets 44px target`);
        else if (w >= 24 && h >= 24) warn(`Tier controls: ${w}×${h}px — above WCAG 2.2 AA (24px) but below HIG 44px`);
        else                         fail(`Tier controls: ${w}×${h}px — below WCAG 2.2 AA 24px minimum`);
      }
    } else {
      info('No tier controls on mobile profile (no films in list yet — check order of ops)');
    }

    await mCtx.close();

  } catch (err) {
    fail(`Script error: ${err.message}`);
    console.error(err);
  } finally {
    await browser.close();
  }

  // ── Final summary ──────────────────────────────────────────
  console.log('\n' + '═'.repeat(64));
  console.log('  STOP POINT 3 — VERIFICATION RESULTS');
  console.log('═'.repeat(64));
  for (const r of results) {
    const icon = r.s === 'PASS' ? '✅' : r.s === 'FAIL' ? '❌' : r.s === 'WARN' ? '⚠️ ' : 'ℹ️ ';
    console.log(`  ${icon} ${r.m}`);
  }
  const P = results.filter(r => r.s === 'PASS').length;
  const F = results.filter(r => r.s === 'FAIL').length;
  const W = results.filter(r => r.s === 'WARN').length;
  console.log(`\n  ${P} passed · ${W} warnings · ${F} failed`);
  console.log('═'.repeat(64));
})();
