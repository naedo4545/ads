import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { configured } from "@/lib/partners/coupang";
import { getCatalog } from "@/lib/partners/service";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret)
    return NextResponse.json(
      { error: "자동 갱신 인증 설정이 필요합니다." },
      { status: 503 },
    );
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(request.headers.get("authorization") || "");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!configured())
    return NextResponse.json(
      { error: "파트너스 API 설정이 필요합니다." },
      { status: 503 },
    );
  try {
    revalidateTag("partner-products");
    const result = await getCatalog();
    return NextResponse.json({
      updatedAt: result.updatedAt,
      count: result.products.length,
    });
  } catch {
    return NextResponse.json(
      { error: "상품 갱신에 실패했습니다. 다음 요청에서 다시 시도합니다." },
      { status: 502 },
    );
  }
}
