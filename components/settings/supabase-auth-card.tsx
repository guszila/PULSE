import type { FormEvent, MouseEvent } from "react";
import { Mail, UploadCloud, LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SupabaseAuthCard({
  user,
  email,
  password,
  message,
  busy,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onSignUp,
  onSignOut,
  onSyncWatchlist
}: {
  user: User | null;
  email: string;
  password?: string;
  message: string;
  busy: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSignIn: (event: FormEvent<HTMLFormElement> | MouseEvent) => void;
  onSignUp: (event: MouseEvent) => void;
  onSignOut: () => void;
  onSyncWatchlist: () => void;
}) {
  return (
    <Card className="mt-3 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06]">
            <Mail className="h-5 w-5 text-zinc-300" />
          </div>
          <div>
            <div className="text-sm font-medium text-zinc-100">บัญชีผู้ใช้</div>
            <p className="mt-1 text-xs text-zinc-500">
              {user?.email ?? "เข้าสู่ระบบด้วยอีเมลและรหัสผ่านเพื่อเปิดพื้นที่บันทึกส่วนตัว"}
            </p>
          </div>
        </div>
        {user ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onSyncWatchlist} disabled={busy}>
              <UploadCloud className="h-4 w-4" />
              บันทึกหุ้นที่ติดตาม
            </Button>
            <Button variant="ghost" size="sm" onClick={onSignOut} disabled={busy}>
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>
        ) : (
          <form onSubmit={onSignIn} className="flex w-full flex-col gap-2 sm:w-auto">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="h-10 min-w-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20 sm:w-[200px]"
                type="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="you@example.com"
              />
              <input
                className="h-10 min-w-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20 sm:w-[200px]"
                type="password"
                value={password || ""}
                onChange={(event) => onPasswordChange?.(event.target.value)}
                placeholder="รหัสผ่าน"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={busy} className="flex-1 sm:flex-none">
                เข้าสู่ระบบ
              </Button>
              <Button type="button" variant="secondary" disabled={busy} onClick={onSignUp} className="flex-1 sm:flex-none">
                สมัครสมาชิก
              </Button>
            </div>
          </form>
        )}
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-500">{message}</p>
    </Card>
  );
}
