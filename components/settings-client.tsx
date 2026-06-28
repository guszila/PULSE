"use client";

import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import { MarketApiStatusCard } from "@/components/settings/market-api-status-card";
import { SupabaseStatusCard } from "@/components/settings/supabase-status-card";
import { SupabaseAuthCard } from "@/components/settings/supabase-auth-card";
import { SectionTitle } from "@/components/shared/section-title";
import type { AlphaEdgeDashboardData } from "@/lib/market-data";
import type { User } from "@supabase/supabase-js";
import { Moon, Sun, Wallet, Gauge, KeyRound, Bell, LayoutDashboard } from "lucide-react";
import { Card } from "@/components/ui/card";

export function SettingsClient({ data }: { data: AlphaEdgeDashboardData }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [currency, setCurrency] = useState("USD");
  const [marketTime, setMarketTime] = useState("NY");
  const [layoutMode, setLayoutMode] = useState("DETAILED");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [customFinnhubKey, setCustomFinnhubKey] = useState("");
  
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("เข้าสู่ระบบเพื่อบันทึกรายชื่อหุ้นที่ติดตามไว้ใช้ทุกวัน");
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    // Load preferences
    const savedTheme = window.localStorage.getItem("alphaedge-theme") as "dark" | "light";
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    
    const savedCurrency = window.localStorage.getItem("alphaedge-currency");
    if (savedCurrency) setCurrency(savedCurrency);
    
    const savedMarketTime = window.localStorage.getItem("alphaedge-markettime");
    if (savedMarketTime) setMarketTime(savedMarketTime);
    
    const savedLayoutMode = window.localStorage.getItem("alphaedge-layoutmode");
    if (savedLayoutMode) setLayoutMode(savedLayoutMode);
    
    const savedNotifications = window.localStorage.getItem("alphaedge-notifications");
    if (savedNotifications !== null) setNotificationsEnabled(savedNotifications === "true");
    
    const savedApiKey = window.localStorage.getItem("alphaedge-finnhub-key");
    if (savedApiKey) setCustomFinnhubKey(savedApiKey);

    // Auth & Status
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
  
  function handleCurrencyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setCurrency(val);
    window.localStorage.setItem("alphaedge-currency", val);
  }
  
  function handleMarketTimeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setMarketTime(val);
    window.localStorage.setItem("alphaedge-markettime", val);
  }
  
  function handleLayoutModeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setLayoutMode(val);
    window.localStorage.setItem("alphaedge-layoutmode", val);
  }

  function handleNotificationsToggle() {
    const nextState = !notificationsEnabled;
    setNotificationsEnabled(nextState);
    window.localStorage.setItem("alphaedge-notifications", String(nextState));
  }

  function handleCustomApiKeyChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setCustomFinnhubKey(val);
    window.localStorage.setItem("alphaedge-finnhub-key", val);
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
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
    const { error } = await supabase.auth.signUp({ email, password });
    setAuthBusy(false);
    setAuthMessage(error ? error.message : "สมัครสมาชิกสำเร็จ กรุณาเช็คอีเมลเพื่อยืนยัน หรือเข้าสู่ระบบได้เลย (ขึ้นอยู่กับการตั้งค่า)");
  }

  async function handleSignOut() {
    setAuthBusy(true);
    await supabase.auth.signOut();
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

  return (
    <section id="settings" className="mt-8 mb-20 max-w-4xl">
      <SectionTitle eyebrow="ตั้งค่า" title="ปรับแต่งแอปพลิเคชัน" />
      
      <div className="flex flex-col gap-6 mt-6">
        
        {/* Appearance Group */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 ml-1 uppercase tracking-wider">การแสดงผล</h3>
          <Card className="flex flex-col divide-y divide-white/[0.04]">
            
            {/* Theme */}
            <div className="flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.04]">
                   {theme === "dark" ? <Moon className="h-4 w-4 text-emerald-400" /> : <Sun className="h-4 w-4 text-emerald-400" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-100">โหมดหน้าจอ</div>
                  <div className="text-xs text-zinc-500">ปรับเปลี่ยนธีมการแสดงผล</div>
                </div>
              </div>
              <button onClick={toggleTheme} className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#070807] data-[state=checked]:bg-emerald-500" data-state={theme === "dark" ? "checked" : "unchecked"}>
                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Layout Mode */}
            <div className="flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.04]">
                   <LayoutDashboard className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-100">รูปแบบหน้า</div>
                  <div className="text-xs text-zinc-500">ความละเอียดของข้อมูล</div>
                </div>
              </div>
              <select value={layoutMode} onChange={handleLayoutModeChange} className="h-8 rounded-md border border-white/[0.08] bg-zinc-900 px-3 py-0 text-xs text-zinc-300 outline-none focus:border-emerald-500/50 cursor-pointer">
                <option value="DETAILED">ละเอียด (Detailed)</option>
                <option value="COMPACT">ย่อ (Compact)</option>
              </select>
            </div>

          </Card>
        </div>

        {/* Preferences Group */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 ml-1 uppercase tracking-wider">การตั้งค่าทั่วไป</h3>
          <Card className="flex flex-col divide-y divide-white/[0.04]">
            
            {/* Currency */}
            <div className="flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.04]">
                   <Wallet className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-100">สกุลเงินเริ่มต้น</div>
                  <div className="text-xs text-zinc-500">แสดงมูลค่าพอร์ตเป็นสกุลเงินใด</div>
                </div>
              </div>
              <select value={currency} onChange={handleCurrencyChange} className="h-8 rounded-md border border-white/[0.08] bg-zinc-900 px-3 py-0 text-xs text-zinc-300 outline-none focus:border-emerald-500/50 cursor-pointer">
                <option value="USD">USD (ดอลลาร์)</option>
                <option value="THB">THB (บาท)</option>
              </select>
            </div>

            {/* Market Time */}
            <div className="flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.04]">
                   <Gauge className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-100">เวลาตลาด</div>
                  <div className="text-xs text-zinc-500">โซนเวลาที่ใช้แสดงในกราฟ</div>
                </div>
              </div>
              <select value={marketTime} onChange={handleMarketTimeChange} className="h-8 rounded-md border border-white/[0.08] bg-zinc-900 px-3 py-0 text-xs text-zinc-300 outline-none focus:border-emerald-500/50 cursor-pointer">
                <option value="NY">นิวยอร์ก (EST)</option>
                <option value="LOCAL">เวลาท้องถิ่น</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.04]">
                   <Bell className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-100">การแจ้งเตือน</div>
                  <div className="text-xs text-zinc-500">รับการแจ้งเตือนราคาและข่าว</div>
                </div>
              </div>
              <button onClick={handleNotificationsToggle} className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#070807] data-[state=checked]:bg-emerald-500" data-state={notificationsEnabled ? "checked" : "unchecked"}>
                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            
          </Card>
        </div>

        {/* API Settings Group */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 ml-1 uppercase tracking-wider">ขั้นสูง (API)</h3>
          <Card className="flex flex-col p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.04]">
                  <KeyRound className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-100">Finnhub API Key ส่วนตัว</div>
                <div className="text-xs text-zinc-500 mt-1 leading-relaxed">หากคุณพบปัญหาโหลดข้อมูลช้า หรือติด Rate Limit ของเว็บ คุณสามารถใช้ API Key ของคุณเองจาก Finnhub ได้ฟรี</div>
              </div>
            </div>
            <input 
              type="password" 
              placeholder="กรอก API Key..." 
              value={customFinnhubKey}
              onChange={handleCustomApiKeyChange}
              className="h-10 w-full rounded-md border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50 transition-colors"
            />
            <div className="mt-3 text-[11px] text-zinc-500/80 leading-relaxed bg-zinc-900/50 p-2.5 rounded-lg border border-white/[0.02]">
              * คีย์ของคุณจะถูกจัดเก็บไว้อย่างปลอดภัยในเบราว์เซอร์นี้เท่านั้น (Local Storage) และจะไม่ถูกส่งไปยังเซิร์ฟเวอร์ของเรา หรือบุคคลที่สามแต่อย่างใด
            </div>
          </Card>
        </div>
        
        {/* Account Group */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 ml-1 uppercase tracking-wider">บัญชีของฉัน</h3>
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
        </div>

        {/* Status Group */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 ml-1 uppercase tracking-wider">สถานะการเชื่อมต่อเซิร์ฟเวอร์</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <SupabaseStatusCard status={supabaseStatus} />
            <MarketApiStatusCard data={data} />
          </div>
        </div>

      </div>
    </section>
  );
}
