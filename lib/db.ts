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

// Helper: Retrieve or generate unique anonymous user session ID
export const getUserId = (): string => {
  if (typeof window === "undefined") return "server_session";
  let userId = localStorage.getItem("taskflow_user_id");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem("taskflow_user_id", userId);
  }
  return userId;
};

// Helper: Read local storage cache
const getLocalTasks = (): Task[] => {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("tasks");
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Operation 1: Fetch all tasks (syncs cloud with cache)
export const fetchTasksFromDb = async (): Promise<Task[]> => {
  const cached = getLocalTasks();
  if (!supabase) return cached;

  const userId = getUserId();
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    if (data) {
      // Map database snake_case fields back to frontend camelCase Task type
      const mapped: Task[] = data.map((t: any) => ({
        id: t.id,
        text: t.text,
        priority: t.priority,
        completed: t.completed,
        category: t.category,
        dueDate: t.due_date || "",
        notes: t.notes || "",
        subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
        estimatedFocus: t.estimated_focus || 1,
        completedPomodoros: t.completed_pomodoros || 0,
        createdAt: t.created_at,
      }));

      // Cache locally
      localStorage.setItem("tasks", JSON.stringify(mapped));
      return mapped;
    }
  } catch (err) {
    console.warn("TaskFlow database offline or fetch failed. Using local storage.", err);
  }
  return cached;
};

// Operation 2: Save or Update a single task
export const saveTaskToDb = async (task: Task): Promise<void> => {
  const cached = getLocalTasks();
  const exists = cached.some((t) => t.id === task.id);
  const updated = exists
    ? cached.map((t) => (t.id === task.id ? task : t))
    : [...cached, task];

  localStorage.setItem("tasks", JSON.stringify(updated));

  if (!supabase) return;
  const userId = getUserId();
  try {
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
    console.warn("Supabase save task failed. Local storage backup updated.", err);
  }
};

// Operation 3: Save / Batch Sync all tasks (e.g. clear, toggle, or bulk edit notes)
export const saveAllTasksToDb = async (allTasks: Task[]): Promise<void> => {
  localStorage.setItem("tasks", JSON.stringify(allTasks));

  if (!supabase) return;
  const userId = getUserId();
  try {
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
    console.warn("Supabase batch sync failed. Local storage backup updated.", err);
  }
};

// Operation 4: Delete task
export const deleteTaskFromDb = async (taskId: string): Promise<void> => {
  const cached = getLocalTasks();
  const updated = cached.filter((t) => t.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(updated));

  if (!supabase) return;
  try {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) throw error;
  } catch (err) {
    console.warn("Supabase delete task failed. Local storage backup updated.", err);
  }
};

// Operation 5: Clear all user tasks
export const clearAllTasksFromDb = async (): Promise<void> => {
  localStorage.setItem("tasks", JSON.stringify([]));

  if (!supabase) return;
  const userId = getUserId();
  try {
    const { error } = await supabase.from("tasks").delete().eq("user_id", userId);
    if (error) throw error;
  } catch (err) {
    console.warn("Supabase clear tasks failed. Local storage backup updated.", err);
  }
};
