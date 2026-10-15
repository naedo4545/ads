"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  ArrowUpRight,
  ArrowRight,
  Heart,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Clock,
  Check,
  ShoppingBag,
  Monitor,
  Armchair,
  Coffee,
  Sparkles,
  Apple,
  Footprints,
  LayoutGrid,
  Info,
  ArrowLeft,
} from "lucide-react";
import {
  categories,
  disclosure,
  type Product,
  type Catalog,
} from "@/lib/partners/catalog";
const categoryIcons: Record<string, typeof LayoutGrid> = {
  all: LayoutGrid,
  digital: Monitor,
  home: Armchair,
  kitchen: Coffee,
  beauty: Sparkles,
  food: Apple,
  fashion: ShoppingBag,
  mens: ShoppingBag,
  sports: Footprints,
};
const money = (value: number) => new Intl.NumberFormat("ko-KR").format(value);
const colors = [
  "#e7eadf",
  "#ece2d6",
  "#ecdcc9",
  "#dae4e9",
  "#e5deda",
  "#e7ded3",
  "#dce6d6",
  "#dde2e8",
  "#ede2bd",
  "#e2e5dd",
  "#eddce0",
  "#dce4db",
];

function ProductArt({
  product,
  hero = false,
}: {
  product: Product;
  hero?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [product.image]);
  const name = product.id.replace("sample-", "");
  if (product.image)
    return (
      <div
        className={`product-image ${imageFailed ? "image-unavailable" : ""}`}
      >
        <img
          src={product.image}
          alt={product.name}
          width={480}
          height={480}
          decoding="async"
          style={imageFailed ? { visibility: "hidden" } : undefined}
          onLoad={() => setImageFailed(false)}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
        <span className="image-error-label">이미지를 불러오지 못했어요</span>
      </div>
    );
  if (product.source === "coupang")
    return (
      <div className="product-image image-unavailable">
        <ShoppingBag size={60} color="#adb79f" />
        <span className="missing-product-label">
          상품 이미지를 준비 중입니다
        </span>
      </div>
    );
  return (
    <div
      className={`product-art art-${name} ${hero ? "hero-product-art" : ""}`}
      style={{
        background:
          colors[
            [
              "headphones",
              "lamp",
              "coffee",
              "speaker",
              "serum",
              "chair",
              "bottle",
              "bag",
              "oats",
              "keyboard",
              "cream",
              "yoga",
            ].indexOf(name)
          ] || "#e7eadf",
      }}
      aria-label="예시 상품 일러스트"
    >
      <svg viewBox="0 0 260 240" role="img" aria-label={product.name}>
        <ellipse
          cx="133"
          cy="211"
          rx="69"
          ry="9"
          fill="#253424"
          opacity=".07"
        />
        {name === "headphones" ? (
          <g transform="rotate(-15 130 125)">
            <path
              d="M65 129V96a65 65 0 0 1 130 0v33"
              stroke="#525b4d"
              strokeWidth="20"
              fill="none"
            />
            <path
              d="M65 100V94a65 65 0 0 1 130 0v6"
              stroke="#909987"
              strokeWidth="10"
              fill="none"
            />
            <rect
              x="42"
              y="113"
              width="46"
              height="76"
              rx="22"
              fill="#3d4739"
            />
            <rect
              x="171"
              y="113"
              width="46"
              height="76"
              rx="22"
              fill="#3d4739"
            />
            <path
              d="M51 126v47m157-47v47"
              stroke="#8e9886"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </g>
        ) : name === "lamp" ? (
          <g>
            <path d="M130 107v90" stroke="#827457" strokeWidth="9" />
            <ellipse cx="130" cy="203" rx="52" ry="10" fill="#d0c1a1" />
            <path d="M59 108q0-72 71-72t71 72Z" fill="#e8d9b8" />
            <ellipse cx="130" cy="108" rx="71" ry="12" fill="#b4a17e" />
            <ellipse cx="130" cy="111" rx="43" ry="6" fill="#fff1c7" />
            <path
              d="M69 91q15-43 51-47"
              stroke="#f5e9d0"
              strokeWidth="6"
              fill="none"
              opacity=".6"
            />
          </g>
        ) : name === "coffee" ? (
          <g>
            <path
              d="M64 48h86l-13 58H80Z"
              fill="#fff9e9"
              stroke="#d0b896"
              strokeWidth="3"
            />
            <path d="M80 108h58l19 87H61Z" fill="#b5865f" opacity=".65" />
            <ellipse cx="109" cy="195" rx="48" ry="9" fill="#79563d" />
            <path d="M164 124h49v50q0 23-25 23t-24-23Z" fill="#f8f1e1" />
            <path
              d="M211 135q32 0 26 26-4 15-24 12"
              fill="none"
              stroke="#e9dfc8"
              strokeWidth="9"
            />
            <path
              d="M172 104q-12-17 1-29m19 29q-12-17 1-29"
              fill="none"
              stroke="#b89a7a"
              strokeWidth="3"
              opacity=".5"
            />
          </g>
        ) : name === "speaker" ? (
          <g transform="rotate(9 130 120)">
            <rect
              x="62"
              y="49"
              width="135"
              height="151"
              rx="41"
              fill="#607d83"
            />
            <rect
              x="73"
              y="61"
              width="112"
              height="126"
              rx="33"
              fill="#719197"
            />
            {Array.from({ length: 12 }, (_, i) => (
              <path
                key={i}
                d={`M82 ${75 + i * 8}h94`}
                stroke="#405d63"
                strokeWidth="1.5"
                opacity=".45"
              />
            ))}
            <path
              d="M112 39q0-23 20-23t20 23"
              stroke="#3b555a"
              strokeWidth="7"
              fill="none"
            />
            <text
              x="130"
              y="131"
              textAnchor="middle"
              fill="#dfebe6"
              fontSize="10"
              letterSpacing="3"
            >
              SOUND
            </text>
          </g>
        ) : name === "serum" || name === "cream" ? (
          <g transform="rotate(8 130 120)">
            <rect
              x="92"
              y="85"
              width="78"
              height="117"
              rx="12"
              fill={name === "cream" ? "#d6a1a7" : "#bca881"}
            />
            <rect x="103" y="42" width="55" height="45" rx="5" fill="#eee8d8" />
            <rect x="97" y="111" width="68" height="61" rx="2" fill="#f5f0e6" />
            <text
              x="131"
              y="135"
              fill="#7e7764"
              fontFamily="Georgia"
              fontSize="17"
              textAnchor="middle"
            >
              daily.
            </text>
            <text
              x="131"
              y="151"
              fill="#aca18b"
              fontSize="5"
              textAnchor="middle"
              letterSpacing="1.5"
            >
              SIMPLE CARE
            </text>
          </g>
        ) : name === "chair" ? (
          <g>
            <path
              d="m70 113-15 95m119-95 18 95m-120-41h110"
              stroke="#835d3c"
              strokeWidth="9"
              fill="none"
            />
            <path
              d="M61 53q0-22 23-22h75q25 0 24 22l-8 70H69Z"
              fill="#c49668"
            />
            <path
              d="M68 116q-20 8-17 28 68 15 134-1 1-20-13-25Z"
              fill="#d6ae82"
            />
            <path
              d="M84 42v69m20-69v69m21-69v69m21-69v69m20-69v69"
              stroke="#a2754d"
              strokeWidth="2"
            />
          </g>
        ) : name === "bottle" ? (
          <g transform="rotate(-12 130 120)">
            <rect
              x="95"
              y="46"
              width="68"
              height="157"
              rx="20"
              fill="#7b9580"
            />
            <rect x="94" y="43" width="70" height="29" rx="8" fill="#485e49" />
            <path
              d="M104 86v90"
              stroke="#b3c2aa"
              strokeWidth="5"
              strokeLinecap="round"
              opacity=".6"
            />
            <text
              x="130"
              y="135"
              textAnchor="middle"
              fill="#edf0dc"
              fontSize="12"
              fontFamily="Georgia"
            >
              slow.
            </text>
          </g>
        ) : name === "bag" ? (
          <g transform="rotate(8 130 120)">
            <path
              d="M99 60V44q30-34 61 0v16"
              stroke="#4e5c5b"
              strokeWidth="10"
              fill="none"
            />
            <rect
              x="63"
              y="55"
              width="133"
              height="149"
              rx="30"
              fill="#6d807b"
            />
            <rect
              x="86"
              y="123"
              width="88"
              height="60"
              rx="12"
              fill="#576a64"
            />
            <path d="M96 132h69" stroke="#c6ceba" strokeWidth="3" />
            <text
              x="130"
              y="101"
              textAnchor="middle"
              fill="#e2e7d4"
              fontSize="11"
              letterSpacing="3"
            >
              WEEKEND
            </text>
          </g>
        ) : name === "oats" ? (
          <g transform="rotate(-6 130 120)">
            <path d="m80 38 104 2 7 164H68Z" fill="#cbae70" />
            <path d="m80 38 104 2-5 13H76Z" fill="#9e7b43" />
            <rect x="77" y="80" width="103" height="85" rx="3" fill="#f2ead6" />
            <text
              x="129"
              y="112"
              textAnchor="middle"
              fill="#7c6a43"
              fontFamily="Georgia"
              fontSize="26"
            >
              oat day
            </text>
            <text
              x="129"
              y="132"
              textAnchor="middle"
              fill="#a39571"
              fontSize="6"
              letterSpacing="2"
            >
              A GOOD MORNING
            </text>
            <path
              d="M103 153q23-22 47 0"
              fill="none"
              stroke="#c4a66a"
              strokeWidth="4"
            />
          </g>
        ) : name === "menswear" ? (
          <g>
            <path
              d="m93 47 37 15 37-15 46 39-25 34-21-16v99H93v-99l-21 16-25-34Z"
              fill="#a0b2ad"
            />
            <path d="m112 52 18 10 18-10-7 24h-23Z" fill="#dae2d8" />
            <path d="M130 77v120" stroke="#6d8980" strokeWidth="3" />
            <path d="M146 99h17v21h-17Z" fill="#8da49b" />
            <circle cx="130" cy="99" r="2" fill="#e7ede2" />
            <circle cx="130" cy="125" r="2" fill="#e7ede2" />
            <circle cx="130" cy="151" r="2" fill="#e7ede2" />
          </g>
        ) : name === "keyboard" ? (
          <g transform="rotate(-12 130 120)">
            <rect
              x="22"
              y="76"
              width="218"
              height="106"
              rx="13"
              fill="#c1c9ba"
            />
            <rect x="27" y="79" width="208" height="94" rx="9" fill="#d5dacc" />
            {Array.from({ length: 4 }, (_, y) =>
              Array.from({ length: 11 }, (_, x) => (
                <rect
                  key={`${x}-${y}`}
                  x={35 + x * 17.5}
                  y={88 + y * 19}
                  width="13"
                  height="14"
                  rx="2"
                  fill={x === 10 ? "#a0af87" : "#f5f6e9"}
                />
              )),
            )}
            <rect x="89" y="147" width="80" height="14" rx="2" fill="#f7f7ee" />
          </g>
        ) : (
          <g transform="rotate(-13 130 120)">
            <path d="M54 170 180 53q35 3 37 36L93 211Z" fill="#a0b09b" />
            <ellipse
              cx="184"
              cy="75"
              rx="31"
              ry="25"
              fill="#6d8367"
              transform="rotate(35 184 75)"
            />
            <ellipse
              cx="184"
              cy="75"
              rx="17"
              ry="13"
              fill="#b8c5ae"
              transform="rotate(35 184 75)"
            />
            <path
              d="m64 177 23 23m-8-39 23 23m-8-39 23 23"
              stroke="#c7d1ba"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>
      <span className="art-example-label">SAMPLE PRODUCT</span>
    </div>
  );
}

type Saved = { product: Product; keyword: string; category?: string };
const PAGE_SIZE = 12;
function productHref(id: string, keyword: string, category = "all") {
  const params = new URLSearchParams();
  if (keyword) params.set("q", keyword);
  if (category !== "all") params.set("category", category);
  return (
    "/product/" +
    encodeURIComponent(id) +
    (params.toString() ? "?" + params.toString() : "")
  );
}
export default function Shop({
  mode = "home",
  id,
}: {
  mode?: "home" | "search" | "saved" | "detail";
  id?: string;
}) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [category, setCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sort, setSort] = useState("recommended");
  const [retry, setRetry] = useState(0);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("moapick-saved") || "[]");
      if (Array.isArray(s))
        setSaved(
          s.filter(
            (v) =>
              v?.product &&
              typeof v.product.id === "string" &&
              typeof v.keyword === "string",
          ),
        );
    } catch {}
    const q = new URLSearchParams(window.location.search).get("q") || "";
    const c =
      new URLSearchParams(window.location.search).get("category") || "all";
    setCategory(categories.some((v) => v.id === c) ? c : "all");
    setQuery(q);
    setApplied(q);
    setReady(true);
  }, [mode, id]);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("moapick-saved", JSON.stringify(saved));
      } catch {}
    }
  }, [saved, ready]);
  const requestKeyword = applied;
  useEffect(
    () => setVisibleCount(PAGE_SIZE),
    [requestKeyword, category, sort, mode],
  );
  useEffect(() => {
    if (!ready) return;
    if (mode === "saved") {
      setLoading(false);
      setError("");
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(
      "/api/products" +
        "?" +
        new URLSearchParams({
          ...(requestKeyword ? { q: requestKeyword } : {}),
          category,
        }).toString(),
      { signal: controller.signal },
    )
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "상품을 불러오지 못했습니다.");
        setCatalog(data);
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          setError(e.message || "연결을 확인해 주세요.");
          setCatalog(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [ready, requestKeyword, category, retry, mode]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);
  const toggle = (product: Product) => {
    setSaved((prev) =>
      prev.some((v) => v.product.id === product.id)
        ? prev.filter((v) => v.product.id !== product.id)
        : [...prev, { product, keyword: requestKeyword, category }],
    );
    setToast(
      saved.some((v) => v.product.id === product.id)
        ? "찜한 상품에서 삭제했어요."
        : "마음에 드는 상품을 담았어요.",
    );
  };
  const isSaved = (p: Product) => saved.some((v) => v.product.id === p.id);
  let products =
    mode === "saved" ? saved.map((v) => v.product) : catalog?.products || [];
  if (mode === "saved" && query)
    products = products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()),
    );
  if (sort === "low")
    products = [...products].sort((a, b) => a.price - b.price);
  if (sort === "high")
    products = [...products].sort((a, b) => b.price - a.price);
  const selected = catalog?.products.find((p) => p.id === id);
  const example = catalog?.mode === "example";
  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== "search") {
      window.location.href =
        "/search" +
        (query.trim() ? "?q=" + encodeURIComponent(query.trim()) : "");
    } else {
      setCategory("all");
      setApplied(query.trim());
      window.history.replaceState(
        null,
        "",
        "/search" +
          (query.trim() ? "?q=" + encodeURIComponent(query.trim()) : ""),
      );
    }
  };
  const productLink = (p: Product) =>
    productHref(p.id, requestKeyword, category);
  const hasMobilePurchase =
    mode === "detail" &&
    selected?.source === "coupang" &&
    Boolean(selected.affiliateUrl);
  return (
    <div
      className={`shop-shell ${hasMobilePurchase ? "has-mobile-purchase" : ""}`}
    >
      <div className="announcement">
        <span>좋은 선택을 더 가깝게.</span> 모아픽에서 발견하고, 쿠팡에서 편하게
        쇼핑하세요. <ArrowUpRight size={12} />
      </div>
      <header className="shop-header">
        <div className="header-main">
          <Link href="/" className="shop-logo">
            <span className="logo-bag">
              <ShoppingBag size={21} strokeWidth={2.3} />
            </span>
            모아픽<span className="logo-period">.</span>
          </Link>
          <form className="header-search" onSubmit={search}>
            <Search size={19} />
            <input
              aria-label="상품 검색"
              placeholder="어떤 상품을 찾고 있나요?"
              maxLength={80}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                aria-label="검색어 지우기"
                onClick={() => setQuery("")}
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              aria-label="검색하기"
              className="search-submit"
            >
              <ArrowRight size={18} />
            </button>
          </form>
          <Link href="/collection" className="header-saved">
            <Heart size={21} />
            <span>찜한 상품</span>
            <b>{saved.length}</b>
          </Link>
          <button
            className="shop-menu-button"
            aria-label="메뉴 열기"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <div className={`header-nav ${menu ? "open" : ""}`}>
          <nav>
            <Link href="/" className={mode === "home" ? "current" : ""}>
              오늘의 발견
            </Link>
            <Link href="/search" className={mode === "search" ? "current" : ""}>
              전체 상품
            </Link>
            <Link
              href="/collection"
              className={mode === "saved" ? "current" : ""}
            >
              나의 위시리스트
            </Link>
          </nav>
          <Link href="/guide" className="how-link">
            <Info size={13} /> 모아픽 이용 안내
          </Link>
        </div>
      </header>
      <main className="shop-main">
        <div className="shop-affiliate-disclosure">
          <span>광고 · 제휴 안내</span>
          <p>{disclosure}</p>
        </div>
        {mode === "home" && (
          <>
            <section className="shop-hero">
              <div className="hero-shop-copy">
                <span className="shop-eyebrow">
                  <span /> LITTLE FINDS, BETTER EVERYDAY
                </span>
                <h1>
                  장바구니 넣기 전,
                  <br />
                  <em>이 상품도 보세요.</em>
                </h1>
                <p>
                  매일 쓰는 것부터 갖고 싶던 것까지.
                  <br />
                  마음에 드는 상품을 더 많이, 한눈에 비교해 보세요.
                </p>
                <Link href="/search" className="shop-dark-button">
                  눈여겨볼 상품 보기 <ArrowUpRight size={17} />
                </Link>
                <div className="hero-footnote">
                  <span>일상의 작은 발견</span>
                  <i />
                  <span>모아픽 큐레이션</span>
                </div>
              </div>
              <div className="hero-shop-visual">
                <span className="hero-large-type">
                  GOOD
                  <br />
                  FINDS.
                </span>
                <div className="hero-product-frame">
                  <ProductArt
                    product={{
                      id: "sample-headphones",
                      name: "헤드폰 예시",
                      price: 0,
                      image: null,
                      affiliateUrl: null,
                      category: "digital",
                      rocket: false,
                      source: "example",
                      updatedAt: "",
                    }}
                    hero
                  />
                  <div className="hero-product-caption">
                    <span>나에게 집중하는 시간</span>
                    <ArrowUpRight size={18} />
                  </div>
                </div>
                <div className="hero-round-sticker">
                  find your
                  <br />
                  <em>everyday.</em>
                  <span>MOAPICK SELECTION</span>
                </div>
                <span className="hero-side-note">
                  A SMALL FIND. A BETTER DAY.
                </span>
              </div>
            </section>
            <div className="benefit-strip">
              <div>
                <ShieldCheck size={18} />
                <span>
                  결제와 배송은 <b>쿠팡에서 안전하게</b>
                </span>
              </div>
              <i />
              <div>
                <Heart size={18} />
                <span>
                  마음에 드는 상품은 <b>찜으로 간편하게</b>
                </span>
              </div>
              <i />
              <div>
                <RefreshCw size={17} />
                <span>
                  새로운 상품을 <b>주기적으로 업데이트</b>
                </span>
              </div>
            </div>
          </>
        )}
        {mode === "detail" ? (
          <>
            <Link href="/search" className="shop-back">
              <ArrowLeft size={15} /> 상품 목록으로
            </Link>
            {loading ? (
              <div className="shop-loading">
                <RefreshCw className="spin" size={22} /> 상품을 확인하고 있어요.
              </div>
            ) : error ? (
              <ErrorState
                message={error}
                retry={() => setRetry((v) => v + 1)}
              />
            ) : selected ? (
              <>
                <div className="product-detail">
                  <div className="detail-image-wrap">
                    <ProductArt product={selected} />
                    {selected.source === "example" && (
                      <span className="detail-sample">디자인 예시 상품</span>
                    )}
                  </div>
                  <div className="detail-info">
                    <div className="shop-eyebrow">
                      마음에 든다면, 가격과 조건부터 확인하세요
                    </div>
                    <span className="detail-category">
                      {categories.find((c) => c.id === selected.category)
                        ?.name || selected.category}
                    </span>
                    <h1>{selected.name}</h1>
                    <p className="detail-price">
                      <strong>{money(selected.price)}</strong>원{" "}
                      <span>
                        {selected.source === "example"
                          ? "예시 가격"
                          : "조회 시점 가격"}
                      </span>
                    </p>
                    <div className="detail-benefits">
                      <p>
                        <Check size={16} /> 주문·결제·배송·반품은 쿠팡에서
                        진행됩니다.
                      </p>
                      <p>
                        <Clock size={16} /> 가격과 재고는 쿠팡에서 최종 확인해
                        주세요.
                      </p>
                      {selected.rocket && (
                        <p>
                          <Check size={16} /> API 기준 로켓배송 상품입니다.
                        </p>
                      )}
                    </div>
                    {selected.source === "coupang" && selected.affiliateUrl ? (
                      <a
                        className="shop-primary buy-button"
                        href={selected.affiliateUrl}
                        target="_blank"
                        rel="sponsored nofollow noopener noreferrer"
                      >
                        쿠팡에서 가격 확인하기 <ExternalLink size={17} />
                      </a>
                    ) : (
                      <div className="example-purchase">
                        <Info size={17} />
                        <span>
                          예시 상품입니다. 파트너스 API를 연결하면
                          <br />
                          본인의 제휴 링크로 쿠팡에 연결됩니다.
                        </span>
                      </div>
                    )}
                    <button
                      className={`detail-save ${isSaved(selected) ? "selected" : ""}`}
                      onClick={() => toggle(selected)}
                    >
                      <Heart
                        size={17}
                        fill={isSaved(selected) ? "currentColor" : "none"}
                      />
                      {isSaved(selected) ? "찜한 상품" : "찜하기"}
                    </button>
                    <p className="product-disclosure">{disclosure}</p>
                    <p className="detail-freshness">
                      {selected.updatedAt
                        ? "상품 정보 조회: " +
                          new Date(selected.updatedAt).toLocaleString("ko-KR", {
                            timeZone: "Asia/Seoul",
                          })
                        : "표시된 상품명과 가격은 기능 확인용 예시입니다."}
                    </p>
                  </div>
                </div>
                <div className="shop-section-heading related-title">
                  <h2>함께 둘러보세요</h2>
                  <Link href="/search">
                    전체 상품 <ArrowUpRight size={15} />
                  </Link>
                </div>
                <div className="shop-product-grid">
                  {(catalog?.products || [])
                    .filter((p) => p.id !== id)
                    .slice(0, 4)
                    .map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        saved={isSaved(p)}
                        toggle={toggle}
                        href={productLink(p)}
                      />
                    ))}
                </div>
              </>
            ) : (
              <div className="shop-empty">
                <ShoppingBag size={35} />
                <h2>지금은 이 상품을 찾을 수 없어요.</h2>
                <p>추천 상품이 갱신되었거나 판매 상태가 바뀌었을 수 있어요.</p>
                <Link href="/search" className="shop-dark-button">
                  다른 상품 둘러보기 <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            {mode === "home" && (
              <section
                className="category-discovery"
                aria-label="분야별 상품 바로가기"
              >
                <div>
                  <h2>뷰티도, 패션도, 운동템도.</h2>
                  <p>오늘의 추천에 없더라도, 원하는 분야에서 찾아보세요.</p>
                </div>
                <div className="category-discovery-grid">
                  {[
                    {
                      id: "beauty",
                      title: "뷰티 · 케어",
                      copy: "매일의 관리, 새로운 발견",
                      Icon: Sparkles,
                    },
                    {
                      id: "fashion",
                      title: "여성패션",
                      copy: "취향대로 완성하는 스타일",
                      Icon: ShoppingBag,
                    },
                    {
                      id: "mens",
                      title: "남성패션",
                      copy: "일상에 더하는 새로운 한 벌",
                      Icon: ShoppingBag,
                    },
                    {
                      id: "sports",
                      title: "스포츠 · 레저",
                      copy: "가볍게 움직이는 하루",
                      Icon: Footprints,
                    },
                  ].map((c) => (
                    <Link
                      key={c.id}
                      href={"/search?category=" + c.id}
                      className={"discovery-" + c.id}
                    >
                      <c.Icon size={25} />
                      <strong>{c.title}</strong>
                      <span>{c.copy}</span>
                      <ArrowUpRight size={18} />
                    </Link>
                  ))}
                </div>
              </section>
            )}
            <section className="product-section">
              <div className="shop-section-heading">
                <div>
                  <span className="shop-eyebrow">
                    {mode === "saved"
                      ? "YOUR LITTLE WISHLIST"
                      : mode === "search"
                        ? "FIND YOUR NEXT FAVORITE"
                        : "CURATED FOR YOUR EVERYDAY"}
                  </span>
                  <h1>
                    {mode === "saved"
                      ? "마음에 담아둔 상품"
                      : mode === "search"
                        ? "취향에 맞는 발견"
                        : "그냥 지나치기 아까운 발견"}
                    <span className="heading-dot" />
                  </h1>
                  <p>
                    {mode === "saved"
                      ? "좋아하는 것들을 모아두고, 필요할 때 다시 만나보세요."
                      : mode === "search"
                        ? "필요한 것, 좋아하는 것. 당신에게 맞는 상품을 찾아보세요."
                        : "생활을 바꿀 작은 아이템, 다음 픽은 여기서 찾아보세요."}
                  </p>
                </div>
                {mode === "home" && (
                  <Link className="all-products-link" href="/search">
                    전체 상품 보기 <ArrowUpRight size={17} />
                  </Link>
                )}
              </div>
              {mode !== "saved" && (
                <div className="shop-categories">
                  {categories.map((c) => {
                    const Icon = categoryIcons[c.id] || LayoutGrid;
                    return (
                      <button
                        key={c.id}
                        className={category === c.id ? "active" : ""}
                        aria-pressed={category === c.id}
                        onClick={() => {
                          setCategory(c.id);
                          setApplied("");
                          setQuery("");
                        }}
                      >
                        <span>
                          <Icon size={20} />
                        </span>
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              )}
              {example && mode !== "saved" && (
                <div className="catalog-notice">
                  <Info size={15} />
                  <p>
                    <strong>현재는 예시 상품을 둘러보고 있어요.</strong>{" "}
                    파트너스 API를 연결하면 실제 상품과 본인의 제휴 링크가
                    자동으로 표시됩니다.
                  </p>
                  <Link href="/guide">
                    연결 안내 <ChevronRight size={14} />
                  </Link>
                </div>
              )}
              {catalog?.selection === "category_search" && (
                <p className="category-search-notice">
                  <Info size={16} />
                  카테고리 추천을 사용할 수 없어 해당 분야의 검색 상품을
                  보여드려요.
                </p>
              )}
              <div className="shop-results">
                <span>
                  {applied && mode !== "saved" ? (
                    <>
                      <b>‘{applied}’</b> 검색 결과 ·{" "}
                    </>
                  ) : (
                    ""
                  )}
                  총 <strong>{products.length}</strong>개 상품
                  {catalog?.mode === "live" && (
                    <small>
                      <span />
                      쿠팡 파트너스 상품
                    </small>
                  )}
                </span>
                <label>
                  <select
                    aria-label="상품 정렬"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="recommended">추천순</option>
                    <option value="low">낮은 가격순</option>
                    <option value="high">높은 가격순</option>
                  </select>
                  <ChevronDown size={13} />
                </label>
              </div>
              {mode !== "saved" && loading ? (
                <div className="shop-product-grid skeleton-grid">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div className="product-skeleton" key={i}>
                      <div />
                      <span />
                      <span />
                    </div>
                  ))}
                </div>
              ) : mode !== "saved" && error ? (
                <ErrorState
                  message={error}
                  retry={() => setRetry((v) => v + 1)}
                />
              ) : products.length ? (
                <div className="shop-product-grid">
                  {products.slice(0, visibleCount).map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      saved={isSaved(p)}
                      toggle={toggle}
                      href={
                        mode === "saved"
                          ? productHref(
                              p.id,
                              saved.find((v) => v.product.id === p.id)
                                ?.keyword || "",
                              saved.find((v) => v.product.id === p.id)
                                ?.category || "all",
                            )
                          : productLink(p)
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="shop-empty">
                  {mode === "saved" ? (
                    <Heart size={35} />
                  ) : (
                    <Search size={35} />
                  )}
                  <h2>
                    {mode === "saved"
                      ? "아직 마음에 담아둔 상품이 없어요."
                      : "검색한 상품을 찾지 못했어요."}
                  </h2>
                  <p>
                    {mode === "saved"
                      ? "상품의 하트를 눌러 나만의 위시리스트를 만들어 보세요."
                      : "다른 검색어나 카테고리로 다시 찾아보세요."}
                  </p>
                  {mode === "saved" ? (
                    <Link href="/search" className="shop-dark-button">
                      상품 둘러보기 <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <button
                      className="shop-dark-button"
                      onClick={() => {
                        setQuery("");
                        setApplied("");
                        setCategory("all");
                      }}
                    >
                      전체 상품 보기 <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              )}
              {!loading && !error && products.length > 0 && (
                <div className="load-more-area">
                  <p aria-live="polite">
                    현재{" "}
                    <strong>{Math.min(visibleCount, products.length)}</strong> /{" "}
                    {products.length}개 상품을 보고 있어요.
                  </p>
                  {visibleCount < products.length ? (
                    <button
                      className="load-more-button"
                      onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                    >
                      상품 더보기{" "}
                      <span>
                        +{Math.min(PAGE_SIZE, products.length - visibleCount)}개
                      </span>
                      <ChevronDown size={19} />
                    </button>
                  ) : (
                    <div className="catalog-end">
                      <Check size={17} /> 현재 목록을 모두 확인했어요.
                      {mode !== "saved" && (
                        <span>
                          다른 카테고리에서도 새로운 상품을 만나보세요.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
              {mode !== "saved" && catalog?.updatedAt && (
                <p className="catalog-freshness">
                  상품 정보 조회{" "}
                  {new Date(catalog.updatedAt).toLocaleString("ko-KR", {
                    timeZone: "Asia/Seoul",
                  })}{" "}
                  · 가격 및 판매 조건은 쿠팡에서 최종 확인해 주세요.
                </p>
              )}
            </section>
            {mode === "home" && (
              <section className="shop-editorial">
                <div>
                  <span className="shop-eyebrow">COLLECT YOUR FAVORITES</span>
                  <h2>
                    살까 말까 할 땐,
                    <br />
                    일단 찜해두세요.
                  </h2>
                  <p>
                    눈여겨본 상품을 하트에 담아두세요.
                    <br />
                    필요한 순간, 나만의 리스트가 기다리고 있을 거예요.
                  </p>
                  <Link href="/collection">
                    내 위시리스트 보기 <ArrowUpRight size={17} />
                  </Link>
                </div>
                <div className="editorial-art" aria-hidden="true">
                  <Heart size={105} strokeWidth={0.9} />
                  <span>
                    little things,
                    <br />
                    <em>big happiness.</em>
                  </span>
                  <div>✳</div>
                </div>
              </section>
            )}
          </>
        )}
        <section className="affiliate-notice">
          <Info size={15} />
          <div>
            <strong>쿠팡 파트너스 안내</strong>
            <p>
              {disclosure} 상품 구매 시 추가 비용은 발생하지 않습니다.
              가격·재고·배송 조건은 연결된 쿠팡 상품 페이지를 기준으로 확인해
              주세요.
            </p>
          </div>
        </section>
      </main>
      <footer className="shop-footer">
        <div>
          <Link href="/" className="shop-logo">
            모아픽<span className="logo-period">.</span>
          </Link>
          <p>작은 발견으로 채우는 더 나은 일상.</p>
        </div>
        <div className="footer-links">
          <Link href="/guide">이용 안내</Link>
          <Link href="/privacy">개인정보 처리방침</Link>
          <Link href="/collection">찜한 상품</Link>
        </div>
        <p className="footer-note">
          모아픽은 상품을 직접 판매하지 않는 쿠팡 파트너스 제휴 사이트입니다.
          <br />
          주문·결제·배송·교환·반품은 쿠팡에서 진행됩니다.
        </p>
        <span className="copyright">
          © {new Date().getFullYear()} MOAPICK. ALL RIGHTS RESERVED.
        </span>
      </footer>
      {hasMobilePurchase && selected && (
        <div className="mobile-purchase-bar">
          <p>광고 · 쿠팡 파트너스 링크를 통한 구매로 수수료를 제공받습니다.</p>
          <div>
            <strong>
              {money(selected.price)}
              <small>원</small>
            </strong>
            <a
              className="shop-primary"
              href={selected.affiliateUrl!}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
            >
              쿠팡에서 확인 <ExternalLink size={17} />
            </a>
          </div>
        </div>
      )}
      {toast && (
        <div className="shop-toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
function ProductCard({
  product: p,
  saved,
  toggle,
  href,
}: {
  product: Product;
  saved: boolean;
  toggle: (p: Product) => void;
  href: string;
}) {
  return (
    <article className="product-card">
      <div className="product-card-image">
        <Link href={href} aria-label={`${p.name} 상세 보기`}>
          <ProductArt product={p} />
        </Link>
        <button
          aria-label={`${p.name} ${saved ? "찜 취소" : "찜하기"}`}
          aria-pressed={saved}
          className={`product-heart ${saved ? "saved" : ""}`}
          onClick={() => toggle(p)}
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />
        </button>
        <span
          className={`product-tag ${p.source === "example" ? "sample-tag" : ""}`}
        >
          {p.source === "example"
            ? "예시 상품"
            : p.rocket
              ? "로켓배송"
              : "쿠팡 파트너스"}
        </span>
      </div>
      <div className="product-card-info">
        <span className="product-category">
          {p.source === "coupang" && <b className="card-ad-label">광고</b>}
          {categories.find((c) => c.id === p.category)?.name || p.category}
        </span>
        <Link href={href} className="product-name">
          {p.name}
        </Link>
        <div className="product-card-price">
          <strong>{money(p.price)}</strong>
          <span>원</span>
          {p.source === "example" && <small>예시 가격</small>}
        </div>
        <div className="product-card-bottom">
          <span>
            {p.source === "example"
              ? "디자인 미리보기"
              : "가격·재고는 쿠팡에서 확인"}
          </span>
          <Link href={href}>
            상품 보기 <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}
function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div className="shop-empty error-state">
      <RefreshCw size={28} />
      <h2>상품을 불러오지 못했어요.</h2>
      <p>{message}</p>
      <button className="shop-dark-button" onClick={retry}>
        다시 시도 <RefreshCw size={15} />
      </button>
      <Link href="/guide" className="error-guide">
        연결 설정 안내 보기
      </Link>
    </div>
  );
}
