"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, ArrowUp, ArrowDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Mock stock data for search
const stocksData = [
  { symbol: "AAPL", name: "Apple Inc.", price: 182.52, change: 3.21 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 337.18, change: 2.87 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 129.96, change: -2.54 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 131.86, change: 2.12 },
  { symbol: "META", name: "Meta Platforms Inc.", price: 326.49, change: 1.98 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 177.67, change: -1.89 },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 433.45, change: -1.67 },
  { symbol: "AMD", name: "Advanced Micro Devices", price: 156.37, change: -1.45 },
  { symbol: "NFLX", name: "Netflix Inc.", price: 482.95, change: -2.34 },
  { symbol: "INTC", name: "Intel Corp.", price: 30.28, change: -1.23 },
  { symbol: "DIS", name: "Walt Disney Co.", price: 111.45, change: 0.87 },
  { symbol: "PYPL", name: "PayPal Holdings Inc.", price: 62.38, change: -0.45 },
  { symbol: "ADBE", name: "Adobe Inc.", price: 474.65, change: 1.23 },
  { symbol: "CSCO", name: "Cisco Systems Inc.", price: 48.92, change: 0.34 },
  { symbol: "CRM", name: "Salesforce Inc.", price: 273.8, change: 1.56 },
]

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<typeof stocksData>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [highlights, setHighlights] = useState<Record<string, "none" | "up" | "down">>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const prevPrices = useRef<Record<string, number>>({})

  // Initialize prices
  useEffect(() => {
    const initialPrices: Record<string, number> = {}
    stocksData.forEach((stock) => {
      initialPrices[stock.symbol] = stock.price
    })
    setPrices(initialPrices)
    prevPrices.current = initialPrices
  }, [])

  // Simulate WebSocket price updates
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * results.length)
      if (results.length === 0) return

      const symbol = results[randomIndex].symbol
      const currentPrice = prices[symbol] || results[randomIndex].price
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
    }, 2000)

    return () => clearInterval(interval)
  }, [isOpen, results, prices])

  // Search function
  useEffect(() => {
    if (query.trim() === "") {
      setResults([])
      return
    }

    const filteredResults = stocksData
      .filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 6) // Limit to 6 results

    setResults(filteredResults)
    setSelectedIndex(-1) // Reset selection when results change
  }, [query])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelectStock(results[selectedIndex].symbol)
        }
        break
      case "Escape":
        e.preventDefault()
        setIsOpen(false)
        break
    }
  }

  const handleSelectStock = (symbol: string) => {
    router.push(`/stock/${symbol}`)
    setQuery("")
    setIsOpen(false)
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search stocks by name or symbol..."
          className="w-full pl-8 pr-8"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(e.target.value.trim() !== "")
          }}
          onFocus={() => {
            if (query.trim() !== "") setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full rounded-l-none"
            onClick={() => {
              setQuery("")
              setIsOpen(false)
              inputRef.current?.focus()
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={resultsRef}
            className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((stock, index) => {
                  const currentPrice = prices[stock.symbol] || stock.price
                  const highlight = highlights[stock.symbol] || "none"

                  return (
                    <div
                      key={stock.symbol}
                      className={cn(
                        "flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted",
                        selectedIndex === index && "bg-muted",
                      )}
                      onClick={() => handleSelectStock(stock.symbol)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{stock.symbol}</span>
                        <span className="text-sm text-muted-foreground">{stock.name}</span>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "font-medium transition-colors",
                            highlight === "up" && "text-green-500",
                            highlight === "down" && "text-red-500",
                          )}
                        >
                          ${currentPrice.toFixed(2)}
                        </div>
                        <div className={cn("text-xs", stock.change >= 0 ? "text-green-500" : "text-red-500")}>
                          {stock.change >= 0 ? (
                            <span className="flex items-center justify-end">
                              <ArrowUp className="h-3 w-3 mr-1" />
                              {stock.change.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="flex items-center justify-end">
                              <ArrowDown className="h-3 w-3 mr-1" />
                              {Math.abs(stock.change).toFixed(2)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <p>No stocks found matching "{query}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

