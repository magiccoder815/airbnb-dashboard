"use client"

import { useState, useEffect } from "react"
import { BarChart, LineChart } from "@/components/ui/charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the types based on your data structure
type Host = {
  host_url: string
  host_name: string
  avatar_url: string
  superhost: boolean
  reviews: number
  rating: number
  about: string | null
  started_year: number
  languages: string[] | null
  location: {
    city: string
    state: string
  } | null
  job: string | null
  total_listings: number
}

export type Listing = {
  link: string
  title: string
  listing_type: string
  listing_price: number
  zipcode: number
  host_url: string
  host: Host
}

interface HostsDataDashboardProps {
  initialData: Listing[]
}

export function HostsDataDashboard({ initialData }: HostsDataDashboardProps) {
  const [zipCode, setZipCode] = useState("")
  const [reviewsRange, setReviewsRange] = useState([0, 500])
  const [ratingRange, setRatingRange] = useState([0, 5])
  const uniqueYears = [...new Set(initialData.map((item) => item.host.started_year))]
    .filter(Boolean)
    .sort((a, b) => a - b)
  const initialYearFilters = Object.fromEntries(uniqueYears.map((year) => [year.toString(), false]))
  const [yearFilters, setYearFilters] = useState(initialYearFilters)
  const [superhostFilter, setSuperhostFilter] = useState<string | null>(null)
  const [filteredData, setFilteredData] = useState<Listing[]>(initialData)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Calculate pagination values
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  // Calculate statistics
  const totalHosts = filteredData.length
  const averageRating = filteredData.reduce((acc, item) => acc + (item.host.rating || 0), 0) / totalHosts || 0
  const superhostPercentage =
    Math.round((filteredData.filter((item) => item.host.superhost).length / totalHosts) * 100) || 0

  // Generate rating distribution data
  const ratingDistribution = [
    { rating: "1", count: filteredData.filter((item) => item.host.rating && item.host.rating < 2).length },
    {
      rating: "2",
      count: filteredData.filter((item) => item.host.rating && item.host.rating >= 2 && item.host.rating < 3).length,
    },
    {
      rating: "3",
      count: filteredData.filter((item) => item.host.rating && item.host.rating >= 3 && item.host.rating < 4).length,
    },
    {
      rating: "4",
      count: filteredData.filter((item) => item.host.rating && item.host.rating >= 4 && item.host.rating < 4.5).length,
    },
    { rating: "5", count: filteredData.filter((item) => item.host.rating && item.host.rating >= 4.5).length },
  ]

    // Generate hosts over time data dynamically based on unique years
    const yearsData = uniqueYears.map((year) => ({
      year: year.toString(),
      count: filteredData.filter((item) => item.host.started_year && item.host.started_year <= year).length,
    }))

  // Apply filters
  useEffect(() => {
    let result = initialData
    console.log("lenght", initialData.length);

    // Filter by ZIP code
    if (zipCode) {
      result = result.filter((item) => item.zipcode.toString().includes(zipCode));
    }
    // Filter by years
    const selectedYears = Object.entries(yearFilters)
      .filter(([_, isSelected]) => isSelected)
      .map(([year]) => Number.parseInt(year))

    if (selectedYears.length > 0) {
      result = result.filter((item) => 
        item.host.started_year && selectedYears.includes(item.host.started_year)
      )
    }
    // Deduplicate hosts based on host URL
    const uniqueHosts = new Set();
    result = result.filter(item => {
      if (uniqueHosts.has(item.host_url)) {
        return false;
      } else {
        uniqueHosts.add(item.host_url);
        return true;
      }
    });

    // Filter by superhost status
    if (superhostFilter === "Yes") {
      result = result.filter((item) => item.host.superhost)
    } else if (superhostFilter === "No") {
      result = result.filter((item) => !item.host.superhost)
    }
    console.log("4", result);
    setFilteredData(result)
    
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [zipCode, reviewsRange, ratingRange, yearFilters, superhostFilter, initialData])

  const resetFilters = () => {
    setZipCode("")
    setReviewsRange([0, 7000])
    setRatingRange([0, 5])
    setYearFilters(initialYearFilters)
    setSuperhostFilter(null)
  }

  const handleDownloadCSV = () => {
    // Convert data to CSV format
    const headers = ["Host Name", "Number of Reviews", "Rating", "Year Hosting", "Superhost", "Lives in"]
    const csvData = filteredData.map((item) => [
      item.host.host_name,
      item.host.reviews,
      item.host.rating,
      item.host.started_year,
      item.host.superhost ? "Yes" : "No",
      item.host.location ? item.host.location.city : "N/A",
    ])

    const csvContent = [headers.join(","), ...csvData.map((row) => row.join(","))].join("\n")

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "airbnb_hosts_data.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page < 1) page = 1
    if (page > totalPages) page = totalPages
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always show first page
      pageNumbers.push(1)

      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if we're at the beginning or end
      if (currentPage <= 2) {
        endPage = 4
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3
      }

      // Add ellipsis if needed
      if (startPage > 2) {
        pageNumbers.push("...")
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("...")
      }

      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Airbnb Hosts Data</h1>
        <Button onClick={handleDownloadCSV} className="bg-blue-500 hover:bg-blue-600">
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="zipcode" className="block text-sm font-medium mb-2">
                ZIP code
              </label>
              <Input
                id="zipcode"
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Number of reviews</label>
              <div className="px-2">
                <Slider
                  defaultValue={[0, 500]}
                  max={500}
                  step={1}
                  value={reviewsRange}
                  onValueChange={setReviewsRange}
                  className="my-4"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{reviewsRange[0]}</span>
                  <span>{reviewsRange[1]}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Average rating</label>
              <div className="px-2">
                <Slider
                  defaultValue={[0, 5]}
                  max={5}
                  step={0.1}
                  value={ratingRange}
                  onValueChange={setRatingRange}
                  className="my-4"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{ratingRange[0].toFixed(1)}</span>
                  <span>{ratingRange[1].toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Year started hosting</label>
              <div className="space-y-2">
                {Object.entries(yearFilters).map(([year, isChecked]) => (
                  <div key={year} className="flex items-center">
                    <Checkbox
                      id={`year-${year}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => setYearFilters((prev) => ({ ...prev, [year]: !!checked }))}
                    />
                    <label
                      htmlFor={`year-${year}`}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {year}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Superhost</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Checkbox
                    id="superhost-yes"
                    checked={superhostFilter === "Yes"}
                    onCheckedChange={(checked) => setSuperhostFilter(checked ? "Yes" : null)}
                  />
                  <label
                    htmlFor="superhost-yes"
                    className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="superhost-no"
                    checked={superhostFilter === "No"}
                    onCheckedChange={(checked) => setSuperhostFilter(checked ? "No" : null)}
                  />
                  <label
                    htmlFor="superhost-no"
                    className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    No
                  </label>
                </div>
              </div>
            </div>

            <Button onClick={resetFilters} className="w-full bg-blue-500 hover:bg-blue-600">
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Hosts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHosts.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageRating.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Superhosts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{superhostPercentage}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Distribution of Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={ratingDistribution}
                  index="rating"
                  categories={["count"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `${value} hosts`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Hosts Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={yearsData}
                  index="year"
                  categories={["count"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `${value} hosts`}
                  className="h-[300px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Host Details</CardTitle>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Rows per page:</span>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="5" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Host Name</TableHead>
                    <TableHead>Number of Reviews</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Year Hosting</TableHead>
                    <TableHead>Superhost</TableHead>
                    <TableHead>Lives in</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.host.avatar_url || "/placeholder.svg"} alt={item.host.host_name} />
                            <AvatarFallback>{item.host.host_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <a
                            href={item.host.host_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {item.host.host_name}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>{item.host.reviews}</TableCell>
                      <TableCell>{item.host.rating}</TableCell>
                      <TableCell>{item.host.started_year}</TableCell>
                      <TableCell>{item.host.superhost ? "Yes" : "No"}</TableCell>
                      <TableCell>{item.host.location ? item.host.location.city : "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} of{" "}
                  {filteredData.length} hosts
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {getPageNumbers().map((page, index) =>
                    typeof page === "number" ? (
                      <Button
                        key={index}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={currentPage === page ? "bg-blue-500 hover:bg-blue-600" : ""}
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={index} className="px-2">
                        {page}
                      </span>
                    ),
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
