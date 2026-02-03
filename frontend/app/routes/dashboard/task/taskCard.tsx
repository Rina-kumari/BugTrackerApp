import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Task } from "@/types/indexTypes";
import { UserCircle, Users } from "lucide-react";

export const TaskCard = ({ task, onClick }: { task: Task; onClick: () => void }) => {
  
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "High":
        return { color: "bg-red-500 text-white", letter: "H" };
      case "Medium":
        return { color: "bg-orange-500 text-white", letter: "M" };
      case "Low":
        return { color: "bg-green-500 text-white", letter: "L" };
      default:
        return { color: "bg-slate-500 text-white", letter: "?" };
    }
  };

  const priorityConfig = getPriorityConfig(task.priority);

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 relative h-35 flex flex-col"
    >
      <div className="absolute top-2 left-2 z-10">
        <div
          className={`${priorityConfig.color} w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm`}
          title={`${task.priority} Priority`}
        >
          {priorityConfig.letter}
        </div>
      </div>

      <CardHeader className="pt-6 pb-0 px-3 shrink-0">
    
        <h4 className="font-semibold text-sm line-clamp-2 pr-1 leading-tight">
          {task.title}
        </h4>
      </CardHeader>

      <CardContent className="px-3 pb-2 pt-0 flex-1 flex flex-col justify-between">
        
          <div className="flex items-center justify-between">
            
            {task.assignees && task.assignees.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="flex -space-x-1.5">
                  {task.assignees.slice(0, 3).map((assignee) => (
                    <div key={assignee.id} className="group relative">
                      <Avatar className="h-6 w-6 border-2 border-background cursor-pointer transition-transform hover:scale-110 hover:z-10">
                    
                        <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                          {assignee.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 hidden group-hover:block pointer-events-none">
                        <div className="bg-popover border rounded-md shadow-lg p-2 whitespace-nowrap">
                          <p className="text-xs font-medium">{assignee.name}</p>
                          {assignee.email && (
                            <p className="text-[10px] text-muted-foreground">{assignee.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {task.assignees.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        +{task.assignees.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs">Unassigned</span>
              </div>
            )}
          </div>
        
        {task.created_by_user && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t mt-2">
            <UserCircle className="h-3 w-3 shrink-0" />
            <span className="truncate">
              <span 
                className="font-medium text-foreground cursor-help underline decoration-dotted"
                title={`Email: ${task.created_by_user.email || 'N/A'}\nRole: ${task.created_by_user.role || 'N/A'}`}
              >
                {task.created_by_user.name}
              </span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};