import { NoDataFound } from '@/components/noDataFound';
import { CreateProject } from '@/components/project/createProject';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { useGetProjectsQuery, useDeleteProject, useGetProjectQuery } from '@/hooks/useProjectHooks';
import type { Project } from '@/types/indexTypes';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import ProjectCard from './projectCard';
import { useAuth } from '@/hooks/useProjectHooks';

const Projects = () => {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [searchParams] = useSearchParams();

  const projectId = searchParams.get("projectId");

  const { data: user } = useAuth();
  const { data: projects, isLoading } = useGetProjectsQuery() as {
    data: Project[];
    isLoading: boolean;
  };
  
  const { data: editingProject } = useGetProjectQuery(editingProjectId?.toString() || '', {
    enabled: !!editingProjectId
  }) as { data: Project | undefined };

  const { mutate: deleteProject } = useDeleteProject();


  const filteredProjects = projectId
    ? projects.filter((p) => p.id === Number(projectId))
    : projects;

  useEffect(() => {
    if (editingProject) {
      setIsCreatingProject(true);
    }
  }, [editingProject]);

  const handleEdit = (project: Project) => {
    setEditingProjectId(project.id);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
    }
  };

  const handleCloseDialog = () => {
    setIsCreatingProject(false);
    setEditingProjectId(null);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-3xl font-bold">
            {projectId && filteredProjects.length > 0
              ? filteredProjects[0].title
              : "Projects"}
          </h2>

          <Button onClick={() => setIsCreatingProject(true)}>
            New Project
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((ps) => (
            <ProjectCard
              key={ps.id}
              project={ps}
              currentUserId={user?.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

          {filteredProjects.length === 0 && (
            <NoDataFound
              title={projectId ? "Project not found" : "No project found"}
              description={
                projectId
                  ? "The selected project doesn't exist or was deleted"
                  : "Create a new project to get started"
              }
              buttonText="Create project"
              buttonAction={() => setIsCreatingProject(true)}
            />
          )}
        </div>
      </div>

      <CreateProject
        isCreatingProject={isCreatingProject}
        setIsCreatingProject={handleCloseDialog}
        editingProject={editingProject || null}
      />
    </>
  );
};

export default Projects;