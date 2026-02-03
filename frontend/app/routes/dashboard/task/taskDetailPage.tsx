import { useDeleteTaskMutation, useTaskByIdQuery } from '@/hooks/useTaskHook';
import { useAuth } from '@/hooks/useProjectHooks';
import type { Project, Task } from '@/types/indexTypes';
import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import { Loader } from '../../../components/ui/loader';
import { Badge } from '@/components/ui/badge';
import { TaskTitle } from '@/components/task/taskTitle';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { TaskStatusSelector } from '@/components/task/taskStatus';
import { TaskDescription } from '@/components/task/taskDescription';
import { TaskAssigneesSelector } from '@/components/task/taskAssignee';
import { TaskPrioritySelector } from '@/components/task/taskPriority';
import { SubTasksDetails } from '@/components/task/subTask';
import { TaskActivity } from '@/components/task/taskActivity';
import { CommentSection } from '@/components/task/commentsection';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, UserCircle, ChevronRight } from 'lucide-react';

const taskDetailPage = () => {

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { data: currentUser, isLoading: isLoadingUser } = useAuth(); // Get current user
    const {taskId, projectId} = useParams<{
        taskId:string;
        projectId:string;
    }>();
    const navigate = useNavigate();

    const {data, isLoading} = useTaskByIdQuery(taskId!) as {
        data: {
            task: Task;
            project: Project;
        };
        isLoading: boolean;
    };

    const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();

    if (isLoading || isLoadingUser){
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader />
            </div>
        )
    }

    if(!data) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-2xl font-bold">Task not found</div>
            </div>
        )
    }

    const {task, project} = data;
    const members = task?.assignee || []; 
    const isTaskCreator = currentUser?.id === task.created_by;

    const handleDeleteTask = () => {
        if (!isTaskCreator) {
            toast.error("Only the task creator can delete this task");
            return;
        }

        if (window.confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`)) {
            deleteTask(taskId!, {
                onSuccess: (response) => {
                    toast.success("Task deleted successfully");
                    navigate(`/projects/${response.projectId || projectId}`);
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || "Failed to delete task");
                },
            });
        }
    };

    return (
        <div className="container mx-auto p-4 md:px-6 max-w-7xl">
    
            <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
                <Link
                    to="/projects"
                    className="hover:text-foreground transition-colors"
                >
                    Projects
                </Link>
                <ChevronRight className="h-4 w-4" />
                <Link
                    to={`/projects/${projectId}`}
                    className="hover:text-foreground transition-colors truncate max-w-xs"
                >
                    {project.title}
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium truncate max-w-md">
                    {task.title}
                </span>
            </nav>

            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                    {!isTaskCreator && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            
                        </span>
                    )}
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleDeleteTask}
                        disabled={!isTaskCreator || isDeleting}
                        className="relative"
                    >
                        {isDeleting ? "Deleting..." : "Delete Task"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                    
                    <div className="bg-card rounded-lg p-6 shadow-sm">
                    
                        <div className="mb-4">
                            <TaskTitle title={task.title} taskId={task.id} />
                        </div>

                        <div className="mb-4">
                            <TaskDescription
                                description={task.description || ""}
                                taskId={task.id}
                            />
                        </div>

                        <div className="text-sm mb-6 space-y-2">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                {task.created_at && formatDistanceToNow(new Date(task.created_at), {
                                    addSuffix: true,
                                })}
                            </div>
                            {task.created_by_user && (
                                <div className="flex items-center gap-1.5 text-sm">
                                    <UserCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span 
                                        className="font-medium text-foreground cursor-help underline decoration-dotted"
                                        title={`Email: ${task.created_by_user.email || 'N/A'}\nRole: ${task.created_by_user.role || 'N/A'}`}
                                    >
                                        {task.created_by_user.name}
                                    </span>
                                    {isTaskCreator && (
                                        <Badge variant="outline" className="ml-2 text-xs">
                                            You
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                    Status
                                </h3>
                                <TaskStatusSelector status={task.status} taskId={task.id} />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                    Priority
                                </h3>
                                <TaskPrioritySelector priority={task.priority} taskId={task.id} />
                            </div>
                        </div>

                        <div className="mb-6">
                            <TaskAssigneesSelector
                                task={task}
                                assignees={task.assignees || []}
                                projectMembers={project.members as any}
                            />
                        </div>

                        <SubTasksDetails subTasks={task.subtasks || []} taskId={task.id} />
                    </div>

                    <CommentSection taskId={task.id} members={project.members as any} />
                </div>

                <div className="lg:col-span-1">
                    <div className="lg:sticky lg:top-4">
                        <TaskActivity resourceId={task.id} />
                    </div>
                </div>
            </div>
        </div>                
    )
}
export default taskDetailPage;