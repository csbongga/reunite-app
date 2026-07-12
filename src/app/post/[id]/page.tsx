"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  MapPin,
  Calendar,
  ShieldCheck,
  Send,
  Lock,
  Flag,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge, TypeBadge } from "@/components/badges";
import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  CURRENT_USER,
  getPost,
  getUser,
  relativeTime,
} from "@/lib/mock-data";

import type { Post } from "@/lib/mock-data";

export default function PostDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  
  const post = getPost(params.id);
  if (!post) {
    return <AppShell hideTabs><div className="p-10 text-center">ไม่พบประกาศนี้</div></AppShell>;
  }

  const poster = getUser(post.userId);
  const happened = new Date(post.happenedAt).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <AppShell hideTabs>
      <div
        className="relative h-64 flex items-center justify-center text-8xl"
        style={{ background: `oklch(0.9 0.06 ${post.imageHue})` }}
        aria-hidden
      >
        {post.image}
        <Link
          href="/"
          className="absolute top-4 left-4 size-10 rounded-full bg-surface/90 backdrop-blur flex items-center justify-center shadow-[var(--shadow-card)]"
          aria-label="ย้อนกลับ"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <button
          className="absolute top-4 right-4 size-10 rounded-full bg-surface/90 backdrop-blur flex items-center justify-center shadow-[var(--shadow-card)]"
          aria-label="รายงานโพสต์"
        >
          <Flag className="size-5" />
        </button>
      </div>

      <div className="px-4 pt-5 space-y-5">
        <div>
          <div className="flex flex-wrap gap-1.5">
            <TypeBadge type={post.type} />
            <StatusBadge status={post.status} />
            <span className="chip">
              {CATEGORY_EMOJI[post.category]} {CATEGORY_LABEL[post.category]}
            </span>
          </div>
          <h1 className="mt-2 text-[22px] font-bold leading-snug text-foreground">
            {post.title}
          </h1>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            โพสต์เมื่อ {relativeTime(post.postedAt)}
          </p>
        </div>

        <div className="rounded-2xl bg-surface border border-border p-4 space-y-3">
          <Row icon={<MapPin className="size-4" />} label="สถานที่" value={post.location} />
          <Row
            icon={<Calendar className="size-4" />}
            label={post.type === "lost" ? "เวลาที่หาย" : "เวลาที่พบ"}
            value={happened}
          />
          <Row
            icon={<ShieldCheck className="size-4" />}
            label="ระยะห่าง"
            value={`ห่างจากคุณ ${post.distanceKm.toFixed(1)} กม.`}
          />
        </div>

        <section>
          <h2 className="font-semibold mb-2">รายละเอียด</h2>
          <p className="text-[14px] text-foreground/90 leading-relaxed whitespace-pre-line">
            {post.description}
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">ตำหนิ / จุดสังเกต</h2>
          <div className="rounded-2xl border border-accent/40 bg-accent/15 p-4 text-[14px] text-foreground/90 leading-relaxed">
            {post.marks}
          </div>
        </section>

        <section className="flex items-center gap-3 rounded-2xl bg-surface border border-border p-4">
          <div className="size-11 rounded-full bg-primary-soft text-primary font-semibold flex items-center justify-center">
            {poster.initials}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[14px] flex items-center gap-1">
              {poster.name}
              {poster.verified && (
                <ShieldCheck className="size-4 text-primary" aria-label="ยืนยันตัวตนแล้ว" />
              )}
            </p>
            <p className="text-[12px] text-muted-foreground">
              ความน่าเชื่อถือ ★ {poster.reputation.toFixed(1)} · เข้าร่วม {poster.joined}
            </p>
          </div>
          <Link href="/profile"
            className="text-[12.5px] font-medium text-primary border border-primary/30 px-3 py-1.5 rounded-full"
          >
            ดูโปรไฟล์
          </Link>
        </section>

        <section>
          <h2 className="font-semibold mb-2">
            พื้นที่ยืนยันข้อมูล ({post.comments.length})
          </h2>
          <div className="rounded-xl bg-primary-soft/50 border border-primary/15 p-3 text-[12.5px] text-foreground/80 flex gap-2 mb-3">
            <Lock className="size-4 shrink-0 mt-0.5 text-primary" />
            ระบบจะปกปิดข้อมูลติดต่อส่วนตัวจนกว่าทั้งสองฝ่ายจะตกลงนัดรับ
            กรุณาถามรายละเอียดเฉพาะที่เจ้าของเท่านั้นที่ตอบได้
          </div>
          <ul className="space-y-3">
            {post.comments.map((c) => {
              const u = getUser(c.userId);
              return (
                <li key={c.id} className="flex gap-2.5">
                  <div className="size-8 rounded-full bg-muted text-muted-foreground font-semibold text-[11px] flex items-center justify-center">
                    {u.initials}
                  </div>
                  <div className="flex-1">
                    <div className="rounded-2xl rounded-tl-sm bg-surface border border-border px-3 py-2">
                      <p className="text-[12.5px] font-medium text-foreground">{u.name}</p>
                      <p className="text-[13.5px] text-foreground/90 mt-0.5">{c.message}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 ml-1">
                      {relativeTime(c.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
            {post.comments.length === 0 && (
              <li className="text-center text-[12.5px] text-muted-foreground py-4">
                ยังไม่มีคนคอมเมนต์ มาเริ่มเป็นคนแรกกัน
              </li>
            )}
          </ul>
        </section>
      </div>

      <div className="sticky bottom-0 mt-6 bg-background/95 backdrop-blur border-t border-border p-3">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center gap-2"
        >
          <div className="size-8 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center">
            {CURRENT_USER.initials}
          </div>
          <input
            type="text"
            placeholder="พิมพ์คำถามยืนยันตำหนิ..."
            className="flex-1 px-4 py-2.5 rounded-full bg-surface border border-border text-[13.5px] focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition"
            aria-label="ส่งข้อความ"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11.5px] text-muted-foreground">{label}</p>
        <p className="text-[14px] font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
