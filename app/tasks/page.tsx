"use client";

import { useState, useEffect, useRef } from "react";
import {
  fetchTasksFromDb,
  saveTaskToDb,
  saveAllTasksToDb,
  deleteTaskFromDb,
  clearAllTasksFromDb,
  type Task,
  type SubTask,
} from "../../lib/db";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  decay: number;
};

export default function Tasks() {
  // Task input states
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [category, setCategory] = useState("General");
  const [dueDate, setDueDate] = useState("");
  const [estimatedFocus, setEstimatedFocus] = useState(1);

  // Filter/Sort states
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("dueDateAsc");

  // App data states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newSubtaskTexts, setNewSubtaskTexts] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  // Confetti canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Load and migrate tasks from database
  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      const data = await fetchTasksFromDb();
      setTasks(data);
    };
    loadData();
  }, []);

  // Sync state wrapper
  const saveTasksToStore = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    saveAllTasksToDb(updatedTasks);
  };

  // Confetti particle canvas setup
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const triggerConfetti = (clientX?: number, clientY?: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = clientX !== undefined ? clientX : rect.width / 2;
    const y = clientY !== undefined ? clientY : rect.height / 2;

    const colors = ["#8b5cf6", "#d946ef", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
    const newParticles: Particle[] = [];

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (1 + Math.random() * 2), // upward force
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: 3 + Math.random() * 3,
        alpha: 1,
        decay: 0.015 + Math.random() * 0.015,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];

    if (!animationFrameRef.current) {
      tickConfetti();
    }
  };

  const tickConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    const remaining: Particle[] = [];

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.alpha -= p.decay;

      if (p.alpha > 0) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        remaining.push(p);
      }
    }

    particlesRef.current = remaining;

    if (remaining.length > 0) {
      animationFrameRef.current = requestAnimationFrame(tickConfetti);
    } else {
      animationFrameRef.current = null;
    }
  };

  // Add new task
  const addTask = () => {
    if (taskName.trim() === "") return;

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: taskName.trim(),
      priority,
      completed: false,
      category,
      dueDate,
      notes: "",
      subtasks: [],
      estimatedFocus,
      completedPomodoros: 0,
      createdAt: new Date().toISOString(),
    };

    saveTasksToStore([...tasks, newTask]);

    // Reset fields
    setTaskName("");
    setDueDate("");
    setEstimatedFocus(1);
  };

  // Delete task
  const deleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter((t) => t.id !== id));
      deleteTaskFromDb(id);
      if (expandedTaskId === id) setExpandedTaskId(null);
    }
  };

  // Toggle task completion
  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          triggerConfetti(e.clientX, e.clientY);
        }
        return { ...t, completed: nextState };
      }
      return t;
    });

    saveTasksToStore(updated);

    // If all tasks are completed, trigger a fullscreen celebration burst
    const activeTasksCount = updated.filter((t) => !t.completed).length;
    if (activeTasksCount === 0 && updated.length > 0) {
      setTimeout(() => {
        triggerConfetti(window.innerWidth / 2 - 100, window.innerHeight / 2);
        triggerConfetti(window.innerWidth / 2 + 100, window.innerHeight / 2);
      }, 400);
    }
  };

  // Edit task notes
  const updateNotes = (id: string, text: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        return { ...t, notes: text };
      }
      return t;
    });
    saveTasksToStore(updated);
  };

  // Add subtask
  const addSubtask = (taskId: string) => {
    const text = newSubtaskTexts[taskId]?.trim() || "";
    if (text === "") return;

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const sub = t.subtasks || [];
        const newSub: SubTask = {
          id: `sub_${Date.now()}`,
          text,
          completed: false,
        };
        return { ...t, subtasks: [...sub, newSub] };
      }
      return t;
    });

    saveTasksToStore(updated);
    setNewSubtaskTexts({ ...newSubtaskTexts, [taskId]: "" });
  };

  // Toggle subtask completion
  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const sub = (t.subtasks || []).map((s) => {
          if (s.id === subtaskId) {
            return { ...s, completed: !s.completed };
          }
          return s;
        });
        return { ...t, subtasks: sub };
      }
      return t;
    });
    saveTasksToStore(updated);
  };

  // Delete subtask
  const deleteSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const sub = (t.subtasks || []).filter((s) => s.id !== subtaskId);
        return { ...t, subtasks: sub };
      }
      return t;
    });
    saveTasksToStore(updated);
  };

  // Clear all tasks
  const clearAll = () => {
    if (confirm("Are you sure you want to clear all tasks from store?")) {
      setTasks([]);
      clearAllTasksFromDb();
      setExpandedTaskId(null);
    }
  };

  // Helper styles for categories
  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case "Coding":
        return { bg: "bg-amber-500/10", text: "text-amber-400 border-amber-500/20", bullet: "bg-amber-400 shadow-[0_0_6px_#f59e0b]" };
      case "Math":
        return { bg: "bg-violet-500/10", text: "text-violet-400 border-violet-500/20", bullet: "bg-violet-400 shadow-[0_0_6px_#8b5cf6]" };
      case "Science":
        return { bg: "bg-emerald-500/10", text: "text-emerald-400 border-emerald-500/20", bullet: "bg-emerald-400 shadow-[0_0_6px_#10b981]" };
      case "Humanities":
        return { bg: "bg-rose-500/10", text: "text-rose-400 border-rose-500/20", bullet: "bg-rose-400 shadow-[0_0_6px_#f43f5e]" };
      case "Languages":
        return { bg: "bg-sky-500/10", text: "text-sky-400 border-sky-500/20", bullet: "bg-sky-400 shadow-[0_0_6px_#0ea5e9]" };
      default:
        return { bg: "bg-zinc-800/40", text: "text-zinc-400 border-zinc-800", bullet: "bg-zinc-400" };
    }
  };

  // Helper status for deadlines
  const getDeadlineBadge = (dueDateStr?: string, isCompleted?: boolean) => {
    if (!dueDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    if (isCompleted) {
      return { text: "Done", style: "bg-zinc-900 border-zinc-800 text-zinc-500" };
    }

    const diff = due.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { text: "Overdue", style: "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse" };
    } else if (days === 0) {
      return { text: "Today", style: "bg-amber-500/10 border-amber-500/20 text-amber-400" };
    } else if (days === 1) {
      return { text: "Tomorrow", style: "bg-sky-500/10 border-sky-500/20 text-sky-400" };
    } else {
      return { text: `Due in ${days}d`, style: "bg-zinc-900 border-zinc-800 text-zinc-400" };
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.text.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "All" || t.category === filterCategory;
    const matchesStatus =
      filterStatus === "All" ||
      (filterStatus === "Active" && !t.completed) ||
      (filterStatus === "Completed" && t.completed);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "dueDateAsc") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === "dueDateDesc") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    if (sortBy === "priorityHigh") {
      const order = { High: 3, Medium: 2, Low: 1 };
      return order[b.priority] - order[a.priority];
    }
    if (sortBy === "alphabetical") {
      return a.text.localeCompare(b.text);
    }
    return 0;
  });

  // Stats
  const completedCount = tasks.filter((t) => t.completed).length;
  const percentage =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  // Dynamic unique subjects
  const categoriesList = ["General", "Math", "Science", "Humanities", "Languages", "Coding"];

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4">
      {/* Canvas for custom local confetti */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-50 w-full h-full"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-violet-600/10 text-violet-400">
              📝
            </span>
            <span>Task Planner</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Build checkboxes, schedule focus sessions, and customize subject categories.
          </p>
        </div>

        {tasks.length > 0 && (
          <button
            onClick={clearAll}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-red-950/20 hover:bg-red-900/40 border border-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Reset Database</span>
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Filters */}
        <div className="space-y-6 lg:col-span-1">
          {/* Create Task Card */}
          <div className="glass p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-xl -z-10" />

            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6]" />
              <span>Create Assignment</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  Task Name
                </label>
                <input
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="e.g. Write Calculus lab report..."
                  className="w-full bg-zinc-900/60 border border-zinc-800/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Subject Tag
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-3 py-3 text-xs text-white outline-none cursor-pointer"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-3 py-3 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="High">High 🔴</option>
                    <option value="Medium">Medium 🟡</option>
                    <option value="Low">Low 🟢</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Est. Focus
                  </label>
                  <select
                    value={estimatedFocus}
                    onChange={(e) => setEstimatedFocus(Number(e.target.value))}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-3 py-3 text-xs text-white outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} Pomodoro{num > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={addTask}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/10 hover:shadow-violet-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Assignment</span>
              </button>
            </div>
          </div>

          {/* Filtering & Sorting Card */}
          <div className="glass p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 shadow-[0_0_8px_#d946ef]" />
              <span>Filters & Sorting</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  Search keyword
                </label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter name..."
                  className="w-full bg-zinc-900/60 border border-zinc-800/80 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  Status
                </label>
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-850">
                  {["All", "Active", "Completed"].map((statusOption) => (
                    <button
                      key={statusOption}
                      onClick={() => setFilterStatus(statusOption)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all ${
                        filterStatus === statusOption
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-500 hover:text-zinc-355"
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 focus:border-fuchsia-500 rounded-xl p-2.5 text-xs text-white cursor-pointer outline-none"
                  >
                    <option value="All">All Subjects</option>
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Sort Order
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 focus:border-fuchsia-500 rounded-xl p-2.5 text-xs text-white cursor-pointer outline-none"
                  >
                    <option value="dueDateAsc">Date (Near First)</option>
                    <option value="dueDateDesc">Date (Far First)</option>
                    <option value="priorityHigh">Priority (High first)</option>
                    <option value="alphabetical">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Task Checklist */}
        <div className="lg:col-span-2 space-y-6 animate-fade-in">
          {/* Stats & Progress */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass p-4 rounded-xl flex items-center justify-between gap-2 border-l-4 border-violet-500">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Tasks</p>
                <p className="text-xl font-bold text-white mt-0.5">{tasks.length}</p>
              </div>
              <span className="text-lg">📋</span>
            </div>

            <div className="glass p-4 rounded-xl flex items-center justify-between gap-2 border-l-4 border-emerald-500">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Completed</p>
                <p className="text-xl font-bold text-emerald-400 mt-0.5">{completedCount}</p>
              </div>
              <span className="text-lg">✅</span>
            </div>

            <div className="glass p-4 rounded-xl flex items-center justify-between gap-2 border-l-4 border-amber-500">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Pending</p>
                <p className="text-xl font-bold text-amber-400 mt-0.5">{tasks.length - completedCount}</p>
              </div>
              <span className="text-lg">⏳</span>
            </div>

            <div className="glass p-4 rounded-xl flex flex-col justify-center">
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                <span>Progress</span>
                <span className="text-violet-400">{percentage}%</span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                <div
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Task lists */}
          <div className="space-y-4">
            {sortedTasks.length === 0 ? (
              <div className="glass p-12 rounded-2xl text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-400 mb-4 border border-violet-500/10">
                  <svg className="w-8 h-8 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No assignments found</h3>
                <p className="text-zinc-500 text-xs max-w-xs leading-relaxed">
                  Try tweaking your filters or add a new task on the left sidebar to start tracking progress.
                </p>
              </div>
            ) : (
              sortedTasks.map((t) => {
                const styles = getCategoryStyles(t.category);
                const deadline = getDeadlineBadge(t.dueDate, t.completed);
                const isExpanded = expandedTaskId === t.id;
                
                // Calculate subtask progress
                const sub = t.subtasks || [];
                const doneSubs = sub.filter((s) => s.completed).length;
                const subtaskPercentage = sub.length === 0 ? 0 : Math.round((doneSubs / sub.length) * 100);

                return (
                  <div
                    key={t.id}
                    className={`glass rounded-2xl border transition-all duration-300 overflow-hidden ${
                      t.completed
                        ? "opacity-55 border-zinc-900/60 bg-zinc-950/10"
                        : "border-zinc-800/80 hover:border-zinc-700/80 shadow-md"
                    }`}
                  >
                    {/* Header bar / Main Toggle */}
                    <div
                      onClick={() => setExpandedTaskId(isExpanded ? null : t.id)}
                      className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-900/30 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Custom checkbox */}
                        <button
                          onClick={(e) => toggleComplete(t.id, e)}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer ${
                            t.completed
                              ? "bg-emerald-500 border-emerald-400 text-white"
                              : "border-zinc-700 hover:border-violet-500 hover:bg-violet-500/10 text-transparent"
                          }`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>

                        {/* Title & tags */}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-semibold text-sm sm:text-base break-words transition-all duration-300 ${
                              t.completed
                                ? "line-through text-zinc-500 decoration-zinc-650 decoration-2"
                                : "text-zinc-200"
                            }`}
                          >
                            {t.text}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {/* Category Badge */}
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${styles.bg} ${styles.text}`}
                            >
                              <span className={`w-1 h-1 rounded-full ${styles.bullet}`} />
                              {t.category}
                            </span>

                            {/* Priority Badge */}
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                                t.priority === "High"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/25"
                                  : t.priority === "Medium"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                              }`}
                            >
                              {t.priority} Priority
                            </span>

                            {/* Due Date Status */}
                            {deadline && (
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${deadline.style}`}
                              >
                                {deadline.text}
                              </span>
                            )}

                            {/* Subtask count */}
                            {sub.length > 0 && (
                              <span className="text-[10px] text-zinc-500 font-semibold">
                                📋 {doneSubs}/{sub.length} Checklists
                              </span>
                            )}

                            {/* Pomodoros completed */}
                            {((t.completedPomodoros || 0) > 0 || (t.estimatedFocus || 1) > 1) && (
                              <span className="text-[10px] text-zinc-500 font-semibold flex items-center gap-0.5">
                                🍅 {t.completedPomodoros || 0}/{t.estimatedFocus || 1} Pomodoros
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dropdown toggle / delete buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => deleteTask(t.id, e)}
                          className="w-8 h-8 rounded-lg bg-zinc-900/40 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/20 text-zinc-500 hover:text-red-400 flex items-center justify-center transition-all duration-300 cursor-pointer"
                          title="Delete Assignment"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        
                        <div
                          className={`w-8 h-8 rounded-lg border border-zinc-800/80 flex items-center justify-center text-zinc-500 transition-all duration-300 ${
                            isExpanded ? "bg-zinc-800 text-white rotate-180" : ""
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Body Panel */}
                    {isExpanded && (
                      <div className="border-t border-zinc-800/60 bg-zinc-950/30 p-6 space-y-6 animate-fade-in">
                        {/* Subtasks checklist */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Checklist ({subtaskPercentage}% done)</span>
                            <span className="text-[10px] text-zinc-500 lowercase font-normal">Add sub-steps below</span>
                          </h4>
                          
                          {/* List of subtasks */}
                          {sub.length > 0 && (
                            <div className="space-y-2.5">
                              {sub.map((s) => (
                                <div
                                  key={s.id}
                                  className="flex items-center justify-between gap-3 p-2.5 bg-zinc-900/30 border border-zinc-800/50 rounded-xl"
                                >
                                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <button
                                      onClick={() => toggleSubtask(t.id, s.id)}
                                      className={`w-4.5 h-4.5 rounded border flex items-center justify-center cursor-pointer shrink-0 transition-all duration-200 ${
                                        s.completed
                                          ? "bg-violet-600 border-violet-500 text-white"
                                          : "border-zinc-700 hover:border-violet-500 text-transparent"
                                      }`}
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    </button>
                                    <span
                                      className={`text-xs truncate break-all transition-colors duration-200 ${
                                        s.completed ? "line-through text-zinc-500" : "text-zinc-300"
                                      }`}
                                    >
                                      {s.text}
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => deleteSubtask(t.id, s.id)}
                                    className="text-zinc-650 hover:text-red-400 transition-colors duration-150 p-1"
                                    title="Delete subtask"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add subtask bar */}
                          <div className="flex gap-2">
                            <input
                              value={newSubtaskTexts[t.id] || ""}
                              onChange={(e) =>
                                setNewSubtaskTexts({ ...newSubtaskTexts, [t.id]: e.target.value })
                              }
                              onKeyDown={(e) => e.key === "Enter" && addSubtask(t.id)}
                              placeholder="Add task detail (e.g. outline intro, proofread...)"
                              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none"
                            />
                            <button
                              onClick={() => addSubtask(t.id)}
                              className="px-3.5 py-2 bg-zinc-800 hover:bg-violet-600 text-white rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Notes and details */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Notes & Instructions</h4>
                          <textarea
                            value={t.notes || ""}
                            onChange={(e) => updateNotes(t.id, e.target.value)}
                            placeholder="Add reference links, submission instructions, or study files reminders..."
                            rows={3}
                            className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 text-xs text-zinc-300 placeholder-zinc-600 outline-none resize-none focus:border-violet-500 transition-all duration-300"
                          />
                        </div>

                        {/* Focus link stats */}
                        <div className="pt-4 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-400">
                          <span className="flex items-center gap-1">
                            <span>🍅 Linked to Focus Timer</span>
                          </span>
                          <div className="flex items-center gap-3">
                            <span>
                              Sessions Completed:{" "}
                              <strong className="text-violet-400 font-bold">{t.completedPomodoros || 0}</strong> /{" "}
                              {t.estimatedFocus || 1}
                            </span>
                            <span className="text-zinc-700">|</span>
                            <a
                              href="/pomodoro"
                              className="text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300 hover:underline transition-colors"
                            >
                              Go to timer room &rarr;
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}