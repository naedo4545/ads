import { test } from "node:test";
import assert from "node:assert/strict";
import {
  authorization,
  affiliateUrl,
  parseProducts,
  fetchCatalog,
  PartnerError,
} from "../lib/partners/coupang";
import { exampleCatalog } from "../lib/partners/catalog";
const path = "/v2/providers/affiliate_open_api/apis/openapi/v1";
const item = {
  productId: 123,
  productName: "텀블러",
  productPrice: 21900,
  productImage: "https://image6.coupangcdn.com/example.jpg",
  productUrl: "https://link.coupang.com/a/verified",
  isRocket: true,
};
const contexts = new WeakSet<object>();
function setup(t: any, handler: typeof fetch) {
  if (!contexts.has(t)) {
    contexts.add(t);
    const originalFetch = global.fetch;
    const names = [
      "COUPANG_ACCESS_KEY",
      "COUPANG_SECRET_KEY",
      "COUPANG_SUB_ID",
    ];
    const original = names.map((name) => [name, process.env[name]] as const);
    t.after(() => {
      global.fetch = originalFetch;
      for (const [name, value] of original) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    });
    process.env.COUPANG_ACCESS_KEY = "test-access";
    process.env.COUPANG_SECRET_KEY = "test-secret";
    process.env.COUPANG_SUB_ID = "testSub";
  }
  global.fetch = handler;
}

const ok = (data: unknown) =>
  new Response(JSON.stringify({ rCode: "0", data }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
test("HMAC signature matches independent fixed test vector and UTC date", () => {
  assert.equal(
    authorization(
      "GET",
      path + "/products/search",
      "keyword=%ED%85%80%EB%B8%94%EB%9F%AC&limit=12",
      "test-access",
      "test-secret",
      new Date("2026-10-15T00:00:00Z"),
    ),
    "CEA algorithm=HmacSHA256, access-key=test-access, signed-date=261015T000000Z, signature=e99b39a10b43d67471ede29cb111022e3a577b42d82b0a025c8a9c813abefd2c",
  );
});
test("Affiliate URLs reject lookalike domains, unsafe protocols and general product links", () => {
  assert.equal(
    affiliateUrl("https://link.coupang.com/a/123"),
    "https://link.coupang.com/a/123",
  );
  for (const value of [
    "javascript:alert(1)",
    "https://link.coupang.com.evil.test/a",
    "https://evil.test/",
    "http://link.coupang.com/a",
    "https://user:password@link.coupang.com/a",
    "https://www.coupang.com/vp/products/123",
  ])
    assert.equal(affiliateUrl(value), null);
});
test("Parse goldbox and search formats, deduplicate and restrict product images", () => {
  const products = parseProducts(
    {
      productData: [
        item,
        item,
        { ...item, productId: 456, productImage: "https://evil.test/tracker" },
      ],
    },
    "2026-10-15T00:00:00Z",
  );
  assert.equal(products.length, 2);
  assert.equal(products[0].affiliateUrl, item.productUrl);
  assert.equal(products[0].rocket, true);
  assert.equal(products[1].image, null);
  assert.equal(parseProducts([], new Date().toISOString()).length, 0);
  assert.throws(() => parseProducts({ unexpected: [] }, ""), PartnerError);
  assert.throws(
    () => parseProducts([{ productName: "missing fields" }], ""),
    PartnerError,
  );
});
test("Official goldbox response produces account-issued links without exposing credentials", async (t) => {
  let calls = 0;
  setup(t, async (url, init) => {
    calls++;
    assert.equal(new URL(String(url)).pathname, path + "/products/goldbox");
    assert.equal(new URL(String(url)).searchParams.get("subId"), "testSub");
    assert.match(
      String((init?.headers as any).Authorization),
      /^CEA algorithm=HmacSHA256/,
    );
    return ok([item]);
  });
  const result = await fetchCatalog();
  assert.equal(calls, 1);
  assert.equal(result.mode, "live");
  assert.equal(result.products[0].affiliateUrl, item.productUrl);
  assert.ok(result.updatedAt);
  assert.equal(JSON.stringify(result).includes("test-secret"), false);
});
test("Raw Coupang product URLs are converted through this account deeplink API", async (t) => {
  let calls = 0;
  const raw = "https://www.coupang.com/vp/products/123";
  setup(t, async (url, init) => {
    calls++;
    const u = new URL(String(url));
    if (u.pathname.endsWith("/products/search")) {
      assert.equal(u.searchParams.get("keyword"), "텀블러");
      return ok({ productData: [{ ...item, productUrl: raw }] });
    }
    assert.equal(u.pathname, path + "/deeplink");
    assert.equal(init?.method, "POST");
    assert.deepEqual(JSON.parse(String(init?.body)), {
      coupangUrls: [raw],
      subId: "testSub",
    });
    return ok([
      {
        originalUrl: raw,
        shortenUrl: "https://link.coupang.com/a/account-owned",
      },
    ]);
  });
  const result = await fetchCatalog("텀블러");
  assert.equal(calls, 2);
  assert.equal(
    result.products[0].affiliateUrl,
    "https://link.coupang.com/a/account-owned",
  );
});
test("Failed affiliate conversion never exposes untracked purchase links", async (t) => {
  setup(t, async (url) =>
    String(url).includes("/deeplink")
      ? ok([])
      : ok([
          { ...item, productUrl: "https://www.coupang.com/vp/products/123" },
        ]),
  );
  await assert.rejects(
    () => fetchCatalog(),
    (error: any) =>
      error instanceof PartnerError && error.code === "invalid_response",
  );
});
test("Rate limits, HTTP authorization errors and API errors are reported rather than replaced by examples", async (t) => {
  for (const status of [429, 403, 500]) {
    setup(t, async () => new Response("", { status }));
    await assert.rejects(
      () => fetchCatalog(),
      (error: any) =>
        error instanceof PartnerError &&
        (status === 429 ? error.code === "rate_limit" : true),
    );
  }
  setup(
    t,
    async () =>
      new Response(
        JSON.stringify({ rCode: "999", rMessage: "private upstream detail" }),
        { status: 200 },
      ),
  );
  await assert.rejects(
    () => fetchCatalog(),
    (error: any) =>
      error instanceof PartnerError &&
      !error.message.includes("private upstream detail"),
  );
});
test("Network failures and malformed responses fail safely", async (t) => {
  setup(t, async () => {
    throw new Error("sensitive internals");
  });
  await assert.rejects(
    () => fetchCatalog(),
    (error: any) =>
      error.code === "upstream" && !error.message.includes("sensitive"),
  );
  setup(t, async () => new Response("not json", { status: 200 }));
  await assert.rejects(
    () => fetchCatalog(),
    (error: any) => error.code === "invalid_response",
  );
});
test("Examples cannot create commission-bearing links and support category search", () => {
  const result = exampleCatalog();
  assert.equal(result.mode, "example");
  assert.equal(result.products.length, 12);
  assert.ok(
    result.products.every(
      (p) => p.affiliateUrl === null && p.source === "example",
    ),
  );
  assert.equal(exampleCatalog("디지털 가전").products.length, 3);
  assert.equal(exampleCatalog("존재하지않는상품").products.length, 0);
});
