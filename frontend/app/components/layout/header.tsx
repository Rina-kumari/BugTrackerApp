import { useAuth } from "@/provider/authContext";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link, useLoaderData, useNavigate, useParams, useSearchParams } from "react-router";
import type { Project } from "@/types/indexTypes";
import { ProjectAvatar } from "../project/projectAvatar";

interface HeaderProps {
  selectedProject?: Project | null;
  onCreateProject?: () => void;
}

export const Header = ({
  selectedProject: selectedProjectProp,
}: HeaderProps) => {

  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { projects } = useLoaderData() as { projects: Project[] };

  const activeProjectId = params.projectId ?? searchParams.get("projectId");

  const resolvedProject =
    selectedProjectProp ?? projects.find((p) => p.id === Number(activeProjectId)) ?? null;

  const onAllProjectsSelected = () => {
    const pathname = window.location.pathname;
    const isOnProjectPage = pathname.includes("/projects/");

    if (isOnProjectPage) {
      navigate("/projects");
    } else {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("projectId");
      const paramString = newParams.toString();
      navigate(paramString ? `${pathname}?${paramString}` : pathname);
    }
  };

  const onProjectSelected = (project: Project) => {
    const pathname = window.location.pathname;
    const isOnProjectPage = pathname.includes("/projects/");

    if (isOnProjectPage) {
      navigate(`/projects/${project.id}`);
    } else {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("projectId", String(project.id));
      navigate(`${pathname}?${newParams.toString()}`);
    }
  };

  return (
    <div className="bg-background sticky top-0 z-40 border-b">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                {resolvedProject ? (
                  <>
                    <ProjectAvatar title={resolvedProject.title} />
                    <span className="font-medium">{resolvedProject.title}</span>
                  </>
                ) : (
                  <span className="font-medium">All Projects</span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuLabel>Project</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onAllProjectsSelected}>
                  <span className="ml-6">All Projects</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                {projects.map((ps: Project) => (
                  <DropdownMenuItem
                    key={ps.id}
                    onClick={() => onProjectSelected(ps)}
                  >
                    <ProjectAvatar title={ps.title} />
                    <span className="ml-2">{ps.title}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button className="rounded-full p-1 w-8 h-8">
      <Avatar className="w-8 h-8">
        <AvatarFallback className="bg-primary text-primary-foreground">
          {user?.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-48">
    
    
    <DropdownMenuItem asChild>
      <Link to="/profile">Profile</Link>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={logout}>Log Out</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

        </div>
      </div>
    </div>
  );
};