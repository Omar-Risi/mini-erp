export type Task = {
  id: number;
  title: string;
  due_date: string;
  assigned_date: string;
  is_overdue: number;
  days_overdue: number;
  status: string;
  created_at: string;
  completed_at: string | null;
};

export type Note = {
  id: number;
  title: string;
  body: string;
  is_daily: number;
  daily_date: string | null;
  created_at: string;
  updated_at: string;
};
