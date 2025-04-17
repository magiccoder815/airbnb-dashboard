"use client"

import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

interface ChartProps {
  data: any[]
  index: string
  categories: string[]
  colors: string[]
  valueFormatter?: (value: number) => string
  className?: string
}

export function BarChart({
  data,
  index,
  categories,
  colors,
  valueFormatter = (value) => `${value}`,
  className,
}: ChartProps) {
  const chartData = {
    labels: data.map((item) => item[index]),
    datasets: categories.map((category, i) => ({
      label: category,
      data: data.map((item) => item[category] || item.count),
      backgroundColor: colors[i] === "blue" ? "rgba(59, 130, 246, 0.8)" : colors[i],
      borderColor: colors[i] === "blue" ? "rgb(37, 99, 235)" : colors[i],
      borderWidth: 1,
    })),
  }

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        display: categories.length > 1,
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number
            return valueFormatter(value)
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Hosts",
        },
      },
      x: {
        title: {
          display: true,
          text: "Rating",
        },
      },
    },
    maintainAspectRatio: false,
  }

  return (
    <div className={className}>
      <Bar data={chartData} options={options} />
    </div>
  )
}

export function LineChart({
  data,
  index,
  categories,
  colors,
  valueFormatter = (value) => `${value}`,
  className,
}: ChartProps) {
  const chartData = {
    labels: data.map((item) => item[index]),
    datasets: categories.map((category, i) => ({
      label: category,
      data: data.map((item) => item[category] || item.count),
      borderColor: colors[i] === "blue" ? "rgb(59, 130, 246)" : colors[i],
      backgroundColor: colors[i] === "blue" ? "rgba(59, 130, 246, 0.1)" : colors[i],
      tension: 0.3,
    })),
  }

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        display: categories.length > 1,
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number
            return valueFormatter(value)
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Hosts",
        },
      },
      x: {
        title: {
          display: true,
          text: "Year",
        },
      },
    },
    maintainAspectRatio: false,
  }

  return (
    <div className={className}>
      <Line data={chartData} options={options} />
    </div>
  )
}
