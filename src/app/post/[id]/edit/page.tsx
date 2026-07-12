"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

export default function EditPostPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [post, setPost] = useState<any>(null);
  
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [marks, setMarks] = useState("");
  const [locationStr, setLocationStr] = useState("");

  useEffect(() => {
    async function loadPost() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      
      const { data: postData } = await supabase
        .from("posts")
        .select("*")
        .eq("id", params.id)
        .single();
        
      if (postData) {
        if (postData.user_id !== user.id) {
          alert("คุณไม่มีสิทธิ์แก้ไขประกาศนี้");
          router.push("/");
          return;
        }
        
        setPost(postData);
        setTitle(postData.title || "");
        setDesc(postData.description || "");
        setMarks(postData.marks || "");
        setLocationStr(postData.location || "");
      }
      setLoading(false);
    }
    loadPost();
  }, [params.id, router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc || !locationStr) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("posts").update({
        title,
        description: desc,
        marks,
        location: locationStr
      }).eq("id", params.id);
      
      if (error) throw error;
      
      alert("บันทึกการแก้ไขเรียบร้อยแล้ว!");
      router.push(`/post/${params.id}`);
      router.refresh();
      
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <AppShell hideTabs><div className="flex h-screen items-center justify-center">กำลังโหลด...</div></AppShell>;

  return (
    <AppShell hideTabs>
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <Link
          href={`/post/${params.id}`}
          className="size-9 rounded-full bg-surface border border-border flex items-center justify-center transition hover:scale-105"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-[17px] font-semibold flex-1">แก้ไขประกาศ</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5">
        <section>
          <label className="text-[13px] font-semibold text-foreground">หัวข้อ *</label>
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-2 w-full px-4 py-3 rounded-xl bg-surface border border-border text-[14px] focus:outline-none focus:border-primary transition"
          />
        </section>

        <section>
          <label className="text-[13px] font-semibold text-foreground">รายละเอียด *</label>
          <textarea
            rows={4}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            required
            className="mt-2 w-full px-4 py-3 rounded-xl bg-surface border border-border text-[14px] focus:outline-none focus:border-primary resize-none transition"
          />
        </section>

        <section>
          <label className="text-[13px] font-semibold text-foreground">ตำหนิ / จุดสังเกต</label>
          <textarea
            rows={2}
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            className="mt-2 w-full px-4 py-3 rounded-xl bg-accent/10 border border-accent/40 text-[14px] focus:outline-none focus:border-accent resize-none transition"
          />
        </section>

        <section>
          <label className="text-[13px] font-semibold text-foreground">ชื่อสถานที่ *</label>
          <input
            value={locationStr}
            onChange={(e) => setLocationStr(e.target.value)}
            required
            className="mt-2 w-full px-4 py-3 rounded-xl bg-surface border border-border text-[14px] focus:outline-none focus:border-primary transition"
          />
          <p className="mt-1 text-[11.5px] text-muted-foreground">หมายเหตุ: พิกัดแผนที่จะยังคงเป็นจุดเดิมที่เคยปักหมุดไว้</p>
        </section>

        <div className="pt-4 pb-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[var(--shadow-pop)] active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="size-4" />
            {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </button>
        </div>
      </form>
    </AppShell>
  );
}
