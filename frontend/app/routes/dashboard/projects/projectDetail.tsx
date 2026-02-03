import { Loader } from "@/components/ui/loader";
import { CreateTaskDialog } from "@/components/task/createTask";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useProjectsQuery, useGetProjectQuery, useAuth, useDeleteProject } from "@/hooks/useProjectHooks";
import type { Task, TaskStatus } from "@/types/indexTypes";
import { Search, X, ArrowLeft, Edit, Trash2, Users, UserCircle, Calendar, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { TaskCard } from "../task/taskCard";
import {AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { CreateProject } from "@/components/project/createProject";
import { useQueryClient } from "@tanstack/react-query";
import {DndContext,DragOverlay,PointerSensor,useSensor,useSensors,closestCorners,type DragEndEvent,type DragStartEvent} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateData } from "@/lib/fetchUtils";

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCreateTask, setIsCreateTask] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<TaskStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string | number>("all");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const wasEditingRef = useRef(false);

  const { data, isLoading } = useProjectsQuery(projectId!);
  const { data: projectData } = useGetProjectQuery(projectId!);
  const { data: currentUser } = useAuth();
  const deleteProjectMutation = useDeleteProject();

  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, 
      },
    })
  );

  const filteredTasks = useMemo(() => {
    if (!data?.tasks) return [];

    return data.tasks.filter((task) => {
      const matchesSearch =
        searchQuery === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      const matchesAssignee =
        assigneeFilter === "all" ||
        (typeof assigneeFilter === "number" &&
          task.assignees?.some((assignee) => assignee.id === assigneeFilter));

      const matchesStatus = taskFilter === "All" || task.status === taskFilter;

      return matchesSearch && matchesPriority && matchesAssignee && matchesStatus;
    });
  }, [data?.tasks, searchQuery, priorityFilter, assigneeFilter, taskFilter]);

  const uniqueAssignees = useMemo(() => {
    if (!data?.tasks) return [];
    const assigneeMap = new Map();
    data.tasks.forEach((task) => {
      task.assignees?.forEach((assignee) => {
        if (!assigneeMap.has(assignee.id)) {
          assigneeMap.set(assignee.id, assignee);
        }
      });
    });
    return Array.from(assigneeMap.values());
  }, [data?.tasks]);

  const clearFilters = () => {
    setSearchQuery("");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setTaskFilter("All");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    priorityFilter !== "all" ||
    assigneeFilter !== "all" ||
    taskFilter !== "All";

  useEffect(() => {
    if (!isEditDialogOpen && wasEditingRef.current && projectId) {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      }, 100);
      wasEditingRef.current = false;
    }
  }, [isEditDialogOpen, projectId, queryClient]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = data?.tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = data?.tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const previousData = queryClient.getQueryData(["projects", projectId]);

    queryClient.setQueryData(["projects", projectId], (old: any) => {
      if (!old) return old;
      
      return {
        ...old,
        tasks: old.tasks.map((t: Task) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        ),
      };
    });

    try {
      await updateData(`/tasks/${taskId}/status`, { status: newStatus });
      
      toast.success(`Task moved to ${newStatus}`);
    } catch (error) {
      console.error("Error updating task:", error);
      
      queryClient.setQueryData(["projects", projectId], previousData);
      
      toast.error("Failed to update task status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return <div>No data found</div>;
  }

  const { project, tasks } = data;
  const projectWithCreator = projectData || project;
  const isOwner = projectWithCreator.created_by === currentUser?.id;

  const handleTaskClick = (taskId: string) => {
    navigate(`/projects/${projectId}/tasks/${taskId}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEdit = () => {
    wasEditingRef.current = true;
    setIsEditDialogOpen(true);
  };

  const handleProjectUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
  };

  const handleDelete = () => {
    deleteProjectMutation.mutate(Number(projectId), {
      onSuccess: () => {
        toast.success("Project deleted successfully");
        navigate("/projects");
      },
      onError: (error) => {
        toast.error("Failed to delete project");
        console.error("Delete error:", error);
      },
    });
    setShowDeleteDialog(false);
  };

  return (
    <div className="space-y-6">
    
      <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
        <Link
          to="/projects"
          className="hover:text-foreground transition-colors"
        >
          Projects
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium truncate max-w-md">
          {projectWithCreator.title}
        </span>
      </nav>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreateTask(true)} size="lg">
            Add Task
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleEdit}
            disabled={!isOwner}
            title={!isOwner ? "Only the project creator can edit" : "Edit project"}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            disabled={!isOwner}
            title={!isOwner ? "Only the project creator can delete" : "Delete project"}
            className="text-destructive hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{projectWithCreator.title}</CardTitle>
          {projectWithCreator.description && (
            <CardDescription className="text-base">
              {projectWithCreator.description}
            </CardDescription>
          )}
          
          {projectWithCreator.created_at && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>
                {' '}
                {new Date(projectWithCreator.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {' at '}
                {new Date(projectWithCreator.created_at).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </CardHeader>

        {projectWithCreator.members && projectWithCreator.members.length > 0 && (
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Project Members</h3>
                <Badge variant="secondary" className="text-xs">
                  {projectWithCreator.members.length}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {projectWithCreator.members.map((member) => (
                  <div key={member.user_id} className="group relative">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="absolute left-0 top-full mt-2 z-50 hidden group-hover:block">
                      <div className="bg-popover border rounded-lg shadow-lg p-3 min-w-50">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">
                                {member.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {member.email}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {member.role || "Member"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {projectWithCreator.created_by_user && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
                  <UserCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {' '}
                    <span 
                      className="font-medium text-foreground cursor-help underline decoration-dotted"
                      title={`Email: ${projectWithCreator.created_by_user.email || 'N/A'}\nRole: ${projectWithCreator.created_by_user.role || 'N/A'}`}
                    >
                      {projectWithCreator.created_by_user.name}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={String(priorityFilter)} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={taskFilter}
            onValueChange={(value) => setTaskFilter(value as TaskStatus | "All")}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="To Do">To Do</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="In Testing">Testing</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={String(assigneeFilter)}
            onValueChange={(value) =>
              setAssigneeFilter(
                value === "all" ? "all" : isNaN(Number(value)) ? value : Number(value)
              )
            }
          >
            <SelectTrigger className="w-full sm:w-45">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {uniqueAssignees.map((assignee) => (
                <SelectItem key={assignee.id} value={String(assignee.id)}>
                  {assignee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={clearFilters}
              title="Clear filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsContent value="all" className="m-0 mt-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <TaskColumn
                title="To Do"
                status="To Do"
                tasks={filteredTasks.filter((task) => task.status === "To Do")}
                onTaskClick={handleTaskClick}
              />
              <TaskColumn
                title="In Progress"
                status="In Progress"
                tasks={filteredTasks.filter((task) => task.status === "In Progress")}
                onTaskClick={handleTaskClick}
              />
              <TaskColumn
                title="Testing"
                status="Testing"
                tasks={filteredTasks.filter((task) => task.status === "Testing")}
                onTaskClick={handleTaskClick}
              />
              <TaskColumn
                title="Done"
                status="Done"
                tasks={filteredTasks.filter((task) => task.status === "Done")}
                onTaskClick={handleTaskClick}
              />
            </div>

            <DragOverlay>
              {activeTask ? (
                <div className="opacity-80">
                  <TaskCard task={activeTask} onClick={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </TabsContent>
      </Tabs>

      <CreateTaskDialog
        open={isCreateTask}
        onOpenChange={setIsCreateTask}
        projectId={projectId!}
        projectMembers={projectWithCreator.members || []}
      />

      <CreateProject
        isCreatingProject={isEditDialogOpen}
        setIsCreatingProject={setIsEditDialogOpen}
        editingProject={projectWithCreator}
        onProjectUpdated={handleProjectUpdated}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectWithCreator.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDetails;

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

const TaskColumn = ({ title, status, tasks, onTaskClick }: TaskColumnProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b">
        <h2 className="font-semibold text-sm">{title}</h2>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>

      <DroppableColumn id={status}>
        {tasks.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableTask key={task.id} task={task} onTaskClick={onTaskClick} />
          ))
        )}
      </DroppableColumn>
    </div>
  );
};

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
}

const DroppableColumn = ({ id, children }: DroppableColumnProps) => {
  const { setNodeRef } = useSortable({ id });

  return (
    <SortableContext
      id={id}
      items={[]}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        className="space-y-3 min-h-50 p-2 rounded-lg transition-colors bg-muted/20"
      >
        {children}
      </div>
    </SortableContext>
  );
};

interface DraggableTaskProps {
  task: Task;
  onTaskClick: (taskId: string) => void;
}

const DraggableTask = ({ task, onTaskClick }: DraggableTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <TaskCard task={task} onClick={() => onTaskClick(task.id)} />
    </div>
  );
};