"use client";

import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import { MarketApiStatusCard } from "@/components/settings/market-api-status-card";
import { ThemeModeCard } from "@/components/settings/theme-mode-card";
import { SupabaseStatusCard, type SupabaseStatus } from "@/components/settings/supabase-status-card";
import { SupabaseAuthCard } from "@/components/settings/supabase-auth-card";
import { SectionTitle } from "@/components/shared/section-title";
import type { AlphaEdgeDashboardData } from "@/lib/market-data";
import type { User } from "@supabase/supabase-js";
import { Moon, Wallet, Gauge, KeyRound, Bell, LayoutDashboard } from "lucide-react";
import { Card } from "@/components/ui/card";

export function SettingsClient({ data }: { data: AlphaEdgeDashboardData }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("เข้าสู่ระบบเพื่อบันทึกรายชื่อหุ้นที่ติดตามไว้ใช้ทุกวัน");
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("alphaedge-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }

    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.access_token) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax`;
      } else {
        document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    });

    fetch("/api/supabase/status")
      .then((response) => (response.ok ? response.json() : null))
      .then((statusData) => {
        if (statusData) setSupabaseStatus(statusData);
      })
      .catch(() => {
        setSupabaseStatus({ connected: false, message: "ไม่สามารถเช็คสถานะ Supabase ได้" });
      });

    return () => subscription.unsubscribe();
  }, []);

  function toggleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    window.localStorage.setItem("alphaedge-theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    document.documentElement.dataset.theme = newTheme;
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement> | React.MouseEvent) {
    if (event && 'preventDefault' in event) event.preventDefault();
    const email = authEmail.trim();
    const password = authPassword;
    if (!email || !password) {
      setAuthMessage("กรุณาใส่อีเมลและรหัสผ่าน");
      return;
    }
    setAuthBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setAuthBusy(false);
    setAuthMessage(error ? error.message : "เข้าสู่ระบบสำเร็จ");
  }

  async function handleSignUp(event: React.MouseEvent) {
    if (event && 'preventDefault' in event) event.preventDefault();
    const email = authEmail.trim();
    const password = authPassword;
    if (!email || !password) {
      setAuthMessage("กรุณาใส่อีเมลและรหัสผ่าน");
      return;
    }
    setAuthBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password
    });
    setAuthBusy(false);
    setAuthMessage(error ? error.message : "สมัครสมาชิกสำเร็จ กรุณาเช็คอีเมลเพื่อยืนยัน หรือเข้าสู่ระบบได้เลย (ขึ้นอยู่กับการตั้งค่า)");
  }

  async function handleSignOut() {
    setAuthBusy(true);
    await supabase.auth.signOut();
    document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    window.location.href = "/login";
  }

  async function handleSyncDefaultWatchlist() {
    if (!user) {
      setAuthMessage("กรุณาเข้าสู่ระบบก่อนบันทึกหุ้นที่ติดตาม");
      return;
    }
    setAuthBusy(true);
    const { error } = await supabase.from("watchlists").upsert(
      data.watchlist.map((stock) => ({
        user_id: user.id,
        symbol: stock.symbol,
        company: stock.company
      })),
      { onConflict: "user_id,symbol" }
    );
    setAuthBusy(false);
    if (error) {
      setAuthMessage(error.message);
      return;
    }
    setAuthMessage("บันทึกรายชื่อหุ้นที่ติดตามแล้ว");
  }

  const settingItems = [
    { label: "ธีม", value: "โหมดมืด อ่านง่ายบนมือถือ", icon: Moon },
    { label: "สกุลเงิน", value: "ดอลลาร์สหรัฐ USD", icon: Wallet },
    { label: "เวลาตลาด", value: "อ้างอิงตลาดนิวยอร์ก", icon: Gauge },
    { label: "API", value: "แหล่งข้อมูลราคาหุ้นและข่าว", icon: KeyRound },
    { label: "แจ้งเตือน", value: "ราคา แนวรับ แนวต้าน และงบ", icon: Bell },
    { label: "รูปแบบหน้า", value: "ออกแบบสำหรับเปิดดูทุกวัน", icon: LayoutDashboard }
  ];

  return (
    <section id="settings" className="mt-8">
      <SectionTitle eyebrow="ตั้งค่า" title="ข้อมูลและการใช้งาน" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <ThemeModeCard theme={theme} onToggle={toggleTheme} />
        {settingItems.slice(1).map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4">
            <Icon className="h-4 w-4 text-zinc-500" />
            <div className="mt-4 text-sm font-medium text-zinc-100">{label}</div>
            <p className="mt-1 text-xs leading-5 text-zinc-500">{value}</p>
          </Card>
        ))}
      </div>
      <SupabaseStatusCard status={supabaseStatus} />
      <MarketApiStatusCard data={data} />
      <SupabaseAuthCard
        user={user}
        email={authEmail}
        password={authPassword}
        message={authMessage}
        busy={authBusy}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onSignOut={handleSignOut}
        onSyncWatchlist={handleSyncDefaultWatchlist}
      />
    </section>
  );
}
