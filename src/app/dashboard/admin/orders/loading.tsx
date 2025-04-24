import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Skeleton className="h-10 w-full max-w-sm" />
              <Skeleton className="h-10 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-[180px]" />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="h-10 border-b px-4 flex items-center">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1">
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>

            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 border-b last:border-0 px-4 flex items-center">
                {Array.from({ length: 7 }).map((_, j) => (
                  <div key={j} className="flex-1">
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

