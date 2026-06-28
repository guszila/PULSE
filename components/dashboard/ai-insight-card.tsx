"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Loader2, AlertCircle, X, Maximize2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import type { AlphaEdgeDashboardData } from "@/lib/market-data";
import { Button } from "@/components/ui/button";

export function AiInsightCard({ data }: { data: AlphaEdgeDashboardData }) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isExpanded]);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const apiKey = window.localStorage.getItem("alphaedge-gemini-key") || "";
      
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-key": apiKey
        },
        body: JSON.stringify(data)
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
      }
      
      setInsight(result.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden border-t-[3px] border-t-indigo-500 bg-gradient-to-b from-indigo-500/10 to-transparent">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100">AI Analysis <span className="text-[10px] font-medium text-indigo-400 border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 rounded-full ml-2">BETA</span></h3>
          </div>
          {!insight && !loading && (
            <Button size="sm" onClick={handleAnalyze} className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 h-8">
              วิเคราะห์ข้อมูลหุ้นนี้
            </Button>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mt-4">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            {/* Cute AI Core Animation */}
            <div className="relative flex items-center justify-center w-16 h-16">
              <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <div className="absolute inset-2 rounded-full bg-indigo-500/20 animate-pulse" />
              <div className="absolute inset-4 rounded-full bg-indigo-500/40 blur-sm animate-pulse" />
              <Sparkles className="h-6 w-6 text-indigo-300 relative z-10 animate-[spin_4s_linear_infinite]" />
            </div>
            
            {/* Bouncing Dots */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex space-x-1.5 items-center">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-sm font-medium text-indigo-300/80 animate-pulse">AI กำลังวิเคราะห์ข้อมูลเชิงลึก...</p>
            </div>
          </div>
        )}

        {insight && (
          <div className="mt-4">
            {/* Collapsed View */}
            <div className="relative max-h-[140px] overflow-hidden prose prose-invert prose-sm max-w-none prose-headings:text-indigo-300 prose-a:text-indigo-400 prose-p:leading-relaxed prose-strong:text-zinc-100 prose-li:text-zinc-300">
              <ReactMarkdown>{insight}</ReactMarkdown>
              
              {/* Fade out gradient matching the card background */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0c0d0c] to-transparent pointer-events-none" />
            </div>
            
            <div className="mt-3 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(true)} className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 -ml-2">
                <Maximize2 className="h-4 w-4 mr-2" /> อ่านบทวิเคราะห์เต็ม
              </Button>
              <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={loading} className="text-xs text-zinc-400 border-white/[0.05] hover:bg-white/[0.02]">
                <Sparkles className="h-3 w-3 mr-2" /> ขอคำแนะนำใหม่
              </Button>
            </div>

            {/* Full Screen Modal */}
            {isExpanded && typeof document !== 'undefined' && createPortal(
              <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                <Card className="flex flex-col w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl bg-zinc-950 border-0 sm:border sm:border-white/[0.1] rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.05] bg-zinc-900/80 sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-zinc-100">บทวิเคราะห์ AI แบบละเอียด</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">อัปเดตข้อมูลเรียลไทม์</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="text-zinc-400 hover:text-white rounded-full sm:hidden">
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-5 sm:p-8 overflow-y-auto custom-scrollbar">
                    <div className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:text-indigo-300 prose-a:text-indigo-400 prose-p:leading-relaxed prose-strong:text-zinc-100 prose-li:text-zinc-300">
                      <ReactMarkdown>{insight}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Footer / Mobile Close Button */}
                  <div className="p-4 border-t border-white/[0.05] bg-zinc-900/50 shrink-0 flex justify-end">
                     <Button variant="outline" onClick={() => setIsExpanded(false)} className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-white/[0.05]">
                        ปิดหน้าต่าง
                     </Button>
                  </div>
                </Card>
              </div>,
              document.body
            )}
          </div>
        )}

        {!insight && !loading && !error && (
          <p className="text-sm text-zinc-400 mt-2">
            ให้ AI ผู้ช่วยส่วนตัววิเคราะห์กราฟเทคนิค ปัจจัยพื้นฐาน และข่าวล่าสุด เพื่อสรุปมุมมองและคำแนะนำการลงทุนแบบอ่านเข้าใจง่าย
          </p>
        )}
      </CardContent>
    </Card>
  );
}
