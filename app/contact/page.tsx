"use client";

import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus("sending");
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <span className="p-2 rounded-xl bg-violet-600/10 text-violet-400">
            📞
          </span>
          <span>Contact Info</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Get in touch with the creator or send a message directly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Contact Cards (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Developer */}
          <div className="glass p-6 rounded-2xl flex items-start gap-4 hover:border-violet-500/40 hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Developer</h3>
              <p className="text-lg font-bold text-white mt-1">Ameen Ali</p>
              <p className="text-xs text-zinc-400 mt-1">Engineering student & developer.</p>
            </div>
          </div>

          {/* Card 2: Email */}
          <a
            href="mailto:ameenayyaril@gmail.com"
            className="glass p-6 rounded-2xl flex items-start gap-4 hover:border-fuchsia-500/40 hover:-translate-y-0.5 transition-all duration-300 block group"
          >
            <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider group-hover:text-fuchsia-400 transition-colors">Email</h3>
              <p className="text-lg font-bold text-white mt-1 group-hover:text-violet-200 transition-colors">
                ameenayyaril@gmail.com
              </p>
              <p className="text-xs text-zinc-400 mt-1">Send an inquiry anytime.</p>
            </div>
          </a>

          {/* Card 3: Framework */}
          <div className="glass p-6 rounded-2xl flex items-start gap-4 hover:border-blue-500/40 hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Framework</h3>
              <p className="text-lg font-bold text-white mt-1">Next.js & Tailwind CSS</p>
              <p className="text-xs text-zinc-400 mt-1">Full stack react capability.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Form (3 cols) */}
        <div className="lg:col-span-3">
          <div className="glass p-6 sm:p-8 rounded-2xl relative overflow-hidden h-full flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl" />

            {status === "success" ? (
              /* Success Animation State */
              <div className="text-center py-8 space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
                <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out! Ameen Ali has received your message and will review it shortly.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="px-6 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors duration-300 mt-4 cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              /* Normal Form State */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Get in Touch</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Fill out the fields below to submit a message.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Your Name
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    disabled={status === "sending"}
                    className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-300 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Your Email
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. jane@example.com"
                    disabled={status === "sending"}
                    className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-300 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you?"
                    disabled={status === "sending"}
                    className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all duration-300 resize-none disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/10 hover:shadow-violet-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  {status === "sending" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}