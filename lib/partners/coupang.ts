import { createHmac } from "node:crypto";
import { z } from "zod";
import type { Catalog, Product } from "./catalog";

const origin = "https://api-gateway.coupang.com";
const base = "/v2/providers/affiliate_open_api/apis/openapi/v1";
export class PartnerError extends Error {
  constructor(
    public code:
      | "configuration"
      | "upstream"
      | "rate_limit"
      | "invalid_response",
    message: string,
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
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new PartnerError(
      "upstream",
      "쿠팡 상품 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }
  if (response.status === 429)
    throw new PartnerError(
      "rate_limit",
      "상품 조회 요청이 많습니다. 잠시 후 다시 시도해 주세요.",
    );
  if (response.status === 401 || response.status === 403)
    throw new PartnerError(
      "configuration",
      "쿠팡 파트너스 API 권한과 등록된 서버 IP를 확인해 주세요.",
    );
  if (!response.ok)
    throw new PartnerError("upstream", "쿠팡 상품 정보를 가져오지 못했습니다.");
  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    throw new PartnerError(
      "invalid_response",
      "상품 응답을 확인할 수 없습니다.",
    );
  }
  const envelope = z
    .object({ rCode: z.string(), data: z.unknown().optional() })
    .safeParse(parsed);
  if (!envelope.success)
    throw new PartnerError(
      "invalid_response",
      "상품 응답 형식이 올바르지 않습니다.",
    );
  if (envelope.data.rCode !== "0")
    throw new PartnerError(
      "upstream",
      "쿠팡 파트너스 요청이 처리되지 않았습니다. API 권한과 이용 한도를 확인해 주세요.",
    );
  return envelope.data.data;
}
const itemSchema = z.object({
  productId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
  productName: z.string().min(1),
  productPrice: z.number().nonnegative(),
  productImage: z.string().optional(),
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
    let image: string | null = null;
    try {
      const u = new URL(item.productImage || "");
      if (
        u.protocol === "https:" &&
        (u.hostname === "coupangcdn.com" ||
          u.hostname.endsWith(".coupangcdn.com"))
      )
        image = u.href;
    } catch {}
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
export async function fetchCatalog(keyword = ""): Promise<Catalog> {
  const params = new URLSearchParams();
  const subId = process.env.COUPANG_SUB_ID?.trim();
  if (subId) params.set("subId", subId);
  if (keyword) {
    params.set("keyword", keyword);
    params.set("limit", "10");
  }
  const raw = await call(
    base + (keyword ? "/products/search" : "/products/goldbox"),
    params,
  );
  const updatedAt = new Date().toISOString();
  const products = parseProducts(raw, updatedAt);
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
    const links = await call(base + "/deeplink", new URLSearchParams(), {
      coupangUrls: Array.from(new Set(Array.from(originals.values()))),
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
    const mapped = new Map(
      parsed.data.map((v) => [
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
  return { mode: "live", products, updatedAt };
}
