import React, { useState, useEffect } from "react";
import { Mood, MoodLog } from "../types";
import { Check, Heart } from "lucide-react";

interface HomeViewProps {
  name: string;
  onAddMoodLog: (feeling: Mood, intensity: number) => void;
  lastLog: MoodLog | null;
  onSearchRedirect: (searchQuery: string) => void;
}

const MOOD_OPTIONS: { type: Mood; emoji: string; label: string }[] = [
  { type: "Happy", emoji: "😊", label: "Happy" },
  { type: "Normal", emoji: "😐", label: "Normal" },
  { type: "Stressed", emoji: "😰", label: "Stressed" },
  { type: "Sad", emoji: "😢", label: "Sad" },
];

export default function HomeView({ name, onAddMoodLog }: HomeViewProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [intensity, setIntensity] = useState<number>(5);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setSubmitted(false);
        setSelectedMood(null);
        setIntensity(5);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  const handleMoodSubmit = () => {
    if (!selectedMood) return;
    onAddMoodLog(selectedMood, intensity);
    setSubmitted(true);
  };

  return (
    <div className="page-enter w-full space-y-6 pb-4">
      {/* Website Name and Logo */}
      <div className="flex flex-col items-center justify-center space-y-2 pt-2">
        <div className="flex items-center space-x-2 bg-brand-50 border border-brand-100 px-4 py-2 rounded-2xl shadow-sm">
          <Heart className="w-5 h-5 text-brand-600 fill-brand-500/10 animate-pulse" />
          <span className="font-display font-bold text-xl tracking-tight text-slate-800">
            Mind<span className="text-brand-600">Care</span>
          </span>
        </div>
      </div>

      {/* Header Info */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">
          Welcome, <span className="text-brand-600 capitalize">{name}</span>!
        </h2>
      </div>

      {/* Main Mood Selection Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-6">
        <h3 className="text-sm font-semibold text-slate-600 text-center">
          How are you feeling today?
        </h3>

        {/* Horizontal grid of moods */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
          {MOOD_OPTIONS.map((opt) => {
            const isSelected = selectedMood === opt.type;
            return (
              <button
                key={opt.type}
                onClick={() => setSelectedMood(opt.type)}
                disabled={submitted}
                className={`flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected 
                    ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm" 
                    : submitted
                    ? "border-slate-100 bg-slate-50/20 text-slate-400 opacity-60 cursor-not-allowed"
                    : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 text-slate-700"
                }`}
              >
                <span className="text-2xl sm:text-3xl mb-1.5 select-none">{opt.emoji}</span>
                <span className="font-semibold text-xs">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Intensity Selector */}
        {selectedMood && !submitted && (
          <div className="space-y-3 pt-2 animate-enter">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
              <span>Intensity:</span>
              <span className="text-brand-600 font-bold bg-brand-50 px-2.5 py-0.5 rounded-full">
                {intensity} / 10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>
        )}

        {/* Submit or Success State */}
        <div>
          {submitted ? (
            <div className="flex items-center justify-center space-x-2 py-3.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl border border-emerald-100 text-sm">
              <Check className="w-4 h-4" />
              <span>Mood logged successfully!</span>
            </div>
          ) : (
            <button
              onClick={handleMoodSubmit}
              disabled={!selectedMood}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center space-x-2 ${
                selectedMood
                  ? "bg-brand-500 hover:bg-brand-600 text-white cursor-pointer active:scale-[0.99]"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <span>Submit Entry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

