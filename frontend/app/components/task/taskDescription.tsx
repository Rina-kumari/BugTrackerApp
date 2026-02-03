import { useUpdateTaskDescriptionMutation } from "@/hooks/useTaskHook";
import { Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export const TaskDescription = ({
  description,
  taskId,
}: {
  description: string;
  taskId: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [savedDescription, setSavedDescription] = useState(description);
  const { mutate, isPending } = useUpdateTaskDescriptionMutation();

  useEffect(() => {
    setCurrentDescription(description);
    setSavedDescription(description);
  }, [description]);

  const updateDescription = () => {
    mutate(
      { taskId, description: currentDescription },
      {
        onSuccess: () => {
          setSavedDescription(currentDescription); 
          setIsEditing(false);
          toast.success("Description updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || "Failed to update description";
          toast.error(errorMessage);
          console.log(error);
          setCurrentDescription(savedDescription);
        },
      }
    );
  };

  const handleCancel = () => {
    setCurrentDescription(savedDescription); 
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {isEditing ? (
        <>
          <Textarea
            className="w-full min-h-25"
            value={currentDescription}
            onChange={(e) => setCurrentDescription(e.target.value)}
            disabled={isPending}
            placeholder="Enter task description..."
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={updateDescription}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-start gap-2">
          <div className="text-sm md:text-base text-pretty flex-1 text-muted-foreground">
            {currentDescription || "No description provided"}
          </div>
          <Edit
            className="size-4 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsEditing(true)}
          />
        </div>
      )}
    </div>
  );
};