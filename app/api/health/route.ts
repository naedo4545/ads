import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/partners/service";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const catalog = await getCatalog();
    return NextResponse.json({
      status: catalog.mode === "live" ? "healthy" : "example",
      services: {
        catalog: "available",
        affiliateLinks: catalog.mode === "live" ? "verified" : "not_configured",
      },
      products: catalog.products.length,
      updatedAt: catalog.updatedAt,
    });
  } catch {
    return NextResponse.json(
      { status: "error", message: "파트너스 상품 연결을 확인해 주세요." },
      { status: 503 },
    );
  }
}
