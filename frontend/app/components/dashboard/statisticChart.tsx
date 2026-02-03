import type {
  taskStatusData,
  StatsCardProps,
  TaskPriorityData,
  TaskTrendsData,
} from "@/types/indexTypes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ChartLine, ChartPie } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface StatisticsChartsProps {
  stats: StatsCardProps;
  taskTrendsData: TaskTrendsData[];
  taskStatusData: taskStatusData[];
  taskPriorityData: TaskPriorityData[];
}

export const StatisticsCharts = ({
  stats,
  taskTrendsData,
  taskStatusData,
  taskPriorityData,
}: StatisticsChartsProps) => {
  return (
    <div className="space-y-6 mb-8">
    
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-medium">Task Trends</CardTitle>
            <CardDescription>Daily task status changes</CardDescription>
          </div>
          <ChartLine className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="w-full overflow-x-auto md:overflow-x-hidden">
          <div className="min-w-125">
            <ChartContainer
              className="h-75"
              config={{
                completed: { color: "#10b981", label: "Completed" },
                inProgress: { color: "#3b82f6", label: "In Progress" },
                toDo: { color: "#6b7280", label: "To Do" },
              }}
            >
              <LineChart data={taskTrendsData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="inProgress"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="In Progress"
                />
                <Line
                  type="monotone"
                  dataKey="toDo"
                  stroke="#6b7280"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="To Do"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium">
                Project Status
              </CardTitle>
              <CardDescription>Project status breakdown</CardDescription>
            </div>
            <ChartPie className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-75 w-full"
              config={{
                "To Do": { color: "#6b7280", label: "To Do" },
                "In Progress": { color: "#3b82f6", label: "In Progress" },
                Testing: { color: "#f59e0b", label: "Testing" },
                Done: { color: "#10b981", label: "Done" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="45%"
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend 
                    content={<ChartLegendContent />}
                    verticalAlign="bottom"
                    height={36}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-medium">
                Task Priority
              </CardTitle>
              <CardDescription>Task priority breakdown</CardDescription>
            </div>
            <ChartPie className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-75 w-full"
              config={{
                High: { color: "#ef4444", label: "High" },
                Medium: { color: "#f59e0b", label: "Medium" },
                Low: { color: "#6b7280", label: "Low" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskPriorityData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {taskPriorityData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend 
                    content={<ChartLegendContent />}
                    verticalAlign="bottom"
                    height={36}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};