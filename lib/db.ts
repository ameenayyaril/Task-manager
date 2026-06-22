import { supabase } from "./supabase";

export type SubTask = {
  id: string;
  text: string;
  completed: boolean;
};

export type Task = {
  id: string;
  text: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  category: string;
  dueDate?: string;
  notes?: string;
  subtasks?: SubTask[];
  estimatedFocus?: number;
  completedPomodoros?: number;
  createdAt?: string;
};

// Get logged-in user ID
export const getUserId = async (): Promise<string | null> => {
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
};

// Local cache
const getLocalTasks = (): Task[] => {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem("tasks");

  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

// Fetch tasks
export const fetchTasksFromDb = async (): Promise<Task[]> => {
  const cached = getLocalTasks();

  if (!supabase) return cached;

  try {
    const userId = await getUserId();

    if (!userId) return cached;

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const tasks: Task[] =
      data?.map((t: any) => ({
        id: t.id,
        text: t.text,
        priority: t.priority,
        completed: t.completed,
        category: t.category,
        dueDate: t.due_date || "",
        notes: t.notes || "",
        subtasks: t.subtasks || [],
        estimatedFocus: t.estimated_focus || 1,
        completedPomodoros: t.completed_pomodoros || 0,
        createdAt: t.created_at,
      })) || [];

    localStorage.setItem("tasks", JSON.stringify(tasks));

    return tasks;
  } catch (err) {
    console.warn("Fetch failed. Using local cache.", err);
    return cached;
  }
};

// Save one task
export const saveTaskToDb = async (task: Task): Promise<void> => {
  const cached = getLocalTasks();

  const updated = cached.some((t) => t.id === task.id)
    ? cached.map((t) => (t.id === task.id ? task : t))
    : [...cached, task];

  localStorage.setItem("tasks", JSON.stringify(updated));

  if (!supabase) return;

  try {
    const userId = await getUserId();

    if (!userId) return;

    const { error } = await supabase.from("tasks").upsert({
      id: task.id,
      user_id: userId,
      text: task.text,
      priority: task.priority,
      completed: task.completed,
      category: task.category,
      due_date: task.dueDate || null,
      notes: task.notes || "",
      subtasks: task.subtasks || [],
      estimated_focus: task.estimatedFocus || 1,
      completed_pomodoros: task.completedPomodoros || 0,
      created_at: task.createdAt || new Date().toISOString(),
    });

    if (error) throw error;
  } catch (err) {
    console.warn("Save failed.", err);
  }
};

// Save all tasks
export const saveAllTasksToDb = async (
  allTasks: Task[]
): Promise<void> => {
  localStorage.setItem("tasks", JSON.stringify(allTasks));

  if (!supabase) return;

  try {
    const userId = await getUserId();

    if (!userId) return;

    const rows = allTasks.map((task) => ({
      id: task.id,
      user_id: userId,
      text: task.text,
      priority: task.priority,
      completed: task.completed,
      category: task.category,
      due_date: task.dueDate || null,
      notes: task.notes || "",
      subtasks: task.subtasks || [],
      estimated_focus: task.estimatedFocus || 1,
      completed_pomodoros: task.completedPomodoros || 0,
      created_at: task.createdAt || new Date().toISOString(),
    }));

    const { error } = await supabase.from("tasks").upsert(rows);

    if (error) throw error;
  } catch (err) {
    console.warn("Batch save failed.", err);
  }
};

// Delete one task
export const deleteTaskFromDb = async (
  taskId: string
): Promise<void> => {
  const cached = getLocalTasks();

  localStorage.setItem(
    "tasks",
    JSON.stringify(cached.filter((t) => t.id !== taskId))
  );

  if (!supabase) return;

  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) throw error;
  } catch (err) {
    console.warn("Delete failed.", err);
  }
};

// Clear all tasks
export const clearAllTasksFromDb = async (): Promise<void> => {
  localStorage.setItem("tasks", JSON.stringify([]));

  if (!supabase) return;

  try {
    const userId = await getUserId();

    if (!userId) return;

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
  } catch (err) {
    console.warn("Clear failed.", err);
  }
};