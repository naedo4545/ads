import { NextRequest, NextResponse } from "next/server";
import { getCatalog } from "@/lib/partners/service";
import { categories } from "@/lib/partners/catalog";
import { PartnerError } from "@/lib/partners/coupang";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
export async function GET(request: NextRequest) {
  const keyword = (request.nextUrl.searchParams.get("q") || "").trim();
  if (keyword.length > 80)
    return NextResponse.json(
      { error: "검색어는 80자 이내로 입력해 주세요." },
      { status: 400 },
    );
  const category = request.nextUrl.searchParams.get("category") || "all";
  if (!categories.some((c) => c.id === category))
    return NextResponse.json(
      { error: "지원하지 않는 카테고리입니다." },
      { status: 400 },
    );
  try {
    const catalog = await getCatalog(keyword, category);
    return NextResponse.json(catalog, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof PartnerError
            ? error.message
            : "상품 정보를 불러오지 못했습니다.",
        code: error instanceof PartnerError ? error.code : "upstream",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
