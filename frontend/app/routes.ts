import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("routes/auth/auth-layout.tsx",[
        index("routes/root/home.tsx"), 
        route("sign-in","routes/auth/signIn.tsx"),
        route("sign-up","routes/auth/signUp.tsx"),
      route("forgot-password","routes/auth/forgotPassword.tsx"),
      route("reset-password","routes/auth/resetPassword.tsx"),
    ]),

    
  layout("routes/dashboard/dashboardLayout.tsx", [
    route("dashboard", "routes/dashboard/dashboard.tsx"),
    route("projects","routes/dashboard/projects/indexProject.tsx"),
    route("projects/:projectId","routes/dashboard/projects/projectDetail.tsx"),
    route("projects/:projectId/tasks/:taskId","routes/dashboard/task/taskDetailPage.tsx"),
     route("profile", "routes/auth/userProfile.tsx"), 
  ]),

  route("*", "routes/auth/not-found.tsx"),

 ] satisfies RouteConfig;
