import { HostsDataDashboard } from "@/components/hosts-data-dashboard"
import rawData from "@/data.json"
import type { Listing } from "@/components/hosts-data-dashboard" 
export default function Home() {
  const data = rawData as Listing[] 

  return (
    <main className="min-h-screen bg-gray-50">
      <HostsDataDashboard initialData={data} />
    </main>
  )
}
