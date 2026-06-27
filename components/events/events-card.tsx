import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { events } from "@/lib/market-data";
import { Calendar, Briefcase, TrendingUp, Building2, Landmark, LineChart, FileText, Activity } from "lucide-react";

const getEventStyle = (label: string) => {
  if (label.includes("งบ")) return { icon: <FileText className="h-4 w-4 text-emerald-400" />, bg: "bg-emerald-500/10", border: "border-emerald-500/20", hover: "hover:bg-emerald-500/20", glow: "group-hover:shadow-[0_0_15px_rgba(52,211,153,0.15)]" };
  if (label.includes("ปันผล")) return { icon: <TrendingUp className="h-4 w-4 text-indigo-400" />, bg: "bg-indigo-500/10", border: "border-indigo-500/20", hover: "hover:bg-indigo-500/20", glow: "group-hover:shadow-[0_0_15px_rgba(129,140,248,0.15)]" };
  if (label.includes("ISM")) return { icon: <Activity className="h-4 w-4 text-blue-400" />, bg: "bg-blue-500/10", border: "border-blue-500/20", hover: "hover:bg-blue-500/20", glow: "group-hover:shadow-[0_0_15px_rgba(96,165,250,0.15)]" };
  if (label.includes("Fed") || label.includes("FOMC")) return { icon: <Landmark className="h-4 w-4 text-rose-400" />, bg: "bg-rose-500/10", border: "border-rose-500/20", hover: "hover:bg-rose-500/20", glow: "group-hover:shadow-[0_0_15px_rgba(251,113,133,0.15)]" };
  if (label.includes("CPI") || label.includes("PPI")) return { icon: <LineChart className="h-4 w-4 text-amber-400" />, bg: "bg-amber-500/10", border: "border-amber-500/20", hover: "hover:bg-amber-500/20", glow: "group-hover:shadow-[0_0_15px_rgba(251,191,36,0.15)]" };
  if (label.includes("จ้างงาน")) return { icon: <Briefcase className="h-4 w-4 text-cyan-400" />, bg: "bg-cyan-500/10", border: "border-cyan-500/20", hover: "hover:bg-cyan-500/20", glow: "group-hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]" };
  if (label.includes("IPO")) return { icon: <Building2 className="h-4 w-4 text-fuchsia-400" />, bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20", hover: "hover:bg-fuchsia-500/20", glow: "group-hover:shadow-[0_0_15px_rgba(232,121,249,0.15)]" };
  return { icon: <Calendar className="h-4 w-4 text-zinc-400" />, bg: "bg-white/[0.03]", border: "border-white/[0.06]", hover: "hover:bg-white/[0.06]", glow: "group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]" };
};

export function EventsCard() {
  return (
    <Card className="border-t-[3px] border-t-blue-500 overflow-hidden">
      <CardHeader className="bg-white/[0.02] pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          อีเวนต์ที่กำลังจะมา
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {events.map(([label, value]) => {
            const style = getEventStyle(label);
            return (
              <div 
                key={label} 
                className={`group relative flex flex-col justify-center rounded-2xl border ${style.border} ${style.bg} p-4 transition-all duration-300 ${style.hover} cursor-pointer ${style.glow}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm">
                    {style.icon}
                  </div>
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{label}</div>
                </div>
                <div className="text-sm font-medium text-zinc-100 leading-snug">{value}</div>
                
                {/* Subtle shine effect on hover */}
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-tr from-white/[0.01] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
