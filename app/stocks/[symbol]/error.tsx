"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { GlobalSearch } from "@/components/shared/global-search";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-zinc-100">ไม่พบข้อมูลหุ้น</h2>
      <p className="mb-8 max-w-md text-sm text-zinc-400">
        {error.message.includes("ไม่พบข้อมูล") 
          ? error.message 
          : "ขออภัย ไม่สามารถดึงข้อมูลหุ้นที่คุณต้องการได้ในขณะนี้ อาจเป็นเพราะชื่อย่อหุ้นไม่ถูกต้อง หรือระบบขัดข้อง"}
      </p>
      
      <div className="mb-8 w-full max-w-sm">
        <GlobalSearch />
      </div>
      
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="outline" className="border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white">
          ลองใหม่อีกครั้ง
        </Button>
        <Link href="/">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-0">
            กลับหน้าแรก
          </Button>
        </Link>
      </div>
    </div>
  );
}
