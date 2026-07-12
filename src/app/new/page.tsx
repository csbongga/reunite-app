"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, Camera, MapPin, Calendar } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  type Category,
  type PostType,
} from "@/lib/mock-data";

export default function Page(props: any) { return <NewPostPage {...props} />; }

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

function NewPostPage() {
  const router = useRouter();
  const [type, setType] = useState<PostType>("lost");
  const [category, setCategory] = useState<Category>("electronics");

  return (
    <AppShell hideTabs>
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="size-9 rounded-full bg-surface border border-border flex items-center justify-center"
          aria-label="ย้อนกลับ"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-[17px] font-semibold flex-1">สร้างประกาศใหม่</h1>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/");
        }}
        className="px-4 py-5 space-y-5"
      >
        <section>
          <Label>ประเภทประกาศ</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <TypeTile
              active={type === "lost"}
              onClick={() => setType("lost")}
              emoji="🔎"
              title="แจ้งของหาย"
              desc="ฉันทำของหายและกำลังตามหา"
            />
            <TypeTile
              active={type === "found"}
              onClick={() => setType("found")}
              emoji="🤝"
              title="แจ้งพบของ"
              desc="ฉันพบของและอยากส่งคืน"
            />
          </div>
        </section>

        <section>
          <Label>รูปภาพสิ่งของ</Label>
          <button
            type="button"
            className="mt-2 w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-border bg-surface flex flex-col items-center justify-center text-muted-foreground gap-2"
          >
            <Camera className="size-7" />
            <span className="text-[13px]">แตะเพื่อถ่ายรูป หรือเลือกจากคลัง</span>
          </button>
        </section>

        <section>
          <Label>หมวดหมู่</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition ${
                  category === c
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-surface text-foreground"
                }`}
              >
                <span className="text-xl">{CATEGORY_EMOJI[c]}</span>
                <span className="text-[11.5px] font-medium text-center leading-tight px-1">
                  {CATEGORY_LABEL[c]}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <Label htmlFor="title">หัวข้อ</Label>
          <Input id="title" placeholder="เช่น พบ AirPods Pro สีขาว" />
        </section>

        <section>
          <Label htmlFor="desc">รายละเอียด</Label>
          <textarea
            id="desc"
            rows={3}
            placeholder="บอกบริบทเพิ่มเติม เช่น สถานการณ์ที่พบ/หาย"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-surface border border-border text-[14px] focus:outline-none focus:border-primary resize-none"
          />
        </section>

        <section>
          <Label htmlFor="marks">ตำหนิ / จุดสังเกต *</Label>
          <textarea
            id="marks"
            rows={2}
            placeholder="รายละเอียดที่เจ้าของของจริงเท่านั้นที่ตอบได้"
            className="mt-2 w-full px-4 py-3 rounded-xl bg-accent/10 border border-accent/40 text-[14px] focus:outline-none focus:border-accent resize-none"
          />
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            ระบบจะใช้ข้อมูลนี้เพื่อยืนยันตัวเจ้าของจริง
          </p>
        </section>

        <section>
          <Label>สถานที่</Label>
          <div className="mt-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border">
            <MapPin className="size-4 text-primary" />
            <input
              className="flex-1 bg-transparent text-[14px] focus:outline-none"
              placeholder="ปักหมุดพิกัด หรือพิมพ์ชื่อสถานที่"
            />
          </div>
        </section>

        <section>
          <Label>วันเวลาที่เกิดเหตุ</Label>
          <div className="mt-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border">
            <Calendar className="size-4 text-primary" />
            <input
              type="datetime-local"
              className="flex-1 bg-transparent text-[14px] focus:outline-none"
            />
          </div>
        </section>

        <div className="pt-2 flex gap-2">
          <Link href="/"
            className="flex-1 h-12 rounded-xl border border-border bg-surface flex items-center justify-center font-medium"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            className="flex-[2] h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[var(--shadow-pop)] active:scale-[0.98] transition"
          >
            เผยแพร่ประกาศ
          </button>
        </div>
      </form>
    </AppShell>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-[13px] font-semibold text-foreground">
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="mt-2 w-full px-4 py-3 rounded-xl bg-surface border border-border text-[14px] focus:outline-none focus:border-primary"
    />
  );
}

function TypeTile({
  active,
  onClick,
  emoji,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl p-3 border transition ${
        active
          ? "border-primary bg-primary-soft"
          : "border-border bg-surface"
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <p className={`mt-1 font-semibold text-[13.5px] ${active ? "text-primary" : ""}`}>
        {title}
      </p>
      <p className="text-[11.5px] text-muted-foreground leading-tight mt-0.5">{desc}</p>
    </button>
  );
}
