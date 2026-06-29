import React from "react";
import { INITIAL_TIPS } from "../data";
import { Moon, Droplet, Footprints, BookOpen, Wind, Users, Smartphone, Music } from "lucide-react";

interface TipsViewProps {
  initialSearchQuery?: string;
}

// Icon mapper to convert string keys from types/data into Lucide JSX components
const ICON_MAP: Record<string, React.ReactNode> = {
  Moon: <Moon className="w-5 h-5 text-brand-500" />,
  Droplet: <Droplet className="w-5 h-5 text-brand-500" />,
  Footprints: <Footprints className="w-5 h-5 text-brand-500" />,
  BookOpen: <BookOpen className="w-5 h-5 text-brand-500" />,
  Wind: <Wind className="w-5 h-5 text-brand-500" />,
  Users: <Users className="w-5 h-5 text-brand-500" />,
  Smartphone: <Smartphone className="w-5 h-5 text-brand-500" />,
  Music: <Music className="w-5 h-5 text-brand-500" />,
};

export default function TipsView({ initialSearchQuery = "" }: TipsViewProps) {
  return (
    <div className="page-enter w-full space-y-6 pb-4">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">
          Daily Tips
        </h2>
      </div>

      {/* List of Tips */}
      <div className="space-y-4">
        {INITIAL_TIPS.map((tip) => (
          <div
            key={tip.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/50 flex items-start space-x-3.5 hover:shadow-md hover:border-slate-300/60 transition-all"
          >
            {/* Icon Container with subtle background colors */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 shrink-0">
              {ICON_MAP[tip.iconName] || <Wind className="w-5 h-5 text-brand-500" />}
            </div>
            
            <div className="space-y-0.5">
              <h3 className="font-semibold text-slate-800 text-sm">
                {tip.title}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                {tip.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
