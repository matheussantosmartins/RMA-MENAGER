export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-500">
      <p className="text-lg font-medium">{title}</p>
      <p className="text-sm">Em construção</p>
    </div>
  );
}
