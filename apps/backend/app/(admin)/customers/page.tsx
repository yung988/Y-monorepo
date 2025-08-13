"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/api-client";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  orders: number;
  totalSpent: number;
  registeredAt: string;
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await apiClient.get("/api/admin/customers");
        if (!response.ok) {
          throw new Error(`Chyba načítání zákazníků (HTTP ${response.status})`);
        }
        const payload = await response.json();
        if (!payload?.success) {
          throw new Error(payload?.error || "Chyba načítání zákazníků");
        }
        setCustomers(payload.data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    return (
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <AdminHeader
        title="Zákazníci"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Zákazníci" }]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Hledat zákazníky..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Seznam zákazníků ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <p>Načítání zákazníků...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jméno</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Počet objednávek</TableHead>
                    <TableHead>Celkově utraceno</TableHead>
                    <TableHead>Registrován</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium relative">
                        <Link href={`/customers/${customer.id}`} className="absolute inset-0" aria-label={`Otevřít zákazníka ${customer.name}`}></Link>
                        {customer.name}
                      </TableCell>
                      <TableCell>
                        <Link href={`/customers/${customer.id}`} className="block">{customer.email}</Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/customers/${customer.id}`} className="block">{customer.phone || "-"}</Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/customers/${customer.id}`} className="block">{customer.orders}</Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/customers/${customer.id}`} className="block">{customer.totalSpent.toLocaleString()} Kč</Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/customers/${customer.id}`} className="block">{new Date(customer.registeredAt).toLocaleDateString("cs-CZ")}</Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
