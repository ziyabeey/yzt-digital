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

  for (const selector of ["#about", "#now", "#work", "#lab", "#notes", "#final"]) {
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


test("aynı 19 modül baştan finale kadar biçim değiştiriyor", async ({ page }) => {
  await page.goto("/");

  const modules = page.locator(".material-module");
  await expect(modules).toHaveCount(19);

  const initial = await modules.nth(0).getAttribute("style");

  await page.locator("#lab").scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  const lab = await modules.nth(0).getAttribute("style");

  await page.locator("#final").scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  const final = await modules.nth(0).getAttribute("style");

  await expect(modules).toHaveCount(19);
  expect(lab).not.toBe(initial);
  expect(final).not.toBe(lab);
  await expectNoHorizontalOverflow(page);
});


test("biyografik sekans aynı materyali altı duruma taşır", async ({ page }) => {
  await page.goto("/");

  const about = page.locator("#about");
  const box = await about.boundingBox();
  expect(box).not.toBeNull();

  const labels = page.locator(".material-label");
  await expect(labels).toHaveCount(6);

  const sectionTop = await about.evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY,
  );
  const sectionHeight = await about.evaluate(
    (element) => element.getBoundingClientRect().height,
  );

  const samples = [0.08, 0.24, 0.4, 0.56, 0.72, 0.9];
  const seen: string[] = [];

  for (const ratio of samples) {
    await page.evaluate(
      ({ y }) => window.scrollTo(0, y),
      { y: sectionTop + sectionHeight * ratio },
    );
    await page.waitForTimeout(120);

    const active = await labels.evaluateAll((items) => {
      const ranked = items
        .map((item) => ({
          text: item.textContent?.trim() ?? "",
          opacity: Number.parseFloat(
            window.getComputedStyle(item).opacity || "0",
          ),
        }))
        .sort((a, b) => b.opacity - a.opacity);

      return ranked[0]?.text ?? "";
    });

    seen.push(active);
    await expect(page.locator(".material-module")).toHaveCount(19);
  }

  expect(new Set(seen).size).toBeGreaterThanOrEqual(4);
  await expectNoHorizontalOverflow(page);
});


test("dört proje aynı 19 parçaya dört farklı dil veriyor", async ({ page }) => {
  await page.goto("/");

  const modules = page.locator(".material-module");
  await expect(modules).toHaveCount(19);

  const selectors = [
    "#project-kepenk",
    "#project-yote",
    "#project-kldrm",
    "#project-h19",
  ];

  const signatures: string[] = [];

  for (const selector of selectors) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(180);

    const signature = await modules.evaluateAll((items) =>
      items
        .map((item) => item.getAttribute("style") ?? "")
        .join("|"),
    );

    signatures.push(signature);
    await expect(modules).toHaveCount(19);
    await expectNoHorizontalOverflow(page);
  }

  expect(new Set(signatures).size).toBe(4);
});


test("notes ve archive rotaları mobilde taşmadan açılıyor", async ({ page }) => {
  await page.goto("/notes");
  await expect(page.getByRole("heading", { name: /Bir şeyi anlamaya/i })).toBeVisible();
  await expect(page.locator(".note-row")).toHaveCount(2);
  await expectNoHorizontalOverflow(page);

  await page.goto("/archive");
  await expect(page.getByRole("heading", { name: /Malzeme değişti/i })).toBeVisible();
  await expect(page.locator(".archive-row")).toHaveCount(11);
  await expectNoHorizontalOverflow(page);
});


test("aktif proje metni malzeme sahnesiyle senkron kalır", async ({ page }) => {
  await page.goto("/");

  for (const selector of [
    "#project-kepenk",
    "#project-yote",
    "#project-kldrm",
    "#project-h19",
  ]) {
    const row = page.locator(selector);
    await row.scrollIntoViewIfNeeded();
    await page.waitForTimeout(140);

    await expect(row).toHaveAttribute("data-active-project", "true");
    await expect(page.locator(".material-module")).toHaveCount(19);
    await expectNoHorizontalOverflow(page);
  }
});


test("404 sayfası aynı görsel dili korur ve taşmaz", async ({ page }) => {
  await page.goto("/bu-yol-yok");

  await expect(
    page.getByRole("heading", { name: /Bu parça/i }),
  ).toBeVisible();
  await expect(page.getByText("10 = 10")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("metadata sosyal görselleri erişilebilir PNG döndürür", async ({ page, request }) => {
  await page.goto("/");

  const imageUrls = await page.evaluate(() => {
    const og = document
      .querySelector('meta[property="og:image"]')
      ?.getAttribute("content");
    const twitter = document
      .querySelector('meta[name="twitter:image"]')
      ?.getAttribute("content");

    return [og, twitter].filter(
      (value): value is string => Boolean(value),
    );
  });

  expect(imageUrls.length).toBe(2);

  for (const url of imageUrls) {
    const response = await request.get(url);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("image/png");
  }
});

test("kamusal profil bağlantıları görünür ve güvenli açılır", async ({ page }) => {
  await page.goto("/");
  await page.locator(".site-footer").scrollIntoViewIfNeeded();

  const links = page.locator(".footer-links a");
  await expect(links).toHaveCount(3);

  for (let index = 0; index < 3; index += 1) {
    await expect(links.nth(index)).toHaveAttribute("target", "_blank");
    await expect(links.nth(index)).toHaveAttribute("rel", /noreferrer/);
  }
});
