import React, { useState, useEffect } from "react";
import { Mood, MoodLog } from "./types";
import StartScreen from "./components/StartScreen";
import HomeView from "./components/HomeView";
import TrackerView from "./components/TrackerView";
import AIBotView from "./components/AIBotView";
import TipsView from "./components/TipsView";
import ContactView from "./components/ContactView";
import { Home, BarChart2, Bot, Lightbulb, Phone } from "lucide-react";

export default function App() {
  const [name, setName] = useState<string>(() => {
    return localStorage.getItem("mindcare_name") || "";
  });

  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(() => {
    const saved = localStorage.getItem("mindcare_logs");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<"home" | "tracker" | "aibot" | "tips" | "contact">("home");
  const [searchQueryForTips, setSearchQueryForTips] = useState("");

  const handleStart = (enteredName: string) => {
    setName(enteredName);
    localStorage.setItem("mindcare_name", enteredName);
  };

  const handleAddMoodLog = (feeling: Mood, intensity: number) => {
    const newLog: MoodLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      feeling,
      intensity,
    };
    const updated = [newLog, ...moodLogs];
    setMoodLogs(updated);
    localStorage.setItem("mindcare_logs", JSON.stringify(updated));
  };

  const handleClearLogs = () => {
    setMoodLogs([]);
    localStorage.removeItem("mindcare_logs");
  };

  const handleSearchRedirect = (query: string) => {
    setSearchQueryForTips(query);
    setActiveTab("tips");
  };

  // Reset search query when user navigates away from tips
  useEffect(() => {
    if (activeTab !== "tips") {
      setSearchQueryForTips("");
    }
  }, [activeTab]);

  // If user hasn't entered a name, show the custom StartScreen
  if (!name) {
    return <StartScreen onStart={handleStart} />;
  }

  // Find the last logged mood to pass to AI assistant context
  const lastLog = moodLogs.length > 0 ? moodLogs[0] : null;

  return (
    <div className="h-screen bg-slate-50 flex flex-col text-slate-900 font-sans overflow-hidden">
      
      {/* Main Container Frame */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Scrollable Content Frame */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 pt-6 pb-28 sm:px-6 overflow-y-auto overflow-x-hidden">
          {activeTab === "home" && (
            <HomeView
              name={name}
              onAddMoodLog={handleAddMoodLog}
              lastLog={lastLog}
              onSearchRedirect={handleSearchRedirect}
            />
          )}

          {activeTab === "tracker" && (
            <TrackerView
              moodLogs={moodLogs}
              onClearLogs={handleClearLogs}
            />
          )}

          {activeTab === "aibot" && (
            <AIBotView
              name={name}
              currentFeeling={lastLog?.feeling || null}
              currentIntensity={lastLog?.intensity || null}
              moodLogs={moodLogs}
            />
          )}

          {activeTab === "tips" && (
            <TipsView initialSearchQuery={searchQueryForTips} />
          )}

          {activeTab === "contact" && <ContactView />}
        </main>
      </div>

      {/* Bottom Horizontal Navigation Bar - Positioned below on all screen sizes, containing ONLY Home, Tracker, AI Bot, Tips, and Contact */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-50 py-3 px-3 sm:px-6 md:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-5 gap-3 sm:gap-6 md:gap-8">
          
          {/* Home Tab */}
          <button
            id="nav-home"
            onClick={() => setActiveTab("home")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 w-full py-2 px-1 sm:px-4 rounded-xl transition-all cursor-pointer ${
              activeTab === "home"
                ? "text-brand-600 bg-brand-50 font-bold"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/70 font-medium"
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="text-[10px] sm:text-sm font-semibold tracking-tight">Home</span>
          </button>

          {/* Tracker Tab */}
          <button
            id="nav-tracker"
            onClick={() => setActiveTab("tracker")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 w-full py-2 px-1 sm:px-4 rounded-xl transition-all cursor-pointer ${
              activeTab === "tracker"
                ? "text-brand-600 bg-brand-50 font-bold"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/70 font-medium"
            }`}
          >
            <BarChart2 className="w-5 h-5 shrink-0" />
            <span className="text-[10px] sm:text-sm font-semibold tracking-tight">Tracker</span>
          </button>

          {/* AI Bot Tab */}
          <button
            id="nav-aibot"
            onClick={() => setActiveTab("aibot")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 w-full py-2 px-1 sm:px-4 rounded-xl transition-all cursor-pointer ${
              activeTab === "aibot"
                ? "text-brand-600 bg-brand-50 font-bold"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/70 font-medium"
            }`}
          >
            <Bot className="w-5 h-5 shrink-0" />
            <span className="text-[10px] sm:text-sm font-semibold tracking-tight">AI Bot</span>
          </button>

          {/* Tips Tab */}
          <button
            id="nav-tips"
            onClick={() => setActiveTab("tips")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 w-full py-2 px-1 sm:px-4 rounded-xl transition-all cursor-pointer ${
              activeTab === "tips"
                ? "text-brand-600 bg-brand-50 font-bold"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/70 font-medium"
            }`}
          >
            <Lightbulb className="w-5 h-5 shrink-0" />
            <span className="text-[10px] sm:text-sm font-semibold tracking-tight">Tips</span>
          </button>

          {/* Contact Tab */}
          <button
            id="nav-contact"
            onClick={() => setActiveTab("contact")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 w-full py-2 px-1 sm:px-4 rounded-xl transition-all cursor-pointer ${
              activeTab === "contact"
                ? "text-brand-600 bg-brand-50 font-bold"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/70 font-medium"
            }`}
          >
            <Phone className="w-5 h-5 shrink-0" />
            <span className="text-[10px] sm:text-sm font-semibold tracking-tight">Contact</span>
          </button>

        </div>
      </nav>
    </div>
  );
}
