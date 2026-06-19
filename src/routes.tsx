import type { RouteObject } from "react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dashboard, dashboardLoader } from "@/pages/Dashboard";
import { Tasks, tasksLoader, tasksAction } from "@/pages/Tasks";
import { Notes } from "@/pages/Notes";
import { Tools } from "@/pages/Tools";

export const routes: RouteObject[] = [
  {
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Dashboard />, loader: dashboardLoader },
      { path: "tasks", element: <Tasks />, loader: tasksLoader, action: tasksAction },
      { path: "notes", element: <Notes /> },
      { path: "tools", element: <Tools /> },
    ],
  },
];
