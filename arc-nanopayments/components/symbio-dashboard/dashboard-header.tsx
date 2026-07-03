"use client"

import { Activity, Zap, TrendingUp, Box } from "lucide-react"

interface HeaderProps {
  cycle: number
  totalVolume: number
  totalProfit: number
  live?: boolean
  settlementMode?: string
  liveUsdcTotal?: number
}

export function DashboardHeader({
  cycle,
  totalVolume,
  totalProfit,
  live = true,
  settlementMode,
  liveUsdcTotal,
}: HeaderProps) {
  return (
    <header className="border-b border-border px-4 py-3 md:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-md border border-neon-green/30 neon-border-green">
            <Activity className="h-4 w-4 text-neon-green" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-neon-green animate-pulse-glow" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wider text-neon-green neon-text-green">
              SYMBIOMARKET
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Arc Blockchain Swarm Interface
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-4 text-xs md:gap-6">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-neon-purple" />
            <span className="text-muted-foreground">CYCLE</span>
            <span className="font-bold text-neon-green neon-text-green animate-flicker">
              #{cycle}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-neon-green" />
            <span className="text-muted-foreground">VOL</span>
            <span className="font-bold text-foreground">
              ${totalVolume.toFixed(4)} USDC
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Box className="h-3 w-3 text-neon-purple" />
            <span className="text-muted-foreground">P&L</span>
            <span className={`font-bold ${totalProfit >= 0 ? "text-neon-green" : "text-destructive"}`}>
              {totalProfit >= 0 ? "+" : ""}
              {totalProfit.toFixed(4)} session PnL
            </span>
          </div>
          {settlementMode === "live" && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">X402</span>
              <span className="font-bold text-neon-green">
                {(liveUsdcTotal ?? 0).toFixed(4)} USDC live
              </span>
            </div>
          )}
          {live && (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse-glow" />
              <span className="text-neon-green font-bold uppercase">Live swarm</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
