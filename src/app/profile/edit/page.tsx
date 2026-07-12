"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, User as UserIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);
      
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.display_name || user.user_metadata?.full_name || "");
        setAvatarUrl(profileData.avatar_url || "");
        setPreview(profileData.avatar_url || "");
      }
      setLoading(false);
    }
    loadProfile();
  }, [router, supabase]);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      alert("กรุณากรอกชื่อแสดงผล");
      return;
    }
    
    setIsSubmitting(true);
    try {
      let finalAvatarUrl = avatarUrl;
      
      // Upload new avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/avatar_${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from("post_images") // Reusing same bucket for simplicity, ideal: 'avatars' bucket
          .upload(filePath, avatarFile);
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from("post_images")
          .getPublicUrl(filePath);
          
        finalAvatarUrl = publicUrlData.publicUrl;
      }
      
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: displayName.trim(),
        avatar_url: finalAvatarUrl
      });
      
      if (error) throw error;
      
      alert("อัปเดตโปรไฟล์เรียบร้อยแล้ว!");
      router.push("/profile");
      
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
          href="/profile"
          className="size-9 rounded-full bg-surface border border-border flex items-center justify-center transition hover:scale-105"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-[17px] font-semibold flex-1">แก้ไขโปรไฟล์</h1>
      </header>
      
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="size-28 rounded-full bg-muted flex items-center justify-center text-4xl font-bold overflow-hidden border-2 border-surface shadow-sm">
              {preview ? (
                <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="size-12 text-muted-foreground" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 size-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition"
            >
              <Camera className="size-4" />
            </button>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImagePick} 
              className="hidden" 
            />
          </div>
          <p className="text-[12px] text-muted-foreground mt-3">แนะนำรูปขนาด 1:1 (สี่เหลี่ยมจัตุรัส)</p>
        </div>
        
        <section>
          <label className="text-[13px] font-semibold text-foreground">ชื่อที่ใช้แสดง (Display Name)</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="ตั้งชื่อของคุณ..."
            required
            className="mt-2 w-full px-4 py-3 rounded-xl bg-surface border border-border text-[14px] focus:outline-none focus:border-primary transition"
          />
        </section>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[var(--shadow-pop)] active:scale-[0.98] transition disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
          >
            {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </div>
      </form>
    </AppShell>
  );
}
