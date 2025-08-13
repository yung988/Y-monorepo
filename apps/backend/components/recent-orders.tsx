"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ExternalLink, Eye, MoreHorizontal, Mail, Truck, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface Order {
  id: string
  customerName: string
  amount: number
  status: string
  date: string
}

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const [orderStatuses, setOrderStatuses] = useState<{ [key: string]: string }>({})
  const { toast } = useToast()

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "Dokončeno", variant: "default" as const },
      delivered: { label: "Doručeno", variant: "default" as const },
      pending: { label: "Čekající", variant: "secondary" as const },
      processing: { label: "Zpracovává se", variant: "outline" as const },
      shipped: { label: "Odesláno", variant: "default" as const },
      cancelled: { label: "Zrušeno", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "secondary" as const,
    }

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // Simulace API volání
      await new Promise((resolve) => setTimeout(resolve, 500))

      setOrderStatuses((prev) => ({ ...prev, [orderId]: newStatus }))

      toast({
        title: "Stav objednávky aktualizován",
        description: `Objednávka ${orderId} byla změněna na ${newStatus}`,
      })
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se aktualizovat stav objednávky",
        variant: "destructive",
      })
    }
  }

  const handleSendEmail = (orderId: string, customerName: string) => {
    toast({
      title: "Email odeslán",
      description: `Potvrzení bylo odesláno zákazníkovi ${customerName}`,
    })
  }

  const handleCancelOrder = (orderId: string) => {
    handleStatusChange(orderId, "cancelled")
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Nedávné objednávky</CardTitle>
            <CardDescription>Posledních {orders.length} objednávek s možností rychlé editace</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/orders">
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Zobrazit všechny objednávky</span>
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.map((order) => {
              const currentStatus = orderStatuses[order.id] || order.status

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium leading-none">{order.customerName}</p>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                              <Link href={`/orders/${order.id}`}>
                                <Eye className="h-3 w-3" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Zobrazit detail objednávky</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">{order.id}</p>
                      <Badge variant="outline" className="text-xs">
                        {new Date(order.date).toLocaleDateString("cs-CZ")}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Select value={currentStatus} onValueChange={(value) => handleStatusChange(order.id, value)}>
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Čekající</SelectItem>
                        <SelectItem value="processing">Zpracovává se</SelectItem>
                        <SelectItem value="shipped">Odesláno</SelectItem>
                        <SelectItem value="delivered">Doručeno</SelectItem>
                        <SelectItem value="cancelled">Zrušeno</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="text-sm font-medium min-w-[80px] text-right">
                      {order.amount.toLocaleString("cs-CZ")} Kč
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Otevřít menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Akce</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Zobrazit detail
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendEmail(order.id, order.customerName)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Odeslat email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Truck className="mr-2 h-4 w-4" />
                          Sledovat zásilku
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <X className="mr-2 h-4 w-4" />
                              Zrušit objednávku
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Zrušit objednávku?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Opravdu chcete zrušit objednávku {order.id}? Tato akce je nevratná.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Zrušit</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancelOrder(order.id)}>
                                Potvrdit zrušení
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
