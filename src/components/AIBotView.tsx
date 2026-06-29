import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, Mood, MoodLog } from "../types";
import { Bot, Send, Sparkles, Loader2, RefreshCw } from "lucide-react";

interface AIBotViewProps {
  name: string;
  currentFeeling: Mood | null;
  currentIntensity: number | null;
  moodLogs: MoodLog[];
}

export default function AIBotView({ name, currentFeeling, currentIntensity, moodLogs }: AIBotViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-msg",
      sender: "bot",
      text: `Hello! I am your AI mental health companion. How are you handling school and life today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Determine current active feeling
  const activeFeeling = currentFeeling || (moodLogs.length > 0 ? moodLogs[0].feeling : null);
  const activeIntensity = currentIntensity || (moodLogs.length > 0 ? moodLogs[0].intensity : null);

  // Automatically request initial tips if student logged a mood
  useEffect(() => {
    if (activeFeeling) {
      const cached = sessionStorage.getItem(`mood-suggestions-${activeFeeling}`);
      if (cached) {
        setAiSuggestions(cached);
        setHasFetchedInitial(true);
      } else if (!hasFetchedInitial && !aiSuggestions) {
        fetchMoodSuggestions(activeFeeling, activeIntensity || 5);
        setHasFetchedInitial(true);
      }
    }
  }, [activeFeeling, hasFetchedInitial, aiSuggestions]);

  const fetchMoodSuggestions = async (feeling: Mood, intensity: number) => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch("/api/gemini/mood-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          feeling,
          intensity
        })
      });
      const data = await response.json();
      if (data.text) {
        setAiSuggestions(data.text);
        sessionStorage.setItem(`mood-suggestions-${feeling}`, data.text);
      }
    } catch (err) {
      console.error("Error fetching mood suggestions:", err);
      // Fallback local bullet suggestions
      const fallback = `• Keep a stable daily routine and focus on deep breathing for 1-2 minutes.\n• Take a short outdoor walk to refresh your focus.\n• Make sure to stay properly hydrated throughout the day.`;
      setAiSuggestions(fallback);
      sessionStorage.setItem(`mood-suggestions-${feeling}`, fallback);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-msg-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          name,
          feeling: activeFeeling,
          intensity: activeIntensity
        })
      });

      const data = await response.json();
      
      const botMsg: ChatMessage = {
        id: `bot-msg-${Date.now()}`,
        sender: "bot",
        text: data.text || "I am listening. Please tell me more about how you're feeling.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Error sending message to AI:", err);
      const errorMsg: ChatMessage = {
        id: `error-msg-${Date.now()}`,
        sender: "bot",
        text: "I had a quick glitch connecting to the universe. Let's practice some slow breathing together while I recover!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="page-enter w-full space-y-4 pb-4 flex flex-col min-h-[calc(100vh-140px)]">
      {/* Bot Page Header */}
      <div className="text-center shrink-0">
        <h2 className="text-2xl font-bold text-slate-800">
          AI Assistant
        </h2>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 flex-1 flex flex-col overflow-hidden min-h-[250px]">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            return (
              <div
                key={msg.id}
                className={`flex ${isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm ${
                    isBot
                      ? "bg-slate-100 text-slate-800 rounded-tl-none font-medium leading-relaxed whitespace-pre-line"
                      : "bg-brand-500 text-white rounded-tr-none font-medium leading-relaxed whitespace-pre-line"
                  }`}
                >
                  {msg.text}
                  <span
                    className={`block text-[10px] mt-1.5 text-right ${
                      isBot ? "text-slate-400" : "text-white/70"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-400 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center space-x-2">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Text Input Footer matches photo */}
        <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-100 flex items-center space-x-2.5 shrink-0">
          <input
            id="chat-input"
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 placeholder-slate-400 text-sm font-medium transition-all"
          />
          <button
            id="chat-send-btn"
            type="submit"
            disabled={!inputText.trim()}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center transition-all ${
              inputText.trim()
                ? "bg-brand-500 hover:bg-brand-600 text-white cursor-pointer hover:shadow-md active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
