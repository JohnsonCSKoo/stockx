"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataTableProps<T> {
    data: T[]
    columns: {
        key: string
        header: string
        sortable?: boolean
        cell: (item: T) => React.ReactNode
        searchable?: boolean
    }[]
    defaultSortKey?: string
    defaultSortDir?: "asc" | "desc"
    searchPlaceholder?: string
    renderEmpty?: () => React.ReactNode
}

export function DataTable<T extends Record<string, any>>({
                                                             data,
                                                             columns,
                                                             defaultSortKey,
                                                             defaultSortDir = "asc",
                                                             searchPlaceholder = "Search...",
                                                             renderEmpty,
                                                         }: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey)
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDir)
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredData, setFilteredData] = useState<T[]>(data)

    // Reset to first page when data changes
    useEffect(() => {
        setCurrentPage(1)
    }, [pageSize, searchQuery])

    // Apply filtering, sorting, and pagination
    useEffect(() => {
        let result = [...data]

        // Apply search filter
        if (searchQuery) {
            const searchableColumns = columns.filter((col) => col.searchable !== false).map((col) => col.key)

            result = result.filter((item) => {
                return searchableColumns.some((key) => {
                    const value = item[key]
                    if (value === null || value === undefined) return false
                    return String(value).toLowerCase().includes(searchQuery.toLowerCase())
                })
            })
        }

        // Apply sorting
        if (sortKey) {
            result.sort((a, b) => {
                const aValue = a[sortKey]
                const bValue = b[sortKey]

                if (aValue === bValue) return 0

                // Handle different data types
                if (typeof aValue === "string" && typeof bValue === "string") {
                    return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
                }

                return sortDirection === "asc" ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1
            })
        }

        setFilteredData(result)
    }, [data, searchQuery, sortKey, sortDirection, columns])

    // Calculate pagination
    const totalPages = Math.ceil(filteredData.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = filteredData.slice(startIndex, endIndex)

    // Handle sort toggle
    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortKey(key)
            setSortDirection("asc")
        }
    }

    // Generate page numbers
    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            // Show all pages if there are few
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            // Calculate range around current page
            let startPage = Math.max(2, currentPage - 1)
            let endPage = Math.min(totalPages - 1, currentPage + 1)

            // Adjust if at edges
            if (currentPage <= 2) {
                endPage = 4
            } else if (currentPage >= totalPages - 1) {
                startPage = totalPages - 3
            }

            // Add ellipsis if needed
            if (startPage > 2) {
                pages.push(-1) // -1 represents ellipsis
            }

            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i)
            }

            // Add ellipsis if needed
            if (endPage < totalPages - 1) {
                pages.push(-2) // -2 represents ellipsis
            }

            // Always show last page
            pages.push(totalPages)
        }

        return pages
    }

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                        <SelectTrigger className="w-[70px]">
                            <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} className="text-left py-3 px-4">
                                    {column.sortable !== false ? (
                                        <button className="flex items-center font-medium" onClick={() => handleSort(column.key)}>
                                            {column.header}
                                            <ArrowUpDown
                                                className={cn("ml-1 h-4 w-4", sortKey === column.key ? "opacity-100" : "opacity-30")}
                                            />
                                        </button>
                                    ) : (
                                        <span className="font-medium">{column.header}</span>
                                    )}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => (
                                <tr key={index} className="border-b">
                                    {columns.map((column) => (
                                        <td key={`${index}-${column.key}`} className="py-4 px-4">
                                            {column.cell(item)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="py-8 text-center text-muted-foreground">
                                    {renderEmpty ? renderEmpty() : "No data found"}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} items
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {getPageNumbers().map((page, i) =>
                                page < 0 ? (
                                    <span key={`ellipsis-${i}`} className="px-2">
                  ...
                </span>
                                ) : (
                                    <Button
                                        key={`page-${page}`}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="icon"
                                        onClick={() => setCurrentPage(page)}
                                        className="w-8 h-8"
                                    >
                                        {page}
                                    </Button>
                                ),
                        )}

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
