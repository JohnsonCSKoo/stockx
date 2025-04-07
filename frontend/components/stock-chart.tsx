"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"

interface StockChartProps {
  symbol: string
  timeframe: string
  chartType: "line" | "candle"
  price: number
  change: number
}

// Generate mock data for the chart
const generateChartData = (timeframe: string, currentPrice: number, priceChange: number) => {
  const now = new Date()
  const data: { time: Date; price: number }[] = []

  // Determine number of data points and interval based on timeframe
  let dataPoints = 0
  let intervalMinutes = 0

  switch (timeframe) {
    case "1m":
      dataPoints = 60
      intervalMinutes = 1
      break
    case "1h":
      dataPoints = 60
      intervalMinutes = 1
      break
    case "1d":
      dataPoints = 24 * 6 // Every 10 minutes
      intervalMinutes = 10
      break
    case "1w":
      dataPoints = 7 * 24 // Hourly for a week
      intervalMinutes = 60
      break
    case "1mo":
      dataPoints = 30 // Daily for a month
      intervalMinutes = 60 * 24
      break
    case "6mo":
      dataPoints = 180 // Daily for 6 months
      intervalMinutes = 60 * 24
      break
    case "1y":
      dataPoints = 365 // Daily for a year
      intervalMinutes = 60 * 24
      break
    default:
      dataPoints = 24 * 6
      intervalMinutes = 10
  }

  // Start price (work backwards from current price)
  const startPrice = currentPrice - priceChange

  // Generate data points
  for (let i = 0; i < dataPoints; i++) {
    const time = new Date(now.getTime() - (dataPoints - i) * intervalMinutes * 60 * 1000)

    // Create some randomness in the price movement
    // More volatile at the beginning, converging to the current price
    const progress = i / dataPoints
    const volatility = 1 - progress // Higher at the beginning
    const randomFactor = (Math.random() - 0.5) * volatility * 5

    // Linear interpolation from start price to current price with some randomness
    const price = startPrice + priceChange * progress + randomFactor

    data.push({ time, price: Math.max(0.01, price) }) // Ensure price is positive
  }

  // Ensure the last point is exactly the current price
  data.push({ time: now, price: currentPrice })

  return data
}

// Generate candlestick data
const generateCandlestickData = (timeframe: string, currentPrice: number, priceChange: number) => {
  const now = new Date()
  const data: {
    time: Date
    open: number
    high: number
    low: number
    close: number
  }[] = []

  // Determine number of data points and interval based on timeframe
  let dataPoints = 0
  let intervalMinutes = 0

  switch (timeframe) {
    case "1m":
      dataPoints = 60
      intervalMinutes = 1
      break
    case "1h":
      dataPoints = 60
      intervalMinutes = 1
      break
    case "1d":
      dataPoints = 24 // Hourly for a day
      intervalMinutes = 60
      break
    case "1w":
      dataPoints = 7 // Daily for a week
      intervalMinutes = 60 * 24
      break
    case "1mo":
      dataPoints = 30 // Daily for a month
      intervalMinutes = 60 * 24
      break
    case "6mo":
      dataPoints = 26 // Weekly for 6 months
      intervalMinutes = 60 * 24 * 7
      break
    case "1y":
      dataPoints = 52 // Weekly for a year
      intervalMinutes = 60 * 24 * 7
      break
    default:
      dataPoints = 24
      intervalMinutes = 60
  }

  // Start price (work backwards from current price)
  const startPrice = currentPrice - priceChange

  // Generate data points
  for (let i = 0; i < dataPoints; i++) {
    const time = new Date(now.getTime() - (dataPoints - i) * intervalMinutes * 60 * 1000)

    // Create some randomness in the price movement
    const progress = i / dataPoints
    const volatility = 1 - progress // Higher at the beginning
    const randomFactor = (Math.random() - 0.5) * volatility * 5

    // Linear interpolation from start price to current price with some randomness
    const basePrice = startPrice + priceChange * progress + randomFactor

    // Generate open, high, low, close
    const range = basePrice * 0.02 // 2% range for high-low
    const open = basePrice - range * (Math.random() * 0.5)
    const close = basePrice + range * (Math.random() * 0.5)
    const high = Math.max(open, close) + range * Math.random()
    const low = Math.min(open, close) - range * Math.random()

    data.push({
      time,
      open: Math.max(0.01, open),
      high: Math.max(0.01, high),
      low: Math.max(0.01, low),
      close: Math.max(0.01, close),
    })
  }

  // Ensure the last point closes at the current price
  const lastPoint = data[data.length - 1]
  data[data.length - 1] = {
    ...lastPoint,
    close: currentPrice,
    high: Math.max(lastPoint.high, currentPrice),
    low: Math.min(lastPoint.low, currentPrice),
  }

  return data
}

export default function StockChart({ symbol, timeframe, chartType, price, change }: StockChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [lineData, setLineData] = useState<{ time: Date; price: number }[]>([])
  const [candleData, setCandleData] = useState<
    { time: Date; open: number; high: number; low: number; close: number }[]
  >([])
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; price: number; time: Date } | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Generate chart data when timeframe or price changes
  useEffect(() => {
    setLineData(generateChartData(timeframe, price, change))
    setCandleData(generateCandlestickData(timeframe, price, change))
  }, [timeframe, price, change])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const parent = canvas.parentElement
        if (parent) {
          setDimensions({
            width: parent.clientWidth,
            height: 400,
          })
        }
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Draw chart
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = dimensions.width * window.devicePixelRatio
    canvas.height = dimensions.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)

    // Draw grid
    drawGrid(ctx, dimensions.width, dimensions.height)

    if (chartType === "line") {
      drawLineChart(ctx, lineData, dimensions.width, dimensions.height)
    } else {
      drawCandlestickChart(ctx, candleData, dimensions.width, dimensions.height)
    }
  }, [lineData, candleData, dimensions, chartType])

  // Handle mouse move for tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || lineData.length === 0) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Find closest data point
    const dataToUse = chartType === "line" ? lineData : candleData
    const xRatio = dimensions.width / (dataToUse.length - 1)
    const closestIndex = Math.min(Math.max(0, Math.round(x / xRatio)), dataToUse.length - 1)

    const point = dataToUse[closestIndex]
    const price = chartType === "line" ? (point as { price: number }).price : (point as { close: number }).close

    // Calculate y position
    const allPrices =
      chartType === "line"
        ? lineData.map((d) => d.price)
        : candleData.map((d) => d.high).concat(candleData.map((d) => d.low))

    const minPrice = Math.min(...allPrices)
    const maxPrice = Math.max(...allPrices)
    const priceRange = maxPrice - minPrice
    const padding = priceRange * 0.1

    const yRatio = dimensions.height / (maxPrice - minPrice + padding * 2)
    const yPos = dimensions.height - (price - minPrice + padding) * yRatio

    setHoveredPoint({
      x: closestIndex * xRatio,
      y: yPos,
      price,
      time: point.time,
    })
  }

  const handleMouseLeave = () => {
    setHoveredPoint(null)
  }

  // Helper function to draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i <= 6; i++) {
      const x = (width / 6) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
  }

  // Helper function to draw line chart
  const drawLineChart = (
    ctx: CanvasRenderingContext2D,
    data: { time: Date; price: number }[],
    width: number,
    height: number,
  ) => {
    if (data.length === 0) return

    const prices = data.map((d) => d.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice
    const padding = priceRange * 0.1

    // Calculate ratios
    const xRatio = width / (data.length - 1)
    const yRatio = height / (maxPrice - minPrice + padding * 2)

    // Draw line
    ctx.strokeStyle = change >= 0 ? "#22c55e" : "#ef4444"
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((point, i) => {
      const x = i * xRatio
      const y = height - (point.price - minPrice + padding) * yRatio

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw area under the line
    ctx.fillStyle = change >= 0 ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"

    ctx.beginPath()
    data.forEach((point, i) => {
      const x = i * xRatio
      const y = height - (point.price - minPrice + padding) * yRatio

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fill()
  }

  // Helper function to draw candlestick chart
  const drawCandlestickChart = (
    ctx: CanvasRenderingContext2D,
    data: { time: Date; open: number; high: number; low: number; close: number }[],
    width: number,
    height: number,
  ) => {
    if (data.length === 0) return

    const highPrices = data.map((d) => d.high)
    const lowPrices = data.map((d) => d.low)
    const minPrice = Math.min(...lowPrices)
    const maxPrice = Math.max(...highPrices)
    const priceRange = maxPrice - minPrice
    const padding = priceRange * 0.1

    // Calculate ratios
    const xRatio = width / data.length
    const yRatio = height / (maxPrice - minPrice + padding * 2)

    // Draw candlesticks
    data.forEach((candle, i) => {
      const x = i * xRatio
      const candleWidth = Math.max(xRatio * 0.8, 1)
      const halfCandleWidth = candleWidth / 2

      const open = height - (candle.open - minPrice + padding) * yRatio
      const close = height - (candle.close - minPrice + padding) * yRatio
      const high = height - (candle.high - minPrice + padding) * yRatio
      const low = height - (candle.low - minPrice + padding) * yRatio

      // Draw wick
      ctx.strokeStyle = candle.close >= candle.open ? "#22c55e" : "#ef4444"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x + halfCandleWidth, high)
      ctx.lineTo(x + halfCandleWidth, low)
      ctx.stroke()

      // Draw body
      ctx.fillStyle = candle.close >= candle.open ? "#22c55e" : "#ef4444"
      const candleHeight = Math.abs(close - open)
      const y = Math.min(open, close)

      ctx.fillRect(x, y, candleWidth, Math.max(candleHeight, 1))
    })
  }

  // Format time based on timeframe
  const formatTime = (date: Date) => {
    switch (timeframe) {
      case "1m":
      case "1h":
        return format(date, "HH:mm")
      case "1d":
        return format(date, "HH:mm")
      case "1w":
        return format(date, "EEE, MMM d")
      case "1mo":
      case "6mo":
      case "1y":
        return format(date, "MMM d, yyyy")
      default:
        return format(date, "HH:mm")
    }
  }

  return (
    <div className="relative w-full h-[400px]">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: "100%", height: "400px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {hoveredPoint && (
        <div
          className="absolute pointer-events-none bg-popover border rounded-md shadow-md px-3 py-2 text-sm"
          style={{
            left: Math.min(hoveredPoint.x, dimensions.width - 150),
            top: Math.min(hoveredPoint.y - 70, dimensions.height - 70),
          }}
        >
          <div className="font-medium">${hoveredPoint.price.toFixed(2)}</div>
          <div className="text-muted-foreground">{formatTime(hoveredPoint.time)}</div>
        </div>
      )}
    </div>
  )
}

