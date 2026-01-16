import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import React from "react"

const Loading = () => {
  const placeholders = Array.from({ length: 10 })

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-6">
        <Skeleton className="mb-2 h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {placeholders.map((_, idx) => (
          <Card key={idx} className="flex flex-col overflow-hidden">
            <div className="aspect-[4/3] w-full overflow-hidden">
              <Skeleton className="h-full w-full" />
            </div>
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle>
                  <Skeleton className="h-4 w-32" />
                </CardTitle>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-3 pb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}

export default Loading


