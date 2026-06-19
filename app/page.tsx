import Link from "next/link";

export default function Home() {
  return (
    <div className="relative pt-6 pb-12 sm:pb-16 lg:pb-24">
      {/* Decorative background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-violet-600/10 rounded-full blur-3xl -z-10 animate-float" />
      <div className="absolute top-1/3 left-1/3 w-[250px] h-[250px] bg-fuchsia-600/10 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: "-3s" }} />

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mt-8 sm:mt-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-6">
          ✨ TaskFlow is now live
        </span>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
          Supercharge Your Studies with{" "}
          <span className="text-gradient-primary">TaskFlow</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          The smart student task manager designed to help you organize assignments, track completion percentages, and visualize your daily progress.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/tasks"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span>Start Managing Tasks</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700/80 text-zinc-200 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>View Dashboard</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 sm:mt-32">
        <div className="glass glass-hover p-8 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-colors duration-300" />
          <div className="w-12 h-12 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Priority Engine</h3>
          <p className="text-zinc-400 leading-relaxed">
            Sort and identify assignments with glowing priority levels (High, Medium, Low) to stay on top of critical deadlines first.
          </p>
        </div>

        <div className="glass glass-hover p-8 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl group-hover:bg-fuchsia-500/20 transition-colors duration-300" />
          <div className="w-12 h-12 rounded-xl bg-fuchsia-600/10 text-fuchsia-400 flex items-center justify-center mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Productivity Charts</h3>
          <p className="text-zinc-400 leading-relaxed">
            Track your metrics dynamically. Monitor total counts, pending tallies, and clean visualization gauges showing completion rates.
          </p>
        </div>

        <div className="glass glass-hover p-8 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors duration-300" />
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Secure & Offline</h3>
          <p className="text-zinc-400 leading-relaxed">
            No signup, database, or network latency. All your tasks remain privately persisted inside your browser's local storage.
          </p>
        </div>
      </div>

      {/* Task Mockup Interactive Section */}
      <div className="mt-28 sm:mt-36 p-1 bg-gradient-to-tr from-violet-500/20 via-fuchsia-500/20 to-blue-500/20 rounded-2xl">
        <div className="glass p-6 sm:p-8 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6 mb-6">
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <span>⚡ Live Dashboard Mockup</span>
              </h4>
              <p className="text-sm text-zinc-400 mt-1">Get a sneak peek at the revamped Task manager interface below.</p>
            </div>
            <Link
              href="/tasks"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors duration-300"
            >
              Open Active Planner &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <div className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full border border-violet-500/50 flex items-center justify-center text-violet-400 bg-violet-500/10">
                  ✓
                </span>
                <div>
                  <p className="text-zinc-200 font-medium">Prepare Chemistry Presentation</p>
                  <p className="text-xs text-zinc-500 mt-1">Status: In Progress</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_12px_rgba(239,68,68,0.1)]">
                High Priority
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 opacity-60">
              <div className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ✓
                </span>
                <div>
                  <p className="text-zinc-400 line-through">Math Assignment - Calculus IV</p>
                  <p className="text-xs text-zinc-500 mt-1">Status: Completed</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Low Priority
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}