import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";
import { useUpdateTaskTitleMutation } from "@/hooks/useTaskHook";
import { toast } from "sonner";

export const TaskTitle = ({
  title,
  taskId
}: {
  title: string;
  taskId: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [savedTitle, setSavedTitle] = useState(title);
  const { mutate, isPending } = useUpdateTaskTitleMutation();

  useEffect(() => {
    setCurrentTitle(title);
    setSavedTitle(title);
  }, [title]);

  const updateTitle = () => {
    if (!currentTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    mutate(
      { taskId, title: currentTitle },
      {
        onSuccess: () => {
          setSavedTitle(currentTitle); 
          setIsEditing(false);
          toast.success("Title updated successfully");
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || "Failed to update title";
          toast.error(errorMessage);
          console.log(error);
          setCurrentTitle(savedTitle);
        },
      }
    );
  };

  const handleCancel = () => {
    setCurrentTitle(savedTitle); 
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <Input
          className="text-xl font-semibold w-full"
          value={currentTitle}
          onChange={(e) => setCurrentTitle(e.target.value)}
          disabled={isPending}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateTitle();
            } else if (e.key === "Escape") {
              handleCancel();
            }
          }}
          autoFocus
        />
      ) : (
        <h2 className="text-xl flex-1 font-semibold">{currentTitle}</h2>
      )}
      {isEditing ? (
        <div className="flex gap-2">
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
            onClick={updateTitle}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      ) : (
        <Edit
          className="size-4 cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={() => setIsEditing(true)}
        />
      )}
    </div>
  );
};