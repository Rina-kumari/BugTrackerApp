import { ProjectAvatar } from '@/components/project/projectAvatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle} from "@/components/ui/alert-dialog";
import type { Project } from '@/types/indexTypes';
import { format } from 'date-fns';
import { Users, Pencil, Trash2, UserCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';

const ProjectCard = ({ 
  project, 
  onEdit, 
  onDelete,
  currentUserId 
}: { 
  project: Project; 
  onEdit?: (project: Project) => void; 
  onDelete?: (id: number) => void;
  currentUserId?: number;
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  const isOwner = project.created_by === currentUserId;

  const handleDelete = () => {
    onDelete?.(project.id);
    setShowDeleteDialog(false);
  };

  const handleCardClick = () => {
    navigate(`/projects/${project.id}`);
  };
  const truncatedDescription = project.description 
    ? project.description.length > 20 
      ? `${project.description.substring(0, 20)}...` 
      : project.description
    : "No description";
      
  return (
    <>
      <Card 
        className="transition-all hover:shadow-md hover:-translate-y-1 relative cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex gap-2 flex-1 min-w-0 overflow-hidden">
              <div className="shrink-0">
                <ProjectAvatar title={project.title} />
              </div>

              <div className="flex-1 min-w-0 overflow-hidden">
                <CardTitle className="text-base truncate">{project.title}</CardTitle>
                
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {project.created_at && format(new Date(project.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>

                
              </div>
            </div>
            <div className="flex items-center text-muted-foreground shrink-0">
              <Users className="h-4 w-4 mr-1.5" />
              <span className="text-sm">{project.members?.length || 0}</span>
            </div>
          </div>

          <CardDescription className="mt-2">
            {truncatedDescription}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
          
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <UserCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {' '}
                <span 
                  className="font-medium text-foreground cursor-help underline decoration-dotted"
                  title={`Email: ${project.created_by_user?.email || 'N/A'}\nRole: ${project.created_by_user?.role || 'N/A'}`}
                >
                  {project.created_by_user?.name || 'Unknown'}
                </span>
              </span>
            </div>

          
            <div className="flex items-center gap-1 shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={!isOwner}
                onClick={(e: React.MouseEvent) => { 
                  e.preventDefault(); 
                  e.stopPropagation();
                  if (isOwner) {
                    onEdit?.(project);
                  }
                }}
                title={!isOwner ? "Only the project creator can edit" : "Edit project"}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={!isOwner}
                onClick={(e: React.MouseEvent) => { 
                  e.preventDefault(); 
                  e.stopPropagation();
                  if (isOwner) {
                    setShowDeleteDialog(true);
                  }
                }}
                title={!isOwner ? "Only the project creator can delete" : "Delete project"}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.title}"?
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
    </>
  );
};

export default ProjectCard;