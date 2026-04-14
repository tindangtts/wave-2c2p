import { Skeleton } from '@/components/ui/skeleton'

export function ProfileMenuSkeleton() {
  return (
    <div className="flex flex-col min-h-dvh bg-[#FAFAFA]">
      {/* Yellow header area */}
      <div className="bg-[#FFE600] h-32 flex flex-col items-center justify-center">
        <Skeleton className="w-[72px] h-[72px] rounded-full bg-black/10 animate-pulse" />
        <Skeleton className="h-4 w-32 mt-2 rounded bg-black/10 animate-pulse" />
      </div>

      {/* Content sections */}
      <div className="px-4 pt-4 flex flex-col gap-6">
        {[0, 1, 2].map((section) => (
          <div key={section}>
            <Skeleton className="h-3 w-24 bg-[#E0E0E0] rounded mb-3 animate-pulse" />
            <div className="flex flex-col gap-1">
              {[0, 1, 2, 3].map((row) => (
                <Skeleton
                  key={row}
                  className="h-14 rounded-xl bg-[#F5F5F5] animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardPageSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 px-4 pt-6 bg-[#FAFAFA] min-h-dvh">
      {/* Card skeleton */}
      <Skeleton className="w-[343px] h-[200px] rounded-2xl bg-[#E0E0E0] animate-pulse" />

      {/* Action row skeleton */}
      <div className="flex gap-3 w-full">
        <Skeleton className="flex-1 h-10 rounded-full bg-[#F5F5F5] animate-pulse" />
        <Skeleton className="flex-1 h-10 rounded-full bg-[#F5F5F5] animate-pulse" />
      </div>

      {/* Info block skeleton */}
      <div className="flex flex-col gap-2 w-full mx-4">
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} className="h-5 rounded bg-[#F5F5F5] animate-pulse" />
        ))}
      </div>
    </div>
  )
}
