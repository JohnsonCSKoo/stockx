"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import SearchBar from "@/components/search-bar"

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [balance, setBalance] = useState("$10,000.00")

  // Toggle login state for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoggedIn(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container h-full mx-auto flex items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <motion.div
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            TS
          </motion.div>
          <span className="font-bold text-xl">TradeSim</span>
        </Link>

        <div className="relative w-full max-w-md mx-4">
          <SearchBar />
        </div>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <div className="hidden md:block text-sm font-medium">
                Balance: <span className="text-green-600 dark:text-green-400">{balance}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback>TS</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">User</p>
                      <p className="text-xs leading-none text-muted-foreground">user@example.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/portfolio" className="w-full">
                      Portfolio
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/transactions" className="w-full">
                      Transactions
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/rankings" className="w-full">
                      Rankings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsLoggedIn(false)} className="text-red-600 dark:text-red-400">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setIsLoggedIn(true)}>Create Account</Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  )
}

