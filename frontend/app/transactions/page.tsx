"use client"

import {useEffect, useState} from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import {PagedRequest} from "@/@types/common";
import {getOrders} from "@/api/tradeApi";

// Generate more mock transaction data
const generateTransactions = (count: number) => {
  const symbols = ["AAPL", "MSFT", "AMZN", "GOOGL", "META", "TSLA", "NFLX", "NVDA", "AMD", "INTC"]
  const types = ["buy", "sell"]
  const statuses = ["completed", "pending"]

  const transactions = []

  for (let i = 1; i <= count; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)]
    const type = types[Math.floor(Math.random() * types.length)]
    const quantity = Math.floor(Math.random() * 10) + 1
    const price = Number.parseFloat((Math.random() * 500 + 50).toFixed(2))

    // Generate a random date within the last 30 days
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))

    transactions.push({
      id: `tx-${i.toString().padStart(3, "0")}`,
      symbol,
      type,
      quantity,
      price,
      timestamp: date.toISOString(),
      status: i <= 5 ? "pending" : "completed", // Make the first 5 pending
    })
  }

  // Sort by timestamp, newest first
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// Generate 50 transactions
const transactions = generateTransactions(50)

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState("all")

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === "all") return true
    if (activeTab === "pending") return tx.status === "pending"
    if (activeTab === "completed") return tx.status === "completed"
    return true
  })

  useEffect (() => {
    const searchParams: PagedRequest = {
      page: 0,
      size: 10,
      sortBy: "createdAt",
      direction: "desc",
      filter: "pending"
    };

    getOrders(searchParams).then(response => console.log(response))
        .catch(error => console.error("Error fetching orders:", error));
  }, []);

  // Define columns for the data table
  const columns = [
    {
      key: "timestamp",
      header: "Date",
      sortable: true,
      cell: (tx: any) => (
          <div>
            {new Date(tx.timestamp).toLocaleDateString()}
            <div className="text-sm text-muted-foreground">{new Date(tx.timestamp).toLocaleTimeString()}</div>
          </div>
      ),
    },
    {
      key: "symbol",
      header: "Symbol",
      sortable: true,
      cell: (tx: any) => (
          <Link href={`/stock/${tx.symbol}`} className="font-medium hover:underline">
            {tx.symbol}
          </Link>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      cell: (tx: any) => (
          <Badge variant={tx.type === "buy" ? "default" : "secondary"}>{tx.type === "buy" ? "Buy" : "Sell"}</Badge>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      sortable: true,
      cell: (tx: any) => <div className="text-right">{tx.quantity}</div>,
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      cell: (tx: any) => <div className="text-right">${tx.price.toFixed(2)}</div>,
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      cell: (tx: any) => <div className="text-right font-medium">${(tx.quantity * tx.price).toFixed(2)}</div>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (tx: any) => (
          <div className="text-right">
            <Badge variant={tx.status === "completed" ? "outline" : "secondary"}>
              {tx.status === "completed" ? "Completed" : "Pending"}
            </Badge>
          </div>
      ),
    },
  ]

  return (
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all your trading activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-0">
                  <DataTable
                      data={filteredTransactions}
                      columns={columns}
                      defaultSortKey="timestamp"
                      defaultSortDir="desc"
                      searchPlaceholder="Search transactions..."
                      renderEmpty={() => <div>No transactions found for the selected filter.</div>}
                  />
                </TabsContent>
                <TabsContent value="pending" className="mt-0">
                  <DataTable
                      data={filteredTransactions}
                      columns={columns}
                      defaultSortKey="timestamp"
                      defaultSortDir="desc"
                      searchPlaceholder="Search pending transactions..."
                      renderEmpty={() => <div>No pending transactions found.</div>}
                  />
                </TabsContent>
                <TabsContent value="completed" className="mt-0">
                  <DataTable
                      data={filteredTransactions}
                      columns={columns}
                      defaultSortKey="timestamp"
                      defaultSortDir="desc"
                      searchPlaceholder="Search completed transactions..."
                      renderEmpty={() => <div>No completed transactions found.</div>}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
  )
}
