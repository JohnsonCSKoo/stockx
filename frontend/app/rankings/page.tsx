"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Mock rankings data
const rankings = {
  day: [
    { rank: 1, username: "trader123", avatar: "/placeholder.svg", gain: 1250.75, returnPercent: 4.25 },
    { rank: 2, username: "investorpro", avatar: "/placeholder.svg", gain: 980.5, returnPercent: 3.75 },
    { rank: 3, username: "stockmaster", avatar: "/placeholder.svg", gain: 875.25, returnPercent: 3.2 },
    { rank: 4, username: "wallstreetwhiz", avatar: "/placeholder.svg", gain: 720.8, returnPercent: 2.9 },
    { rank: 5, username: "marketmaven", avatar: "/placeholder.svg", gain: 650.3, returnPercent: 2.65 },
    { rank: 6, username: "bullbear", avatar: "/placeholder.svg", gain: 580.45, returnPercent: 2.4 },
    { rank: 7, username: "stonksguru", avatar: "/placeholder.svg", gain: 520.1, returnPercent: 2.15 },
    { rank: 8, username: "wealthbuilder", avatar: "/placeholder.svg", gain: 475.6, returnPercent: 1.95 },
    { rank: 9, username: "user", avatar: "/placeholder.svg", gain: 425.2, returnPercent: 1.75 },
    { rank: 10, username: "daytrader", avatar: "/placeholder.svg", gain: 380.9, returnPercent: 1.55 },
  ],
  week: [
    { rank: 1, username: "investorpro", avatar: "/placeholder.svg", gain: 3250.75, returnPercent: 12.25 },
    { rank: 2, username: "stockmaster", avatar: "/placeholder.svg", gain: 2980.5, returnPercent: 10.75 },
    { rank: 3, username: "trader123", avatar: "/placeholder.svg", gain: 2475.25, returnPercent: 9.2 },
    { rank: 4, username: "marketmaven", avatar: "/placeholder.svg", gain: 2120.8, returnPercent: 8.9 },
    { rank: 5, username: "wallstreetwhiz", avatar: "/placeholder.svg", gain: 1950.3, returnPercent: 7.65 },
    { rank: 6, username: "user", avatar: "/placeholder.svg", gain: 1780.45, returnPercent: 7.4 },
    { rank: 7, username: "stonksguru", avatar: "/placeholder.svg", gain: 1620.1, returnPercent: 6.15 },
    { rank: 8, username: "bullbear", avatar: "/placeholder.svg", gain: 1475.6, returnPercent: 5.95 },
    { rank: 9, username: "wealthbuilder", avatar: "/placeholder.svg", gain: 1325.2, returnPercent: 5.75 },
    { rank: 10, username: "daytrader", avatar: "/placeholder.svg", gain: 1180.9, returnPercent: 4.55 },
  ],
  month: [
    { rank: 1, username: "stockmaster", avatar: "/placeholder.svg", gain: 8250.75, returnPercent: 28.25 },
    { rank: 2, username: "investorpro", avatar: "/placeholder.svg", gain: 7980.5, returnPercent: 25.75 },
    { rank: 3, username: "marketmaven", avatar: "/placeholder.svg", gain: 7475.25, returnPercent: 23.2 },
    { rank: 4, username: "trader123", avatar: "/placeholder.svg", gain: 6720.8, returnPercent: 21.9 },
    { rank: 5, username: "user", avatar: "/placeholder.svg", gain: 5950.3, returnPercent: 19.65 },
    { rank: 6, username: "wallstreetwhiz", avatar: "/placeholder.svg", gain: 5580.45, returnPercent: 18.4 },
    { rank: 7, username: "wealthbuilder", avatar: "/placeholder.svg", gain: 5120.1, returnPercent: 16.15 },
    { rank: 8, username: "stonksguru", avatar: "/placeholder.svg", gain: 4475.6, returnPercent: 14.95 },
    { rank: 9, username: "bullbear", avatar: "/placeholder.svg", gain: 4125.2, returnPercent: 13.75 },
    { rank: 10, username: "daytrader", avatar: "/placeholder.svg", gain: 3880.9, returnPercent: 12.55 },
  ],
}

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState("day")
  const currentUsername = "user" // Simulating the current user

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Trader Rankings</CardTitle>
            <CardDescription>See how you stack up against other traders</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="day" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
              <TabsContent value="day" className="mt-0">
                <RankingsTable data={rankings.day} currentUsername={currentUsername} />
              </TabsContent>
              <TabsContent value="week" className="mt-0">
                <RankingsTable data={rankings.week} currentUsername={currentUsername} />
              </TabsContent>
              <TabsContent value="month" className="mt-0">
                <RankingsTable data={rankings.month} currentUsername={currentUsername} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function RankingsTable({ data, currentUsername }: { data: any[]; currentUsername: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Rank</th>
            <th className="text-left py-3 px-4">Trader</th>
            <th className="text-right py-3 px-4">Gain ($)</th>
            <th className="text-right py-3 px-4">Return (%)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((trader, index) => (
            <motion.tr
              key={trader.rank}
              className={cn("border-b", trader.username === currentUsername && "bg-muted/50")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <td className="py-4 px-4">
                <Badge
                  variant={trader.rank <= 3 ? "default" : "outline"}
                  className="w-8 h-8 rounded-full flex items-center justify-center p-0"
                >
                  {trader.rank}
                </Badge>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={trader.avatar} alt={trader.username} />
                    <AvatarFallback>{trader.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{trader.username}</div>
                    {trader.username === currentUsername && <div className="text-xs text-muted-foreground">You</div>}
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 text-right font-medium">${trader.gain.toFixed(2)}</td>
              <td className="py-4 px-4 text-right text-green-500">+{trader.returnPercent.toFixed(2)}%</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

