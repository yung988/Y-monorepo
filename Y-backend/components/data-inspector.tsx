"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabaseAdapter } from "@/lib/supabase-adapter"
import { Database, Table, Eye, RefreshCw } from "lucide-react"

export function DataInspector() {
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [tableData, setTableData] = useState<any[]>([])
  const [tableStructure, setTableStructure] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    loadTables()
    loadDashboardData()
  }, [])

  const loadTables = async () => {
    try {
      setLoading(true)
      const tableList = await supabaseAdapter.getAllTables()
      setTables(tableList)
      if (tableList.length > 0 && !selectedTable) {
        setSelectedTable(tableList[0])
      }
    } catch (error) {
      console.error("Error loading tables:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadTableData = async (tableName: string) => {
    try {
      setLoading(true)
      const [data, structure] = await Promise.all([
        supabaseAdapter.getTableData(tableName, { limit: 10 }),
        supabaseAdapter.getTableStructure(tableName),
      ])
      setTableData(data || [])
      setTableStructure(structure || [])
    } catch (error) {
      console.error("Error loading table data:", error)
      setTableData([])
      setTableStructure([])
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardData = async () => {
    try {
      const data = await supabaseAdapter.getDashboardData()
      setDashboardData(data)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    }
  }

  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable)
    }
  }, [selectedTable])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Data Inspector
          </CardTitle>
          <CardDescription>Analýza existujících dat v tvé Supabase databázi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={loadTables} disabled={loading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Obnovit
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Přehled</TabsTrigger>
              <TabsTrigger value="tables">Tabulky</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard Data</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Celkem tabulek</CardTitle>
                    <Table className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tables.length}</div>
                  </CardContent>
                </Card>

                {dashboardData && (
                  <>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Produkty</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.totalProducts}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Objednávky</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.totalOrders}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Zákazníci</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{dashboardData.totalCustomers}</div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Dostupné tabulky</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tables.map((table) => (
                      <Badge key={table} variant="outline">
                        {table}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tables" className="space-y-4">
              <div className="flex gap-4">
                <Card className="w-1/3">
                  <CardHeader>
                    <CardTitle>Tabulky</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {tables.map((table) => (
                          <Button
                            key={table}
                            variant={selectedTable === table ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setSelectedTable(table)}
                          >
                            <Table className="h-4 w-4 mr-2" />
                            {table}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      {selectedTable || "Vyber tabulku"}
                    </CardTitle>
                    {selectedTable && <CardDescription>Struktura a data tabulky {selectedTable}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    {selectedTable && (
                      <Tabs defaultValue="structure">
                        <TabsList>
                          <TabsTrigger value="structure">Struktura</TabsTrigger>
                          <TabsTrigger value="data">Data</TabsTrigger>
                        </TabsList>

                        <TabsContent value="structure">
                          <ScrollArea className="h-[300px]">
                            <div className="space-y-2">
                              {tableStructure.map((column, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded">
                                  <div>
                                    <span className="font-medium">{column.column_name}</span>
                                    <Badge variant="outline" className="ml-2">
                                      {column.data_type}
                                    </Badge>
                                  </div>
                                  <Badge variant={column.is_nullable === "YES" ? "secondary" : "default"}>
                                    {column.is_nullable === "YES" ? "Nullable" : "Required"}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="data">
                          <ScrollArea className="h-[300px]">
                            <div className="space-y-4">
                              {tableData.map((row, index) => (
                                <Card key={index}>
                                  <CardContent className="pt-4">
                                    <pre className="text-xs overflow-auto">{JSON.stringify(row, null, 2)}</pre>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-4">
              {dashboardData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Dashboard Data Preview</CardTitle>
                    <CardDescription>Jak budou vypadat data v dashboard komponentách</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs overflow-auto bg-muted p-4 rounded">
                      {JSON.stringify(dashboardData, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
