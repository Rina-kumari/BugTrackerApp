import type { TaskStatus } from "@/types/indexTypes";
import { useState, useEffect } from "react";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "../ui/select";
import { useUpdateTaskStatusMutation } from "@/hooks/useTaskHook";
import { toast } from "sonner";

export const TaskStatusSelector = ({
  status,
  taskId,
}: {
  status: TaskStatus;
  taskId: string;
}) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  const { mutate, isPending } = useUpdateTaskStatusMutation();

  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  const handleStatusChange = (value: string) => {
    const newStatus = value as TaskStatus;
    setCurrentStatus(newStatus); 

    mutate(
      { taskId, status: newStatus },
      {
        onSuccess: () => {
          toast.success("Status updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || "Failed to update status";
          toast.error(errorMessage);
          console.log(error);
          setCurrentStatus(status);
        },
      }
    );
  };

  return (
    <Select value={currentStatus || ""} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-45" disabled={isPending}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="To Do">To Do</SelectItem>
        <SelectItem value="In Progress">In Progress</SelectItem>
        <SelectItem value="Testing">Testing</SelectItem>
        <SelectItem value="Done">Done</SelectItem>
      </SelectContent>
    </Select>
  );
};