"use client"

import { cn } from "@/lib/utils"

export function IridescentBackground() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full">
      <div
        className={cn(
          "absolute inset-0 -z-10 h-full w-full bg-black",
          "[&_>_*]:-z-10 [&_>_*]:absolute [&_>_*]:h-full [&_>_*]:w-full [&_>_*]:bg-gradient-to-t [&_>_*]:from-transparent [&_>_*]:to-transparent [&_>_*]:opacity-50",
          "[&_>_div:first-child]:bg-blue-500/30",
          "[&_>_div:first-child]:left-[-20%] [&_>_div:first-child]:top-[-20%]",
          "[&_>_div:nth-child(2)]:-bottom-1/4 [&_>_div:nth-child(2)]:bg-emerald-500/30",
          "[&_>_div:nth-child(3)]:left-1/3 [&_>_div:nth-child(3)]:-top-1/4 [&_>_div:nth-child(3)]:bg-purple-500/30",
          "[&_>_div:nth-child(4)]:left-[-20%] [&_>_div:nth-child(4)]:-bottom-1/4 [&_>_div:nth-child(4)]:bg-red-500/30",
          "[&_>_div:nth-child(5)]:left-2/3 [&_>_div:nth-child(5)]:top-0 [&_>_div:nth-child(5)]:bg-yellow-500/30",
          "animate-pulse-slow"
        )}
      >
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
      <div className="absolute inset-0 -z-10 h-full w-full backdrop-blur-[120px]" />
    </div>
  )
}
