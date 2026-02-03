import type { Subtask } from "@/types/indexTypes";
import { useState, useEffect } from "react";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAddSubTaskMutation, useUpdateSubTaskMutation } from "@/hooks/useTaskHook";
import { toast } from "sonner";

export const SubTasksDetails = ({
  subTasks,
  taskId,
}: {
  subTasks: Subtask[];
  taskId: string;
}) => {
  const [newSubTask, setNewSubTask] = useState("");
  const [localSubTasks, setLocalSubTasks] = useState<Subtask[]>(subTasks);
  
  const { mutate: addSubTask, isPending } = useAddSubTaskMutation();
  const { mutate: updateSubTask, isPending: isUpdating } = useUpdateSubTaskMutation();

  useEffect(() => {
    setLocalSubTasks(subTasks);
  }, [subTasks]);

  const handleToggleTask = (subTaskId: string, checked: boolean) => {
    setLocalSubTasks(prev =>
      prev.map(st => st.id === subTaskId ? { ...st, completed: checked } : st)
    );

    updateSubTask(
      { taskId, subTaskId, completed: checked },
      {
        onSuccess: () => {
          toast.success("Sub task updated successfully");
        },
        onError: (error: any) => {
          const errMessage = error.response?.data?.message || "Failed to update sub task";
          toast.error(errMessage);
          setLocalSubTasks(subTasks);
        },
      }
    );
  };

  const handleAddSubTask = () => {
    if (!newSubTask.trim()) {
      toast.error("Sub task title cannot be empty");
      return;
    }

    const optimisticSubTask: Subtask = {
      id: `temp-${Date.now()}`,
      title: newSubTask,
      completed: false,
      createdAt: new Date(),
    };

    setLocalSubTasks(prev => [...prev, optimisticSubTask]);
    const titleToAdd = newSubTask;
    setNewSubTask("");

    addSubTask(
      { taskId, title: titleToAdd },
      {
        onSuccess: (data) => {
          if (data?.subtasks) {
            setLocalSubTasks(data.subtasks);
          } else if (data?.subtask) {
            setLocalSubTasks(prev => 
              prev.map(st => st.id === optimisticSubTask.id ? data.subtask : st)
            );
          }
          toast.success("Sub task added successfully");
        },
        onError: (error: any) => {
          const errMessage = error.response?.data?.message || "Failed to add sub task";
          toast.error(errMessage);
          setLocalSubTasks(prev => prev.filter(st => st.id !== optimisticSubTask.id));
          setNewSubTask(titleToAdd);
        },
      }
    );
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Sub Tasks
      </h3>

      <div className="space-y-3 mb-4">
        {localSubTasks.length > 0 ? (
          localSubTasks.map((subTask) => (
            <div key={subTask.id} className="flex items-center space-x-3 py-1">
              <Checkbox
                id={subTask.id}
                checked={subTask.completed}
                onCheckedChange={(checked) =>
                  handleToggleTask(subTask.id, !!checked)
                }
                disabled={isUpdating}
              />

              <label
                htmlFor={subTask.id}
                className={cn(
                  "text-sm cursor-pointer flex-1",
                  subTask.completed ? "line-through text-muted-foreground" : ""
                )}
              >
                {subTask.title}
              </label>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground py-2">No sub tasks</div>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add a sub task"
          value={newSubTask}
          onChange={(e) => setNewSubTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newSubTask.trim()) {
              handleAddSubTask();
            }
          }}
          disabled={isPending}
        />

        <Button
          onClick={handleAddSubTask}
          disabled={isPending || newSubTask.trim().length === 0}
          size="sm"
        >
          {isPending ? "Adding..." : "Add"}
        </Button>
      </div>
    </div>
  );
};