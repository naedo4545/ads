import { unstable_cache } from "next/cache";
import { createHash } from "node:crypto";
import { configured, fetchCatalog } from "./coupang";
import { exampleCatalog } from "./catalog";
export async function getCatalog(keyword = "") {
  if (!configured()) return exampleCatalog(keyword);
  // Scope cache to the partner account so a credential change cannot reuse another account's links.
  const scope = createHash("sha256")
    .update(
      (process.env.COUPANG_ACCESS_KEY || "") +
        "\0" +
        (process.env.COUPANG_SECRET_KEY || "") +
        "\0" +
        (process.env.COUPANG_SUB_ID || ""),
    )
    .digest("hex");
  return unstable_cache(
    () => fetchCatalog(keyword),
    ["partner-products-v1", scope, keyword],
    { revalidate: 3600, tags: ["partner-products"] },
  )();
}
