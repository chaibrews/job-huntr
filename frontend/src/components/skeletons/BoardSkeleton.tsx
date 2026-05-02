export default function BoardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-shadow mb-6 -mt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-3 w-20 bg-primary/15 rounded mb-3" />
        ))}
      </div>

      {/* Columns */}
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
      >
        {[1, 2, 3].map((col) => (
          <div key={col} className="flex flex-col gap-3">
            {/* Column header */}
            <div className="flex items-center gap-2 px-1">
              <div className="h-4 w-20 bg-primary/15 rounded" />
              <div className="w-5 h-5 rounded-full bg-primary/10" />
            </div>
            {/* Cards */}
            {[1, 2, col === 1 ? 3 : 0].filter(Boolean).map((row) => (
              <div
                key={row}
                className="bg-white/50 rounded-xl p-4 border border-primary/20"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    <div className="h-3 w-28 bg-primary/15 rounded" />
                    <div className="h-2.5 w-20 bg-primary/10 rounded" />
                  </div>
                </div>
                <div className="h-4 w-40 bg-primary/10 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
