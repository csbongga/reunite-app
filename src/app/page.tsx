"use client";

import Link from "next/link";
import { Bell, MapPin, Sparkles, Filter } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  type Category,
} from "@/lib/mock-data";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Page(props: any) { return <FeedPage {...props} />; }

const FILTERS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "lost", label: "ของหาย" },
  { id: "found", label: "พบของ" },
] as const;

const CATEGORIES: Category[] = [
  "electronics",
  "wallet",
  "keys",
  "documents",
  "bag",
  "jewelry",
  "pet",
  "clothing",
  "other",
];

function FeedPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [category, setCategory] = useState<Category | "all">("all");
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const metaName = user.user_metadata?.full_name;
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUser(profile || { display_name: metaName || "ผู้ใช้ใหม่" });
      }
    };
    fetchUser();
  }, [supabase]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*, author:profiles(display_name, avatar_url)')
        .order('created_at', { ascending: false });
        
      if (data) {
        setPosts(data);
      }
      setLoading(false);
    };
    
    fetchPosts();
  }, [supabase]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => (filter === "all" ? true : p.type === filter)).filter(
      (p) => (category === "all" ? true : p.category === category),
    );
  }, [posts, filter, category]);

  return (
    <AppShell
      topBar={
        <header className="sticky top-0 z-20 bg-background/85 backdrop-blur border-b border-border">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <div>
              <p className="text-[12px] text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3" /> กรุงเทพ · 5 กม.
              </p>
              <h1 className="text-[22px] font-bold leading-tight">
                สวัสดี, {user?.display_name?.split(" ")[0] || "ผู้เยี่ยมชม"} 👋
              </h1>
            </div>
            <button
              className="size-10 rounded-full bg-surface border border-border flex items-center justify-center text-foreground relative"
              aria-label="การแจ้งเตือน"
            >
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 size-2 bg-destructive rounded-full" />
            </button>
          </div>

          <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap border transition ${
                  filter === f.id
                    ? "bg-foreground text-background border-foreground"
                    : "bg-surface text-muted-foreground border-border"
                }`}
              >
                {f.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1 px-3 rounded-full bg-surface border border-border text-[12px] text-muted-foreground">
              <Filter className="size-3" /> ตัวกรอง
            </div>
          </div>
        </header>
      }
    >
      <section className="px-4 pt-4">
        <Link href="/new"
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.12_205)] text-primary-foreground shadow-[var(--shadow-pop)]"
        >
          <div className="size-11 rounded-xl bg-white/15 flex items-center justify-center">
            <Sparkles className="size-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[15px]">เริ่มประกาศใหม่</p>
            <p className="text-[12.5px] opacity-90">แจ้งของหาย หรือของที่คุณพบในไม่กี่ขั้นตอน</p>
          </div>
          <span aria-hidden className="text-xl">→</span>
        </Link>
      </section>

      <section className="px-4 pt-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-foreground">หมวดหมู่ยอดนิยม</h2>
          <button className="text-[12.5px] text-primary font-medium">ดูทั้งหมด</button>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4">
          <CategoryPill
            label="ทั้งหมด"
            emoji="✨"
            active={category === "all"}
            onClick={() => setCategory("all")}
          />
          {CATEGORIES.map((c) => (
            <CategoryPill
              key={c}
              label={CATEGORY_LABEL[c]}
              emoji={CATEGORY_EMOJI[c]}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>
      </section>

      <section className="px-4 pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">รอบ ๆ คุณ ({posts.length})</h2>
          <span className="text-[12px] text-muted-foreground">ใหม่ล่าสุด</span>
        </div>
        
        {loading ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-[13px] text-muted-foreground">
            กำลังโหลดข้อมูล...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-[13px] text-muted-foreground">
            ยังไม่มีโพสต์ในหมวดที่เลือก ลองเปลี่ยนตัวกรองดูนะ
          </div>
        ) : (
          filteredPosts.map((p) => {
            const mappedPost = {
              id: p.id,
              type: p.type as "lost" | "found",
              title: p.title,
              category: p.category as Category,
              status: p.status as "open" | "closed",
              location: p.location || "ไม่ระบุตำแหน่ง",
              postedAt: new Date(p.created_at),
              userId: p.user_id,
              distanceKm: 1.2, // mock value for now
              image: CATEGORY_EMOJI[p.category as Category] || "📦",
              imageUrl: p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : p.image_url,
              imageUrls: p.image_urls || [],
              imageHue: 200, // fixed for now
              author: p.author
            };
            return <PostCard key={p.id} post={mappedPost} />;
          })
        )}
      </section>
    </AppShell>
  );
}

function CategoryPill({
  label,
  emoji,
  active,
  onClick,
}: {
  label: string;
  emoji: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex flex-col items-center justify-center gap-1 w-[72px] h-[78px] rounded-2xl border transition ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-pop)]"
          : "bg-surface text-foreground border-border"
      }`}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-[11px] font-medium leading-tight text-center px-1 line-clamp-2">
        {label}
      </span>
    </button>
  );
}
