"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchTasksFromDb,
  saveTaskToDb,
  saveAllTasksToDb,
  type Task
} from "../../lib/db";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      const data = await fetchTasksFromDb();
      setTasks(data);
    };
    loadData();
  }, []);

  const toggleComplete = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const updatedTask: Task = { ...t, completed: !t.completed };
        saveTaskToDb(updatedTask);
        return updatedTask;
      }
      return t;
    });
    setTasks(updated);
  };

  // Basic counts
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const percentage = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  // Focus sessions tracking
  const totalEstimatedFocus = tasks.reduce((sum, t) => sum + (t.estimatedFocus || 1), 0);
  const totalCompletedFocus = tasks.reduce((sum, t) => sum + (t.completedPomodoros || 0), 0);
  const focusPercentage = totalEstimatedFocus === 0 ? 0 : Math.round((totalCompletedFocus / totalEstimatedFocus) * 100);

  // Category counts and rates
  const categoriesList = ["General", "Math", "Science", "Humanities", "Languages", "Coding"];
  const categoryStats = categoriesList.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat);
    const catCompleted = catTasks.filter((t) => t.completed).length;
    return {
      name: cat,
      total: catTasks.length,
      completed: catCompleted,
      percentage: catTasks.length === 0 ? 0 : Math.round((catCompleted / catTasks.length) * 100),
    };
  });

  // Timeline & deadlines (Pending tasks sorted by date)
  const upcomingTasks = tasks
    .filter((t) => !t.completed && t.dueDate)
    .sort((a, b) => {
      return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
    })
    .slice(0, 5);

  // SVG Radial Gauge details for Overall Productivity
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Category styles dictionary
  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case "Coding":
        return { text: "text-amber-400", bg: "bg-amber-500/10", fill: "#f59e0b" };
      case "Math":
        return { text: "text-violet-400", bg: "bg-violet-500/10", fill: "#8b5cf6" };
      case "Science":
        return { text: "text-emerald-400", bg: "bg-emerald-500/10", fill: "#10b981" };
      case "Humanities":
        return { text: "text-rose-400", bg: "bg-rose-500/10", fill: "#f43f5e" };
      case "Languages":
        return { text: "text-sky-400", bg: "bg-sky-500/10", fill: "#0ea5e9" };
      default:
        return { text: "text-zinc-400", bg: "bg-zinc-800/40", fill: "#71717a" };
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <span className="p-2 rounded-xl bg-fuchsia-600/10 text-fuchsia-400">
            📊
          </span>
          <span>Analytics Center</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          {tasks.length === 0
            ? "Your dashboard is empty. Visit the Task Planner to create assignments!"
            : percentage === 100
            ? "Incredible work! 🏆 You completed 100% of your tasks!"
            : `Track metrics: you completed ${percentage}% of registered workload.`}
        </p>
      </div>

      {tasks.length === 0 ? (
        /* Empty State */
        <div className="glass p-12 rounded-3xl text-center max-w-2xl mx-auto flex flex-col items-center mt-8">
          <div className="w-20 h-20 bg-fuchsia-600/10 rounded-2xl flex items-center justify-center text-fuchsia-400 mb-6 border border-fuchsia-500/10">
            <svg className="w-10 h-10 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Workspace metrics are empty</h2>
          <p className="text-zinc-500 text-sm max-w-md leading-relaxed mb-8">
            Create tasks first to view completion graphs, subject summaries, and study focus logs.
          </p>
          <Link
            href="/tasks"
            className="px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            Create Your First Task
          </Link>
        </div>
      ) : (
        /* Full Workspace Dashboard */
        <div className="space-y-8 animate-fade-in">
          {/* Top Row Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Gauge Indicator */}
            <div className="glass p-6 rounded-2xl flex items-center gap-6 md:col-span-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/5 rounded-full blur-xl" />
              
              <div className="relative w-24 h-24 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={radius} className="stroke-zinc-900" strokeWidth="7" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-violet-500 transition-all duration-1000 ease-out"
                    strokeWidth="7"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-white">{percentage}%</span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Tasks Done</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-1">Productivity Index</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your overall task completion rate. Complete checklists and tasks to boost your score!
                </p>
              </div>
            </div>

            {/* Pomodoro Focus Hours Gauge */}
            <div className="glass p-6 rounded-2xl flex items-center justify-between border-l-4 border-fuchsia-500">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Study Focus Hours</span>
                <h3 className="text-2xl font-extrabold text-white">
                  {totalCompletedFocus} <span className="text-xs text-zinc-500 font-normal">/ {totalEstimatedFocus} Pomos</span>
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                    <div className="bg-fuchsia-500 h-full rounded-full" style={{ width: `${focusPercentage}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-fuchsia-400">{focusPercentage}% Done</span>
                </div>
              </div>
              <span className="text-2xl p-2.5 rounded-xl bg-fuchsia-600/10 text-fuchsia-400">🍅</span>
            </div>

            {/* Total Workload Count */}
            <div className="glass p-6 rounded-2xl flex items-center justify-between border-l-4 border-violet-500">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Remaining Workload</span>
                <h3 className="text-3xl font-extrabold text-white mt-1">{pendingCount}</h3>
                <p className="text-[10px] text-zinc-500 mt-1">Pending assignments</p>
              </div>
              <span className="text-2xl p-2.5 rounded-xl bg-violet-600/10 text-violet-400">📝</span>
            </div>
          </div>

          {/* Lower Section Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Custom SVG Category Bar Graph (3 Cols) */}
            <div className="glass p-6 sm:p-8 rounded-2xl lg:col-span-3 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Subject Category Summaries</h3>
                <p className="text-xs text-zinc-400 mt-1">Distribution of assignments and rates by subject.</p>
              </div>

              {/* Custom SVG horizontal bar charts */}
              <div className="space-y-4 pt-2">
                {categoryStats.map((c) => {
                  const theme = getCategoryTheme(c.name);
                  const isZero = c.total === 0;

                  return (
                    <div key={c.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className={`flex items-center gap-1.5 ${theme.text}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.fill }} />
                          {c.name}
                        </span>
                        <span className="text-zinc-500 text-[11px]">
                          {isZero ? (
                            "No tasks"
                          ) : (
                            `${c.completed}/${c.total} completed (${c.percentage}%)`
                          )}
                        </span>
                      </div>

                      {/* Customized Progress Bar */}
                      <div className="w-full bg-zinc-950/60 border border-zinc-900 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${isZero ? 0 : c.percentage}%`,
                            backgroundColor: theme.fill,
                            boxShadow: `0 0 8px ${theme.fill}80`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Upcoming Deadlines Timeline (2 Cols) */}
            <div className="glass p-6 sm:p-8 rounded-2xl lg:col-span-2 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-zinc-850 pb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Upcoming Deadlines</h3>
                  <Link href="/tasks" className="text-xs font-semibold text-violet-400 hover:underline">
                    Manage &rarr;
                  </Link>
                </div>

                {upcomingTasks.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 flex flex-col items-center">
                    <span className="text-2xl mb-1.5">📅</span>
                    <h4 className="font-bold text-white text-xs">No scheduled deadlines</h4>
                    <p className="text-[10px] mt-0.5 max-w-[200px]">
                      Add due dates to your tasks in the Planner to populate this calendar dashboard.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingTasks.map((t) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const due = new Date(t.dueDate!);
                      due.setHours(0, 0, 0, 0);
                      const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      const isOverdue = diff < 0;

                      return (
                        <div
                          key={t.id}
                          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                            isOverdue
                              ? "bg-red-500/5 border-red-500/20"
                              : "bg-zinc-900/40 border-zinc-800/80"
                          }`}
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border ${
                                getCategoryTheme(t.category).bg
                              } ${getCategoryTheme(t.category).text} border-zinc-800`}
                            >
                              {t.category}
                            </span>
                            <p className="text-xs font-semibold text-zinc-200 truncate mt-1">{t.text}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                isOverdue
                                  ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse"
                                  : diff === 0
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                  : "bg-zinc-900 border-zinc-800 text-zinc-400"
                              }`}
                            >
                              {isOverdue ? "Overdue" : diff === 0 ? "Today" : `${diff} days`}
                            </span>
                            <p className="text-[9px] text-zinc-500 font-medium mt-1">{t.dueDate}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {pendingCount > 5 && (
                <div className="text-center text-[10px] text-zinc-500 mt-4 pt-3 border-t border-zinc-900">
                  And {pendingCount - 5} more pending items. Stay focused!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}