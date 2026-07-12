"use client";

import React, { use, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, MapPin, Calendar, Image as ImageIcon, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CATEGORY_EMOJI, CATEGORY_LABEL, type Category, type PostType } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES: Category[] = [
  "electronics", "wallet", "keys", "documents", "bag", "jewelry", "pet", "clothing", "other",
];

export default function Page(props: any) { return <NewPostPage {...props} />; }

function NewPostPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<PostType>("lost");
  const [category, setCategory] = useState<Category>("electronics");
  
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [marks, setMarks] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Limit to 4 images
      const newFiles = [...images, ...files].slice(0, 4);
      setImages(newFiles);
      setPreviews(newFiles.map(file => URL.createObjectURL(file)));
    }
    // clear input so same file can be picked again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newImages.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc || !location || !date) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("กรุณาเข้าสู่ระบบก่อนสร้างประกาศ");
        router.push("/auth");
        return;
      }

      let uploadedUrls: string[] = [];
      
      if (images.length > 0) {
        for (const file of images) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from("post_images")
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          const { data: publicUrlData } = supabase.storage
            .from("post_images")
            .getPublicUrl(filePath);
            
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      }

      const firstImage = uploadedUrls.length > 0 ? uploadedUrls[0] : null;

      const { error: insertError } = await supabase.from("posts").insert({
        user_id: user.id,
        type,
        category,
        title,
        description: desc,
        marks,
        location,
        date: new Date(date).toISOString(),
        image_url: firstImage,
        image_urls: uploadedUrls,
        status: 'searching'
      });

      if (insertError) throw insertError;
      
      alert("สร้างประกาศสำเร็จ!");
      router.push("/");
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell hideTabs>
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="size-9 rounded-full bg-surface border border-border flex items-center justify-center transition hover:scale-105"
          aria-label="ย้อนกลับ"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-[17px] font-semibold flex-1">สร้างประกาศใหม่</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5">
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
          <div className="flex items-center justify-between">
            <Label>รูปภาพสิ่งของ</Label>
            <span className="text-[11.5px] text-muted-foreground">{images.length}/4 รูป</span>
          </div>
          <input 
            type="file" 
            accept="image/*"
            multiple
            ref={fileInputRef} 
            onChange={handleImagePick} 
            className="hidden" 
          />
          
          {previews.length > 0 && (
            <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative shrink-0 w-32 aspect-square rounded-2xl overflow-hidden border border-border">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 size-7 bg-black/50 backdrop-blur rounded-full text-white flex items-center justify-center hover:bg-black/70 transition"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              
              {images.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0 w-32 aspect-square rounded-2xl border-2 border-dashed border-border bg-surface flex flex-col items-center justify-center text-muted-foreground gap-1 active:scale-[0.98] transition hover:border-primary/50 hover:bg-primary-soft/30"
                >
                  <Camera className="size-6" />
                  <span className="text-[11px] font-medium mt-1">เพิ่มรูปภาพ</span>
                </button>
              )}
            </div>
          )}

          {previews.length === 0 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-border bg-surface flex flex-col items-center justify-center text-muted-foreground gap-2 active:scale-[0.98] transition hover:border-primary/50 hover:bg-primary-soft/30"
            >
              <Camera className="size-8 opacity-70" />
              <div className="text-center">
                <p className="text-[13px] font-medium text-foreground">แตะเพื่อเลือกรูปภาพ</p>
                <p className="text-[12px] mt-0.5 opacity-70">เลือกได้สูงสุด 4 รูป</p>
              </div>
            </button>
          )}
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
                    : "border-border bg-surface text-foreground hover:bg-surface/60"
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
          <Label htmlFor="title">หัวข้อ *</Label>
          <Input 
            id="title" 
            placeholder="เช่น พบ AirPods Pro สีขาว" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </section>

        <section>
          <Label htmlFor="desc">รายละเอียด *</Label>
          <textarea
            id="desc"
            rows={3}
            placeholder="บอกบริบทเพิ่มเติม เช่น สถานการณ์ที่พบ/หาย"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            required
            className="mt-2 w-full px-4 py-3 rounded-xl bg-surface border border-border text-[14px] focus:outline-none focus:border-primary resize-none transition"
          />
        </section>

        <section>
          <Label htmlFor="marks">ตำหนิ / จุดสังเกต</Label>
          <textarea
            id="marks"
            rows={2}
            placeholder="รายละเอียดที่เจ้าของของจริงเท่านั้นที่ตอบได้"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            className="mt-2 w-full px-4 py-3 rounded-xl bg-accent/10 border border-accent/40 text-[14px] focus:outline-none focus:border-accent resize-none transition"
          />
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            ระบบจะใช้ข้อมูลนี้เพื่อยืนยันตัวเจ้าของจริง
          </p>
        </section>

        <section>
          <Label>สถานที่ *</Label>
          <div className="mt-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border focus-within:border-primary transition">
            <MapPin className="size-4 text-primary shrink-0" />
            <input
              className="flex-1 bg-transparent text-[14px] focus:outline-none"
              placeholder="ปักหมุดพิกัด หรือพิมพ์ชื่อสถานที่"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
        </section>

        <section>
          <Label>วันเวลาที่เกิดเหตุ *</Label>
          <div className="mt-2 flex items-center gap-2 px-4 py-3 rounded-xl bg-surface border border-border focus-within:border-primary transition">
            <Calendar className="size-4 text-primary shrink-0" />
            <input
              type="datetime-local"
              className="flex-1 bg-transparent text-[14px] focus:outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </section>

        <div className="pt-2 flex gap-2 pb-6">
          <Link href="/"
            className="flex-1 h-12 rounded-xl border border-border bg-surface flex items-center justify-center font-medium transition hover:bg-surface/80"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[var(--shadow-pop)] active:scale-[0.98] transition disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 hover:opacity-90"
          >
            {isSubmitting ? "กำลังบันทึก..." : "เผยแพร่ประกาศ"}
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
      className="mt-2 w-full px-4 py-3 rounded-xl bg-surface border border-border text-[14px] focus:outline-none focus:border-primary transition"
    />
  );
}

function TypeTile({ active, onClick, emoji, title, desc }: { active: boolean; onClick: () => void; emoji: string; title: string; desc: string; }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl p-3 border transition ${
        active ? "border-primary bg-primary-soft shadow-[var(--shadow-pop)]" : "border-border bg-surface hover:border-primary/40 hover:bg-primary-soft/10"
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <p className={`mt-1 font-semibold text-[13.5px] ${active ? "text-primary" : "text-foreground"}`}>
        {title}
      </p>
      <p className="text-[11.5px] text-muted-foreground leading-tight mt-0.5">{desc}</p>
    </button>
  );
}
