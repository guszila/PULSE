"use client";

import { useState, type FormEvent, type MouseEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

function calculatePasswordStrength(pass: string) {
  if (!pass) return 0;
  let score = 0;
  if (pass.length > 5) score += 1;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  return score;
}

export function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("เข้าสู่ระบบเพื่อใช้งาน AlphaEdge");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const strength = calculatePasswordStrength(password);
  const strengthColors = ["bg-zinc-800", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];
  const strengthWidths = ["w-0", "w-1/4", "w-2/4", "w-3/4", "w-full"];
  const strengthLabels = ["", "อ่อน", "ปานกลาง", "ดี", "ดีมาก"];

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsError(false);
    if (!email || !password) {
      setIsError(true);
      setMessage("กรุณาใส่อีเมลและรหัสผ่าน");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setBusy(false);
    
    if (error) {
      setIsError(true);
      setMessage(error.message);
    } else {
      setIsError(false);
      router.push("/");
      router.refresh();
    }
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsError(false);
    if (!email || !password || !confirmPassword) {
      setIsError(true);
      setMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    setBusy(false);
    
    if (error) {
       setIsError(true);
       setMessage(error.message);
    } else {
       setIsError(false);
       if (data.session?.access_token) {
          router.push("/");
          router.refresh();
       } else {
          setMessage("สมัครสมาชิกสำเร็จ กรุณาเช็คอีเมลเพื่อยืนยัน หรือเข้าสู่ระบบได้เลย");
       }
    }
  }

  return (
    <Card className="p-6 sm:p-8 border-white/[0.08] bg-[#0c0d0c]/50 backdrop-blur-xl">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-300/20 bg-teal-300/10 shadow-inset">
          <Sparkles className="h-6 w-6 text-teal-100" />
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-white">AlphaEdge</div>
          <div className="mt-1 text-sm text-zinc-400">แอปช่วยตัดสินใจหุ้นสหรัฐ</div>
        </div>
      </div>

      <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <input
            className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/20"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="อีเมล (you@example.com)"
          />
          <input
            className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/20"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="รหัสผ่าน"
          />
          {!isLogin && (
            <input
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/20"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="ยืนยันรหัสผ่าน"
            />
          )}

          {!isLogin && password && (
            <div className="flex flex-col gap-1.5 mt-1 px-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">ความปลอดภัยรหัสผ่าน</span>
                <span className={`${strengthColors[strength].replace("bg-", "text-")} font-medium`}>
                  {strengthLabels[strength]}
                </span>
              </div>
              <div className="flex h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div 
                   className={`h-full transition-all duration-300 ${strengthColors[strength]} ${strengthWidths[strength]}`} 
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 mt-2">
          <Button type="submit" disabled={busy} className="h-11 w-full text-base">
            {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-400">
        {isLogin ? "ยังไม่มีบัญชีใช่ไหม? " : "มีบัญชีอยู่แล้ว? "}
        <button 
          type="button" 
          onClick={() => {
            setIsLogin(!isLogin);
            setIsError(false);
            setMessage(isLogin ? "สมัครสมาชิกเพื่อเริ่มใช้งาน AlphaEdge" : "เข้าสู่ระบบเพื่อใช้งาน AlphaEdge");
          }} 
          className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
        >
          {isLogin ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
        </button>
      </div>

      {isError ? (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs text-red-400 min-h-4">
          {message}
        </div>
      ) : (
        <p className="mt-4 text-center text-xs text-zinc-500 min-h-4">{message}</p>
      )}
    </Card>
  );
}
