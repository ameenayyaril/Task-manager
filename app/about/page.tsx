export default function About() {
  const techStack = [
    { name: "Next.js 16 (App Router)", color: "bg-black text-white border-zinc-800" },
    { name: "React 19", color: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
    { name: "Tailwind CSS v4", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
    { name: "TypeScript", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { name: "Local Storage", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    { name: "Google Fonts (Outfit & Inter)", color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <span className="p-2 rounded-xl bg-violet-600/10 text-violet-400">
            ℹ️
          </span>
          <span>About TaskFlow</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Learn more about the project, framework, and capabilities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card 1: Our Mission */}
        <div className="glass p-6 sm:p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-xl" />
          
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-violet-400">🎯</span> Our Mission
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-4">
            Managing student life is a complex balancing act. Between classes, homework, presentations, and extracurriculars, keeping track of deadlines can be overwhelming.
          </p>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            TaskFlow was developed as a clean, minimal planner designed to give students instant, zero-friction task management. By visualizing completion ratios and prioritizing items, students can easily identify key tasks and stay focused.
          </p>
        </div>

        {/* Card 2: Core Philosophy */}
        <div className="glass p-6 sm:p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/5 rounded-full blur-xl" />

          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-fuchsia-400">⚡</span> Product Design
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-4">
            We believe that software should be fast, private, and beautiful. TaskFlow bypasses the complexity of user registration and servers by utilizing modern client-side features.
          </p>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Your data is stored completely inside your own browser window, allowing for sub-millisecond responses and 100% data security. The UI adapts dynamically to your preferences, providing micro-interactions that make writing tasks feel rewarding.
          </p>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="glass p-6 sm:p-8 rounded-2xl mt-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>🛠️</span> Tech Stack & Standards
        </h2>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          TaskFlow is built on top of state-of-the-art web technologies to ensure lightweight page loads, accessibility standards, and clean codebases.
        </p>

        <div className="flex flex-wrap gap-3">
          {techStack.map((tech) => (
            <span
              key={tech.name}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border ${tech.color} hover:scale-105 hover:border-violet-400 transition-all duration-300`}
            >
              {tech.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}