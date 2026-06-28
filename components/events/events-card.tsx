import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { events } from "@/lib/market-data";
import { Calendar, Briefcase, TrendingUp, Building2, Landmark, LineChart, FileText, Activity } from "lucide-react";

const getEventStyle = (label: string) => {
  if (label.includes("งบ")) return { icon: <FileText className="h-4 w-4 text-emerald-400" />, bg: "bg-emerald-500/20", border: "border-emerald-500/30", glow: "group-hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]", image: "/images/events/earnings.png" };
  if (label.includes("ปันผล")) return { icon: <TrendingUp className="h-4 w-4 text-indigo-400" />, bg: "bg-indigo-500/20", border: "border-indigo-500/30", glow: "group-hover:shadow-[0_0_20px_rgba(129,140,248,0.2)]", image: "/images/events/dividends.png" };
  if (label.includes("ISM")) return { icon: <Activity className="h-4 w-4 text-blue-400" />, bg: "bg-blue-500/20", border: "border-blue-500/30", glow: "group-hover:shadow-[0_0_20px_rgba(96,165,250,0.2)]", image: "/images/events/macro.png" };
  if (label.includes("Fed") || label.includes("FOMC")) return { icon: <Landmark className="h-4 w-4 text-rose-400" />, bg: "bg-rose-500/20", border: "border-rose-500/30", glow: "group-hover:shadow-[0_0_20px_rgba(251,113,133,0.2)]", image: "/images/events/fed.png" };
  if (label.includes("CPI") || label.includes("PPI")) return { icon: <LineChart className="h-4 w-4 text-amber-400" />, bg: "bg-amber-500/20", border: "border-amber-500/30", glow: "group-hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]", image: "/images/events/macro.png" };
  if (label.includes("จ้างงาน")) return { icon: <Briefcase className="h-4 w-4 text-cyan-400" />, bg: "bg-cyan-500/20", border: "border-cyan-500/30", glow: "group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]", image: "/images/events/macro.png" };
  if (label.includes("IPO")) return { icon: <Building2 className="h-4 w-4 text-fuchsia-400" />, bg: "bg-fuchsia-500/20", border: "border-fuchsia-500/30", glow: "group-hover:shadow-[0_0_20px_rgba(232,121,249,0.2)]", image: "/images/events/earnings.png" };
  return { icon: <Calendar className="h-4 w-4 text-zinc-400" />, bg: "bg-white/[0.05]", border: "border-white/[0.1]", glow: "group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]", image: null };
};

export function EventsCard() {
  return (
    <Card className="border-t-[3px] border-t-blue-500 overflow-hidden shadow-lg">
      <CardHeader className="bg-white/[0.02] pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          อีเวนต์ที่กำลังจะมา
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 pb-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {events.map(([label, value]) => {
            const style = getEventStyle(label);
            return (
              <div 
                key={label} 
                className={`group relative flex flex-col justify-center rounded-2xl border ${style.border} p-4 min-h-[110px] overflow-hidden transition-all duration-500 ${style.glow} cursor-pointer`}
              >
                {/* Background Image Layer */}
                {style.image ? (
                  <>
                    <Image 
                      src={style.image} 
                      alt={label} 
                      fill 
                      unoptimized={true}
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover opacity-[0.25] group-hover:opacity-[0.4] transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070807] via-[#070807]/70 to-transparent"></div>
                    {/* Add a color tint overlay based on the event style */}
                    <div className={`absolute inset-0 ${style.bg} mix-blend-overlay`}></div>
                  </>
                ) : (
                  <div className={`absolute inset-0 ${style.bg}`}></div>
                )}
                
                <div className="relative z-10 flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-md shadow-inner border border-white/10 group-hover:bg-black/60 transition-colors">
                    {style.icon}
                  </div>
                  <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider drop-shadow-md">{label}</div>
                </div>
                <div className="relative z-10 text-sm font-bold text-white leading-snug drop-shadow-lg">{value}</div>
                
                {/* Subtle shine effect on hover */}
                <div className="absolute inset-0 z-20 rounded-2xl bg-gradient-to-tr from-white/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 border border-white/[0.03] pointer-events-none"></div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
