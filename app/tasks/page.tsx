"use client";

import { useState, useEffect } from "react";

type Task = {
  text: string;
  priority: string;
  completed: boolean;
};

export default function Tasks() {
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks, mounted]);

  const addTask = () => {
    if (task.trim() === "") return;

    setTasks([
      ...tasks,
      {
        text: task.trim(),
        priority,
        completed: false,
      },
    ]);

    setTask("");
    setPriority("Medium");
  };

  const deleteTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const toggleComplete = (index: number) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  const clearAll = () => {
    if (confirm("Are you sure you want to clear all tasks?")) {
      setTasks([]);
    }
  };

  const filteredTasks = tasks.filter((t) =>
    t.text.toLowerCase().includes(search.toLowerCase())
  );

  const completedCount = tasks.filter((t) => t.completed).length;

  const percentage =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  // If not mounted yet (server-side), render a loading skeleton or neutral state
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-violet-600/10 text-violet-400">
              📝
            </span>
            <span>Task Manager</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Organize your assignments and prioritize your learning goals.</p>
        </div>

        {tasks.length > 0 && (
          <button
            onClick={clearAll}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-red-950/40 hover:bg-red-900/60 border border-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Clear All Tasks</span>
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form & Search */}
        <div className="space-y-6 lg:col-span-1">
          {/* Create Task Card */}
          <div className="glass p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-xl -z-10" />
            
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6]" />
              <span>Create Task</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Task Name
                </label>
                <input
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="e.g. Write Calculus assignment..."
                  className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Priority
                </label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="High">🔴 High Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="Low">🟢 Low Priority</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                onClick={addTask}
                className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/10 hover:shadow-violet-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Search Card */}
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-fuchsia-500 shadow-[0_0_8px_#d946ef]" />
              <span>Search Tasks</span>
            </h2>
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to filter..."
                className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-300"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Task Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 border-l-4 border-violet-500">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-white mt-1">{tasks.length}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                📋
              </div>
            </div>

            <div className="glass p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 border-l-4 border-emerald-500">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{completedCount}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                ✅
              </div>
            </div>

            <div className="glass p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 border-l-4 border-amber-500">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{tasks.length - completedCount}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                ⏳
              </div>
            </div>
          </div>

          {/* Progress Card */}
          {tasks.length > 0 && (
            <div className="glass p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-zinc-300">Overall Progress</span>
                <span className="text-sm font-bold text-violet-400">{percentage}%</span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-3 overflow-hidden border border-zinc-800/50">
                <div
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(217,70,239,0.3)]"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Task List Container */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              tasks.length === 0 ? (
                // Empty state (no tasks at all)
                <div className="glass p-12 rounded-2xl text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-400 mb-6 border border-violet-500/10">
                    <svg className="w-10 h-10 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No tasks created yet</h3>
                  <p className="text-zinc-400 max-w-sm leading-relaxed mb-6">
                    Stay organized and boost your study speed. Add assignments using the builder on the left to start!
                  </p>
                </div>
              ) : (
                // Filtered empty state (search result empty)
                <div className="glass p-12 rounded-2xl text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-zinc-800/40 rounded-xl flex items-center justify-center text-zinc-500 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">No matching tasks</h3>
                  <p className="text-zinc-400 text-sm">
                    No results found for &ldquo;<span className="text-violet-400 font-semibold">{search}</span>&rdquo;. Check your spelling or try another keyword.
                  </p>
                </div>
              )
            ) : (
              filteredTasks.map((t, index) => {
                const originalIndex = tasks.findIndex((taskItem) => taskItem === t);
                const isHigh = t.priority === "High";
                const isMedium = t.priority === "Medium";
                const isLow = t.priority === "Low";

                return (
                  <div
                    key={index}
                    className={`glass p-5 rounded-2xl flex items-center justify-between gap-4 border transition-all duration-300 relative overflow-hidden group ${
                      t.completed
                        ? "opacity-50 border-zinc-800/40 bg-zinc-950/20"
                        : "border-zinc-800/80 hover:border-zinc-700/80 hover:shadow-lg hover:shadow-violet-500/[0.02] hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Custom circular checkbox */}
                      <button
                        onClick={() => toggleComplete(originalIndex)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0 ${
                          t.completed
                            ? "bg-emerald-500 border-emerald-400 text-white"
                            : "border-zinc-700 hover:border-violet-500 hover:bg-violet-500/10 text-transparent"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-medium text-sm sm:text-base break-words transition-all duration-300 ${
                            t.completed
                              ? "line-through text-zinc-500 decoration-zinc-600 decoration-2"
                              : "text-zinc-200"
                          }`}
                        >
                          {t.text}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Priority:</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              isHigh
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : isMedium
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}
                          >
                            <span className={`w-1 h-1 rounded-full ${
                              isHigh ? "bg-rose-400" : isMedium ? "bg-amber-400" : "bg-emerald-400"
                            }`} />
                            {t.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(originalIndex)}
                      className="w-9 h-9 rounded-lg bg-zinc-900/40 hover:bg-red-500/10 border border-zinc-800/80 hover:border-red-500/20 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0"
                      title="Delete Task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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