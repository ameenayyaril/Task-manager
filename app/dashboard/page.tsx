"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Task = {
  text: string;
  priority: string;
  completed: boolean;
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks if updated in dashboard
  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  const toggleComplete = (index: number) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    saveTasks(updated);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  
  const highPriorityTasks = tasks.filter((t) => t.priority === "High");
  const mediumPriorityTasks = tasks.filter((t) => t.priority === "Medium");
  const lowPriorityTasks = tasks.filter((t) => t.priority === "Low");

  const highCompleted = highPriorityTasks.filter((t) => t.completed).length;
  const mediumCompleted = mediumPriorityTasks.filter((t) => t.completed).length;
  const lowCompleted = lowPriorityTasks.filter((t) => t.completed).length;

  const percentage =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  // SVG Radial Gauge details
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  // Get first 4 pending tasks
  const pendingTasksList = tasks
    .map((task, index) => ({ ...task, originalIndex: index }))
    .filter((t) => !t.completed)
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto py-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <span className="p-2 rounded-xl bg-fuchsia-600/10 text-fuchsia-400">
            📊
          </span>
          <span>Analytics Dashboard</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          {tasks.length === 0
            ? "No tasks found. Visit the Task Manager to get started!"
            : percentage === 100
            ? "Amazing! You have completed all your tasks! 🏆"
            : `Keep it up! You have finished ${percentage}% of your tasks.`}
        </p>
      </div>

      {tasks.length === 0 ? (
        /* Empty Dashboard State */
        <div className="glass p-12 rounded-2xl text-center max-w-2xl mx-auto flex flex-col items-center mt-8">
          <div className="w-20 h-20 bg-fuchsia-600/10 rounded-2xl flex items-center justify-center text-fuchsia-400 mb-6 border border-fuchsia-500/10">
            <svg className="w-10 h-10 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Your dashboard is empty</h2>
          <p className="text-zinc-400 leading-relaxed mb-8">
            Create tasks first to view completion rates, priority metrics, and productivity gauges.
          </p>
          <Link
            href="/tasks"
            className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/10 hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            Go to Task Manager
          </Link>
        </div>
      ) : (
        /* Active Dashboard Content */
        <div className="space-y-8 animate-fade-in">
          {/* Top Numeric Cards & Radial Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Gauge */}
            <div className="glass p-6 rounded-2xl flex items-center justify-center gap-6 md:col-span-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/5 rounded-full blur-xl" />
              
              {/* Radial Progress SVG */}
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-zinc-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-violet-500 transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-extrabold text-white">{percentage}%</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Done</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-1">Productivity Index</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Your overall task completion rate. Maintain consistent habits to hit 100%!
                </p>
              </div>
            </div>

            {/* Total Tasks Card */}
            <div className="glass p-6 rounded-2xl flex flex-col justify-between border-l-4 border-violet-500">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Total Workload</span>
                <span className="text-xl">📋</span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold text-white">{tasks.length}</h3>
                <p className="text-xs text-zinc-500 mt-1">Total items registered</p>
              </div>
            </div>

            {/* Active Tasks Card */}
            <div className="glass p-6 rounded-2xl flex flex-col justify-between border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Remaining</span>
                <span className="text-xl">⏳</span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold text-white">{pendingCount}</h3>
                <p className="text-xs text-zinc-500 mt-1">Pending student tasks</p>
              </div>
            </div>
          </div>

          {/* Lower Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Priority Breakdowns Card */}
            <div className="glass p-6 sm:p-8 rounded-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Priority Distribution</h3>
                <p className="text-xs text-zinc-400 mt-1">Task completion metrics based on priority tags.</p>
              </div>

              <div className="space-y-4">
                {/* High Priority Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-rose-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      High Priority
                    </span>
                    <span className="text-zinc-400">
                      {highCompleted}/{highPriorityTasks.length} Done ({highPriorityTasks.length === 0 ? 0 : Math.round((highCompleted / highPriorityTasks.length) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          highPriorityTasks.length === 0
                            ? 0
                            : (highCompleted / highPriorityTasks.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Medium Priority Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Medium Priority
                    </span>
                    <span className="text-zinc-400">
                      {mediumCompleted}/{mediumPriorityTasks.length} Done ({mediumPriorityTasks.length === 0 ? 0 : Math.round((mediumCompleted / mediumPriorityTasks.length) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          mediumPriorityTasks.length === 0
                            ? 0
                            : (mediumCompleted / mediumPriorityTasks.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Low Priority Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Low Priority
                    </span>
                    <span className="text-zinc-400">
                      {lowCompleted}/{lowPriorityTasks.length} Done ({lowPriorityTasks.length === 0 ? 0 : Math.round((lowCompleted / lowPriorityTasks.length) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          lowPriorityTasks.length === 0
                            ? 0
                            : (lowCompleted / lowPriorityTasks.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions List (Latest Pending Tasks) */}
            <div className="glass p-6 sm:p-8 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-white">Up Next</h3>
                  <Link
                    href="/tasks"
                    className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    View All &rarr;
                  </Link>
                </div>

                {pendingTasksList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <span className="text-3xl mb-2">🎉</span>
                    <h4 className="font-bold text-white text-sm">All caught up!</h4>
                    <p className="text-xs text-zinc-500 max-w-xs mt-1">
                      You have zero pending tasks remaining. Great job mastering your workflow today!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingTasksList.map((t) => (
                      <div
                        key={t.originalIndex}
                        className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-800/60 rounded-xl hover:border-zinc-700/60 hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => toggleComplete(t.originalIndex)}
                            className="w-5.5 h-5.5 rounded-full border border-zinc-700 hover:border-violet-500 hover:bg-violet-500/10 flex items-center justify-center text-transparent cursor-pointer shrink-0 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <span className="text-zinc-200 text-sm font-medium truncate max-w-[200px] sm:max-w-[260px]">
                            {t.text}
                          </span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide shrink-0 ${
                            t.priority === "High"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                              : t.priority === "Medium"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {pendingCount > 4 && (
                <div className="text-center text-xs text-zinc-500 mt-4">
                  And {pendingCount - 4} more remaining. Keep making progress!
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}