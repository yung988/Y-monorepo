"use client"

import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

interface RealtimeIndicatorProps {
  isConnected: boolean
}

export function RealtimeIndicator({ isConnected }: RealtimeIndicatorProps) {
  return (
    <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          Připojeno
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Odpojeno
        </>
      )}
    </Badge>
  )
}
