import * as React from "react"

export function MindfulMeLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      aria-hidden="true"
      {...props}
    >
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="hsl(var(--primary))"
        d="m223.2 88.4-72-48a16 16 0 0 0-14.4 0l-72 48a16 16 0 0 0-8.8 14.3v62.6a16 16 0 0 0 8.8 14.3l72 48a16 16 0 0 0 14.4 0l72-48a16 16 0 0 0 8.8-14.3v-62.6a16 16 0 0 0-8.8-14.3Z"
        opacity={0.2}
      />
      <path
        fill="hsl(var(--primary))"
        d="m223.2 88.4-72-48a16 16 0 0 0-14.4 0l-72 48a16 16 0 0 0-8.8 14.3v62.6a16 16 0 0 0 8.8 14.3l72 48a16 16 0 0 0 14.4 0l72-48a16 16 0 0 0 8.8-14.3v-62.6a16 16 0 0 0-8.8-14.3Z"
      />
      <path fill="hsl(var(--background))" d="M128 128h96v16h-96z" />
    </svg>
  )
}
