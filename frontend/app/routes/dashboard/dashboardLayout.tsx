import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../provider/authContext";
import { Loader } from "@/components/ui/loader";
import { Header } from "@/components/layout/header";
import { SidebarComponent } from "@/components/layout/sidebarComponent";
import { useState } from "react";
import { CreateProject } from "@/components/project/createProject";
import { fetchData } from "@/lib/fetchUtils";


export const clientLoader = async () => {
  try {
    const [projects] = await Promise.all([fetchData("/projects")]);
    return { projects };
  } catch (error) {
    console.log(error);
    return { projects: [] }; 
  }
};

export function HydrateFallback() {
  return <Loader />;
}


const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <div className="flex h-screen w-full">
      <SidebarComponent />

      <div className="flex flex-1 flex-col h-full">
        <Header onCreateProject={() => setIsCreatingProject(true)} />

        <main className="flex-1 overflow-y-auto h-full w-full">
          <div className="mx-auto container px-2 sm:px-6 lg:px-8 py-0 md:py-8 w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <CreateProject
        isCreatingProject={isCreatingProject}
        setIsCreatingProject={setIsCreatingProject}
      />
    </div>
  );
};

export default DashboardLayout;