import React, { useState } from "react";

interface StartScreenProps {
  onStart: (name: string) => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [nameInput, setNameInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError("Please enter your name to proceed.");
      return;
    }
    onStart(trimmed);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 px-6 py-12 select-none">
      <div className="w-full max-w-md text-center">
        {/* Title */}
        <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900 mb-2">
          Welcome to MindCare
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          A simple space to monitor your mental wellness.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              id="name-input"
              type="text"
              placeholder="What is your name?"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                if (error) setError("");
              }}
              className="w-full px-5 py-3.5 rounded-xl bg-white text-slate-800 placeholder-slate-400 font-medium text-base border border-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 shadow-sm text-center transition-all"
            />
          </div>

          {error && (
            <p className="text-rose-500 text-xs font-semibold text-center">
              {error}
            </p>
          )}

          <button
            id="start-btn"
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base shadow-sm transition-all cursor-pointer"
          >
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
}
