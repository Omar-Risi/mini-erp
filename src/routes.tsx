import type { RouteObject } from "react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dashboard, dashboardLoader } from "@/pages/Dashboard";
import { Tasks, tasksLoader, tasksAction } from "@/pages/Tasks";
import { NotesList, notesListLoader, notesListAction } from "@/pages/NotesList";
import { NoteEditor, noteLoader, noteAction } from "@/pages/NoteEditor";
import { Tools } from "@/pages/Tools";

export const routes: RouteObject[] = [
  {
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Dashboard />, loader: dashboardLoader },
      { path: "tasks", element: <Tasks />, loader: tasksLoader, action: tasksAction },
      {
        path: "notes",
        children: [
          { index: true, element: <NotesList />, loader: notesListLoader, action: notesListAction },
          { path: ":id", element: <NoteEditor />, loader: noteLoader, action: noteAction },
        ],
      },
      { path: "tools", element: <Tools /> },
    ],
  },
];
