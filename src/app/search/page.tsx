"use client";

import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { CATEGORY_EMOJI, type Category } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

export default function Page(props: any) { return <SearchPage {...props} />; }

function SearchPage() {
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadPosts() {
      const { data } = await supabase
        .from("posts")
        .select("*, author:profiles(display_name, avatar_url)")
        .order("created_at", { ascending: false });
        
      if (data) {
        const mapped = data.map(p => ({
          id: p.id,
          type: p.type,
          status: p.status,
          category: p.category,
          title: p.title,
          description: p.description,
          location: p.location,
          date: new Date(p.date || p.created_at).toISOString(),
          marks: p.marks || "",
          userId: p.user_id,
          distanceKm: 1.2,
          image: CATEGORY_EMOJI[p.category as Category] || "📦",
          imageUrl: p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : p.image_url,
          imageUrls: p.image_urls || [],
          imageHue: 200,
          author: p.author
        }));
        setPosts(mapped);
      }
      setLoading(false);
    }
    loadPosts();
  }, [supabase]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        (p.location && p.location.toLowerCase().includes(term)) ||
        (p.marks && p.marks.toLowerCase().includes(term)),
    );
  }, [q, posts]);

  const popular = ["AirPods", "กระเป๋าสตางค์", "กุญแจรถ", "แมว", "บัตรนักศึกษา"];

  return (
    <AppShell
      topBar={
        <header className="px-4 pt-5 pb-3 space-y-3 bg-background border-b border-border">
          <h1 className="text-[20px] font-bold">ค้นหา</h1>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 h-11 rounded-xl bg-surface border border-border focus-within:border-primary transition">
              <SearchIcon className="size-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="คำสำคัญ เช่น AirPods, กระเป๋า"
                className="flex-1 bg-transparent text-[14px] focus:outline-none"
              />
            </div>
            <button
              className="size-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center transition active:scale-95 hover:opacity-90 shadow-[var(--shadow-pop)]"
              aria-label="ตัวกรองเพิ่มเติม"
            >
              <SlidersHorizontal className="size-5" />
            </button>
          </div>
        </header>
      }
    >
      <section className="px-4 pt-5">
        <p className="text-[12.5px] text-muted-foreground mb-2">ค้นหายอดนิยม</p>
        <div className="flex flex-wrap gap-2">
          {popular.map((tag) => (
            <button
              key={tag}
              onClick={() => setQ(tag)}
              className="chip bg-surface border border-border text-foreground transition active:scale-95"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6 space-y-3 pb-6">
        <h2 className="font-semibold">
          {loading ? "กำลังโหลดข้อมูล..." : `ผลลัพธ์ (${results.length})`}
        </h2>
        
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">กำลังโหลด...</div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-[13px] text-muted-foreground">
            ไม่พบประกาศที่ตรงกับคำค้น "{q}"
          </div>
        ) : (
          results.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </section>
    </AppShell>
  );
}
