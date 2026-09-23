export default function Loading() {
  return (
    <div className="grid gap-4 py-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-paper-2" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-paper-2" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-paper-2" />
    </div>
  );
}
