'use client'

import * as React from 'react'

// Mock browser chrome wrapping the preview so the editor looks like a live
// window on the published site. Pure visual — no navigation.
export function BrowserFrame({
  url,
  children,
  fullBleed = false,
}: {
  url: string
  children: React.ReactNode
  fullBleed?: boolean
}) {
  return (
    <div
      suppressHydrationWarning
      className={
        'mx-auto flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] ' +
        (fullBleed ? '' : 'max-w-[1200px]')
      }
    >
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#111] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex flex-1 justify-center">
          <div className="max-w-[420px] truncate rounded-md bg-white/5 px-3 py-1 text-[12px] text-white/60">
            {url}
          </div>
        </div>
        <div className="w-[52px]" />
      </div>
      <div className="relative flex-1 overflow-auto bg-black">{children}</div>
    </div>
  )
}
