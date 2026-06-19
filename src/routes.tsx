import type { RouteObject } from "react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Tasks } from "@/pages/Tasks";
import { Notes } from "@/pages/Notes";
import { Tools } from "@/pages/Tools";

export const routes: RouteObject[] = [
  {
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "tasks", element: <Tasks /> },
      { path: "notes", element: <Notes /> },
      { path: "tools", element: <Tools /> },
    ],
  },
];
