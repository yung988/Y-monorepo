"use client";

import { Calendar, CheckCircle, Package, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  packeta_label_id: string;
  packeta_pickup_point_name: string;
  created_at: string;
  packeta_printed?: boolean;
  packeta_printed_at?: string;
}

export function PacketaBulkPrint() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/packeta/generate-labels?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        const error = await response.json();
        toast({
          title: "Chyba",
          description: error.error || "Chyba při načítání objednávek",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Chyba",
        description: "Chyba při načítání objednávek",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId],
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((order) => order.id));
    }
  };

  const printSelectedLabels = async () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "Upozornění",
        description: "Nejsou vybrané žádné objednávky",
        variant: "destructive",
      });
      return;
    }

    setPrinting(true);
    try {
      // Stáhni a vytiskni PDF
      const response = await fetch("/api/packeta/generate-labels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderIds: selectedOrders }),
      });

      if (response.ok) {
        // Otevři PDF v novém okně pro tisk
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const printWindow = window.open(url, "_blank");

        if (printWindow) {
          printWindow.onload = () => {
            // Automaticky spustí dialog pro tisk
            printWindow.print();

            // Označ objednávky jako vytištěné po kliknutí na tisk
            printWindow.onafterprint = async () => {
              await markOrdersAsPrinted();
              printWindow.close();
            };
          };
        }

        window.URL.revokeObjectURL(url);

        toast({
          title: "Úspěch",
          description: `PDF se štítky pro ${selectedOrders.length} objednávek bylo otevřeno pro tisk`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Chyba",
          description: error.error || "Chyba při generování štítků",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error printing labels:", error);
      toast({
        title: "Chyba",
        description: "Chyba při tisku štítků",
        variant: "destructive",
      });
    } finally {
      setPrinting(false);
    }
  };

  const markOrdersAsPrinted = async () => {
    try {
      const response = await fetch("/api/packeta/mark-printed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderIds: selectedOrders }),
      });

      if (response.ok) {
        // Aktualizuj lokální stav
        setOrders((prev) =>
          prev.map((order) =>
            selectedOrders.includes(order.id)
              ? { ...order, packeta_printed: true, packeta_printed_at: new Date().toISOString() }
              : order,
          ),
        );
        setSelectedOrders([]);

        toast({
          title: "Úspěch",
          description: "Objednávky byly označeny jako vytištěné",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Chyba",
          description: error.error || "Chyba při označování objednávek",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error marking orders as printed:", error);
      toast({
        title: "Chyba",
        description: "Chyba při označování objednávek",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedDate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="h-5 w-5" />
          Hromadný tisk Packeta štítků
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Výběr data */}
        <div className="flex items-center gap-4">
          <Label htmlFor="date">Datum objednávek:</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button onClick={fetchOrders} disabled={loading}>
            <Calendar className="h-4 w-4 mr-2" />
            {loading ? "Načítám..." : "Načíst objednávky"}
          </Button>
        </div>

        {/* Celkové statistiky */}
        {orders.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>
                Celkem objednávek: <strong>{orders.length}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>
                Vytištěných: <strong>{orders.filter((o) => o.packeta_printed).length}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              <span>
                K tisku: <strong>{orders.filter((o) => !o.packeta_printed).length}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Ovládací tlačítka */}
        {orders.length > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={selectedOrders.length === orders.length}
              onCheckedChange={toggleSelectAll}
            />
            <Label htmlFor="select-all">Vybrat všechny</Label>

            <div className="ml-auto flex gap-2">
              <Button
                onClick={printSelectedLabels}
                disabled={selectedOrders.length === 0 || printing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Printer className="h-4 w-4 mr-2" />
                {printing ? "Připravuji tisk..." : `Vytisknout štítky (${selectedOrders.length})`}
              </Button>
            </div>
          </div>
        )}

        {/* Seznam objednávek */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`flex items-center gap-4 p-3 border rounded-lg ${
                order.packeta_printed ? "bg-green-50 border-green-200" : "bg-white"
              }`}
            >
              <Checkbox
                checked={selectedOrders.includes(order.id)}
                onCheckedChange={() => toggleOrderSelection(order.id)}
                disabled={order.packeta_printed}
              />

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">#{order.order_number || order.id.slice(0, 8)}</span>
                  {order.packeta_printed && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Vytištěno
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                <p className="text-xs text-muted-foreground">{order.packeta_pickup_point_name}</p>
              </div>

              <div className="text-right text-sm text-muted-foreground">
                <p>{new Date(order.created_at).toLocaleDateString("cs-CZ")}</p>
                {order.packeta_printed_at && (
                  <p className="text-xs text-green-600">
                    Vytištěno: {new Date(order.packeta_printed_at).toLocaleDateString("cs-CZ")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Pro vybrané datum nebyly nalezeny žádné objednávky s Packeta štítky.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
