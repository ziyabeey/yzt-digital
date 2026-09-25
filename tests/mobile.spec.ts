import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const metrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    body: document.body.scrollWidth,
    html: document.documentElement.scrollWidth,
  }));

  expect(metrics.body).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(metrics.html).toBeLessThanOrEqual(metrics.viewport + 1);
}

test("19 modül korunuyor ve mobilde taşma yapmıyor", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".wordmark")).toBeVisible();
  await expect(page.locator(".material-module")).toHaveCount(19);
  await expectNoHorizontalOverflow(page);

  const manifestoHeight = await page.locator("#index").evaluate(
    (element) => element.getBoundingClientRect().height,
  );

  for (const ratio of [0.12, 0.32, 0.54, 0.76, 0.96]) {
    await page.evaluate(
      ({ y }) => window.scrollTo(0, y),
      { y: manifestoHeight * ratio },
    );
    await page.waitForTimeout(80);
    await expect(page.locator(".material-module")).toHaveCount(19);
    await expectNoHorizontalOverflow(page);
  }

  for (const selector of ["#about", "#now", "#work", "#lab", "#notes"]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    await expect(page.locator(".material-module")).toHaveCount(19);
    await expectNoHorizontalOverflow(page);
  }
});

test("mobil metinler viewport içinde kalıyor", async ({ page }) => {
  await page.goto("/");

  const selectors = [
    ".manifesto-line",
    ".identity-copy h1",
    ".now-grid h2",
    ".project-row h2",
    ".lab-word",
    ".notes-intro h2",
  ];

  for (const selector of selectors) {
    const items = page.locator(selector);
    const count = await items.count();

    for (let index = 0; index < count; index += 1) {
      const item = items.nth(index);
      await item.scrollIntoViewIfNeeded();
      const box = await item.boundingBox();

      if (!box) continue;

      expect(box.x).toBeGreaterThanOrEqual(-2);
      expect(box.x + box.width).toBeLessThanOrEqual(
        (await page.evaluate(() => window.innerWidth)) + 2,
      );
    }
  }
});

test("reduced motion içerik ve navigasyonu bozmuyor", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.locator(".manifesto-scene.scene-one")).toBeVisible();
  await expect(page.locator(".material-module")).toHaveCount(19);
  await expect(page.locator("#about")).toContainText("Malzeme değişiyor.");
  await expect(page.locator("#now")).toContainText("Kepenk.ai");
  await expectNoHorizontalOverflow(page);
});


test("mobil menü dokunma ve erişilebilirlik açısından çalışıyor", async ({ page }) => {
  await page.goto("/");

  const menu = page.getByRole("button", { name: "Menüyü aç" });
  await expect(menu).toBeVisible();

  const box = await menu.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);

  await menu.click();
  await expect(page.getByRole("button", { name: "Menüyü kapat" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Mobil navigasyon" })).toBeVisible();

  await page.getByRole("link", { name: "LAB" }).click();
  await expect(page.locator("#lab")).toBeInViewport();
  await expect(page.getByRole("button", { name: "Menüyü aç" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
