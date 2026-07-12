"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, ShieldCheck, Star, LogOut, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { PostCard } from "@/components/post-card";
import { CATEGORY_EMOJI, type Category } from "@/lib/mock-data";
import { StatusBadge } from "@/components/badges";
import { createClient } from "@/lib/supabase/client";

export default function Page(props: any) { return <ProfilePage {...props} />; }

function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myPosts, setMyPosts] = useState<any[]>([]);

  const [tab, setTab] = useState<"active" | "closed">("active");
  const active = myPosts.filter((p) => p.status !== "closed");
  const closed = myPosts.filter((p) => p.status === "closed");
  const list = tab === "active" ? active : closed;

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);
      
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileData) setProfile(profileData);
      
      const { data: postsData } = await supabase
        .from("posts")
        .select("*, author:profiles(display_name, avatar_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
        
      if (postsData) {
        setMyPosts(postsData.map(p => ({
          id: p.id,
          type: p.type,
          title: p.title,
          category: p.category,
          status: p.status,
          location: p.location || "ไม่ระบุตำแหน่ง",
          postedAt: new Date(p.created_at),
          userId: p.user_id,
          distanceKm: 0,
          image: CATEGORY_EMOJI[p.category as Category] || "📦",
          imageUrl: p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : p.image_url,
          imageUrls: p.image_urls || [],
          imageHue: 200,
          author: p.author
        })));
      }
      
      setLoading(false);
    }
    loadUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">กำลังโหลดข้อมูลโปรไฟล์...</div>;
  }

  return (
    <AppShell
      topBar={
        <header className="px-4 pt-5 pb-3 flex items-center justify-between">
          <h1 className="text-[20px] font-bold">โปรไฟล์</h1>
          <button onClick={handleLogout}
            className="size-10 rounded-full bg-surface border border-border flex items-center justify-center text-destructive"
            aria-label="ออกจากระบบ"
          >
            <LogOut className="size-5" />
          </button>
        </header>
      }
    >
      <section className="px-4">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.5_0.12_210)] text-primary-foreground p-5 shadow-[var(--shadow-pop)]">
          <div className="flex items-center gap-3">
            <div className="size-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-xl font-bold uppercase">
              {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-[17px] flex items-center gap-1.5 truncate">
                {profile?.display_name || "ผู้ใช้งาน"}
                <ShieldCheck className="size-4 shrink-0" />
              </p>
              <p className="text-[12.5px] opacity-90 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Stat label="ประกาศ" value={myPosts.length.toString()} />
            <Stat
              label="คะแนน"
              value={
                <span className="flex items-center justify-center gap-0.5">
                  <Star className="size-3.5 fill-current" />
                  5.0
                </span>
              }
            />
            <Stat label="ปิดเคส" value={closed.length.toString()} />
          </div>
        </div>
      </section>

      <section className="px-4 mt-5 space-y-2">
        <Row label="ข้อมูลส่วนตัว" />
        <Row label="ประวัติการเปลี่ยนสถานะ" />
        <Row label="ความเป็นส่วนตัวและความปลอดภัย" />
      </section>

      <section className="px-4 mt-6">
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          <TabBtn active={tab === "active"} onClick={() => setTab("active")}>
            กำลังดำเนินการ ({active.length})
          </TabBtn>
          <TabBtn active={tab === "closed"} onClick={() => setTab("closed")}>
            ปิดเคสแล้ว ({closed.length})
          </TabBtn>
        </div>

        <div className="mt-4 space-y-3">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-[13px] text-muted-foreground">
              ยังไม่มีประกาศในหมวดนี้
            </div>
          ) : (
            list.map((p) => (
              <div key={p.id} className="relative">
                <PostCard post={p} />
                <div className="mt-1 ml-1">
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="px-4 mt-8 pb-8">
        <button onClick={handleLogout} className="w-full h-12 rounded-xl border border-destructive/30 text-destructive font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition">
          <LogOut className="size-4" /> ออกจากระบบ
        </button>
      </section>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur py-2.5">
      <p className="text-[18px] font-bold leading-none">{value}</p>
      <p className="text-[11px] opacity-90 mt-1">{label}</p>
    </div>
  );
}

function Row({ label }: { label: string }) {
  return (
    <button className="w-full flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3.5 text-[14px] font-medium">
      <span>{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition ${
        active ? "bg-surface text-foreground shadow-[var(--shadow-card)]" : "text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}
