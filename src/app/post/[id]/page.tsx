"use client";

import React, { use, useEffect, useState } from "react";
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
  User as UserIcon,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge, TypeBadge } from "@/components/badges";
import {
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  relativeTime,
} from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/map-picker"), { ssr: false });

export default function PostDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const supabase = createClient();
  
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    async function loadData() {
      const { data: postData } = await supabase
        .from("posts")
        .select("*, author:profiles(display_name, avatar_url)")
        .eq("id", params.id)
        .single();
      
      const { data: commentsData } = await supabase
        .from("comments")
        .select("*, author:profiles(display_name, avatar_url)")
        .eq("post_id", params.id)
        .order("created_at", { ascending: true });
        
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setCurrentUser(profile);
      }
      
      setPost(postData);
      setComments(commentsData || []);
      setLoading(false);
    }
    loadData();
  }, [params.id, supabase]);
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!currentUser) {
      alert("กรุณาเข้าสู่ระบบก่อนคอมเมนต์");
      router.push("/auth");
      return;
    }
    
    setIsSubmitting(true);
    
    const { data: insertedComment, error } = await supabase
      .from("comments")
      .insert({
        post_id: post.id,
        user_id: currentUser.id,
        message: newComment.trim(),
      })
      .select("*, author:profiles(display_name, avatar_url)")
      .single();
      
    setIsSubmitting(false);
    
    if (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } else if (insertedComment) {
      setComments([...comments, insertedComment]);
      setNewComment("");
      
      if (post.user_id !== currentUser.id) {
        // Send notification
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          actor_id: currentUser.id,
          post_id: post.id,
          type: "comment"
        });
      }
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`ยืนยันการเปลี่ยนสถานะเป็น "${newStatus === "searching" ? "กำลังตามหา" : newStatus === "arranging" ? "นัดรับ" : "ปิดเคส"}" ?`)) return;
    const { error } = await supabase.from("posts").update({ status: newStatus }).eq("id", post.id).select().single();
    if (!error) {
      setPost({ ...post, status: newStatus });
    } else {
      alert("Error: " + error.message);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id).select().single();
    if (!error) {
      router.push("/");
    } else {
      alert("Error: " + error.message);
    }
  };

  if (loading) {
    return <AppShell hideTabs><div className="p-10 text-center text-muted-foreground">กำลังโหลดข้อมูล...</div></AppShell>;
  }

  if (!post) {
    return <AppShell hideTabs><div className="p-10 text-center text-foreground font-medium">ไม่พบประกาศนี้</div></AppShell>;
  }

  const posterName = post.author?.display_name || "ผู้ใช้งาน";
  const posterInitials = posterName.charAt(0).toUpperCase();
  const happened = new Date(post.date || post.created_at).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const images = post.image_urls && post.image_urls.length > 0 ? post.image_urls : (post.image_url ? [post.image_url] : []);
  
  const currentUserInitials = currentUser?.display_name ? currentUser.display_name.charAt(0).toUpperCase() : "";

  return (
    <AppShell hideTabs>
      <div className="relative bg-black border-b border-border">
        {images.length > 0 ? (
          <div 
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 pt-1 items-center"
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              const slide = Math.round(target.scrollLeft / target.clientWidth);
              setCurrentSlide(slide);
            }}
          >
            {images.map((url: string, i: number) => (
              <div 
                key={i} 
                className="shrink-0 w-full h-72 snap-center relative flex items-center justify-center cursor-pointer group"
                onClick={() => setFullscreenImageIndex(i)}
              >
                {/* Background blur for aesthetics */}
                <div 
                  className="absolute inset-0 opacity-40 scale-110 blur-xl"
                  style={{ backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
                {/* Main uncropped image */}
                <img src={url} alt={`Image ${i+1}`} className="relative z-10 w-full h-full object-contain transition-transform group-active:scale-[0.98]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-8xl" style={{ background: `oklch(0.9 0.06 200)` }}>
            {CATEGORY_EMOJI[post.category as keyof typeof CATEGORY_EMOJI] || "📦"}
          </div>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
            {images.map((_: any, i: number) => (
              <div 
                key={i} 
                className={`size-1.5 rounded-full shadow-sm transition-all duration-300 ${
                  i === currentSlide ? "bg-white w-3" : "bg-white/40"
                }`} 
              />
            ))}
          </div>
        )}
        
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-2.5 py-1 rounded-full text-white text-[11px] font-medium tracking-wide shadow-sm z-20">
            {images.length} รูป (ปัดซ้ายขวา)
          </div>
        )}

        <Link
          href="/"
          className="absolute top-4 left-4 size-10 rounded-full bg-surface/90 backdrop-blur flex items-center justify-center shadow-[var(--shadow-card)] transition hover:scale-105 z-20"
          aria-label="ย้อนกลับ"
        >
          <ArrowLeft className="size-5 text-foreground" />
        </Link>
        <button
          className="absolute top-4 right-4 size-10 rounded-full bg-surface/90 backdrop-blur flex items-center justify-center shadow-[var(--shadow-card)] transition hover:scale-105 z-20"
          aria-label="รายงานโพสต์"
        >
          <Flag className="size-5 text-foreground" />
        </button>
      </div>

      <div className="px-4 pt-5 space-y-5">
        <div>
          <div className="flex flex-wrap gap-1.5">
            <TypeBadge type={post.type} />
            <StatusBadge status={post.status} />
            <span className="chip">
              {CATEGORY_EMOJI[post.category as keyof typeof CATEGORY_EMOJI]} {CATEGORY_LABEL[post.category as keyof typeof CATEGORY_LABEL]}
            </span>
          </div>
          <h1 className="mt-2 text-[22px] font-bold leading-snug text-foreground">
            {post.title}
          </h1>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            โพสต์เมื่อ {relativeTime(post.created_at)}
          </p>
        </div>

        <div className="rounded-2xl bg-surface border border-border p-4 space-y-3">
          <Row icon={<MapPin className="size-4" />} label="สถานที่" value={post.location || "ไม่ระบุ"} />
          {post.lat && post.lng && (
            <div className="pt-1 pb-1">
              <MapPicker location={{ lat: post.lat, lng: post.lng }} readonly />
            </div>
          )}
          <Row
            icon={<Calendar className="size-4" />}
            label={post.type === "lost" ? "เวลาที่หาย" : "เวลาที่พบ"}
            value={happened}
          />
          {post.distanceKm > 0 && (
            <Row
              icon={<ShieldCheck className="size-4" />}
              label="ระยะห่าง"
              value={`ห่างจากคุณ ${post.distanceKm.toFixed(1)} กม.`}
            />
          )}
        </div>

        {/* Owner Management Panel */}
        {currentUser && currentUser.id === post.user_id && (
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                จัดการประกาศของคุณ
              </h2>
              <Link 
                href={`/post/${post.id}/edit`}
                className="text-[12.5px] font-medium text-primary px-3 py-1.5 bg-primary/10 rounded-lg hover:bg-primary/20 transition"
              >
                แก้ไขข้อความ
              </Link>
            </div>
            <div className="space-y-3">
              <p className="text-[13px] text-muted-foreground">เปลี่ยนสถานะของประกาศ:</p>
              <div className="flex gap-2">
                {(["searching", "arranging", "closed"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`flex-1 py-2 rounded-xl text-[12.5px] font-medium transition active:scale-95 ${
                      post.status === s 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "bg-surface border border-border text-foreground hover:border-primary/50"
                    }`}
                  >
                    {s === "searching" ? "กำลังตามหา" : s === "arranging" ? "นัดรับ" : "ปิดเคส"}
                  </button>
                ))}
              </div>
              <div className="pt-2">
                <button
                  onClick={handleDeletePost}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 transition active:scale-95"
                >
                  <Trash2 className="size-4" />
                  ลบประกาศนี้
                </button>
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="font-semibold mb-2 text-foreground">รายละเอียด</h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed whitespace-pre-line">
            {post.description}
          </p>
        </section>

        {post.marks && (
          <section>
            <h2 className="font-semibold mb-2 text-foreground">ตำหนิ / จุดสังเกต</h2>
            <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-[14px] text-foreground/90 leading-relaxed">
              {post.marks}
            </div>
          </section>
        )}

        <section className="flex items-center gap-3 rounded-2xl bg-surface border border-border p-4">
          <div className="size-11 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center">
            {posterInitials}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[14px] flex items-center gap-1 text-foreground">
              {posterName}
            </p>
            <p className="text-[12px] text-muted-foreground">
              เข้าร่วมเมื่อเร็วๆ นี้
            </p>
          </div>
          <Link href="/profile"
            className="text-[12.5px] font-medium text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full"
          >
            ดูโปรไฟล์
          </Link>
        </section>

        <section>
          <h2 className="font-semibold mb-2 text-foreground">
            พื้นที่ยืนยันข้อมูล ({comments.length})
          </h2>
          <div className="rounded-xl bg-primary-soft/50 border border-primary/15 p-3 text-[12.5px] text-foreground/80 flex gap-2 mb-4">
            <Lock className="size-4 shrink-0 mt-0.5 text-primary" />
            ระบบจะปกปิดข้อมูลติดต่อส่วนตัวจนกว่าทั้งสองฝ่ายจะตกลงนัดรับ
            กรุณาถามรายละเอียดเฉพาะที่เจ้าของเท่านั้นที่ตอบได้
          </div>
          
          {comments.length === 0 ? (
            <div className="text-center text-[12.5px] text-muted-foreground py-6">
              ยังไม่มีคนคอมเมนต์ มาเริ่มเป็นคนแรกกัน
            </div>
          ) : (
            <ul className="space-y-4">
              {comments.map((comment) => {
                const isOwner = comment.user_id === post.user_id;
                const authorName = comment.author?.display_name || "ผู้ใช้งาน";
                const initial = authorName.charAt(0).toUpperCase();
                
                return (
                  <li key={comment.id} className="flex gap-3">
                    <div className="size-8 shrink-0 rounded-full bg-muted text-muted-foreground text-[12px] font-bold flex items-center justify-center">
                      {initial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-foreground">
                          {authorName}
                        </span>
                        {isOwner && (
                          <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            เจ้าของโพสต์
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {relativeTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-[13.5px] text-foreground/90 mt-0.5 leading-relaxed">
                        {comment.message}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="sticky bottom-0 mt-6 bg-background/95 backdrop-blur border-t border-border p-3">
        <form
          onSubmit={handleCommentSubmit}
          className="flex items-center gap-2"
        >
          <div className="size-8 shrink-0 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center">
            {currentUserInitials || <UserIcon className="size-4" />}
          </div>
          <input
            type="text"
            placeholder="พิมพ์คำถามยืนยันตำหนิ..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-full bg-surface border border-border text-[13.5px] focus:outline-none focus:border-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="size-10 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition disabled:opacity-50 disabled:active:scale-100"
            aria-label="ส่งข้อความ"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>

      {/* Fullscreen Image Viewer / Lightbox */}
      {fullscreenImageIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-200">
          <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10">
            <span className="text-white/80 text-[13px] font-medium tracking-wide bg-black/40 px-3 py-1 rounded-full backdrop-blur">
              {fullscreenImageIndex + 1} / {images.length}
            </span>
            <button
              onClick={() => setFullscreenImageIndex(null)}
              className="size-10 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-95 transition backdrop-blur"
              aria-label="ปิด"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative px-2 pb-12">
            <img 
              src={images[fullscreenImageIndex]} 
              alt="Fullscreen" 
              className="w-full h-full object-contain" 
            />
            
            {/* Prev/Next invisible tap areas for easy navigation */}
            {fullscreenImageIndex > 0 && (
              <button 
                className="absolute left-0 inset-y-0 w-1/3 outline-none"
                onClick={() => setFullscreenImageIndex(fullscreenImageIndex - 1)}
                aria-label="รูปก่อนหน้า"
              />
            )}
            {fullscreenImageIndex < images.length - 1 && (
              <button 
                className="absolute right-0 inset-y-0 w-1/3 outline-none"
                onClick={() => setFullscreenImageIndex(fullscreenImageIndex + 1)}
                aria-label="รูปถัดไป"
              />
            )}
            
            {/* Fullscreen dots indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 pointer-events-none">
                {images.map((_: any, i: number) => (
                  <div 
                    key={i} 
                    className={`size-2 rounded-full transition-all duration-300 ${
                      i === fullscreenImageIndex ? "bg-white w-4" : "bg-white/30"
                    }`} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
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
