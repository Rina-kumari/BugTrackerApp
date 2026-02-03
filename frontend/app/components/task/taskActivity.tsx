import { fetchData } from "@/lib/fetchUtils";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "../ui/loader";
import type { ActivityLog } from "@/types/indexTypes";
import { getActivityIcon } from "./taskIcon";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const TaskActivity = ({ resourceId }: { resourceId: string }) => {
  const { data, isPending } = useQuery({
    queryKey: ["task-activity", resourceId],
    queryFn: () => fetchData(`/tasks/${resourceId}/activity`),
  }) as {
    data: ActivityLog[];
    isPending: boolean;
  };

  if (isPending) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h3 className="text-lg text-muted-foreground mb-4">Activity</h3>
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h3 className="text-lg text-muted-foreground mb-4">Activity</h3>
        <p className="text-sm text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Activity</h3>

      <div className="space-y-4">
        {data.map((activity) => (
          <div key={activity.id} className="flex gap-3">

            <div className="shrink-0">
              {getActivityIcon(activity.action)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user?.name || 'Unknown User'}</span>{" "}
                    <span className="text-muted-foreground">{activity.description}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};