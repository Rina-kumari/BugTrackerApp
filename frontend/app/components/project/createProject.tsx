import { projectSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useCreateProject, useGetUsersQuery, useUpdateProject, useAuth } from "@/hooks/useProjectHooks";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { Project, ProjectRole } from "@/types/indexTypes";
import { useEffect, useState, useRef, useCallback } from "react";

interface CreateProjectProps {
  isCreatingProject: boolean;
  setIsCreatingProject: (isCreatingProject: boolean) => void;
  editingProject?: Project | null;
  onProjectUpdated?: () => void;
}

export type ProjectForm = z.infer<typeof projectSchema>;

export const CreateProject = ({
  isCreatingProject,
  setIsCreatingProject,
  editingProject = null,
  onProjectUpdated,
}: CreateProjectProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [pendingRoles, setPendingRoles] = useState<Record<number, ProjectRole>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      members: [],
    },
  });

  const navigate = useNavigate();
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery();
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useAuth();

  const allUsers = users || [];
  const currentUserId = currentUser?.id;

  const isEditMode = !!editingProject;
  const isPending = isCreating || isUpdating;

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if (containerRef.current?.contains(target)) return;

    if (target.closest('[data-radix-popper-content-wrapper]')) return;
    if (target.closest('[role="listbox"]')) return;
    if (target.closest('[role="option"]')) return;

    setShowDropdown(false);
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [handleOutsideClick]);

  const filteredUsers = allUsers.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    if (isCreatingProject && !isLoadingUsers && !isLoadingCurrentUser && allUsers.length > 0) {
      if (editingProject) {
        const mappedMembers: { userId: number; role: ProjectRole }[] =
          editingProject.members?.map((m) => ({
            userId: m.user_id,
            role: m.role,
          })) || [];

        const creatorInMembers = mappedMembers.find(m => m.userId === editingProject.created_by);
        if (!creatorInMembers && editingProject.created_by) {
          mappedMembers.unshift({
            userId: editingProject.created_by,
            role: "admin" as ProjectRole,
          });
        }

        form.reset({
          title: editingProject.title,
          description: editingProject.description || "",
          members: mappedMembers,
        });
      } else {
        const loggedInUser = allUsers.find((u) => u.id === currentUserId);
        const initialMembers = loggedInUser
          ? [{ userId: loggedInUser.id, role: "admin" as ProjectRole }]
          : [];

        form.reset({
          title: "",
          description: "",
          members: initialMembers,
        });
      }
    }
  }, [editingProject, isCreatingProject, form, allUsers, currentUserId, isLoadingUsers, isLoadingCurrentUser]);

  const getEffectiveRole = (
    userId: number,
    selectedMembers: { userId: number; role: ProjectRole }[]
  ): ProjectRole => {
    const existing = selectedMembers.find((m) => m.userId === userId);
    if (existing) return existing.role;
    return pendingRoles[userId] ?? "member";
  };

  const onSubmit = (data: ProjectForm) => {
    if (isEditMode && editingProject) {
      const creatorInMembers = data.members?.find(m => m.userId === editingProject.created_by);
      if (!creatorInMembers && editingProject.created_by) {
        data.members = [
          { userId: editingProject.created_by, role: "admin" as ProjectRole },
          ...(data.members || []),
        ];
      }
    }

    setIsCreatingProject(false);

    if (isEditMode && editingProject) {
      updateProject(
        { id: editingProject.id, data },
        {
          onSuccess: () => {
            form.reset();
            toast.success("Project updated successfully");
            onProjectUpdated?.();
          },
          onError: (error: any) => {
            const errorMessage =
              error.response?.data?.message || "Failed to update project";
            toast.error(errorMessage);
            setIsCreatingProject(true);
          },
        }
      );
    } else {
      createProject(data, {
        onSuccess: () => {
          toast.success("Project created successfully");
          navigate("/projects");
          form.reset();
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message || "Failed to create project";
          toast.error(errorMessage);
          setIsCreatingProject(true);
        },
      });
    }
  };

  return (
    <Dialog
      open={isCreatingProject}
      onOpenChange={setIsCreatingProject}
      modal={true}
    >
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Project" : "Create Project"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
            
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Project Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Project Description"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="members"
                render={({ field }) => {
                  const selectedMembers = field.value || [];

                  return (
                    <FormItem>
                      <FormLabel>Project Members</FormLabel>

                      <div className="relative" ref={containerRef}>
                        <Input
                          ref={inputRef}
                          placeholder="Search by name or email..."
                          value={searchQuery}
                          disabled={isLoadingUsers}
                          className="h-9"
                          onFocus={() => {
                            if (searchQuery.trim().length > 0) {
                              setShowDropdown(true);
                            }
                          }}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSearchQuery(value);
                            setShowDropdown(value.trim().length > 0);
                          }}
                        />

                        {showDropdown && searchQuery.trim().length > 0 && (
                          <div className="absolute z-10 w-full mt-1 max-h-64 overflow-y-auto border rounded-md bg-background shadow-md p-2 flex flex-col gap-1">
                            {isLoadingUsers ? (
                              <p className="text-sm text-muted-foreground p-2">
                                Loading users...
                              </p>
                            ) : filteredUsers.length === 0 ? (
                              <p className="text-sm text-muted-foreground p-2">
                                No users found
                              </p>
                            ) : (
                              filteredUsers.map((user) => {
                                const selectedMember = selectedMembers.find(
                                  (m) => m.userId === user.id
                                );
                              
                                // Check if user is creator (in both create and edit mode)
                                const isCreatorUser = isEditMode 
                                  ? editingProject?.created_by === user.id 
                                  : currentUserId === user.id;
                                
                                const effectiveRole = getEffectiveRole(user.id, selectedMembers);

                                return (
                                  <div
                                    key={user.id}
                                    className="flex items-center gap-2 p-2 border rounded hover:bg-muted/50 transition-colors"
                                  >
                                    <Checkbox
                                      checked={!!selectedMember}
                                      disabled={isCreatorUser}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([
                                            ...selectedMembers,
                                            { userId: user.id, role: effectiveRole },
                                          ]);
                                          setPendingRoles((prev) => {
                                            const next = { ...prev };
                                            delete next[user.id];
                                            return next;
                                          });
                                        } else {
                                          field.onChange(
                                            selectedMembers.filter((m) => m.userId !== user.id)
                                          );
                                        }
                                        setSearchQuery("");
                                        setShowDropdown(false);
                                        inputRef.current?.focus();
                                      }}
                                      id={`user-${user.id}`}
                                    />

                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {user.name}
                                        {isCreatorUser && (
                                          <span className="ml-2 text-xs text-primary">
                                            ({isEditMode ? "Creator" : "You"})
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {user.email}
                                      </p>
                                    </div>

                                    <Select
                                      value={effectiveRole}
                                      disabled={isCreatorUser}
                                      onValueChange={(newRole) => {
                                        if (selectedMember) {
                                          field.onChange(
                                            selectedMembers.map((m) =>
                                              m.userId === user.id
                                                ? { ...m, role: newRole as ProjectRole }
                                                : m
                                            )
                                          );
                                        } else {
                                          setPendingRoles((prev) => ({
                                            ...prev,
                                            [user.id]: newRole as ProjectRole,
                                          }));
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="w-24 h-7 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="developer">Developer</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="qa">QA</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>

                      {selectedMembers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedMembers.map((m) => {
                            const user = allUsers.find((u) => u.id === m.userId);
                            // Check if user is creator (in both create and edit mode)
                            const isCreatorUser = isEditMode 
                              ? editingProject?.created_by === m.userId 
                              : currentUserId === m.userId;
                            
                            return (
                              <span
                                key={m.userId}
                                className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2 py-1"
                              >
                                {user?.name} ({m.role})
                                {!isCreatorUser && (
                                  <button
                                    type="button"
                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                    onClick={() => {
                                      field.onChange(
                                        selectedMembers.filter((s) => s.userId !== m.userId)
                                      );
                                    }}
                                  >
                                    ✕
                                  </button>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? isEditMode ? "Updating..." : "Creating..."
                  : isEditMode ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};