"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, MessageCircle, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";
import { relativeTime } from "@/lib/mock-data";

export default function NotificationsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data } = await supabase
        .from("notifications")
        .select(`
          id,
          type,
          is_read,
          created_at,
          post_id,
          actor:profiles!actor_id(display_name, avatar_url),
          post:posts!post_id(title)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setNotifications(data || []);
      setLoading(false);
      
      // Mark all as read when opening page
      if (data && data.some(n => !n.is_read)) {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", user.id)
          .eq("is_read", false);
      }
    }

    loadNotifications();
  }, [router, supabase]);

  if (loading) {
    return (
      <AppShell hideTabs>
        <div className="flex h-screen items-center justify-center text-muted-foreground">กำลังโหลดการแจ้งเตือน...</div>
      </AppShell>
    );
  }

  return (
    <AppShell hideTabs>
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="size-9 rounded-full bg-surface border border-border flex items-center justify-center transition hover:scale-105"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-[17px] font-semibold flex-1">การแจ้งเตือน</h1>
      </header>

      <section className="px-4 py-5">
        {notifications.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
            <Bell className="size-12 mb-3 opacity-20" />
            <p className="text-[14px]">ยังไม่มีการแจ้งเตือนใหม่</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Link 
                key={n.id} 
                href={`/post/${n.post_id}`}
                className={`block p-4 rounded-2xl border transition ${
                  !n.is_read 
                    ? "bg-primary/5 border-primary/20" 
                    : "bg-surface border-border hover:bg-surface/80"
                }`}
              >
                <div className="flex gap-3">
                  <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                    n.type === 'comment' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                  }`}>
                    {n.type === 'comment' ? <MessageCircle className="size-5" /> : <CheckCircle2 className="size-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[13.5px] leading-tight text-foreground">
                      <span className="font-semibold">{n.actor?.display_name || "มีคน"}</span>
                      {n.type === "comment" ? " ได้แสดงความคิดเห็นในประกาศ " : " มีความเคลื่อนไหวในประกาศ "}
                      <span className="font-medium text-primary">"{n.post?.title || "ประกาศของคุณ"}"</span>
                    </p>
                    <p className="text-[11.5px] text-muted-foreground mt-1">
                      {relativeTime(n.created_at)}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
