export type Mood = "Happy" | "Normal" | "Stressed" | "Sad";

export interface MoodLog {
  id: string;
  timestamp: string; // ISO date string
  feeling: Mood;
  intensity: number; // 1 to 10
  note?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string; // HH:MM
}

export interface TipItem {
  id: string;
  title: string;
  desc: string;
  iconName: string; // corresponding to Lucide-react icon names
}
