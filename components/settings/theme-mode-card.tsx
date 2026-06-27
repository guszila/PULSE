import { Sun, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ThemeModeCard({ theme, onToggle }: { theme: "dark" | "light"; onToggle: () => void }) {
  const isLight = theme === "light";

  return (
    <Card className="p-4">
      {isLight ? <Sun className="h-4 w-4 text-zinc-500" /> : <Moon className="h-4 w-4 text-zinc-500" />}
      <div className="mt-4 text-sm font-medium text-zinc-100">ธีม</div>
      <p className="mt-1 text-xs leading-5 text-zinc-500">
        {isLight ? "โหมดสว่าง สบายตากลางวัน" : "โหมดมืด อ่านง่ายบนมือถือ"}
      </p>
      <Button variant="outline" size="sm" className="mt-4 w-full" onClick={onToggle}>
        {isLight ? "เปลี่ยนเป็นโหมดมืด" : "เปลี่ยนเป็นโหมดสว่าง"}
      </Button>
    </Card>
  );
}
