import { StatsCard } from "@/components/dashboard/statCard";
import { StatisticsCharts } from "@/components/dashboard/statisticChart";
import { Loader } from "@/components/ui/loader";
import { useGetProjectStatsQuery } from "@/hooks/useProjectHooks";
import type {
  Project,
  taskStatusData,
  StatsCardProps,
  Task,
  TaskPriorityData,
  TaskTrendsData,
} from "@/types/indexTypes";
import { useSearchParams } from "react-router";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");

  const { data, isPending, isError, error } = useGetProjectStatsQuery(projectId) as {
    data: {
      stats: StatsCardProps;
      taskTrendsData: TaskTrendsData[];
      taskStatusData: taskStatusData[];
      taskPriorityData: TaskPriorityData[];
      upcomingTasks: Task[];
      recentProjects: Project[];
    } | undefined;
    isPending: boolean;
    isError: boolean;
    error: any;
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">Error loading dashboard</h2>
          <p className="text-muted-foreground mt-2">
            {error?.message || "Something went wrong. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No data available</h2>
          <p className="text-muted-foreground mt-2">Unable to load dashboard data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 2xl:space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {projectId ? "Project Dashboard" : "All Projects Dashboard"}
        </h1>
      </div>

      <StatsCard data={data.stats} />

      <StatisticsCharts
        stats={data.stats}
        taskTrendsData={data.taskTrendsData}
        taskStatusData={data.taskStatusData}
        taskPriorityData={data.taskPriorityData}
      />
    </div>
  );
};

export default Dashboard;