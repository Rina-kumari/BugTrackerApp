import type { TaskPriority } from "@/types/indexTypes";
import { useState, useEffect } from "react";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "../ui/select";
import { useUpdateTaskPriorityMutation } from "@/hooks/useTaskHook";
import { toast } from "sonner";

export const TaskPrioritySelector = ({
  priority,
  taskId,
}: {
  priority: TaskPriority;
  taskId: string;
}) => {
  const [currentPriority, setCurrentPriority] = useState(priority);
  const { mutate, isPending } = useUpdateTaskPriorityMutation();

  useEffect(() => {
    setCurrentPriority(priority);
  }, [priority]);

  const handlePriorityChange = (value: string) => {
    const newPriority = value as TaskPriority;
    setCurrentPriority(newPriority); 

    mutate(
      { taskId, priority: newPriority },
      {
        onSuccess: () => {
          toast.success("Priority updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || "Failed to update priority";
          toast.error(errorMessage);
          console.log(error);
          setCurrentPriority(priority);
        },
      }
    );
  };

  return (
    <Select value={currentPriority || ""} onValueChange={handlePriorityChange}>
      <SelectTrigger className="w-45" disabled={isPending}>
        <SelectValue placeholder="Priority" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="Low">Low</SelectItem>
        <SelectItem value="Medium">Medium</SelectItem>
        <SelectItem value="High">High</SelectItem>
      </SelectContent>
    </Select>
  );
};