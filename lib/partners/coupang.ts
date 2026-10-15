import { createHmac } from "node:crypto";
import { z } from "zod";
import { categories, type Catalog, type Product } from "./catalog";

const origin = "https://api-gateway.coupang.com";
const base = "/v2/providers/affiliate_open_api/apis/openapi/v1";
export type PartnerDiagnostic = {
  stage:
    | "recommendations"
    | "category_recommendations"
    | "product_search"
    | "affiliate_links";
  httpStatus: number;
  providerCode?: string;
  providerMessage?: string;
};
export function redactProviderMessage(message: string, secrets: string[]) {
  let result = message;
  for (const secret of secrets) {
    if (secret) result = result.split(secret).join("[redacted]");
  }
  return result
    .replace(
      /(access[-_ ]?key|secret[-_ ]?key|signature|authorization)\s*[:=]\s*[^,\s]+/gi,
      "$1=[redacted]",
    )
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .slice(0, 240);
}
export class PartnerError extends Error {
  constructor(
    public code:
      | "configuration"
      | "upstream"
      | "rate_limit"
      | "invalid_response",
    message: string,
    public diagnostic?: PartnerDiagnostic,
  ) {
    super(message);
    this.name = "PartnerError";
  }
}
export function configured() {
  return Boolean(
    process.env.COUPANG_ACCESS_KEY?.trim() &&
      process.env.COUPANG_SECRET_KEY?.trim(),
  );
}
export function authorization(
  method: string,
  path: string,
  query: string,
  accessKey: string,
  secretKey: string,
  now = new Date(),
) {
  const datetime = now
    .toISOString()
    .replace(/[:-]|\.\d{3}/g, "")
    .slice(2);
  const signature = createHmac("sha256", secretKey)
    .update(datetime + method.toUpperCase() + path + query)
    .digest("hex");
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;
}
export function affiliateUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (["link.coupang.com", "coupa.ng"].includes(url.hostname))
      return url.href;
    // Only accept Coupang-hosted URLs returned by the authenticated affiliate API.
    if (
      ["www.coupang.com", "coupang.com"].includes(url.hostname) &&
      url.pathname.startsWith("/re/")
    )
      return url.href;
    return null;
  } catch {
    return null;
  }
}
function coupangProductUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      ["www.coupang.com", "coupang.com"].includes(u.hostname)
    );
  } catch {
    return false;
  }
}
async function call(
  path: string,
  query: URLSearchParams,
  body?: unknown,
): Promise<unknown> {
  const access = process.env.COUPANG_ACCESS_KEY?.trim();
  const secret = process.env.COUPANG_SECRET_KEY?.trim();
  if (!access || !secret)
    throw new PartnerError(
      "configuration",
      "쿠팡 파트너스 API 설정이 필요합니다.",
    );
  const method = body ? "POST" : "GET";
  const q = query.toString();
  let response: Response;
  try {
    response = await fetch(origin + path + (q ? "?" + q : ""), {
      method,
      headers: {
        Authorization: authorization(method, path, q, access, secret),
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new PartnerError(
      "upstream",
      "쿠팡 상품 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }
  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }
  const envelope = z
    .object({
      rCode: z.union([z.string(), z.number()]).transform(String),
      rMessage: z.string().optional(),
      data: z.unknown().optional(),
    })
    .safeParse(parsed);
  const diagnostic: PartnerDiagnostic = {
    stage: path.includes("/bestcategories/")
      ? "category_recommendations"
      : path.endsWith("/products/search")
        ? "product_search"
        : path.endsWith("/deeplink")
          ? "affiliate_links"
          : "recommendations",
    httpStatus: response.status,
  };
  if (envelope.success) {
    diagnostic.providerCode = redactProviderMessage(envelope.data.rCode, [
      access,
      secret,
    ]).slice(0, 32);
    if (envelope.data.rMessage)
      diagnostic.providerMessage = redactProviderMessage(
        envelope.data.rMessage,
        [access, secret],
      );
  }
  const message = diagnostic.providerMessage || "";
  if (
    response.status === 429 ||
    /rate.?limit|too many|호출.*(초과|제한)|한도.*초과/i.test(message)
  )
    throw new PartnerError(
      "rate_limit",
      "쿠팡 상품 조회 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.",
      diagnostic,
    );
  if (response.status === 401 || response.status === 403)
    throw new PartnerError(
      "configuration",
      "쿠팡 파트너스 API 권한과 등록된 서버 IP를 확인해 주세요.",
      diagnostic,
    );
  if (!response.ok)
    throw new PartnerError(
      "upstream",
      "쿠팡 상품 서버가 요청을 처리하지 못했습니다.",
      diagnostic,
    );
  if (!envelope.success)
    throw new PartnerError(
      "invalid_response",
      "상품 응답 형식이 올바르지 않습니다.",
      diagnostic,
    );
  if (envelope.data.rCode !== "0")
    throw new PartnerError(
      "upstream",
      "쿠팡 파트너스 요청이 거절됐습니다. 공급처 오류 내용을 확인해 주세요.",
      diagnostic,
    );
  return envelope.data.data;
}
export function normalizeProductImage(
  value: string | null | undefined,
): string | null {
  if (!value?.trim()) return null;
  try {
    const trimmed = value.trim();
    const url = new URL(
      trimmed.startsWith("//") ? "https:" + trimmed : trimmed,
    );
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return null;
    if (
      url.hostname !== "coupangcdn.com" &&
      !url.hostname.endsWith(".coupangcdn.com")
    )
      return null;
    if (url.port && url.port !== "443") return null;
    url.protocol = "https:";
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}
const itemSchema = z.object({
  productId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
  productName: z.string().min(1),
  productPrice: z.number().nonnegative(),
  productImage: z.string().nullish(),
  productUrl: z.string().url(),
  isRocket: z.boolean().optional(),
  categoryName: z.string().optional(),
});
export function parseProducts(raw: unknown, updatedAt: string): Product[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && "productData" in raw
      ? (raw as { productData: unknown }).productData
      : null;
  if (!Array.isArray(list))
    throw new PartnerError(
      "invalid_response",
      "상품 목록 형식이 올바르지 않습니다.",
    );
  const unique = new Map<string, Product>();
  for (const value of list) {
    const parsed = itemSchema.safeParse(value);
    if (!parsed.success) continue;
    const item = parsed.data;
    const image = normalizeProductImage(item.productImage);
    const id = String(item.productId);
    unique.set(id, {
      id,
      name: item.productName,
      price: item.productPrice,
      image,
      affiliateUrl: affiliateUrl(item.productUrl),
      category: item.categoryName || "쿠팡 추천",
      rocket: item.isRocket || false,
      source: "coupang",
      updatedAt,
    });
  }
  if (list.length && unique.size === 0)
    throw new PartnerError(
      "invalid_response",
      "표시할 수 있는 상품 정보가 없습니다.",
    );
  return Array.from(unique.values());
}
export async function fetchCatalog(
  keyword = "",
  category = "all",
): Promise<Catalog> {
  const params = new URLSearchParams();
  const subId = process.env.COUPANG_SUB_ID?.trim();
  if (subId) params.set("subId", subId);
  if (keyword) {
    params.set("keyword", keyword);
    params.set("limit", "10");
  }
  const selectedCategory = categories.find((c) => c.id === category);
  if (!selectedCategory)
    throw new PartnerError("configuration", "지원하지 않는 카테고리입니다.");
  const categoryId =
    "coupangCategoryId" in selectedCategory
      ? selectedCategory.coupangCategoryId
      : null;
  if (!keyword && categoryId) params.set("limit", "100");
  const endpoint = keyword
    ? "/products/search"
    : categoryId
      ? "/products/bestcategories/" + categoryId
      : "/products/goldbox";
  let raw: unknown;
  try {
    raw = await call(base + endpoint, params);
  } catch (error) {
    const inactiveCategory =
      !keyword &&
      Boolean(categoryId) &&
      error instanceof PartnerError &&
      error.diagnostic?.stage === "category_recommendations" &&
      error.diagnostic.providerCode === "400" &&
      /category id is not active/i.test(error.diagnostic.providerMessage || "");
    if (!inactiveCategory) throw error;
    raw = [];
  }
  const updatedAt = new Date().toISOString();
  let products = parseProducts(raw, updatedAt);
  let selection: Catalog["selection"];
  if (!keyword && categoryId && products.length === 0) {
    const searchParams = new URLSearchParams();
    searchParams.set("keyword", selectedCategory.keyword);
    searchParams.set("limit", "10");
    if (subId) searchParams.set("subId", subId);
    raw = await call(base + "/products/search", searchParams);
    products = parseProducts(raw, updatedAt);
    selection = "category_search";
  }
  // Normal product URLs must first be converted using this account's deeplink API.
  const list = Array.isArray(raw)
    ? raw
    : (raw as { productData?: unknown[] })?.productData || [];
  const originals = new Map<string, string>();
  for (const value of list) {
    const item = itemSchema.safeParse(value);
    if (
      item.success &&
      coupangProductUrl(item.data.productUrl) &&
      !affiliateUrl(item.data.productUrl)
    )
      originals.set(String(item.data.productId), item.data.productUrl);
  }
  if (originals.size) {
    const urls = Array.from(new Set(Array.from(originals.values())));
    const converted: {
      originalUrl: string;
      shortenUrl?: string;
      landingUrl?: string;
    }[] = [];
    for (let index = 0; index < urls.length; index += 50) {
      const links = await call(base + "/deeplink", new URLSearchParams(), {
        coupangUrls: urls.slice(index, index + 50),
        ...(subId ? { subId } : {}),
      });
      const parsed = z
        .array(
          z.object({
            originalUrl: z.string(),
            shortenUrl: z.string().optional(),
            landingUrl: z.string().optional(),
          }),
        )
        .safeParse(links);
      if (!parsed.success)
        throw new PartnerError(
          "invalid_response",
          "파트너스 링크를 생성하지 못했습니다.",
        );
      converted.push(...parsed.data);
    }
    const mapped = new Map(
      converted.map((v) => [
        v.originalUrl,
        affiliateUrl(v.shortenUrl || "") || affiliateUrl(v.landingUrl || ""),
      ]),
    );
    for (const product of products) {
      const original = originals.get(product.id);
      if (original) product.affiliateUrl = mapped.get(original) || null;
    }
  }
  // Never send an untracked general product link as a commission-bearing link.
  if (products.some((p) => !p.affiliateUrl))
    throw new PartnerError(
      "invalid_response",
      "일부 상품의 파트너스 링크를 확인하지 못했습니다.",
    );
  const rejectedHosts = new Set<string>();
  const sourceFields = new Set<string>();
  let sourceMissing = 0;
  let invalidUrls = 0;
  for (const value of list) {
    if (!value || typeof value !== "object") continue;
    const entry = value as Record<string, unknown>;
    Object.keys(entry)
      .filter((key) => /image|thumbnail|picture/i.test(key))
      .slice(0, 8)
      .forEach((key) => sourceFields.add(key));
    const candidate = entry.productImage;
    if (typeof candidate !== "string" || !candidate.trim()) {
      sourceMissing++;
      continue;
    }
    if (normalizeProductImage(candidate)) continue;
    try {
      const text = candidate.trim();
      const url = new URL(text.startsWith("//") ? "https:" + text : text);
      rejectedHosts.add(url.hostname);
    } catch {
      invalidUrls++;
    }
  }
  const imageDiagnostics = {
    accepted: products.filter((p) => Boolean(p.image)).length,
    sourceMissing,
    rejectedHosts: Array.from(rejectedHosts),
    invalidUrls,
    sourceFields: Array.from(sourceFields),
  };
  return {
    mode: "live",
    products,
    imageDiagnostics,
    updatedAt,
    ...(selection ? { selection } : {}),
  };
}
