import React from "react";
import { LucideIcon } from "lucide-react";

interface SectionTitleProps {
  eyebrow?: string;
  title?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}

export function SectionTitle({ eyebrow, title, icon: Icon, children }: SectionTitleProps) {
  if (children) {
    return (
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="h-5 w-5 text-indigo-400" />}
        <h2 className="text-xl font-semibold tracking-normal text-zinc-50">{children}</h2>
      </div>
    );
  }

  return (
    <div className="mb-3">
      {eyebrow && <p className="text-xs uppercase text-zinc-500">{eyebrow}</p>}
      {title && <h2 className="mt-1 text-xl font-semibold tracking-normal text-zinc-50">{title}</h2>}
    </div>
  );
}
