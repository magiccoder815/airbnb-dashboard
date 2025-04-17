import { HostsDataDashboard } from "@/components/hosts-data-dashboard"
import data from "@/data.json"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HostsDataDashboard initialData={data} />
    </main>
  )
}
