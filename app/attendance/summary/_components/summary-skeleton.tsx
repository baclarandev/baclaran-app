export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-muted rounded w-24 mb-3"></div>
          <div className="h-8 bg-muted rounded w-32 mt-2"></div>
          <div className="h-3 bg-muted rounded w-20 mt-2"></div>
        </div>
        <div className="w-12 h-12 rounded-lg bg-muted"></div>
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr className="border-b border-border hover:bg-accent/30 transition-colors animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-muted rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-muted rounded w-32"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-muted rounded w-40"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-muted rounded-full w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-muted rounded-full w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-muted rounded-full w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-muted rounded w-12"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-muted rounded-full w-24"></div>
      </td>
    </tr>
  );
}

export function AttendanceTableSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-6 py-4 font-semibold text-foreground text-sm">
                <div className="h-4 bg-muted rounded w-24"></div>
              </th>
              <th className="text-left px-6 py-4 font-semibold text-foreground text-sm">
                <div className="h-4 bg-muted rounded w-32"></div>
              </th>
              <th className="text-left px-6 py-4 font-semibold text-foreground text-sm">
                <div className="h-4 bg-muted rounded w-24"></div>
              </th>
              <th className="text-left px-6 py-4 font-semibold text-foreground text-sm">
                <div className="h-4 bg-muted rounded w-28"></div>
              </th>
              <th className="text-left px-6 py-4 font-semibold text-foreground text-sm">
                <div className="h-4 bg-muted rounded w-20"></div>
              </th>
              <th className="text-left px-6 py-4 font-semibold text-foreground text-sm">
                <div className="h-4 bg-muted rounded w-20"></div>
              </th>
              <th className="text-left px-6 py-4 font-semibold text-foreground text-sm">
                <div className="h-4 bg-muted rounded w-24"></div>
              </th>
              <th className="text-left px-6 py-4 font-semibold text-foreground text-sm">
                <div className="h-4 bg-muted rounded w-20"></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonTableRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FilterSectionSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-pulse">
      <div className="h-6 bg-muted rounded w-20 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-muted rounded w-16 mb-2"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        ))}
      </div>
      <div className="h-10 bg-muted rounded w-32"></div>
    </div>
  );
}
