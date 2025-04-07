"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Mock portfolio data
const initialPortfolio = [
  { symbol: "AAPL", name: "Apple Inc.", shares: 10, avgCost: 170.25, currentPrice: 182.52, change: 7.21 },
  { symbol: "MSFT", name: "Microsoft Corp.", shares: 5, avgCost: 320.1, currentPrice: 337.18, change: 5.33 },
  { symbol: "AMZN", name: "Amazon.com Inc.", shares: 8, avgCost: 135.5, currentPrice: 129.96, change: -4.09 },
  { symbol: "GOOGL", name: "Alphabet Inc.", shares: 3, avgCost: 125.75, currentPrice: 131.86, change: 4.86 },
  { symbol: "META", name: "Meta Platforms Inc.", shares: 4, avgCost: 310.2, currentPrice: 326.49, change: 5.25 },
  { symbol: "TSLA", name: "Tesla Inc.", shares: 6, avgCost: 190.3, currentPrice: 177.67, change: -6.64 },
  { symbol: "NFLX", name: "Netflix Inc.", shares: 2, avgCost: 450.15, currentPrice: 482.95, change: 7.29 },
]

type SortField = "symbol" | "shares" | "avgCost" | "currentPrice" | "change" | "value"
type SortDirection = "asc" | "desc"

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState(initialPortfolio)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [highlights, setHighlights] = useState<Record<string, "none" | "up" | "down">>({})
  const [sortField, setSortField] = useState<SortField>("value")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedPortfolio = [...portfolio].sort((a, b) => {
    let aValue, bValue

    switch (sortField) {
      case "symbol":
        aValue = a.symbol
        bValue = b.symbol
        break
      case "shares":
        aValue = a.shares
        bValue = b.shares
        break
      case "avgCost":
        aValue = a.avgCost
        bValue = b.avgCost
        break
      case "currentPrice":
        aValue = prices[a.symbol] || a.currentPrice
        bValue = prices[b.symbol] || b.currentPrice
        break
      case "change":
        const aCurrPrice = prices[a.symbol] || a.currentPrice
        const bCurrPrice = prices[b.symbol] || b.currentPrice
        aValue = (aCurrPrice / a.avgCost - 1) * 100
        bValue = (bCurrPrice / b.avgCost - 1) * 100
        break
      case "value":
        aValue = a.shares * (prices[a.symbol] || a.currentPrice)
        bValue = b.shares * (prices[b.symbol] || b.currentPrice)
        break
      default:
        aValue = a.symbol
        bValue = b.symbol
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">
                      <button className="flex items-center font-medium" onClick={() => handleSort("symbol")}>
                        Symbol
                        <ArrowUpDown
                          className={cn("ml-1 h-4 w-4", sortField === "symbol" ? "opacity-100" : "opacity-30")}
                        />
                      </button>
                    </th>
                    <th className="text-left py-3 px-4">
                      <button className="flex items-center font-medium" onClick={() => handleSort("shares")}>
                        Shares
                        <ArrowUpDown
                          className={cn("ml-1 h-4 w-4", sortField === "shares" ? "opacity-100" : "opacity-30")}
                        />
                      </button>
                    </th>
                    <th className="text-right py-3 px-4">
                      <button className="flex items-center font-medium ml-auto" onClick={() => handleSort("avgCost")}>
                        Avg. Cost
                        <ArrowUpDown
                          className={cn("ml-1 h-4 w-4", sortField === "avgCost" ? "opacity-100" : "opacity-30")}
                        />
                      </button>
                    </th>
                    <th className="text-right py-3 px-4">
                      <button
                        className="flex items-center font-medium ml-auto"
                        onClick={() => handleSort("currentPrice")}
                      >
                        Current Price
                        <ArrowUpDown
                          className={cn("ml-1 h-4 w-4", sortField === "currentPrice" ? "opacity-100" : "opacity-30")}
                        />
                      </button>
                    </th>
                    <th className="text-right py-3 px-4">
                      <button className="flex items-center font-medium ml-auto" onClick={() => handleSort("change")}>
                        Change
                        <ArrowUpDown
                          className={cn("ml-1 h-4 w-4", sortField === "change" ? "opacity-100" : "opacity-30")}
                        />
                      </button>
                    </th>
                    <th className="text-right py-3 px-4">
                      <button className="flex items-center font-medium ml-auto" onClick={() => handleSort("value")}>
                        Value
                        <ArrowUpDown
                          className={cn("ml-1 h-4 w-4", sortField === "value" ? "opacity-100" : "opacity-30")}
                        />
                      </button>
                    </th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPortfolio.map((stock) => {
                    const currentPrice = prices[stock.symbol] || stock.currentPrice
                    const changePercent = (currentPrice / stock.avgCost - 1) * 100
                    const value = stock.shares * currentPrice
                    const highlight = highlights[stock.symbol] || "none"

                    return (
                      <tr key={stock.symbol} className="border-b">
                        <td className="py-4 px-4">
                          <Link href={`/stock/${stock.symbol}`} className="font-medium hover:underline">
                            {stock.symbol}
                          </Link>
                          <div className="text-sm text-muted-foreground">{stock.name}</div>
                        </td>
                        <td className="py-4 px-4">{stock.shares}</td>
                        <td className="py-4 px-4 text-right">${stock.avgCost.toFixed(2)}</td>
                        <td
                          className={cn(
                            "py-4 px-4 text-right transition-colors",
                            highlight === "up" && "text-green-500",
                            highlight === "down" && "text-red-500",
                          )}
                        >
                          ${currentPrice.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Badge variant={changePercent >= 0 ? "default" : "destructive"}>
                            {changePercent >= 0 ? (
                              <ChevronUp className="h-3 w-3 mr-1" />
                            ) : (
                              <ChevronDown className="h-3 w-3 mr-1" />
                            )}
                            {Math.abs(changePercent).toFixed(2)}%
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right font-medium">${value.toFixed(2)}</td>
                        <td className="py-4 px-4 text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/stock/${stock.symbol}`}>Trade</Link>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

