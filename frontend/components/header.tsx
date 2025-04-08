"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import {getCurrentUser, logoutUser} from "@/lib/actions"

interface User {
  id: string
  username: string
  balance: number
}

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [balance, setBalance] = useState("$10,000.00")
  const router = useRouter()

  // Check if user is logged in on client side
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await getCurrentUser();
        console.log(response);

        if (response.username) {
          setIsLoggedIn(true);


          setUser(data.user)
          setBalance(
              `$${data.user.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          )
        } else {
          setIsLoggedIn(false)
          setUser(null)
        }
      } catch (error) {
        console.error("Failed to check session:", error)
        setIsLoggedIn(false)
        setUser(null)
      }
    }

    checkSession();
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
      setIsLoggedIn(false)
      setUser(null)
      router.refresh()
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

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
              X$
            </motion.div>
            <span className="font-bold text-xl">StockX</span>
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
                          <AvatarImage src="/placeholder.svg" alt={user?.username || "User"} />
                          <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "TS"}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.username || "User"}</p>
                          <p className="text-xs leading-none text-muted-foreground">Temporary Account</p>
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
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
            ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={() => router.push("/create-account")}>Create Account</Button>
                </motion.div>
            )}
          </div>
        </div>
      </motion.header>
  )
}
