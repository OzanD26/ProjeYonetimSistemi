import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../components/ui/RootLayout";
import Protected from "../components/ui/Protected";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import Login from "../features/auth/Login";
import ProjectsPage from "../features/projects/ProjectsPage";
import TasksPage from "../features/tasks/TasksPage";   // +++

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Protected />,
    children: [
      {
        path: "/",
        element: <RootLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "/projects", element: <ProjectsPage /> },
          { path: "/tasks", element: <TasksPage /> },   // +++
        ],
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFound /> },
]);
