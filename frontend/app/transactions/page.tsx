"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Mock transaction data
const transactions = [
  {
    id: "tx-001",
    symbol: "AAPL",
    type: "buy",
    quantity: 5,
    price: 175.25,
    timestamp: "2023-04-05T14:30:00Z",
    status: "completed",
  },
  {
    id: "tx-002",
    symbol: "MSFT",
    type: "buy",
    quantity: 3,
    price: 325.1,
    timestamp: "2023-04-05T15:45:00Z",
    status: "completed",
  },
  {
    id: "tx-003",
    symbol: "AAPL",
    type: "buy",
    quantity: 5,
    price: 178.5,
    timestamp: "2023-04-06T10:15:00Z",
    status: "completed",
  },
  {
    id: "tx-004",
    symbol: "AMZN",
    type: "buy",
    quantity: 8,
    price: 135.5,
    timestamp: "2023-04-07T09:30:00Z",
    status: "completed",
  },
  {
    id: "tx-005",
    symbol: "GOOGL",
    type: "buy",
    quantity: 3,
    price: 125.75,
    timestamp: "2023-04-10T11:20:00Z",
    status: "completed",
  },
  {
    id: "tx-006",
    symbol: "MSFT",
    type: "buy",
    quantity: 2,
    price: 312.6,
    timestamp: "2023-04-12T13:45:00Z",
    status: "completed",
  },
  {
    id: "tx-007",
    symbol: "META",
    type: "buy",
    quantity: 4,
    price: 310.2,
    timestamp: "2023-04-15T10:05:00Z",
    status: "completed",
  },
  {
    id: "tx-008",
    symbol: "TSLA",
    type: "buy",
    quantity: 6,
    price: 190.3,
    timestamp: "2023-04-18T14:25:00Z",
    status: "completed",
  },
  {
    id: "tx-009",
    symbol: "NFLX",
    type: "buy",
    quantity: 2,
    price: 450.15,
    timestamp: "2023-04-20T15:30:00Z",
    status: "completed",
  },
  {
    id: "tx-010",
    symbol: "TSLA",
    type: "sell",
    quantity: 2,
    price: 177.67,
    timestamp: "2023-04-25T09:45:00Z",
    status: "pending",
  },
]

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState("all")

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === "all") return true
    if (activeTab === "pending") return tx.status === "pending"
    if (activeTab === "completed") return tx.status === "completed"
    return true
  })

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
                <TransactionTable transactions={filteredTransactions} />
              </TabsContent>
              <TabsContent value="pending" className="mt-0">
                <TransactionTable transactions={filteredTransactions} />
              </TabsContent>
              <TabsContent value="completed" className="mt-0">
                <TransactionTable transactions={filteredTransactions} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function TransactionTable({ transactions }: { transactions: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Date</th>
            <th className="text-left py-3 px-4">Symbol</th>
            <th className="text-left py-3 px-4">Type</th>
            <th className="text-right py-3 px-4">Quantity</th>
            <th className="text-right py-3 px-4">Price</th>
            <th className="text-right py-3 px-4">Total</th>
            <th className="text-right py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-muted-foreground">
                No transactions found
              </td>
            </tr>
          ) : (
            transactions.map((tx, index) => (
              <motion.tr
                key={tx.id}
                className="border-b"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className="py-4 px-4">
                  {new Date(tx.timestamp).toLocaleDateString()}
                  <div className="text-sm text-muted-foreground">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                </td>
                <td className="py-4 px-4">
                  <Link href={`/stock/${tx.symbol}`} className="font-medium hover:underline">
                    {tx.symbol}
                  </Link>
                </td>
                <td className="py-4 px-4">
                  <Badge variant={tx.type === "buy" ? "default" : "secondary"}>
                    {tx.type === "buy" ? "Buy" : "Sell"}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-right">{tx.quantity}</td>
                <td className="py-4 px-4 text-right">${tx.price.toFixed(2)}</td>
                <td className="py-4 px-4 text-right font-medium">${(tx.quantity * tx.price).toFixed(2)}</td>
                <td className="py-4 px-4 text-right">
                  <Badge variant={tx.status === "completed" ? "outline" : "secondary"}>
                    {tx.status === "completed" ? "Completed" : "Pending"}
                  </Badge>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

