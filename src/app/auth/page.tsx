"use client";

import Link from "next/link";
import { ShieldCheck, Search, Handshake } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [mode, setMode] = useState<"login" | "signup">("login");
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [lineId, setLineId] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        router.push("/");
        router.refresh();
      } else {
        // Signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: fullName,
              phone: phone,
              line_id: lineId || null,
            }
          }
        });
        if (error) throw error;
        
        if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          setMode("login");
          setSuccessMsg("สมัครสมาชิกสำเร็จ! กรุณาเช็กอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ");
          // Clear password for safety
          setPassword("");
        }
      }
    } catch (err: any) {
      if (err.message?.includes("already registered")) {
        setErrorMsg("อีเมลนี้ถูกลงทะเบียนไปแล้ว กรุณาเข้าสู่ระบบ");
      } else if (err.message?.includes("Invalid login credentials")) {
        setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        setErrorMsg(err.message || "เกิดข้อผิดพลาด โปรดลองอีกครั้ง");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-soft via-background to-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px]">
        <div className="text-center">
          <div className="inline-flex size-14 rounded-2xl bg-primary text-primary-foreground items-center justify-center shadow-[var(--shadow-pop)] mb-4 text-2xl">
            🤝
          </div>
          <h1 className="text-[24px] font-bold leading-tight">
            ตามหาของที่หาย<br />
            <span className="text-primary">ส่งคืนของที่พบ</span>
          </h1>
        </div>

        <div className="mt-6 bg-surface p-6 rounded-3xl border border-border shadow-[var(--shadow-card)]">
          {/* Tabs */}
          <div className="flex bg-muted p-1 rounded-xl mb-6">
            <button
              onClick={() => { setMode("login"); setErrorMsg(""); }}
              className={`flex-1 py-2 text-[14px] font-semibold rounded-lg transition ${
                mode === "login" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => { setMode("signup"); setErrorMsg(""); }}
              className={`flex-1 py-2 text-[14px] font-semibold rounded-lg transition ${
                mode === "signup" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-destructive/10 text-destructive text-[13px] rounded-xl font-medium">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-primary/10 text-primary text-[13px] rounded-xl font-medium">
                {successMsg}
              </div>
            )}
            
            {mode === "signup" && (
              <>
                <div>
                  <label className="text-[13px] font-semibold text-foreground">ชื่อ-นามสกุล <span className="text-destructive">*</span></label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ชื่อที่ใช้แสดงในระบบ"
                    className="mt-1.5 w-full px-4 py-3 rounded-xl bg-background border border-border text-[14px] focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-foreground">เบอร์โทรศัพท์ <span className="text-muted-foreground font-normal">(ไม่บังคับ)</span></label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="ตัวอย่าง: 0812345678"
                    className="mt-1.5 w-full px-4 py-3 rounded-xl bg-background border border-border text-[14px] focus:outline-none focus:border-primary"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-[13px] font-semibold text-foreground">อีเมล <span className="text-destructive">*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="อีเมลของคุณ"
                className="mt-1.5 w-full px-4 py-3 rounded-xl bg-background border border-border text-[14px] focus:outline-none focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="text-[13px] font-semibold text-foreground">รหัสผ่าน <span className="text-destructive">*</span></label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                className="mt-1.5 w-full px-4 py-3 rounded-xl bg-background border border-border text-[14px] focus:outline-none focus:border-primary"
                required
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="text-[13px] font-semibold text-foreground">Line ID <span className="text-muted-foreground font-normal">(ไม่บังคับ)</span></label>
                <input
                  type="text"
                  value={lineId}
                  onChange={(e) => setLineId(e.target.value)}
                  placeholder="กรอกไอดีไลน์ถ้าต้องการให้ติดต่อทางไลน์"
                  className="mt-1.5 w-full px-4 py-3 rounded-xl bg-background border border-border text-[14px] focus:outline-none focus:border-primary"
                />
              </div>
            )}
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[var(--shadow-pop)] active:scale-[0.98] transition disabled:opacity-70"
              >
                {loading ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิกเลย"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
