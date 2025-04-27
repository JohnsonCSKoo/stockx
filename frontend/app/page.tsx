"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {getDashboardStockUpdates} from "@/api/stockApi";

// Mock data
const topGainers = [
  { symbol: "AAPL", name: "Apple Inc.", price: 182.52, change: 3.21 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 337.18, change: 2.87 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 129.96, change: 2.54 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 131.86, change: 2.12 },
  { symbol: "META", name: "Meta Platforms Inc.", price: 326.49, change: 1.98 },
]

const topLosers = [
  { symbol: "NFLX", name: "Netflix Inc.", price: 482.95, change: -2.34 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 177.67, change: -1.89 },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 433.45, change: -1.67 },
  { symbol: "AMD", name: "Advanced Micro Devices", price: 156.37, change: -1.45 },
  { symbol: "INTC", name: "Intel Corp.", price: 30.28, change: -1.23 },
]

const indexes = [
  { symbol: "SPX:IND", name: "S&P 500", price: 5021.84, change: 0.57 },
  { symbol: "IXIC:IND", name: "Nasdaq Composite", price: 17714.1, change: 0.82 },
  { symbol: "DJIA:IND", name: "Dow Jones", price: 38671.69, change: 0.32 },
  { symbol: "RUT:IND", name: "Russell 2000", price: 1964.36, change: -0.21 },
  { symbol: "VIX:IND", name: "CBOE Volatility Index", price: 14.3, change: -3.51 },
]

const portfolio = [
  { symbol: "AAPL", shares: 10, avgCost: 170.25, currentPrice: 182.52, change: 7.21 },
  { symbol: "MSFT", shares: 5, avgCost: 320.1, currentPrice: 337.18, change: 5.33 },
  { symbol: "AMZN", shares: 8, avgCost: 135.5, currentPrice: 129.96, change: -4.09 },
]

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [dashboardData, setDashboardData] = useState<any>({});

  useEffect(() => {
    getDashboardStockUpdates("Connecting to WebSocket...", data => {
      setDashboardData(data);
      console.log(dashboardData);
    });
  }, []);

  // // Simulate WebSocket price updates
  // useEffect(() => {
  //   if (isLoading) return
  //
  //   const symbols = [...topGainers, ...topLosers, ...indexes].map((stock) => stock.symbol)
  //   const initialPrices: Record<string, number> = {}
  //   symbols.forEach((symbol) => {
  //     const stock = [...topGainers, ...topLosers, ...indexes].find((s) => s.symbol === symbol)
  //     if (stock) initialPrices[symbol] = stock.price
  //   })
  //   setPrices(initialPrices)
  //
  //   const interval = setInterval(() => {
  //     setPrices((prev) => {
  //       const newPrices = { ...prev }
  //       const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
  //       const currentPrice = newPrices[randomSymbol] || 100
  //       const change = currentPrice * (Math.random() * 0.01 - 0.005) // -0.5% to +0.5%
  //       newPrices[randomSymbol] = Number.parseFloat((currentPrice + change).toFixed(2))
  //       return newPrices
  //     })
  //   }, 2000)
  //
  //   return () => clearInterval(interval)
  // }, [isLoading])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ArrowUp className="h-5 w-5 mr-2 text-green-500" />
                Top Gainers
              </CardTitle>
              <CardDescription>Stocks with highest % gain today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading
                  ? Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <div className="text-right space-y-2">
                            <Skeleton className="h-4 w-16 ml-auto" />
                            <Skeleton className="h-3 w-12 ml-auto" />
                          </div>
                        </div>
                      ))
                  : topGainers.map((stock) => (
                      <StockItem key={stock.symbol} stock={stock} price={prices[stock.symbol] || stock.price} />
                    ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <ArrowDown className="h-5 w-5 mr-2 text-red-500" />
                Top Losers
              </CardTitle>
              <CardDescription>Stocks with highest % loss today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading
                  ? Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <div className="text-right space-y-2">
                            <Skeleton className="h-4 w-16 ml-auto" />
                            <Skeleton className="h-3 w-12 ml-auto" />
                          </div>
                        </div>
                      ))
                  : topLosers.map((stock) => (
                      <StockItem key={stock.symbol} stock={stock} price={prices[stock.symbol] || stock.price} />
                    ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {isLoggedIn && (
          <motion.div variants={item}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Portfolio Summary</CardTitle>
                <CardDescription>Your current holdings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground">Total Balance</div>
                  <div className="text-2xl font-bold">$10,245.67</div>
                </div>
                <div className="space-y-4">
                  {portfolio.map((item) => (
                    <div key={item.symbol} className="flex justify-between items-center">
                      <div>
                        <Link href={`/stock/${item.symbol}`} className="font-medium hover:underline">
                          {item.symbol}
                        </Link>
                        <div className="text-sm text-muted-foreground">{item.shares} shares</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${item.currentPrice.toFixed(2)}</div>
                        <div className={cn("text-sm", item.change > 0 ? "text-green-500" : "text-red-500")}>
                          {item.change > 0 ? "+" : ""}
                          {item.change.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <Link href="/portfolio" className="text-sm text-primary flex items-center justify-end">
                    View full portfolio
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        variants={item}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Popular Indexes</CardTitle>
            <CardDescription>Major market indexes</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-4 p-1">
                {isLoading
                  ? Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="w-[250px]">
                          <Card>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-3 w-12" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))
                  : indexes.map((index) => (
                      <IndexCard key={index.symbol} index={index} price={prices[index.symbol] || index.price} />
                    ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function StockItem({ stock, price }: { stock: any; price: number }) {
  const [prevPrice, setPrevPrice] = useState(price)
  const [highlight, setHighlight] = useState<"none" | "up" | "down">("none")

  useEffect(() => {
    if (price !== prevPrice) {
      setHighlight(price > prevPrice ? "up" : "down")
      const timer = setTimeout(() => setHighlight("none"), 1000)
      setPrevPrice(price)
      return () => clearTimeout(timer)
    }
  }, [price, prevPrice])

  return (
    <Link
      href={`/stock/${stock.symbol}`}
      className="flex justify-between items-center hover:bg-muted/50 p-2 rounded-md transition-colors"
    >
      <div>
        <div className="font-medium">{stock.symbol}</div>
        <div className="text-sm text-muted-foreground">{stock.name}</div>
      </div>
      <div className="text-right">
        <div
          className={cn(
            "font-medium transition-colors",
            highlight === "up" && "text-green-500",
            highlight === "down" && "text-red-500",
          )}
        >
          ${price.toFixed(2)}
        </div>
        <div className={cn("text-sm", stock.change > 0 ? "text-green-500" : "text-red-500")}>
          {stock.change > 0 ? "+" : ""}
          {stock.change.toFixed(2)}%
        </div>
      </div>
    </Link>
  )
}

function IndexCard({ index, price }: { index: any; price: number }) {
  const [prevPrice, setPrevPrice] = useState(price)
  const [highlight, setHighlight] = useState<"none" | "up" | "down">("none")

  useEffect(() => {
    if (price !== prevPrice) {
      setHighlight(price > prevPrice ? "up" : "down")
      const timer = setTimeout(() => setHighlight("none"), 1000)
      setPrevPrice(price)
      return () => clearTimeout(timer)
    }
  }, [price, prevPrice])

  return (
    <div className="w-[250px]">
      <Card>
        <CardContent className="p-4">
          <div className="font-medium">{index.name}</div>
          <div
            className={cn(
              "text-2xl font-bold my-1 transition-colors",
              highlight === "up" && "text-green-500",
              highlight === "down" && "text-red-500",
            )}
          >
            {price.toFixed(2)}
          </div>
          <Badge variant={index.change >= 0 ? "default" : "destructive"} className="mt-1">
            {index.change >= 0 ? "+" : ""}
            {index.change.toFixed(2)}%
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}

