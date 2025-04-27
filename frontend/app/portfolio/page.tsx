"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DataTable } from "@/components/ui/data-table"

// Mock portfolio data
const initialPortfolio = [
  { symbol: "AAPL", name: "Apple Inc.", shares: 10, avgCost: 170.25, currentPrice: 182.52, change: 7.21 },
  { symbol: "MSFT", name: "Microsoft Corp.", shares: 5, avgCost: 320.1, currentPrice: 337.18, change: 5.33 },
  { symbol: "AMZN", name: "Amazon.com Inc.", shares: 8, avgCost: 135.5, currentPrice: 129.96, change: -4.09 },
  { symbol: "GOOGL", name: "Alphabet Inc.", shares: 3, avgCost: 125.75, currentPrice: 131.86, change: 4.86 },
  { symbol: "META", name: "Meta Platforms Inc.", shares: 4, avgCost: 310.2, currentPrice: 326.49, change: 5.25 },
  { symbol: "TSLA", name: "Tesla Inc.", shares: 6, avgCost: 190.3, currentPrice: 177.67, change: -6.64 },
  { symbol: "NFLX", name: "Netflix Inc.", shares: 2, avgCost: 450.15, currentPrice: 482.95, change: 7.29 },
  { symbol: "NVDA", name: "NVIDIA Corp.", shares: 7, avgCost: 410.25, currentPrice: 433.45, change: 5.65 },
  { symbol: "AMD", name: "Advanced Micro Devices", shares: 12, avgCost: 145.3, currentPrice: 156.37, change: 7.62 },
  { symbol: "INTC", name: "Intel Corp.", shares: 15, avgCost: 32.4, currentPrice: 30.28, change: -6.54 },
  { symbol: "PYPL", name: "PayPal Holdings Inc.", shares: 8, avgCost: 65.75, currentPrice: 62.38, change: -5.13 },
  { symbol: "CSCO", name: "Cisco Systems Inc.", shares: 10, avgCost: 47.2, currentPrice: 48.92, change: 3.64 },
  { symbol: "CRM", name: "Salesforce Inc.", shares: 3, avgCost: 260.15, currentPrice: 273.8, change: 5.25 },
  { symbol: "ADBE", name: "Adobe Inc.", shares: 2, avgCost: 450.3, currentPrice: 474.65, change: 5.41 },
  { symbol: "ORCL", name: "Oracle Corp.", shares: 6, avgCost: 115.45, currentPrice: 120.8, change: 4.63 },
  { symbol: "IBM", name: "IBM Corp.", shares: 4, avgCost: 145.2, currentPrice: 152.3, change: 4.89 },
  { symbol: "QCOM", name: "Qualcomm Inc.", shares: 5, avgCost: 135.6, currentPrice: 142.75, change: 5.27 },
  { symbol: "TXN", name: "Texas Instruments", shares: 7, avgCost: 165.3, currentPrice: 172.4, change: 4.29 },
  { symbol: "MU", name: "Micron Technology", shares: 9, avgCost: 72.45, currentPrice: 76.8, change: 6.0 },
  { symbol: "AMAT", name: "Applied Materials", shares: 6, avgCost: 145.7, currentPrice: 152.9, change: 4.94 },
  { symbol: "LRCX", name: "Lam Research", shares: 2, avgCost: 625.4, currentPrice: 652.3, change: 4.3 },
  { symbol: "AVGO", name: "Broadcom Inc.", shares: 3, avgCost: 830.25, currentPrice: 865.4, change: 4.23 },
  { symbol: "INTU", name: "Intuit Inc.", shares: 2, avgCost: 510.3, currentPrice: 535.75, change: 4.99 },
  { symbol: "NOW", name: "ServiceNow Inc.", shares: 1, avgCost: 680.45, currentPrice: 710.2, change: 4.37 },
  { symbol: "WDAY", name: "Workday Inc.", shares: 3, avgCost: 245.3, currentPrice: 258.65, change: 5.44 },
  { symbol: "ZM", name: "Zoom Video", shares: 4, avgCost: 72.4, currentPrice: 68.35, change: -5.59 },
  { symbol: "TEAM", name: "Atlassian Corp.", shares: 2, avgCost: 195.6, currentPrice: 205.4, change: 5.01 },
  { symbol: "OKTA", name: "Okta Inc.", shares: 3, avgCost: 85.3, currentPrice: 89.75, change: 5.22 },
  { symbol: "DDOG", name: "Datadog Inc.", shares: 5, avgCost: 115.4, currentPrice: 121.3, change: 5.11 },
  { symbol: "NET", name: "Cloudflare Inc.", shares: 7, avgCost: 72.35, currentPrice: 76.5, change: 5.74 },
]

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState(initialPortfolio)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [highlights, setHighlights] = useState<Record<string, "none" | "up" | "down">>({})
  const prevPrices = useRef<Record<string, number>>({})

  // Initialize prices
  useEffect(() => {
    const initialPrices: Record<string, number> = {}
    portfolio.forEach((stock) => {
      initialPrices[stock.symbol] = stock.currentPrice
    })
    setPrices(initialPrices)
    prevPrices.current = initialPrices
  }, [])

  // Simulate WebSocket price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * portfolio.length)
      const symbol = portfolio[randomIndex].symbol
      const currentPrice = prices[symbol] || portfolio[randomIndex].currentPrice
      const change = currentPrice * (Math.random() * 0.01 - 0.005) // -0.5% to +0.5%
      const newPrice = Number.parseFloat((currentPrice + change).toFixed(2))

      setPrices((prev) => {
        const newPrices = { ...prev, [symbol]: newPrice }
        return newPrices
      })

      setHighlights((prev) => {
        const direction = newPrice > (prevPrices.current[symbol] || currentPrice) ? "up" : "down"
        const newHighlights = { ...prev, [symbol]: direction }

        // Clear previous highlight after animation
        setTimeout(() => {
          setHighlights((current) => ({ ...current, [symbol]: "none" }))
        }, 1000)

        return newHighlights
      })

      prevPrices.current = { ...prevPrices.current, [symbol]: newPrice }
    }, 3000)

    return () => clearInterval(interval)
  }, [portfolio, prices])

  const calculateTotalValue = () => {
    return portfolio.reduce((total, stock) => {
      const currentPrice = prices[stock.symbol] || stock.currentPrice
      return total + stock.shares * currentPrice
    }, 0)
  }

  const calculateTotalCost = () => {
    return portfolio.reduce((total, stock) => {
      return total + stock.shares * stock.avgCost
    }, 0)
  }

  const calculateTotalGain = () => {
    const totalValue = calculateTotalValue()
    const totalCost = calculateTotalCost()
    return totalValue - totalCost
  }

  const calculateTotalGainPercent = () => {
    const totalValue = calculateTotalValue()
    const totalCost = calculateTotalCost()
    return (totalValue / totalCost - 1) * 100
  }

  // Define columns for the data table
  const columns = [
    {
      key: "symbol",
      header: "Symbol",
      sortable: true,
      cell: (stock: any) => (
          <div>
            <Link href={`/stock/${stock.symbol}`} className="font-medium hover:underline">
              {stock.symbol}
            </Link>
            <div className="text-sm text-muted-foreground">{stock.name}</div>
          </div>
      ),
    },
    {
      key: "shares",
      header: "Shares",
      sortable: true,
      cell: (stock: any) => stock.shares,
    },
    {
      key: "avgCost",
      header: "Avg. Cost",
      sortable: true,
      cell: (stock: any) => <div className="text-right">${stock.avgCost.toFixed(2)}</div>,
    },
    {
      key: "currentPrice",
      header: "Current Price",
      sortable: true,
      cell: (stock: any) => {
        const currentPrice = prices[stock.symbol] || stock.currentPrice
        const highlight = highlights[stock.symbol] || "none"

        return (
            <div
                className={cn(
                    "text-right transition-colors",
                    highlight === "up" && "text-green-500",
                    highlight === "down" && "text-red-500",
                )}
            >
              ${currentPrice.toFixed(2)}
            </div>
        )
      },
    },
    {
      key: "change",
      header: "Change",
      sortable: true,
      cell: (stock: any) => {
        const currentPrice = prices[stock.symbol] || stock.currentPrice
        const changePercent = (currentPrice / stock.avgCost - 1) * 100

        return (
            <div className="text-right">
              <Badge variant={changePercent >= 0 ? "default" : "destructive"}>
                {changePercent >= 0 ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                {Math.abs(changePercent).toFixed(2)}%
              </Badge>
            </div>
        )
      },
    },
    {
      key: "value",
      header: "Value",
      sortable: true,
      cell: (stock: any) => {
        const currentPrice = prices[stock.symbol] || stock.currentPrice
        const value = stock.shares * currentPrice
        return <div className="text-right font-medium">${value.toFixed(2)}</div>
      },
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      cell: (stock: any) => (
          <div className="text-right">
            <Button asChild variant="outline" size="sm">
              <Link href={`/stock/${stock.symbol}`}>Trade</Link>
            </Button>
          </div>
      ),
    },
  ]

  return (
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Portfolio Summary</CardTitle>
              <CardDescription>Your investment overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                  <div className="text-2xl font-bold">${calculateTotalValue().toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Cost</div>
                  <div className="text-2xl font-bold">${calculateTotalCost().toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Gain/Loss</div>
                  <div
                      className={cn("text-2xl font-bold", calculateTotalGain() >= 0 ? "text-green-500" : "text-red-500")}
                  >
                    ${calculateTotalGain().toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Return</div>
                  <div
                      className={cn(
                          "text-2xl font-bold",
                          calculateTotalGainPercent() >= 0 ? "text-green-500" : "text-red-500",
                      )}
                  >
                    {calculateTotalGainPercent() >= 0 ? "+" : ""}
                    {calculateTotalGainPercent().toFixed(2)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Holdings</CardTitle>
              <CardDescription>All stocks in your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                  data={portfolio}
                  columns={columns}
                  defaultSortKey="value"
                  defaultSortDir="desc"
                  searchPlaceholder="Search by symbol or name..."
                  renderEmpty={() => <div>No holdings found. Start trading to build your portfolio!</div>}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
  )
}
