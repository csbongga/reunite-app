"use client";

import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { POSTS } from "@/lib/mock-data";

export default function Page(props: any) { return <SearchPage {...props} />; }

function SearchPage() {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return POSTS;
    return POSTS.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.location.toLowerCase().includes(term) ||
        p.marks.toLowerCase().includes(term),
    );
  }, [q]);

  const popular = ["AirPods", "กระเป๋าสตางค์", "กุญแจรถ", "แมว", "บัตรนักศึกษา"];

  return (
    <AppShell
      topBar={
        <header className="px-4 pt-5 pb-3 space-y-3 bg-background border-b border-border">
          <h1 className="text-[20px] font-bold">ค้นหา</h1>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 h-11 rounded-xl bg-surface border border-border focus-within:border-primary">
              <SearchIcon className="size-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="คำสำคัญ เช่น AirPods, กระเป๋า"
                className="flex-1 bg-transparent text-[14px] focus:outline-none"
              />
            </div>
            <button
              className="size-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center"
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
              className="chip bg-surface border border-border text-foreground"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6 space-y-3">
        <h2 className="font-semibold">ผลลัพธ์ ({results.length})</h2>
        {results.length === 0 ? (
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

