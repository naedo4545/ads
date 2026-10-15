import { unstable_cache } from "next/cache";
import { createHash } from "node:crypto";
import { configured, fetchCatalog } from "./coupang";
import { exampleCatalog, categories } from "./catalog";
export async function getCatalog(keyword = "", category = "all") {
  if (!configured())
    return exampleCatalog(
      keyword || categories.find((c) => c.id === category)?.keyword || "",
    );
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
    () => fetchCatalog(keyword, category),
    ["partner-products-v3", scope, keyword, category],
    { revalidate: 3600, tags: ["partner-products"] },
  )();
}
