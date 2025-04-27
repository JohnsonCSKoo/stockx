"use client"

import type React from "react";
import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import {AnimatePresence, motion} from "framer-motion";
import {ArrowDown, ArrowUp, BarChart2, ChevronRight, LineChart, X} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Separator} from "@/components/ui/separator";
import {cn} from "@/lib/utils";
import StockChart from "@/components/stock-chart";
import {OrderDirection, OrderRequest, OrderType} from "@/@types/order";
import {placeOrder} from "@/api/tradeApi";

// Mock data for the stock
const stockData = {
  AAPL: {
    name: "Apple Inc.",
    price: 182.52,
    change: 3.21,
    volume: "45.3M",
    marketCap: "2.87T",
    weekRange: "124.17 - 199.62",
    owned: 10,
    avgCost: 170.25,
  },
  MSFT: {
    name: "Microsoft Corp.",
    price: 337.18,
    change: 2.87,
    volume: "22.1M",
    marketCap: "2.51T",
    weekRange: "245.61 - 366.78",
    owned: 5,
    avgCost: 320.1,
  },
  AMZN: {
    name: "Amazon.com Inc.",
    price: 129.96,
    change: -2.54,
    volume: "31.7M",
    marketCap: "1.34T",
    weekRange: "101.15 - 145.86",
    owned: 8,
    avgCost: 135.5,
  },
  GOOGL: {
    name: "Alphabet Inc.",
    price: 131.86,
    change: 2.12,
    volume: "18.9M",
    marketCap: "1.67T",
    weekRange: "102.21 - 142.38",
    owned: 0,
    avgCost: 0,
  },
  META: {
    name: "Meta Platforms Inc.",
    price: 326.49,
    change: 1.98,
    volume: "15.2M",
    marketCap: "837.5B",
    weekRange: "197.90 - 342.92",
    owned: 0,
    avgCost: 0,
  },
}

export default function StockPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const [stock, setStock] = useState<any>(null)
  const [price, setPrice] = useState(0)
  const [prevPrice, setPrevPrice] = useState(0)
  const [highlight, setHighlight] = useState<"none" | "up" | "down">("none")
  const [showTrade, setShowTrade] = useState(false)
  const [tradeType, setTradeType] = useState<OrderDirection>(OrderDirection.BUY)
  const [timeframe, setTimeframe] = useState("1d")
  const [chartType, setChartType] = useState<"line" | "candle">("line")

  useEffect(() => {
    // Get stock data based on symbol
    if (symbol && stockData[symbol as keyof typeof stockData]) {
      const data = stockData[symbol as keyof typeof stockData]
      setStock(data)
      setPrice(data.price)
      setPrevPrice(data.price)
    }
  }, [symbol])

  // Simulate WebSocket price updates
  useEffect(() => {
    if (!stock) return

    const interval = setInterval(() => {
      const change = price * (Math.random() * 0.01 - 0.005) // -0.5% to +0.5%
      const newPrice = Number.parseFloat((price + change).toFixed(2))
      setPrice(newPrice)
    }, 3000)

    return () => clearInterval(interval)
  }, [stock, price])

  useEffect(() => {
    if (price !== prevPrice) {
      setHighlight(price > prevPrice ? "up" : "down")
      const timer = setTimeout(() => setHighlight("none"), 1000)
      setPrevPrice(price)
      return () => clearTimeout(timer)
    }
  }, [price, prevPrice])

  if (!stock) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Stock not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold">{symbol}</h1>
            <span className="text-lg text-muted-foreground">{stock.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={cn(
                "text-4xl font-bold transition-colors",
                highlight === "up" && "text-green-500",
                highlight === "down" && "text-red-500",
              )}
            >
              ${price.toFixed(2)}
            </span>
            <span className={cn("flex items-center text-lg", stock.change > 0 ? "text-green-500" : "text-red-500")}>
              {stock.change > 0 ? <ArrowUp className="h-5 w-5 mr-1" /> : <ArrowDown className="h-5 w-5 mr-1" />}
              {Math.abs(stock.change).toFixed(2)}% {timeframe === "1d" ? "today" : `(${timeframe})`}
            </span>
          </div>

          <div className="flex gap-6 mt-2 text-sm text-muted-foreground">
            <div>
              <span className="mr-1">Volume:</span>
              <span className="font-medium">{stock.volume}</span>
            </div>
            <div>
              <span className="mr-1">Market Cap:</span>
              <span className="font-medium">{stock.marketCap}</span>
            </div>
            <div>
              <span className="mr-1">52-Week Range:</span>
              <span className="font-medium">{stock.weekRange}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex justify-between items-center">
                <div className="flex gap-1">
                  <Button
                    variant={timeframe === "1m" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimeframe("1m")}
                  >
                    1m
                  </Button>
                  <Button
                    variant={timeframe === "1h" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimeframe("1h")}
                  >
                    1h
                  </Button>
                  <Button
                    variant={timeframe === "1d" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimeframe("1d")}
                  >
                    1d
                  </Button>
                  <Button
                    variant={timeframe === "1w" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimeframe("1w")}
                  >
                    1w
                  </Button>
                  <Button
                    variant={timeframe === "1mo" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimeframe("1mo")}
                  >
                    1mo
                  </Button>
                  <Button
                    variant={timeframe === "6mo" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimeframe("6mo")}
                  >
                    6mo
                  </Button>
                  <Button
                    variant={timeframe === "1y" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimeframe("1y")}
                  >
                    1y
                  </Button>
                </div>
                <div className="flex gap-1 border rounded-md">
                  <Button
                    variant={chartType === "line" ? "ghost" : "ghost"}
                    size="sm"
                    className={cn("rounded-r-none border-r", chartType === "line" && "bg-muted")}
                    onClick={() => setChartType("line")}
                  >
                    <LineChart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === "candle" ? "ghost" : "ghost"}
                    size="sm"
                    className={cn("rounded-l-none", chartType === "candle" && "bg-muted")}
                    onClick={() => setChartType("candle")}
                  >
                    <BarChart2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="px-4 pb-4">
                <StockChart
                  symbol={symbol as string}
                  timeframe={timeframe}
                  chartType={chartType}
                  price={price}
                  change={stock.change}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">About {symbol}</h3>
              <p className="text-muted-foreground">
                {symbol === "AAPL" &&
                  "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and wearables, home, and accessories."}
                {symbol === "MSFT" &&
                  "Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company operates through Productivity and Business Processes, Intelligent Cloud, and More Personal Computing segments."}
                {symbol === "AMZN" &&
                  "Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions through online and physical stores in North America and internationally. It operates through e-commerce, AWS, and advertising segments."}
                {symbol === "GOOGL" &&
                  "Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments."}
                {symbol === "META" &&
                  "Meta Platforms, Inc. engages in the development of products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide."}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Trade</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setTradeType(OrderDirection.BUY)
                      setShowTrade(true)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Buy
                  </Button>
                  <Button
                    onClick={() => {
                      setTradeType(OrderDirection.SELL)
                      setShowTrade(true)
                    }}
                    variant="destructive"
                    disabled={stock.owned === 0}
                  >
                    Sell
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Current Price</div>
                  <div className="text-lg font-bold">${price.toFixed(2)}</div>
                </div>
                <Separator />
                {stock.owned > 0 ? (
                  <>
                    <div>
                      <div className="text-sm text-muted-foreground">Shares Owned</div>
                      <div className="text-lg font-bold">{stock.owned}</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">Average Cost</div>
                      <div className="text-lg font-bold">${stock.avgCost.toFixed(2)}</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">Total Value</div>
                      <div className="text-lg font-bold">${(stock.owned * price).toFixed(2)}</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground">Profit/Loss</div>
                      <div
                        className={cn("text-lg font-bold", price > stock.avgCost ? "text-green-500" : "text-red-500")}
                      >
                        ${(stock.owned * (price - stock.avgCost)).toFixed(2)}(
                        {((price / stock.avgCost - 1) * 100).toFixed(2)}%)
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">You don't own any shares of this stock.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Recent News</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-3">
                  <h4 className="font-medium">{symbol} Reports Q2 Earnings</h4>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
                <div className="border-l-4 border-primary pl-3">
                  <h4 className="font-medium">Analysts Upgrade {symbol} to "Buy"</h4>
                  <p className="text-sm text-muted-foreground">5 days ago</p>
                </div>
                <div className="border-l-4 border-primary pl-3">
                  <h4 className="font-medium">{symbol} Announces New Product Line</h4>
                  <p className="text-sm text-muted-foreground">1 week ago</p>
                </div>
                <div className="text-sm text-primary flex items-center mt-2">
                  <span>View all news</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AnimatePresence>
        {showTrade && (
          <TradePanel
            symbol={symbol as string}
            price={price}
            type={tradeType}
            owned={stock.owned}
            onClose={() => setShowTrade(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function TradePanel({
  symbol,
  price,
  type,
  owned,
  onClose,
}: {
  symbol: string
  price: number
  type: OrderDirection
  owned: number
  onClose: () => void
}) {
  const [quantity, setQuantity] = useState(type === OrderDirection.SELL ? owned : 1)
  const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET)
  const [limitPrice, setLimitPrice] = useState<number>(price)

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (isNaN(value) || value < 1) {
      setQuantity(1)
    } else if (type === OrderDirection.SELL && value > owned) {
      setQuantity(owned)
    } else {
      setQuantity(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would handle the trade submission
    console.log(symbol, quantity, orderType, limitPrice);
    const orderRequest: OrderRequest = {
      symbol: symbol,
      quantity: quantity,
      limitPrice: limitPrice,
      direction: type,
      type: orderType
    };

    await placeOrder(orderRequest)
        .then(response => {
      console.log(response);
    }).catch(error => console.error(error));

    // alert(
    //   `${type === OrderDirection.BUY ? "Bought" : "Sold"} ${quantity} shares of ${symbol} at $${orderType === OrderType.MARKET ? price.toFixed(2) : limitPrice}`,
    // )
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md bg-background shadow-lg h-full overflow-auto"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {type === OrderDirection.BUY ? "Buy" : "Sell"} {symbol}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-price">Current Price</Label>
              <Input id="current-price" value={`$${price.toFixed(2)}`} disabled />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="quantity">Quantity</Label>
                {type === OrderDirection.SELL && (
                  <button type="button" className="text-sm text-primary" onClick={() => setQuantity(owned)}>
                    Sell All ({owned})
                  </button>
                )}
              </div>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={type === OrderDirection.SELL ? owned : undefined}
                value={quantity}
                onChange={handleQuantityChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Order Type</Label>
              <RadioGroup defaultValue={OrderType.MARKET} value={orderType} onValueChange={setOrderType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={OrderType.MARKET} id="market" />
                  <Label htmlFor="market">Market Order</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={OrderType.LIMIT} id="limit" />
                  <Label htmlFor="limit">Limit Order</Label>
                </div>
              </RadioGroup>
            </div>

            {orderType === OrderType.LIMIT && (
              <div className="space-y-2">
                <Label htmlFor="limit-price">Limit Price</Label>
                <Input id="limit-price" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} />
              </div>
            )}

            <div className="space-y-2">
              <Label>Order Summary</Label>
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between py-1">
                    <span>Shares</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Price</span>
                    <span>${orderType === OrderType.MARKET ? price.toFixed(2) : limitPrice}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between py-1 font-bold">
                    <span>Total</span>
                    <span>
                      ${(quantity * (orderType === OrderType.MARKET ? price : Number.parseFloat(limitPrice))).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button
              type="submit"
              className={cn(
                "w-full",
                type === OrderDirection.BUY ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700",
              )}
            >
              Confirm {type === OrderDirection.BUY ? "Purchase" : "Sale"}
            </Button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

