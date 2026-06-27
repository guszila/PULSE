export function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-3">
      <p className="text-xs uppercase text-zinc-500">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-semibold tracking-normal text-zinc-50">{title}</h2>
    </div>
  );
}
