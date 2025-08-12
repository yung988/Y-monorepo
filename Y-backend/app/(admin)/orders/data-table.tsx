"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, Printer, Package } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [bulkCreateDialogOpen, setBulkCreateDialogOpen] = useState(false);
  const [bulkCreateProcessing, setBulkCreateProcessing] = useState(false);
  const [bulkWeight, setBulkWeight] = useState("0.5");
  const [bulkWidth, setBulkWidth] = useState("10");
  const [bulkHeight, setBulkHeight] = useState("10");
  const [bulkDepth, setBulkDepth] = useState("5");
  const { toast } = useToast();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedOrdersWithPacketa = selectedRows.filter((row) => {
    const o = row.original as { packeta_label_id?: string; packeta_printed?: boolean };
    return o.packeta_label_id && !o.packeta_printed;
  });

  // Objednávky které mají Packeta pickup point ale ještě nemají vytvořenou zásilku
  const selectedOrdersForBulkCreate = selectedRows.filter((row) => {
    const o = row.original as {
      packeta_pickup_point_id?: string;
      packeta_label_id?: string;
      shipping_method?: string;
    };
    return (o.packeta_pickup_point_id || o.shipping_method === "Packeta") && !o.packeta_label_id;
  });

  const handlePrintLabels = async () => {
    if (selectedOrdersWithPacketa.length === 0) {
      toast({
        title: "Upozornění",
        description: "Nejsou vybrané žádné objednávky s nevytištěnými Packeta štítky",
        variant: "destructive",
      });
      return;
    }

    const orderIds = selectedOrdersWithPacketa.map((row) => (row.original as { id: string }).id);

    try {
      // Vygeneruj PDF se štítky
      const response = await fetch("/api/packeta/generate-labels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderIds }),
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

            // Označ objednávky jako vytištěné po zavření okna tisku
            printWindow.onafterprint = async () => {
              await markOrdersAsPrinted(orderIds);
              printWindow.close();
            };
          };
        }

        window.URL.revokeObjectURL(url);

        toast({
          title: "Úspěch",
          description: `PDF se štítky pro ${orderIds.length} objednávek bylo otevřeno pro tisk`,
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
    }
  };

  const markOrdersAsPrinted = async (orderIds: string[]) => {
    try {
      const response = await fetch("/api/packeta/mark-printed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderIds }),
      });

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: `${orderIds.length} objednávek bylo označeno jako vytištěno`,
        });
        // Refresh stránky pro zobrazení změn
        window.location.reload();
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

  const handleBulkCreateShipments = async () => {
    setBulkCreateProcessing(true);
    const orderIds = selectedOrdersForBulkCreate.map((row) => (row.original as any).id);

    try {
      const response = await fetch("/api/packeta/bulk-create-shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderIds,
          weight: parseFloat(bulkWeight),
          width: parseFloat(bulkWidth),
          height: parseFloat(bulkHeight),
          depth: parseFloat(bulkDepth),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Úspěch",
          description: `${result.successCount} zásilek bylo vytvořeno`,
        });
        setBulkCreateDialogOpen(false);
        window.location.reload();
      } else {
        const error = await response.json();
        toast({
          title: "Chyba",
          description: error.error || "Chyba při vytváření zásilek",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating bulk shipments:", error);
      toast({
        title: "Chyba",
        description: "Chyba při vytváření zásilek",
        variant: "destructive",
      });
    } finally {
      setBulkCreateProcessing(false);
    }
  };

  const handleDownloadLabels = async () => {
    if (selectedOrdersWithPacketa.length === 0) {
      toast({
        title: "Upozornění",
        description: "Nejsou vybrané žádné objednávky s nevytištěnými Packeta štítky",
        variant: "destructive",
      });
      return;
    }

    const orderIds = selectedOrdersWithPacketa.map((row) => (row.original as { id: string }).id);

    try {
      // Vygeneruj PDF se štítky
      const response = await fetch("/api/packeta/generate-labels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderIds }),
      });

      if (response.ok) {
        // Stáhni PDF soubor
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `packeta-labels-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Úspěch",
          description: `PDF se štítky pro ${orderIds.length} objednávek bylo staženo`,
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
      console.error("Error downloading labels:", error);
      toast({
        title: "Chyba",
        description: "Chyba při stahování štítků",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrovat podle zákazníka..."
          value={(table.getColumn("customer_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("customer_name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center space-x-2">
          {selectedOrdersForBulkCreate.length > 0 && (
            <Dialog open={bulkCreateDialogOpen} onOpenChange={setBulkCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Package className="mr-2 h-4 w-4" />
                  Vytvořit zásilky ({selectedOrdersForBulkCreate.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Hromadné vytvoření Packeta zásilek</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Vytvoří se zásilky pro {selectedOrdersForBulkCreate.length} vybraných objednávek.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="bulk-weight">Váha (kg)</Label>
                    <Input
                      id="bulk-weight"
                      value={bulkWeight}
                      onChange={(e) => setBulkWeight(e.target.value)}
                      placeholder="např. 0.5"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="bulk-width">Šířka (cm)</Label>
                      <Input
                        id="bulk-width"
                        value={bulkWidth}
                        onChange={(e) => setBulkWidth(e.target.value)}
                        placeholder="např. 10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bulk-height">Výška (cm)</Label>
                      <Input
                        id="bulk-height"
                        value={bulkHeight}
                        onChange={(e) => setBulkHeight(e.target.value)}
                        placeholder="např. 10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bulk-depth">Hloubka (cm)</Label>
                      <Input
                        id="bulk-depth"
                        value={bulkDepth}
                        onChange={(e) => setBulkDepth(e.target.value)}
                        placeholder="např. 5"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleBulkCreateShipments}
                  disabled={bulkCreateProcessing}
                  className="w-full mt-4"
                >
                  {bulkCreateProcessing ? "Vytváření..." : "Potvrdit a vytvořit zásilky"}
                </Button>
              </DialogContent>
            </Dialog>
          )}
          {selectedOrdersWithPacketa.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Printer className="mr-2 h-4 w-4" />
                  Štítky ({selectedOrdersWithPacketa.length})
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handlePrintLabels}>
                  <Printer className="mr-2 h-4 w-4" />
                  Vytisknout štítky
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadLabels}>
                  <Package className="mr-2 h-4 w-4" />
                  Stáhnout štítky
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Sloupce <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Žádné výsledky.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} z{" "}
          {table.getFilteredRowModel().rows.length} řádek(ů) vybráno.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Předchozí
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Další
          </Button>
        </div>
      </div>
    </div>
  );
}
