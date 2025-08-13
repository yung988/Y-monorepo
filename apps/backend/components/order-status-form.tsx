"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface OrderStatusFormProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusForm({ orderId, currentStatus }: OrderStatusFormProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Čeká na platbu", variant: "secondary" as const },
      paid: { label: "Zaplaceno", variant: "default" as const },
      shipped: { label: "Odesláno", variant: "outline" as const },
      delivered: { label: "Doručeno", variant: "default" as const },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        variant: "secondary" as const,
      }
    );
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus === currentStatus) {
      toast({
        title: "Žádná změna",
        description: "Status objednávky nebyl změněn.",
        variant: "default",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: selectedStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Chyba při aktualizaci statusu");
      }

      const updatedOrder = await response.json();

      // Odeslat email notifikaci
      try {
        const emailResponse = await fetch(`/api/orders/${orderId}/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!emailResponse.ok) {
          console.error("Chyba při odesílání email notifikace");
        }
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
      }

      toast({
        title: "Status aktualizován",
        description: `Status objednávky byl úspěšně změněn na "${getStatusBadge(selectedStatus).label}". Email notifikace byla odeslána.`,
        variant: "default",
      });

      // Obnovit stránku pro aktualizaci dat
      router.refresh();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se aktualizovat status objednávky.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span>Aktuální status:</span>
        <Badge variant={getStatusBadge(currentStatus).variant}>
          {getStatusBadge(currentStatus).label}
        </Badge>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Změnit status:</label>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Čeká na platbu</SelectItem>
            <SelectItem value="paid">Zaplaceno</SelectItem>
            <SelectItem value="shipped">Odesláno</SelectItem>
            <SelectItem value="delivered">Doručeno</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full" onClick={handleStatusUpdate} disabled={isLoading}>
        {isLoading ? "Aktualizuji..." : "Aktualizovat status"}
      </Button>
    </div>
  );
}
