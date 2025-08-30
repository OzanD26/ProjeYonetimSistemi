import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../components/ui/RootLayout";
import Protected from "../components/ui/Protected";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import Login from "../features/auth/Login";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Protected />,
    children: [
      {
        path: "/",
        element: <RootLayout />,
        children: [{ index: true, element: <Dashboard /> }],
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFound /> },
]);
