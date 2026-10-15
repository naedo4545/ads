export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string | null;
  affiliateUrl: string | null;
  rocket: boolean;
  source: "coupang" | "example";
  updatedAt: string;
};
export type Catalog = {
  mode: "live" | "example";
  products: Product[];
  updatedAt: string | null;
  selection?: "category_search";
};
export const categories = [
  { id: "all", name: "오늘의 추천", keyword: "" },
  {
    id: "digital",
    coupangCategoryId: "1015",
    name: "디지털 · 가전",
    keyword: "디지털 가전",
  },
  {
    id: "home",
    coupangCategoryId: "1014",
    name: "홈 · 리빙",
    keyword: "홈 리빙",
  },
  {
    id: "kitchen",
    coupangCategoryId: "1012",
    name: "주방 · 생활",
    keyword: "주방 생활",
  },
  {
    id: "beauty",
    coupangCategoryId: "1009",
    name: "뷰티 · 케어",
    keyword: "뷰티",
  },
  {
    id: "food",
    coupangCategoryId: "1011",
    name: "식품 · 건강",
    keyword: "식품",
  },
  {
    id: "fashion",
    coupangCategoryId: "1001",
    name: "여성패션",
    keyword: "여성패션",
  },
  {
    id: "mens",
    coupangCategoryId: "1002",
    name: "남성패션",
    keyword: "남성패션",
  },
  {
    id: "sports",
    coupangCategoryId: "1016",
    name: "스포츠 · 레저",
    keyword: "스포츠",
  },
];
const exampleRows: [string, string, string, number][] = [
  ["headphones", "무선 노이즈 캔슬링 헤드폰", "digital", 89000],
  ["lamp", "따뜻한 빛 무선 테이블 조명", "home", 32900],
  ["coffee", "홈카페 핸드드립 커피 세트", "kitchen", 28500],
  ["speaker", "어디서든 함께하는 미니 스피커", "digital", 45900],
  ["serum", "매일 촉촉한 데일리 수분 세럼", "beauty", 19800],
  ["chair", "내 공간을 바꾸는 우드 체어", "home", 79000],
  ["bottle", "가볍게 챙기는 스테인리스 텀블러", "kitchen", 21900],
  ["bag", "주말의 시작, 데일리 백팩", "fashion", 54900],
  ["menswear", "가볍게 입는 데일리 남성 셔츠", "mens", 29900],
  ["oats", "든든한 아침 오트 그래놀라", "food", 12900],
  ["keyboard", "책상 위의 작은 변화, 무선 키보드", "digital", 69000],
  ["cream", "편안한 하루 핸드크림", "beauty", 15900],
  ["yoga", "나를 위한 시간, 홈트 요가 매트", "sports", 24900],
];
export function exampleCatalog(keyword = ""): Catalog {
  const normalize = (v: string) =>
    v
      .toLowerCase()
      .replace(/[·\s]+/g, " ")
      .trim();
  const text = normalize(keyword);
  return {
    mode: "example",
    updatedAt: null,
    products: exampleRows
      .map(([id, name, category, price]) => ({
        id: `sample-${id}`,
        name,
        category,
        price,
        image: null,
        affiliateUrl: null,
        rocket: false,
        source: "example" as const,
        updatedAt: "",
      }))
      .filter(
        (p) =>
          !text ||
          normalize(
            `${p.name} ${categories.find((c) => c.id === p.category)?.name || ""}`,
          ).includes(text),
      ),
  };
}
export const disclosure =
  "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";
