import React from "react";
import { MoodLog, Mood } from "../types";
import { Calendar, Trash2, ShieldAlert, BarChart3, TrendingUp, Sparkles } from "lucide-react";

interface TrackerViewProps {
  moodLogs: MoodLog[];
  onClearLogs: () => void;
}

export default function TrackerView({ moodLogs, onClearLogs }: TrackerViewProps) {
  const [showConfirmClear, setShowConfirmClear] = React.useState(false);
  
  // Calculate stats
  const totalLogs = moodLogs.length;

  const countByMood = moodLogs.reduce((acc, log) => {
    acc[log.feeling] = (acc[log.feeling] || 0) + 1;
    return acc;
  }, {} as Record<Mood, number>);

  const moodColors: Record<Mood, { bar: string; text: string; bg: string; emoji: string }> = {
    Happy: { bar: "bg-brand-600", text: "text-brand-600", bg: "bg-brand-50", emoji: "😊" },
    Normal: { bar: "bg-brand-500", text: "text-brand-500", bg: "bg-brand-50", emoji: "😐" },
    Stressed: { bar: "bg-brand-400", text: "text-brand-400", bg: "bg-brand-50/70", emoji: "😰" },
    Sad: { bar: "bg-brand-300", text: "text-brand-300", bg: "bg-brand-50/50", emoji: "😢" }
  };

  const averageIntensity = totalLogs > 0
    ? (moodLogs.reduce((sum, log) => sum + log.intensity, 0) / totalLogs).toFixed(1)
    : "0.0";

  // Get dominant mood
  let dominantMood: Mood | "None" = "None";
  let maxCount = 0;
  Object.entries(countByMood).forEach(([mood, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantMood = mood as Mood;
    }
  });

  return (
    <div className="page-enter w-full space-y-6 pb-4">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">
          Health Tracker
        </h2>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/50 text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Logs</p>
          <p className="text-xl font-extrabold text-brand-600">{totalLogs}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/50 text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Avg Intensity</p>
          <p className="text-xl font-extrabold text-brand-600">{averageIntensity}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/50 text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Dominant</p>
          <p className="text-xl font-extrabold text-brand-600">
            {dominantMood !== "None" ? moodColors[dominantMood as Mood].emoji : "—"}
          </p>
        </div>
      </div>

      {/* Visual Bar Chart: "tracker in a bar" */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/50 space-y-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-slate-800">Mood Frequency</h3>
        </div>

        {totalLogs === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-400 text-xs italic">
              No logs submitted yet. Log your mood on the Home tab.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(["Happy", "Normal", "Stressed", "Sad"] as Mood[]).map((mood) => {
              const count = countByMood[mood] || 0;
              const percentage = totalLogs > 0 ? (count / totalLogs) * 100 : 0;
              const style = moodColors[mood];

              return (
                <div key={mood} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center space-x-1.5 text-slate-700">
                      <span className="select-none">{style.emoji}</span>
                      <span className="font-medium">{mood}</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {count} logs ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  {/* Progress bar representing frequency */}
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div
                      className={`h-full ${style.bar} transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, totalLogs > 0 ? 5 : 0)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mood Entry History Logs */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/50 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-slate-800">History</h3>
          </div>
          {totalLogs > 0 && (
            <div className="flex items-center gap-2">
              {showConfirmClear ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 p-1 rounded-lg">
                  <span className="text-[9px] text-rose-700 font-bold px-1">Confirm?</span>
                  <button
                    onClick={() => {
                      onClearLogs();
                      setShowConfirmClear(false);
                    }}
                    className="text-[9px] bg-rose-600 hover:bg-rose-700 text-white px-2 py-0.5 rounded font-bold transition-all cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold transition-all cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="text-[10px] text-rose-500 hover:text-rose-600 font-semibold flex items-center space-x-1 hover:bg-rose-50/50 px-2 py-1 rounded transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          )}
        </div>

        {totalLogs === 0 ? (
          <p className="text-slate-400 text-center py-4 text-xs italic">
            Your logs will populate here.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto pr-1">
            {moodLogs.map((log) => {
              const style = moodColors[log.feeling];
              const date = new Date(log.timestamp);
              const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const formattedDate = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <div key={log.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-lg bg-slate-50 p-1 rounded-lg border border-slate-100 select-none">
                      {style.emoji}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                        {log.feeling}
                        <span className="text-[10px] font-medium px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded">
                          Intensity {log.intensity}/10
                        </span>
                      </h4>
                      <p className="text-slate-400 text-[9px]">
                        {formattedDate} at {formattedTime}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
