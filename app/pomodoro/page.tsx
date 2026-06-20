"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  fetchTasksFromDb,
  saveTaskToDb,
  type Task,
  type SubTask,
} from "../../lib/db";

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"work" | "short" | "long">("work");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [testSpeed, setTestSpeed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Time durations based on mode
  const DURATIONS = {
    work: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
  };

  // Sound chime synthesizer using Web Audio API
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      // Friendly chime melody
      playTone(523.25, ctx.currentTime, 0.15); // C5
      playTone(659.25, ctx.currentTime + 0.12, 0.15); // E5
      playTone(783.99, ctx.currentTime + 0.24, 0.35); // G5
    } catch (e) {
      console.warn("Web Audio chime failed", e);
    }
  };

  // Load tasks from database
  useEffect(() => {
    setMounted(true);
    const loadData = async () => {
      const data = await fetchTasksFromDb();
      setTasks(data);
    };
    loadData();
  }, []);

  // Timer loop
  useEffect(() => {
    if (isActive) {
      const interval = testSpeed ? 10 : 1000;
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, testSpeed, mode, selectedTaskId]);

  // Mode change handler
  const handleModeChange = (newMode: "work" | "short" | "long") => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
  };

  // Timer completion
  const handleTimerComplete = () => {
    setIsActive(false);
    playChime();

    // If it was focus mode and task was selected, increment pomodoros
    if (mode === "work" && selectedTaskId) {
      const updated = tasks.map((t) => {
        if (t.id === selectedTaskId) {
          const updatedTask: Task = { ...t, completedPomodoros: (t.completedPomodoros || 0) + 1 };
          saveTaskToDb(updatedTask);
          return updatedTask;
        }
        return t;
      });
      setTasks(updated);
    }

    // Auto switch modes or suggest next step
    if (mode === "work") {
      alert("Great job! Work focus session finished. Time for a short break!");
      handleModeChange("short");
    } else {
      alert("Break finished! Let's get back to focus.");
      handleModeChange("work");
    }
  };

  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(DURATIONS[mode]);
  };

  // Skip timer
  const skipTimer = () => {
    if (confirm("Are you sure you want to skip the remaining focus time?")) {
      handleTimerComplete();
    }
  };

  // Formatter for MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Progress circle SVG properties
  const total = DURATIONS[mode];
  const percentage = total === 0 ? 0 : (timeLeft / total) * 100;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const currentTaskObj = tasks.find((t) => t.id === selectedTaskId);
  const pendingTasksList = tasks.filter((t) => !t.completed);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-violet-600/10 text-violet-400">
              ⏱️
            </span>
            <span>Focus Room</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Boost your studying using the Pomodoro technique. Select tasks to track study sessions.
          </p>
        </div>

        {/* Speed-up test option */}
        <button
          onClick={() => setTestSpeed(!testSpeed)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 ${
            testSpeed
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
              : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <span>⚡ Demo Speed ({testSpeed ? "100x" : "1x"})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Focus Timer Window */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-8 rounded-3xl relative overflow-hidden flex flex-col items-center shadow-2xl">
            {/* Top glows */}
            <div className={`absolute top-0 w-48 h-48 rounded-full blur-3xl -z-10 transition-all duration-1000 ${
              mode === "work"
                ? "bg-violet-600/10 right-0"
                : mode === "short"
                ? "bg-emerald-600/10 left-12"
                : "bg-sky-600/10 right-12"
            }`} />

            {/* Mode Switcher Badges */}
            <div className="flex bg-zinc-950/60 p-1.5 rounded-2xl border border-zinc-800/80 mb-8 max-w-sm w-full">
              <button
                onClick={() => handleModeChange("work")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  mode === "work"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Focus (25m)
              </button>
              <button
                onClick={() => handleModeChange("short")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  mode === "short"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Short Break (5m)
              </button>
              <button
                onClick={() => handleModeChange("long")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  mode === "long"
                    ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Long Break (15m)
              </button>
            </div>

            {/* Radial Clock Circle */}
            <div className="relative w-64 h-64 flex items-center justify-center mb-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  className="stroke-zinc-900"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  className={`transition-all duration-500 ease-out ${
                    mode === "work"
                      ? "stroke-violet-500"
                      : mode === "short"
                      ? "stroke-emerald-500"
                      : "stroke-sky-500"
                  }`}
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-mono font-extrabold text-white tracking-tight">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">
                  {isActive ? "Ticking" : "Paused"}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={resetTimer}
                className="w-12 h-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 hover:text-white text-zinc-400 flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95"
                title="Reset timer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3" />
                </svg>
              </button>

              <button
                onClick={() => setIsActive(!isActive)}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ${
                  mode === "work"
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-violet-500/25"
                    : mode === "short"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/25"
                    : "bg-gradient-to-r from-sky-600 to-blue-600 shadow-sky-500/25"
                }`}
              >
                {isActive ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M18 12a1 1 0 01-1 1H7a1 1 0 01-1-1V7a1 1 0 011-1h10a1 1 0 011 1v5z" clipRule="evenodd" />
                    <rect x="6" y="5" width="4" height="14" rx="1.5" />
                    <rect x="14" y="5" width="4" height="14" rx="1.5" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={skipTimer}
                className="w-12 h-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 hover:text-white text-zinc-400 flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95"
                title="Skip focus"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Linked Task Workspace */}
        <div className="space-y-6">
          {/* Linked Task Selector */}
          <div className="glass p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
              <span>Link Student Task</span>
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Link an active task to count your focus hours directly against that assignment.
            </p>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Active Assignment
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer transition-colors duration-200"
              >
                <option value="">-- No Linked Task --</option>
                {pendingTasksList.map((t) => (
                  <option key={t.id} value={t.id}>
                    ({t.category}) {t.text.substring(0, 30)}
                    {t.text.length > 30 ? "..." : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Active Task Card */}
            {currentTaskObj ? (
              <div className="p-4 rounded-2xl bg-violet-600/5 border border-violet-500/20 space-y-3 animate-fade-in mt-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/25 uppercase tracking-wide">
                    {currentTaskObj.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    currentTaskObj.priority === "High"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : currentTaskObj.priority === "Medium"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    {currentTaskObj.priority}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm leading-relaxed">{currentTaskObj.text}</h4>
                
                {/* Pomodoro Session count progress */}
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span>Focus Sessions:</span>
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <span className="text-violet-400">{currentTaskObj.completedPomodoros || 0}</span>
                    <span className="text-zinc-600">/</span>
                    <span className="text-zinc-400">{currentTaskObj.estimatedFocus || 1}</span>
                    <span>🍅</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-950/20 text-zinc-500 flex flex-col items-center">
                <span className="text-2xl mb-2">🎯</span>
                <p className="text-xs">No task is currently linked. Connect an active task above to record your pomodoro sessions.</p>
              </div>
            )}
          </div>

          {/* Quick tips */}
          <div className="glass p-6 rounded-3xl">
            <h3 className="text-sm font-bold text-white mb-2">💡 Study Suggestions</h3>
            <ul className="text-xs text-zinc-400 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-violet-400 font-bold">•</span>
                <span>Work intensely for 25 minutes, keeping browser notifications and phones muted.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 font-bold">•</span>
                <span>When the chime rings, completely detach from work and stretch for 5 minutes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 font-bold">•</span>
                <span>Every 4 focus intervals, take a longer 15-minute break to refresh your mind.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
