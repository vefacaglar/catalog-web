export default function Loading() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-busy>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-zinc-200">
          <div className="aspect-square bg-zinc-100" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-1/3 rounded bg-zinc-100" />
            <div className="h-4 w-2/3 rounded bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
