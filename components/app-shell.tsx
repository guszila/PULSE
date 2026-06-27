"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Bot,
  CalendarDays,
  LayoutDashboard,
  LineChart,
  Menu,
  MessageSquare,
  Moon,
  PieChart,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type AlphaEdgeTheme = "dark" | "light";

const THEME_STORAGE_KEY = "alphaedge-theme";

const navItems = [
  { label: "สรุปวันนี้", icon: Target, href: "/" },
  { label: "กราฟ", icon: Activity, href: "/stock" },
  { label: "พอร์ต", icon: PieChart, href: "/portfolio" },
  { label: "หุ้นที่ดู", icon: LineChart, href: "/watchlist" },
  { label: "ตลาด", icon: LayoutDashboard, href: "/markets" },
  { label: "เหตุการณ์", icon: CalendarDays, href: "/events" },
  { label: "ตั้งค่า", icon: Settings, href: "/settings" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [theme, setTheme] = useState<AlphaEdgeTheme>("dark");
  const [themeReady, setThemeReady] = useState(false);
  const pathname = usePathname();

  const isLightTheme = theme === "light";

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    document.documentElement.classList.toggle("light", isLightTheme);
    document.documentElement.classList.toggle("dark", !isLightTheme);
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [isLightTheme, theme, themeReady]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  return (
    <div className={`min-h-screen text-zinc-100 ${isLightTheme ? "theme-light" : "theme-dark"}`}>
      <div className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.08] bg-[#070807]/92 backdrop-blur-2xl lg:hidden">
        <div className="flex h-14 items-center justify-between px-3">
          <Brand />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme} aria-label="Toggle theme">
              {isLightTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setAssistantOpen(true)} aria-label="Open AI sidebar">
              <Bot className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-white/[0.08] bg-[#080908]/90 p-4 backdrop-blur-2xl lg:block">
        <Brand />
        <nav className="mt-10 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition hover:bg-white/[0.06] hover:text-zinc-50 ${
                pathname === item.href ? "bg-white/[0.07] text-zinc-50" : "text-zinc-400"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-amber-300/15 bg-amber-300/[0.06] p-3">
          <div className="flex items-center gap-2 text-xs text-amber-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            ดูความเสี่ยงก่อนตัดสินใจ
          </div>
          <p className="mt-2 text-xs leading-5 text-zinc-400">ข้อมูลนี้ช่วยวิเคราะห์ ไม่ใช่คำสั่งให้ซื้อขาย</p>
        </div>
      </aside>

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="h-full w-[82vw] max-w-[340px] border-r border-white/[0.08] bg-[#080908] p-4"
              initial={{ x: -360 }}
              animate={{ x: 0 }}
              exit={{ x: -360 }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
            >
              <div className="flex items-center justify-between">
                <Brand />
                <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="mt-8 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm hover:bg-white/[0.06] ${
                      pathname === item.href ? "bg-white/[0.07] text-zinc-50" : "text-zinc-300"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="px-3 pb-36 pt-16 sm:px-6 lg:ml-[264px] lg:px-8 lg:pb-28 lg:pt-6">
        {children}
      </section>

      <MobileBottomNav pathname={pathname} />

      <Button
        onClick={() => setAssistantOpen(true)}
        className="fixed bottom-24 right-4 z-40 h-12 w-12 rounded-full shadow-glass sm:bottom-5 sm:right-5"
        size="icon"
        aria-label="Open AI assistant"
      >
        <Bot className="h-5 w-5" />
      </Button>

      <AssistantSidebar open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-teal-300/20 bg-teal-300/10 shadow-inset">
        <Sparkles className="h-4 w-4 text-teal-100" />
      </div>
      <div>
        <div className="text-sm font-semibold text-white">AlphaEdge</div>
        <div className="text-[11px] text-zinc-500">แอปช่วยตัดสินใจหุ้นสหรัฐ</div>
      </div>
    </div>
  );
}

function MobileBottomNav({ pathname }: { pathname: string }) {
  const mobileItems = navItems.slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#070807]/95 px-1.5 pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-1.5 backdrop-blur-2xl lg:hidden">
      <div className="mx-auto grid max-w-[390px] grid-cols-5 gap-0.5">
        {mobileItems.map((item) => {
          const isPortfolio = item.href === "/portfolio";
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex h-[46px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[9px] font-medium leading-none transition ${
                isPortfolio
                  ? "bg-teal-500/15 text-teal-300 border border-teal-500/20"
                  : pathname === item.href
                  ? "bg-white/[0.07] text-zinc-100"
                  : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-100"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function AssistantSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          className="fixed inset-y-0 right-0 z-50 w-full border-l border-white/[0.08] bg-[#080908]/95 p-4 shadow-glass backdrop-blur-2xl sm:w-[420px]"
          initial={{ x: 460 }}
          animate={{ x: 0 }}
          exit={{ x: 460 }}
          transition={{ type: "spring", damping: 32, stiffness: 260 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06]">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">AlphaEdge AI</div>
                <div className="text-xs text-zinc-500">ถามเกี่ยวกับหุ้นสหรัฐ</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close assistant">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-6 space-y-3">
            {[
              "AAPL ใกล้แนวรับหรือแนวต้านแค่ไหน?",
              "เปรียบเทียบความแข็งแรงของ NVDA กับ MSFT",
              "หาหุ้นที่ใกล้ breakout",
              "สรุปความเสี่ยงของพอร์ตวันนี้"
            ].map((prompt) => (
              <button
                key={prompt}
                className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.07]"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-2 pl-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-zinc-500" />
                <input
                  className="h-10 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                  placeholder="ถามเรื่องจุดเข้า ความเสี่ยง แนวรับ..."
                />
                <Button size="sm">ถาม</Button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
