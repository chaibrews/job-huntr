import AppShell from "../AppShell";

export default function ApplicationDetailSkeleton() {
  return (
    <AppShell>
      <div className="animate-pulse">
        <div className="mb-5 mt-4 flex flex-col gap-4 rounded-xl bg-primary-lighter p-4 sm:mt-12 sm:flex-row sm:items-center sm:p-5">
          <div className="w-12 h-12 rounded-xl bg-primary/20 shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-5 w-48 bg-primary/20 rounded-md" />
            <div className="h-4 w-32 bg-primary/15 rounded-md" />
            <div className="h-3 w-24 bg-primary/10 rounded-md" />
          </div>
          <div className="h-6 w-20 bg-primary/20 rounded-full" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-shadow p-4"
                >
                  <div className="h-3 w-16 bg-primary/15 rounded mb-2" />
                  <div className="h-9 bg-primary/10 rounded-lg" />
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-shadow p-4"
                >
                  <div className="h-3 w-16 bg-primary/15 rounded mb-2" />
                  <div className="h-8 bg-primary/10 rounded-lg" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg border border-shadow p-4">
              <div className="h-3 w-28 bg-primary/15 rounded mb-3" />
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-3 bg-primary/10 rounded"
                    style={{ width: i === 3 ? "60%" : "100%" }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-lg border border-shadow p-4">
              <div className="h-3 w-36 bg-primary/15 rounded mb-4" />
              {[1, 2].map((i) => (
                <div key={i} className="flex items-start gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full bg-primary/15 shrink-0" />
                  <div className="flex flex-col gap-1.5 pt-0.5">
                    <div className="h-3 w-20 bg-primary/15 rounded" />
                    <div className="h-2.5 w-28 bg-primary/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-shadow p-4"
              >
                <div className="h-3 w-28 bg-primary/15 rounded mb-3" />
                <div className="h-3 w-3/4 bg-primary/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
