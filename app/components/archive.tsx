"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  Bookmark,
  LayoutGrid,
  FolderHeart,
  Compass,
  X,
  Menu,
  SlidersHorizontal,
  Check,
  ChevronDown,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

type Ad = {
  id: string;
  brand: string;
  initials: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  color: string;
  art: string;
  headline: string;
  subtitle: string;
  date: string;
};
const ads: Ad[] = [
  {
    id: "stride",
    brand: "STRIDE",
    initials: "S",
    title: "가볍게, 나만의 페이스로",
    description:
      "도시를 달리는 모든 순간을 위해. 일상과 러닝의 경계를 넘나드는 새로운 데일리 러닝화 캠페인입니다.",
    category: "패션 · 스포츠",
    platform: "Google",
    color: "#e8eee1",
    art: "shoe",
    headline: "FIND YOUR\nOWN PACE.",
    subtitle: "THE EVERYDAY RUNNER / STRIDE 02",
    date: "2026-10-14",
  },
  {
    id: "morrow",
    brand: "morrow",
    initials: "m",
    title: "피부가 쉬어가는 시간",
    description:
      "꼭 필요한 성분만 남겼습니다. 매일의 루틴을 편안하게 만드는 식물성 스킨케어를 만나보세요.",
    category: "뷰티 · 케어",
    platform: "Meta",
    color: "#e9e4db",
    art: "bottle",
    headline: "Less,\nbut better.",
    subtitle: "A LITTLE CARE. EVERY DAY.",
    date: "2026-10-14",
  },
  {
    id: "pause",
    brand: "PAUSE",
    initials: "P",
    title: "좋아하는 소리에 머무르다",
    description:
      "소음은 멀리, 당신의 플레이리스트는 가까이. 나에게 집중하는 시간을 위한 오디오 컬렉션.",
    category: "테크 · 디지털",
    platform: "Google",
    color: "#dcdff3",
    art: "audio",
    headline: "YOUR WORLD.\nON MUTE.",
    subtitle: "PAUSE / WIRELESS AUDIO",
    date: "2026-10-13",
  },
  {
    id: "oat",
    brand: "OAT DAYS",
    initials: "O",
    title: "아침을 조금 더 다정하게",
    description:
      "바쁜 하루에도 기분 좋은 시작. 고소한 귀리와 커피가 만나는 식물성 오트 라떼.",
    category: "푸드 · 라이프",
    platform: "Meta",
    color: "#f1c76a",
    art: "can",
    headline: "GOOD DAYS\nSTART SLOW.",
    subtitle: "OAT LATTE / MADE FOR YOUR MORNING",
    date: "2026-10-13",
  },
  {
    id: "folio",
    brand: "folio",
    initials: "f",
    title: "흩어진 생각을 하나의 흐름으로",
    description:
      "메모부터 프로젝트까지 한곳에서. 생각을 정리하고 다음 아이디어를 발견하는 새로운 작업 공간.",
    category: "테크 · 디지털",
    platform: "Google",
    color: "#dcebe5",
    art: "app",
    headline: "MAKE ROOM\nFOR IDEAS.",
    subtitle: "YOUR NEXT CHAPTER STARTS HERE",
    date: "2026-10-12",
  },
  {
    id: "ordinary",
    brand: "ordinary",
    initials: "o",
    title: "좋은 공간은 일상에서 시작되니까",
    description:
      "매일 마주하는 작은 물건이 만드는 변화. 오래 쓰고 싶은 디자인으로 일상을 채워보세요.",
    category: "리빙 · 공간",
    platform: "Meta",
    color: "#ead6c6",
    art: "chair",
    headline: "A PLACE\nTO JUST BE.",
    subtitle: "OBJECTS FOR AN ORDINARY LIFE",
    date: "2026-10-12",
  },
  {
    id: "rove",
    brand: "ROVE",
    initials: "R",
    title: "익숙한 길에서 조금 더 멀리",
    description:
      "가벼운 가방 하나로 시작하는 주말의 작은 모험. 가볍고 단단한 트래블 에센셜.",
    category: "패션 · 스포츠",
    platform: "Google",
    color: "#cee0e8",
    art: "bag",
    headline: "TAKE THE\nLONG WAY.",
    subtitle: "LESS BAGGAGE. MORE STORIES.",
    date: "2026-10-11",
  },
  {
    id: "sundays",
    brand: "SUNDAYS",
    initials: "su",
    title: "오늘은 당신의 속도로",
    description:
      "서두를 필요 없는 일요일처럼. 나만의 리듬을 찾는 데일리 웰니스 프로그램.",
    category: "푸드 · 라이프",
    platform: "Meta",
    color: "#f0d7df",
    art: "sun",
    headline: "NOTHING\nTO RUSH.",
    subtitle: "A SMALL MOMENT, JUST FOR YOU.",
    date: "2026-10-10",
  },
];
const categories = [
  "전체",
  "패션 · 스포츠",
  "뷰티 · 케어",
  "테크 · 디지털",
  "푸드 · 라이프",
  "리빙 · 공간",
];

function Artwork({ ad, large = false }: { ad: Ad; large?: boolean }) {
  return (
    <div
      className={`artwork art-${ad.art} ${large ? "art-large" : ""}`}
      style={{ background: ad.color }}
      aria-label={`${ad.brand} 예시 광고 디자인`}
    >
      <div className="art-brand">
        {ad.brand}
        <span>®</span>
      </div>
      <div className="art-headline">
        {ad.headline.split("\n").map((line, i) => (
          <span key={i}>{line}</span>
        ))}
      </div>
      <div className="art-object" aria-hidden="true">
        {ad.art === "shoe" && (
          <svg viewBox="0 0 300 160">
            <defs>
              <linearGradient id="sole">
                <stop stopColor="#fcfdf5" />
                <stop offset="1" stopColor="#c1c7ae" />
              </linearGradient>
            </defs>
            <path
              d="M42 104c23-2 25-47 38-50 10-2 21 30 33 30l43-24c10-6 18-1 22 11l17 26 61 20c15 5 25 19 13 24-33 16-184 11-228 2-18-4-18-29 1-39Z"
              fill="url(#sole)"
              stroke="#a0a78f"
              strokeWidth="2"
            />
            <path
              d="m107 85 14 30 63-12M116 82l22 3m-12-11 21 5m-7-11 22 6m-7-11 18 7"
              stroke="#5a6750"
              strokeWidth="5"
            />
            <path
              d="M30 131c54 15 191 20 243-2l-4 14c-43 20-188 13-232 1Z"
              fill="#747e61"
            />
            <path
              d="m70 80 4 28 25 7"
              fill="none"
              stroke="#d2d7c5"
              strokeWidth="8"
            />
          </svg>
        )}
        {ad.art === "bottle" && (
          <>
            <div className="bottle bottle-back">
              <span>
                morrow
                <br />
                <small>DAILY ESSENTIALS</small>
              </span>
            </div>
            <div className="bottle">
              <span>
                morrow
                <br />
                <small>
                  THE DAILY SERUM
                  <br />
                  30 ml / 1.0 fl oz
                </small>
              </span>
            </div>
          </>
        )}
        {ad.art === "audio" && (
          <svg viewBox="0 0 240 200">
            <path
              d="M47 120V89a73 73 0 0 1 146 0v31"
              stroke="#34354c"
              strokeWidth="18"
              fill="none"
            />
            <path
              d="M47 92a73 73 0 0 1 146 0"
              stroke="#78798d"
              strokeWidth="9"
              fill="none"
            />
            <rect
              x="27"
              y="105"
              width="47"
              height="76"
              rx="22"
              fill="#36374d"
              transform="rotate(-14 50 143)"
            />
            <rect
              x="166"
              y="105"
              width="47"
              height="76"
              rx="22"
              fill="#36374d"
              transform="rotate(14 190 143)"
            />
            <path
              d="M38 119v38m160-38v38"
              stroke="#85869a"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        )}
        {ad.art === "can" && (
          <div className="oat-can">
            <small>PLANT BASED / ALL GOOD</small>
            <strong>
              oat
              <br />
              days.
            </strong>
            <span>
              THE SLOW MORNING
              <br />
              OAT LATTE
            </span>
            <i>250 ml</i>
          </div>
        )}
        {ad.art === "app" && (
          <div className="mini-app">
            <div className="mini-bar">
              ◒ folio <span>Workspace ↗</span>
            </div>
            <small>MY PERSONAL SPACE</small>
            <h3>
              A little more
              <br />
              space to think.
            </h3>
            <div className="mini-blocks">
              <i />
              <i />
              <i />
            </div>
            <p>✳ A new idea starts here</p>
          </div>
        )}
        {ad.art === "chair" && (
          <svg viewBox="0 0 240 220">
            <path
              d="m60 110-6 99m105-96 19 96m-109-39 96 1"
              stroke="#7f4f32"
              strokeWidth="9"
              fill="none"
            />
            <path
              d="M47 46q0-22 25-22h81q23 0 24 22l-8 68H56Z"
              fill="#b67f52"
            />
            <path
              d="M50 110q-15 15-10 32 70 15 143-1 1-22-17-29Z"
              fill="#d1a073"
            />
            <path
              d="M66 35v66m17-66v68m17-68v68m17-68v68m17-68v68m17-68v68"
              stroke="#704b33"
              strokeWidth="2"
              opacity=".25"
            />
          </svg>
        )}
        {ad.art === "bag" && (
          <svg viewBox="0 0 240 220">
            <path
              d="M85 61V43q35-39 69 0v18"
              stroke="#465b5c"
              strokeWidth="12"
              fill="none"
            />
            <rect
              x="48"
              y="56"
              width="145"
              height="145"
              rx="32"
              fill="#526b6b"
            />
            <path
              d="M66 70q-8 63 0 117M175 70q8 63 0 117"
              stroke="#7e9490"
              strokeWidth="3"
              fill="none"
            />
            <rect
              x="80"
              y="120"
              width="80"
              height="56"
              rx="12"
              fill="#3e5658"
            />
            <path d="M89 128h63" stroke="#aab9ad" strokeWidth="3" />
            <text
              x="120"
              y="104"
              textAnchor="middle"
              fill="#dde7cf"
              fontSize="17"
              fontWeight="bold"
            >
              ROVE
            </text>
          </svg>
        )}
        {ad.art === "sun" && (
          <div className="sun-flower">
            <span>✳</span>
            <p>just be.</p>
          </div>
        )}
      </div>
      <div className="art-subtitle">
        {ad.subtitle}
        <ArrowUpRight size={13} />
      </div>
    </div>
  );
}

export default function Archive({
  mode = "home",
  id,
}: {
  mode?: "home" | "search" | "collection" | "detail";
  id?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [platform, setPlatform] = useState("전체 플랫폼");
  const [sort, setSort] = useState("latest");
  const [saved, setSaved] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("adlib-saved") || "[]");
      if (Array.isArray(data))
        setSaved(data.filter((x) => typeof x === "string"));
    } catch {}
    setHydrated(true);
    if (mode === "search") {
      const p = new URLSearchParams(window.location.search);
      setQuery(p.get("q") || "");
      const c = p.get("category");
      if (c && categories.includes(c)) setCategory(c);
    }
  }, [mode]);
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem("adlib-saved", JSON.stringify(saved));
      } catch {}
    }
  }, [saved, hydrated]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document
          .querySelector<HTMLInputElement>(".search-field input")
          ?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2300);
    return () => clearTimeout(t);
  }, [toast]);
  const toggle = (ad: Ad) => {
    setSaved((prev) =>
      prev.includes(ad.id) ? prev.filter((x) => x !== ad.id) : [...prev, ad.id],
    );
    setToast(
      saved.includes(ad.id) ? "컬렉션에서 삭제했어요." : "컬렉션에 저장했어요.",
    );
  };
  let filtered = ads.filter(
    (a) =>
      (mode !== "collection" || saved.includes(a.id)) &&
      (category === "전체" || a.category === category) &&
      (platform === "전체 플랫폼" || a.platform === platform) &&
      `${a.title} ${a.brand} ${a.description} ${a.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (sort === "brand")
    filtered = [...filtered].sort((a, b) => a.brand.localeCompare(b.brand));
  if (sort === "oldest") filtered = [...filtered].reverse();
  const selected = ads.find((a) => a.id === id);
  const nav = [
    { href: "/", icon: Compass, label: "발견하기", active: mode === "home" },
    {
      href: "/search",
      icon: LayoutGrid,
      label: "광고 탐색",
      active: mode === "search" || mode === "detail",
    },
    {
      href: "/collection",
      icon: FolderHeart,
      label: "내 컬렉션",
      active: mode === "collection",
    },
  ];
  return (
    <div className="archive-shell">
      {menu && (
        <button
          aria-label="메뉴 닫기"
          className="nav-overlay"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "is-open" : ""}`}>
        <Link href="/" className="wordmark">
          <span className="brand-symbol">
            a<span>↗</span>
          </span>
          adlib<span className="wordmark-dot">.</span>
        </Link>
        <p className="sidebar-caption">YOUR NEXT IDEA STARTS HERE</p>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`nav-item ${n.active ? "active" : ""}`}
              aria-current={n.active ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              <n.icon size={19} />
              {n.label}
              {n.href === "/collection" && (
                <span className="nav-count">{saved.length}</span>
              )}
              {n.active && n.href !== "/collection" && (
                <span className="active-dot" />
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">
          <div className="note-symbol">✳</div>
          <strong>
            좋은 아이디어는
            <br />
            발견에서 시작됩니다.
          </strong>
          <p>
            마음에 드는 광고를 모아
            <br />
            나만의 영감을 완성해 보세요.
          </p>
          <Link href="/collection">
            컬렉션 둘러보기 <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <div className="avatar">M</div>
          <div>
            <strong>나의 워크스페이스</strong>
            <small>Personal space</small>
          </div>
          <span className="online-dot" />
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu"
              aria-label="메뉴 열기"
              onClick={() => setMenu(true)}
            >
              <Menu size={21} />
            </button>
            <span>워크스페이스</span>
            <span className="breadcrumb-slash">/</span>
            <strong>
              {mode === "home"
                ? "발견하기"
                : mode === "collection"
                  ? "내 컬렉션"
                  : mode === "detail"
                    ? "광고 상세"
                    : "광고 탐색"}
            </strong>
          </div>
          <div className="top-right">
            <span className="demo-badge">
              <span />
              예시 아카이브
            </span>
            <div className="top-avatar">M</div>
          </div>
        </header>
        <main className="main-content">
          {mode === "detail" ? (
            selected ? (
              <>
                <Link href="/search" className="back-link">
                  <ArrowLeft size={16} /> 광고 탐색으로 돌아가기
                </Link>
                <div className="detail-layout">
                  <Artwork ad={selected} large />
                  <div className="detail-copy">
                    <span className="eyebrow">CREATIVE SPOTLIGHT</span>
                    <div className="detail-brand">
                      {selected.brand} <span>{selected.platform}</span>
                    </div>
                    <h1>{selected.title}</h1>
                    <p>{selected.description}</p>
                    <dl>
                      <div>
                        <dt>카테고리</dt>
                        <dd>{selected.category}</dd>
                      </div>
                      <div>
                        <dt>플랫폼</dt>
                        <dd>{selected.platform} Ads</dd>
                      </div>
                      <div>
                        <dt>등록일</dt>
                        <dd>{selected.date.replace(/-/g, ". ")}</dd>
                      </div>
                      <div>
                        <dt>광고 형식</dt>
                        <dd>이미지 · 크리에이티브</dd>
                      </div>
                    </dl>
                    <button
                      className={`primary-button ${saved.includes(selected.id) ? "is-saved" : ""}`}
                      onClick={() => toggle(selected)}
                    >
                      {saved.includes(selected.id) ? (
                        <Check size={17} />
                      ) : (
                        <Bookmark size={17} />
                      )}{" "}
                      {saved.includes(selected.id)
                        ? "컬렉션에 저장됨"
                        : "컬렉션에 저장"}
                    </button>
                    <p className="detail-disclaimer">
                      이 광고는 탐색 기능을 체험하기 위해 제작한 예시입니다.
                      <br />
                      실제 브랜드의 집행 광고가 아닙니다.
                    </p>
                  </div>
                </div>
                <div className="section-heading related-heading">
                  <h2>
                    함께 발견해 보세요 <span>MORE TO EXPLORE</span>
                  </h2>
                </div>
                <div className="ad-grid">
                  {ads
                    .filter((a) => a.id !== selected.id)
                    .slice(0, 4)
                    .map((a) => (
                      <Card
                        key={a.id}
                        ad={a}
                        saved={saved.includes(a.id)}
                        toggle={toggle}
                      />
                    ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <Search size={35} />
                <h1>광고를 찾을 수 없어요</h1>
                <p>다른 광고에서 새로운 영감을 발견해 보세요.</p>
                <Link href="/search" className="primary-button">
                  광고 탐색하기 <ArrowRight size={17} />
                </Link>
              </div>
            )
          ) : (
            <>
              <div className="page-intro">
                <div>
                  <div className="eyebrow">
                    {mode === "home"
                      ? "THE CREATIVE DISCOVERY SPACE"
                      : mode === "collection"
                        ? "YOUR PERSONAL INSPIRATION BOARD"
                        : "EXPLORE THE POSSIBILITIES"}
                  </div>
                  <h1>
                    {mode === "home" ? (
                      <>
                        다음 아이디어를 <span>발견하세요.</span>
                        <span className="title-spark">✳</span>
                      </>
                    ) : mode === "collection" ? (
                      "차곡차곡 모은 영감."
                    ) : (
                      "좋은 광고, 더 가까이."
                    )}
                  </h1>
                  <p>
                    {mode === "home"
                      ? "눈길을 끄는 크리에이티브부터 새로운 브랜드의 이야기까지."
                      : mode === "collection"
                        ? "마음에 드는 광고를 저장하고, 언제든 다시 꺼내 보세요."
                        : "브랜드, 키워드, 카테고리로 다음 캠페인의 힌트를 찾아보세요."}
                  </p>
                </div>
                <span className="intro-index">
                  {mode === "home"
                    ? "01 / DISCOVER"
                    : mode === "collection"
                      ? "03 / COLLECT"
                      : "02 / EXPLORE"}
                </span>
              </div>
              {mode === "home" && (
                <section className="hero-banner">
                  <div className="hero-copy">
                    <span className="hero-kicker">
                      <span /> CURATED FOR YOUR NEXT MOVE
                    </span>
                    <h2>
                      좋은 광고에는
                      <br />
                      이유가 있으니까.
                    </h2>
                    <p>
                      스크롤을 멈추게 한 그 아이디어.
                      <br />
                      발견하고, 모으고, 당신의 것으로 만드세요.
                    </p>
                    <Link href="/search" className="hero-cta">
                      새로운 영감 만나기 <ArrowUpRight size={18} />
                    </Link>
                    <div className="hero-bottom">
                      <span>EXPLORE. SAVE. CREATE.</span>
                      <span>↗</span>
                    </div>
                  </div>
                  <div className="hero-visual" aria-hidden="true">
                    <div className="hero-orbit" />
                    <span className="hero-star">✳</span>
                    <div className="hero-sticker">
                      a little
                      <br />
                      <em>inspiration.</em>
                      <span>GOES A LONG WAY ↗</span>
                    </div>
                    <div className="floating-ad">
                      <span>THE DAILY EDIT / 001</span>
                      <strong>
                        Make
                        <br />
                        something
                        <br />
                        <i>worth a look.</i>
                      </strong>
                      <div className="floating-sun">✳</div>
                      <small>ADLIB CREATIVE ARCHIVE ↗</small>
                    </div>
                    <span className="hero-vertical">
                      A FRESH PERSPECTIVE, EVERY DAY.
                    </span>
                  </div>
                </section>
              )}
              <section className="browse-section" aria-label="광고 목록">
                <div className="section-heading">
                  <div>
                    <h2>
                      {mode === "collection"
                        ? "저장한 광고"
                        : mode === "search"
                          ? "광고 탐색"
                          : "발견의 시작"}{" "}
                      <span>
                        {mode === "collection"
                          ? "SAVED CREATIVES"
                          : "THE CREATIVE EDIT"}
                      </span>
                    </h2>
                    <p>
                      {mode === "collection"
                        ? `${saved.length}개의 아이디어가 기다리고 있어요.`
                        : "다양한 시선으로 완성한 브랜드의 크리에이티브를 만나보세요."}
                    </p>
                  </div>
                  {mode === "home" && (
                    <Link className="text-link" href="/search">
                      전체 탐색 <ArrowUpRight size={16} />
                    </Link>
                  )}
                </div>
                <div className="search-row">
                  <div className="search-field">
                    <Search size={19} />
                    <input
                      aria-label="브랜드 또는 키워드 검색"
                      placeholder="어떤 영감을 찾고 있나요? 브랜드 또는 키워드 검색"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                      <button
                        aria-label="검색어 지우기"
                        onClick={() => setQuery("")}
                      >
                        <X size={16} />
                      </button>
                    )}
                    <kbd>⌘ K</kbd>
                  </div>
                  <label className="platform-select">
                    <SlidersHorizontal size={16} />
                    <select
                      aria-label="플랫폼 필터"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                    >
                      <option>전체 플랫폼</option>
                      <option>Google</option>
                      <option>Meta</option>
                    </select>
                    <ChevronDown size={14} />
                  </label>
                </div>
                <div className="category-row">
                  <div className="categories">
                    {categories.map((c) => (
                      <button
                        key={c}
                        className={c === category ? "selected" : ""}
                        aria-pressed={c === category}
                        onClick={() => setCategory(c)}
                      >
                        {c === "전체" && <LayoutGrid size={13} />} {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="results-bar">
                  <span>
                    전체 <strong>{filtered.length}</strong>개{" "}
                    <span className="results-note">· 예시 크리에이티브</span>
                  </span>
                  <label className="sort-select">
                    <select
                      aria-label="광고 정렬"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="latest">최신 등록순</option>
                      <option value="oldest">오래된 순</option>
                      <option value="brand">브랜드 이름순</option>
                    </select>
                    <ChevronDown size={13} />
                  </label>
                </div>
                {filtered.length ? (
                  <div className="ad-grid">
                    {filtered.map((ad) => (
                      <Card
                        key={ad.id}
                        ad={ad}
                        saved={saved.includes(ad.id)}
                        toggle={toggle}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    {mode === "collection" ? (
                      <Bookmark size={32} />
                    ) : (
                      <Search size={32} />
                    )}
                    <h3>
                      {mode === "collection" && !saved.length
                        ? "아직 모아둔 광고가 없어요."
                        : "일치하는 광고가 없어요."}
                    </h3>
                    <p>
                      {mode === "collection" && !saved.length
                        ? "마음에 드는 광고의 북마크를 눌러 첫 영감을 저장해 보세요."
                        : "다른 검색어나 필터로 다시 찾아보세요."}
                    </p>
                    {mode === "collection" && !saved.length ? (
                      <Link href="/search" className="primary-button">
                        광고 탐색하기 <ArrowRight size={16} />
                      </Link>
                    ) : (
                      <button
                        className="primary-button"
                        onClick={() => {
                          setQuery("");
                          setCategory("전체");
                          setPlatform("전체 플랫폼");
                        }}
                      >
                        필터 초기화
                      </button>
                    )}
                  </div>
                )}
              </section>
              {mode === "home" && (
                <div className="collection-banner">
                  <span className="collection-icon">
                    <FolderHeart size={27} />
                  </span>
                  <div>
                    <h3>스쳐가는 영감, 놓치지 마세요.</h3>
                    <p>북마크 한 번으로 만드는 나만의 크리에이티브 아카이브.</p>
                  </div>
                  <Link href="/collection">
                    내 컬렉션 보기 <ArrowUpRight size={17} />
                  </Link>
                </div>
              )}
            </>
          )}
          <footer>
            <Link href="/" className="footer-logo">
              adlib.
            </Link>
            <p>좋은 아이디어를 위한 열린 아카이브.</p>
            <span>
              © 2026 ADLIB <span className="footer-separator">/</span> MADE FOR
              THE CURIOUS.
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
function Card({
  ad,
  saved,
  toggle,
}: {
  ad: Ad;
  saved: boolean;
  toggle: (ad: Ad) => void;
}) {
  return (
    <article className="ad-card">
      <div className="card-visual">
        <Link
          href={`/detail/${ad.id}`}
          aria-label={`${ad.brand} — ${ad.title} 상세 보기`}
        >
          <Artwork ad={ad} />
        </Link>
        <button
          className={`save-button ${saved ? "saved" : ""}`}
          aria-label={`${ad.brand} ${saved ? "저장 취소" : "저장"}`}
          aria-pressed={saved}
          onClick={() => toggle(ad)}
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </button>
        <span className="format-tag">이미지 광고</span>
      </div>
      <div className="card-info">
        <div className="brand-row">
          <span className={`brand-avatar brand-${ad.art}`}>{ad.initials}</span>
          <strong>{ad.brand}</strong>
          <span className="platform-tag">
            <span
              className={ad.platform === "Google" ? "google-dot" : "meta-dot"}
            />
            {ad.platform}
          </span>
        </div>
        <Link href={`/detail/${ad.id}`} className="card-title">
          {ad.title}
        </Link>
        <div className="card-meta">
          <span>{ad.category}</span>
          <span>{ad.date.slice(5).replace("-", ".")} 등록</span>
        </div>
      </div>
    </article>
  );
}
