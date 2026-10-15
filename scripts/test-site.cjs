const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const baseURL = process.env.SITE_TEST_URL || "http://127.0.0.1:3100";
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const check = async (name, fn) => {
    await fn();
    console.log("PASS", name);
  };
  const waitCount = (n) =>
    page.waitForFunction(
      (n) => document.querySelectorAll(".product-card").length === n,
      n,
    );
  try {
    await check(
      "Shopping homepage renders 12 clearly marked examples without fake purchase links",
      async () => {
        const r = await page.goto(baseURL);
        assert.equal(r.status(), 200);
        await page.getByRole("heading", { name: /장바구니 넣기 전/ }).waitFor();
        await waitCount(12);
        await page.locator(".catalog-notice").waitFor();
        assert.equal(
          await page.locator('a[href*="link.coupang.com"]').count(),
          0,
        );
        await page.screenshot({
          path: "/tmp/moapick-desktop.png",
          fullPage: true,
        });
      },
    );
    await check(
      "Category and price sorting use the selected product set",
      async () => {
        await page
          .getByRole("button", { name: "디지털 · 가전", exact: true })
          .click();
        await waitCount(3);
        await page.getByLabel("상품 정렬").selectOption("low");
        assert.match(
          await page.locator(".product-name").first().innerText(),
          /스피커/,
        );
        await page.getByLabel("상품 정렬").selectOption("high");
        assert.match(
          await page.locator(".product-name").first().innerText(),
          /헤드폰/,
        );
      },
    );
    await check(
      "Beauty, womenswear, menswear and sports each have a working independent category",
      async () => {
        await page.goto(baseURL);
        await waitCount(12);
        assert.equal(
          await page.locator(".category-discovery-grid>a").count(),
          4,
        );
        for (const [category, count] of [
          ["beauty", 2],
          ["fashion", 1],
          ["mens", 1],
          ["sports", 1],
        ]) {
          await page.goto(baseURL + "/search?category=" + category);
          await waitCount(count);
          assert.equal(
            await page.locator(".shop-categories button.active").count(),
            1,
          );
        }
        await page.goto(baseURL + "/search");
        await waitCount(12);
      },
    );
    await check("Search submit, empty result and reset work", async () => {
      await page
        .getByRole("textbox", { name: "상품 검색" })
        .fill("없는상품테스트");
      await page.getByRole("button", { name: "검색하기", exact: true }).click();
      await page.waitForURL("**/search?q=*");
      await page
        .getByRole("heading", { name: "검색한 상품을 찾지 못했어요." })
        .waitFor();
      await page
        .getByRole("button", { name: "전체 상품 보기", exact: true })
        .click();
      await waitCount(12);
    });
    await check(
      "Wishlist persists after navigation and reload, then removes correctly",
      async () => {
        await page
          .getByRole("button", {
            name: "무선 노이즈 캔슬링 헤드폰 찜하기",
            exact: true,
          })
          .click();
        await page.goto(baseURL + "/collection");
        await waitCount(1);
        await page.reload();
        await waitCount(1);
        await page
          .getByRole("button", {
            name: "무선 노이즈 캔슬링 헤드폰 찜 취소",
            exact: true,
          })
          .click();
        await page
          .getByRole("heading", { name: "아직 마음에 담아둔 상품이 없어요." })
          .waitFor();
      },
    );
    await check(
      "Example detail cannot misrepresent a commission-bearing purchase",
      async () => {
        await page.goto(baseURL + "/product/sample-headphones");
        await page
          .getByRole("heading", {
            name: "무선 노이즈 캔슬링 헤드폰",
            exact: true,
          })
          .waitFor();
        await page.locator(".example-purchase").waitFor();
        assert.equal(
          await page
            .getByRole("link", { name: "쿠팡에서 가격 확인하기" })
            .count(),
          0,
        );
        assert.match(
          await page.locator(".product-disclosure").innerText(),
          /일정액의 수수료/,
        );
        await page.goto(baseURL + "/product/nonexistent");
        await page
          .getByRole("heading", { name: "지금은 이 상품을 찾을 수 없어요." })
          .waitFor();
      },
    );
    const fixture = {
      mode: "live",
      updatedAt: "2026-10-15T00:00:00Z",
      products: [
        {
          id: "998",
          name: "공식 API 테스트 상품",
          price: 12000,
          image: null,
          affiliateUrl: "https://link.coupang.com/a/accounttest",
          rocket: true,
          category: "쿠팡 추천",
          source: "coupang",
          updatedAt: "2026-10-15T00:00:00Z",
        },
      ],
    };
    await check(
      "Mock live catalog exposes only the account-issued affiliate CTA with sponsored rel",
      async () => {
        await page.route("**/api/products**", (route) =>
          route.fulfill({ json: fixture }),
        );
        await page.goto(baseURL + "/product/998");
        await page
          .getByRole("heading", { name: "공식 API 테스트 상품", exact: true })
          .waitFor();
        const link = page.getByRole("link", { name: "쿠팡에서 가격 확인하기" });
        assert.equal(
          await link.getAttribute("href"),
          "https://link.coupang.com/a/accounttest",
        );
        assert.match(await link.getAttribute("rel"), /sponsored/);
        assert.equal(await link.getAttribute("target"), "_blank");
        assert.equal(await page.locator(".example-purchase").count(), 0);
        await page.unroute("**/api/products**");
      },
    );
    await check(
      "Live product images load with visible dimensions and have an explicit failure fallback",
      async () => {
        const imageFixture = {
          ...fixture,
          products: [
            {
              ...fixture.products[0],
              image: "https://image6.coupangcdn.com/browser-test.svg",
            },
          ],
        };
        let failImage = false;
        await page.route("https://image6.coupangcdn.com/**", (route) =>
          failImage
            ? route.abort()
            : route.fulfill({
                contentType: "image/svg+xml",
                body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="320" height="320" fill="#aec4a3"/></svg>',
              }),
        );
        await page.route("**/api/products**", (route) =>
          route.fulfill({ json: imageFixture }),
        );
        await page.goto(baseURL + "/search");
        await waitCount(1);
        await page.waitForFunction(() => {
          const img = document.querySelector(".product-card img");
          return img && img.complete && img.naturalWidth === 320;
        });
        assert.ok(
          await page
            .locator(".product-card img")
            .evaluate(
              (el) =>
                el.getBoundingClientRect().width > 100 &&
                el.getBoundingClientRect().height > 100 &&
                getComputedStyle(el).visibility === "visible",
            ),
        );
        await page.locator(".product-name").click();
        await page.waitForFunction(() => {
          const img = document.querySelector(".detail-image-wrap img");
          return img && img.complete && img.naturalWidth === 320;
        });
        failImage = true;
        await page.reload();
        await page.locator(".detail-image-wrap .image-unavailable").waitFor();
        assert.match(
          await page.locator(".image-error-label").first().innerText(),
          /이미지를 불러오지 못했어요/,
        );
        failImage = false;
        await page.reload();
        await page.waitForFunction(() => {
          const img = document.querySelector(".detail-image-wrap img");
          return (
            img &&
            img.complete &&
            img.naturalWidth === 320 &&
            getComputedStyle(img).visibility === "visible"
          );
        });
        await page.unroute("**/api/products**");
        await page.unroute("https://image6.coupangcdn.com/**");
      },
    );
    await check(
      "Live API failures show an error, do not fall back silently, and can retry",
      async () => {
        let failing = true;
        await page.route("**/api/products**", (route) =>
          failing
            ? route.fulfill({
                status: 503,
                json: { error: "API 연결 테스트 실패" },
              })
            : route.fulfill({ json: fixture }),
        );
        await page.goto(baseURL + "/search");
        await page
          .getByRole("heading", { name: "상품을 불러오지 못했어요." })
          .waitFor();
        assert.equal(await page.locator(".product-card").count(), 0);
        failing = false;
        await page
          .getByRole("button", { name: "다시 시도", exact: true })
          .click();
        await waitCount(1);
        await page.unroute("**/api/products**");
      },
    );
    await check(
      "More products reveals 12, 24 and all 29 with category context and tracking intact",
      async () => {
        const many = {
          ...fixture,
          products: Array.from({ length: 29 }, (_, i) => ({
            ...fixture.products[0],
            id: String(2000 + i),
            name: "더보기 상품 " + i,
            price: 10000 + i,
            affiliateUrl: "https://link.coupang.com/a/partner-" + i,
          })),
        };
        let requestedCategory = "";
        await page.route("**/api/products**", (route) => {
          requestedCategory =
            new URL(route.request().url()).searchParams.get("category") ||
            "all";
          return route.fulfill({ json: many });
        });
        await page.goto(baseURL + "/search");
        await waitCount(12);
        await page.getByRole("button", { name: /상품 더보기/ }).click();
        await waitCount(24);
        await page.getByRole("button", { name: /상품 더보기/ }).click();
        await waitCount(29);
        assert.equal(await page.locator(".load-more-button").count(), 0);
        await page.locator(".catalog-end").waitFor();
        await page
          .getByRole("button", { name: "디지털 · 가전", exact: true })
          .click();
        await waitCount(12);
        assert.equal(requestedCategory, "digital");
        const href = await page
          .locator(".product-name")
          .first()
          .getAttribute("href");
        assert.match(href, /category=digital/);
        await page.locator(".product-name").first().click();
        await page
          .getByRole("heading", { name: "더보기 상품 0", exact: true })
          .waitFor();
        assert.equal(
          await page.locator(".buy-button").getAttribute("href"),
          "https://link.coupang.com/a/partner-0",
        );
        assert.equal(
          await page.locator(".card-ad-label").first().innerText(),
          "광고",
        );
        await page.setViewportSize({ width: 390, height: 844 });
        await page.locator(".mobile-purchase-bar").waitFor();
        assert.equal(
          await page.locator(".mobile-purchase-bar a").getAttribute("href"),
          "https://link.coupang.com/a/partner-0",
        );
        assert.ok(
          Number.parseFloat(
            await page
              .locator(".product-disclosure")
              .evaluate((el) => getComputedStyle(el).fontSize),
          ) >= 14,
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        );
        await page.setViewportSize({ width: 1440, height: 1050 });
        await page.unroute("**/api/products**");
      },
    );
    await check(
      "Wishlist can show more items even when the external catalog is unavailable",
      async () => {
        const entries = Array.from({ length: 15 }, (_, i) => ({
          product: {
            ...fixture.products[0],
            id: String(3000 + i),
            name: "찜 상품 " + i,
          },
          keyword: "",
          category: "digital",
        }));
        await page.evaluate(
          (entries) =>
            localStorage.setItem("moapick-saved", JSON.stringify(entries)),
          entries,
        );
        let requests = 0;
        await page.route("**/api/products**", (route) => {
          requests++;
          return route.fulfill({
            status: 503,
            json: { error: "API unavailable" },
          });
        });
        await page.goto(baseURL + "/collection");
        await waitCount(12);
        await page.getByRole("button", { name: /상품 더보기/ }).click();
        await waitCount(15);
        assert.equal(requests, 0);
        assert.match(
          await page.locator(".product-name").first().getAttribute("href"),
          /category=digital/,
        );
        await page.evaluate(() => localStorage.removeItem("moapick-saved"));
        await page.unroute("**/api/products**");
      },
    );
    await check(
      "Public routes validate search length and protect scheduled refresh",
      async () => {
        const invalid = await context.request.get(
          baseURL + "/api/products?q=" + "a".repeat(81),
        );
        assert.equal(invalid.status(), 400);
        const badCategory = await context.request.get(
          baseURL + "/api/products?category=invalid",
        );
        assert.equal(badCategory.status(), 400);
        const cron = await context.request.get(baseURL + "/api/cron/products");
        assert.ok([401, 503].includes(cron.status()));
        const health = await context.request.get(baseURL + "/api/health");
        const body = await health.json();
        assert.equal(body.status, "example");
        assert.equal(body.services.affiliateLinks, "not_configured");
      },
    );
    await check(
      "Mobile homepage, menu and detail fit 390px and 320px",
      async () => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(baseURL);
        await waitCount(12);
        assert.ok(
          await page
            .locator(".product-name")
            .first()
            .evaluate((el) => parseFloat(getComputedStyle(el).fontSize) >= 16),
        );
        assert.ok(
          await page
            .locator(".shop-affiliate-disclosure p")
            .evaluate((el) => parseFloat(getComputedStyle(el).fontSize) >= 13),
        );
        await page.screenshot({
          path: "/tmp/moapick-mobile.png",
          fullPage: true,
        });
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        );
        await page
          .getByRole("button", { name: "메뉴 열기", exact: true })
          .click();
        await page.locator(".header-nav.open").waitFor();
        await page
          .getByRole("link", { name: "전체 상품", exact: true })
          .click();
        await page.waitForURL("**/search");
        await waitCount(12);
        await page.setViewportSize({ width: 320, height: 720 });
        await page.goto(baseURL + "/product/sample-headphones");
        await page
          .getByRole("heading", { name: "무선 노이즈 캔슬링 헤드폰" })
          .waitFor();
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
        );
      },
    );
    await check(
      "Setup and privacy pages explain settings and local storage",
      async () => {
        await page.goto(baseURL + "/guide");
        await page
          .getByRole("heading", { name: /발견은 모아픽에서/ })
          .waitFor();
        assert.match(
          await page.locator(".setup-variables").innerText(),
          /COUPANG_SECRET_KEY/,
        );
        await page.goto(baseURL + "/privacy");
        await page
          .getByRole("heading", { name: "개인정보 처리방침", exact: true })
          .waitFor();
      },
    );
    assert.deepEqual(errors, []);
    console.log("PASS No browser runtime errors");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
