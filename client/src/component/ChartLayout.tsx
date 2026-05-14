  

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type ChartLayoutProps = {
  result: {
    data: Record<string, any>[]
  }
}

export function ChartLayout({ result }: ChartLayoutProps) {

  // remove _id dynamically from every object
  const chartData = result.data.map(({ _id, ...rest }) => rest)

  // if no data
  if (!chartData.length) {
    return <div>No Data</div>
  }

  // get all keys from first object
  const keys = Object.keys(chartData[0])

  // detect string key for x-axis
  const xAxisKey =
    keys.find(
      (key) =>
        typeof chartData[0][key] === "string"
    ) || keys[0]

  // detect all numeric keys for bars
  const barKeys = keys.filter(
    (key) =>
      typeof chartData[0][key] === "number"
  )

  // fully dynamic config
  const chartConfig = barKeys.reduce(
    (acc: ChartConfig, key) => {
      acc[key] = {
        label: key,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      }
      return acc
    },
    {}
  )

  return (
    <ChartContainer
      config={chartConfig}
      className="min-h-[250px] w-full"
    >
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />

        <XAxis
          dataKey={xAxisKey}
          tickLine={false}
          axisLine={false}
          tickMargin={10}
        />

        <YAxis />

        <ChartTooltip
          content={<ChartTooltipContent />}
        />

        {barKeys.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={chartConfig[key]?.color}
            radius={4}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}