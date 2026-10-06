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

test("H19 açılışı tam 19 harfi koruyor", async ({ page }) => {
  await page.goto("/");

  const glyphs = page.locator("[data-h19-glyph]");
  await expect(glyphs).toHaveCount(19);
  await expect(page.locator("[data-phase]")).toHaveAttribute("data-phase", "line");

  const orbitCounts = await glyphs.evaluateAll((items) =>
    items.reduce<Record<string, number>>((counts, item) => {
      const orbit = (item as HTMLElement).dataset.h19Orbit ?? "";
      counts[orbit] = (counts[orbit] ?? 0) + 1;
      return counts;
    }, {}),
  );

  expect(orbitCounts).toEqual({
    "0": 1,
    H: 6,
    "2H": 6,
    "9H": 6,
  });

  await expectNoHorizontalOverflow(page);
});

test("scroll aynı 19 harfi farklı matematiksel durumlara taşıyor", async ({ page }) => {
  await page.goto("/");

  const sequence = page.locator("[data-phase]");
  const glyphs = page.locator("[data-h19-glyph]");
  const height = await sequence.evaluate((element) =>
    element.getBoundingClientRect().height,
  );

  const samples = [0.03, 0.14, 0.31, 0.49, 0.66, 0.83, 0.95];
  const phases: string[] = [];
  const signatures: string[] = [];

  for (const ratio of samples) {
    await page.evaluate(
      ({ y }) => window.scrollTo(0, y),
      { y: height * ratio },
    );
    await page.waitForTimeout(120);

    phases.push((await sequence.getAttribute("data-phase")) ?? "");
    signatures.push(
      await glyphs.evaluateAll((items) =>
        items.map((item) => getComputedStyle(item).transform).join("|"),
      ),
    );

    await expect(glyphs).toHaveCount(19);
    await expectNoHorizontalOverflow(page);
  }

  expect(new Set(phases).size).toBeGreaterThanOrEqual(5);
  expect(new Set(signatures).size).toBeGreaterThanOrEqual(5);
});

test("reduced motion H19 geometrisini bozmuyor", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.locator("[data-h19-glyph]")).toHaveCount(19);
  await expect(page.locator("[data-phase]")).toHaveAttribute("data-phase", "hex");
  await expectNoHorizontalOverflow(page);
});
