import type { Task, User } from "@/types/indexTypes";
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { useUpdateTaskAssigneesMutation } from "@/hooks/useTaskHook";
import { toast } from "sonner";

export const TaskAssigneesSelector = ({
  task,
  assignees,
  projectMembers,
}: {
  task: Task;
  assignees: User[];
  projectMembers: any[];
}) => {
  const members = projectMembers.map((m) => m.user || m);

  const [selectedIds, setSelectedIds] = useState<string[]>(
    assignees.map((assignee) => assignee?.id?.toString() || "").filter(Boolean)
  );
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const { mutate, isPending } = useUpdateTaskAssigneesMutation();

  const handleSelect = (id: string) => {
    let newSelected: string[] = [];

    if (selectedIds.includes(id)) {
      newSelected = selectedIds.filter((sid) => sid !== id);
    } else {
      newSelected = [...selectedIds, id];
    }

    setSelectedIds(newSelected);

    mutate(
      {
        taskId: task.id.toString(),
        assignees: newSelected,
        projectId: task.project_id?.toString(), 
      },
      {
        onSuccess: () => {
          setDropDownOpen(false);
          toast.success("Assignees updated successfully");
        },
        onError: (error: any) => {
          const errMessage =
            error.response?.data?.message || "Failed to update assignees";
          toast.error(errMessage);
          console.log(error);
        },
      }
    );
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        Assignees
      </h3>

      <div className="flex flex-wrap gap-2 mb-2">
        {selectedIds.length === 0 ? (
          <span className="text-xs text-muted-foreground">Unassigned</span>
        ) : (
          members
            .filter(
              (member) =>
                member?.id && selectedIds.includes(member.id.toString())
            )
            .map((member) => (
              <div
                key={member.id}
                className="flex items-center bg-gray-100 rounded px-2 py-1"
              >
                <span className="text-xs text-muted-foreground">
                  {member.name}
                </span>
              </div>
            ))
        )}
      </div>

      <div className="relative">
        <button
          className="text-sm text-muted-foreground w-full border rounded px-3 py-2 text-left bg-white"
          onClick={() => setDropDownOpen(!dropDownOpen)}
          disabled={isPending}
        >
          {selectedIds.length === 0
            ? "Select assignees"
            : `${selectedIds.length} selected`}
        </button>

        {dropDownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
            {members.filter((m) => m?.id).length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No members available
              </div>
            ) : (
              members
                .filter((m) => m?.id)
                .map((member) => (
                  <label
                    className="flex items-start px-3 py-2 cursor-pointer hover:bg-gray-50"
                    key={member.id}
                  >
                    <Checkbox
                      checked={selectedIds.includes(member.id.toString())}
                      onCheckedChange={() =>
                        handleSelect(member.id.toString())
                      }
                      className="mr-2 mt-1"
                      disabled={isPending}
                    />

                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-medium">
                        {member.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {member.email}
                      </span>
                      {member.role && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {member.role}
                        </span>
                      )}
                    </div>
                  </label>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};