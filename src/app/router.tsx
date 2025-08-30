import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../components/ui/RootLayout";
import Protected from "../components/ui/Protected";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import Login from "../features/auth/Login";
<<<<<<< HEAD
=======
import ProjectsPage from "../features/projects/ProjectsPage";  // +++
>>>>>>> 9447b77 (Mock api ayarları login girişi ayarlandı)

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Protected />,
    children: [
      {
        path: "/",
        element: <RootLayout />,
<<<<<<< HEAD
        children: [{ index: true, element: <Dashboard /> }],
=======
        children: [
          { index: true, element: <Dashboard /> },
          { path: "/projects", element: <ProjectsPage /> },   // +++
        ],
>>>>>>> 9447b77 (Mock api ayarları login girişi ayarlandı)
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFound /> },
]);
