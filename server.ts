import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY is not defined. AI Bot will fall back to smart local suggestions.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Dynamic Mood-Based Tips & Suggestion Endpoint (Short & point format)
app.post("/api/gemini/mood-suggestion", async (req, res) => {
  const { name, feeling, intensity, selectedCopingTips } = req.body;
  
  if (!feeling) {
    return res.status(400).json({ error: "Feeling is required." });
  }

  const moodIntensity = intensity ? ` (intensity level: ${intensity}/10)` : "";
  const tipsContext = selectedCopingTips && selectedCopingTips.length > 0 
    ? `They are interested in activities like: ${selectedCopingTips.join(", ")}.`
    : "";

  const prompt = `You are a supportive, professional, and empathetic AI Mental Health Assistant.
The student client is named ${name || "Guest"}.
They are feeling: "${feeling}"${moodIntensity}.
${tipsContext}

Please generate a short, personalized suggestion set tailored for their exact mood state.
Guidelines for your response:
1. Provide exactly 3 to 4 actionable, highly specific coping strategies or encouraging points.
2. Format your response strictly in short, crisp bullet points. No conversational filler or introductory/concluding fluff.
3. Use warm, comforting, but highly concise language. Keep each bullet point to 1-2 sentences.
4. Keep the points extremely practical and geared towards a student.`;

  try {
    if (!apiKey) {
      // Return beautiful high-quality fallback tips if key is missing
      return res.json({
        text: getLocalMockSuggestion(feeling, name || "Guest", intensity)
      });
    }

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    const isRateLimit = error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("quota") || error?.statusCode === 429;
    if (isRateLimit) {
      console.warn("Gemini API Notice: Quota limit reached. Serving high-quality local suggestions.");
    } else {
      console.warn("Gemini API Notice: Using local suggestions fallback.");
    }
    res.json({
      text: getLocalMockSuggestion(feeling, name || "Guest", intensity)
    });
  }
});

// 2. Chat Endpoint for the AI Mental Health Companion Chatbot
app.post("/api/gemini/chat", async (req, res) => {
  const { messages, name, feeling, intensity } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  // Format conversational context
  const contextText = feeling 
    ? `Student context: Name is ${name || "Guest"}, currently feeling ${feeling}${intensity ? ` with intensity ${intensity}/10` : ""}.`
    : `Student context: Name is ${name || "Guest"}.`;

  const systemInstruction = `You are a safe, compassionate, and professional AI Mental Health Companion named MindCare Companion.
${contextText}

Instructions:
1. Respond to the student in a very supportive, warm, and clear manner.
2. Always keep your replies relatively SHORT and in point/bullet format when giving suggestions (i.e. 'Sort and point Format'), so that it is super clear, clean, and readable for a student who might be stressed.
3. Be an active listener. Validate their feelings.
4. Do NOT give medical advice or clinical diagnoses. Maintain a supportive companion role.
5. Emphasize simple, actionable mental health tips (such as study-breaks, proper hydration, deep breathing, walk, screen time boundaries).`;

  try {
    if (!apiKey) {
      // Return smart localized chat tips if key is missing
      return res.json({
        text: getLocalSmartChatFallback(messages, name || "Guest", feeling || null, intensity || null)
      });
    }

    const ai = getAIClient();
    
    // Transform chat history into Gemini contents format
    const contents = messages.map(msg => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents as any,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    const isRateLimit = error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("quota") || error?.statusCode === 429;
    if (isRateLimit) {
      console.warn("Gemini API Notice: Quota limit reached in chat. Serving high-quality local suggestions.");
    } else {
      console.warn("Gemini API Notice: Using local chat fallback.");
    }
    // Graceful recovery: rather than 500 error, reply with high-quality localized mental health tips
    res.json({
      text: getLocalSmartChatFallback(messages, name || "Guest", feeling || null, intensity || null)
    });
  }
});

// Smart fallback generator when API rate-limits/quota exceeded
function getLocalSmartChatFallback(messages: any[], name: string, feeling: string | null, intensity: number | null): string {
  const lastMsgObj = messages[messages.length - 1];
  const userText = (lastMsgObj?.text || "").toLowerCase();
  
  let greeting = `Thank you for sharing that with me, ${name || "friend"}. I'm listening closely.`;
  let points: string[] = [];
  let closing = `Remember, I am always here to listen and help you process things. You are doing great!`;

  const feelingStr = (feeling || "").toLowerCase();
  
  if (userText.includes("hello") || userText.includes("hi") || userText.includes("hey")) {
    greeting = `Hello, ${name || "friend"}! It is wonderful to connect with you. How are you feeling today?`;
    points = [
      "If you'd like, you can tell me about any stress or school goals you are working on today.",
      "We can also talk about quick mindfulness tips, sleep recommendations, or healthy breaks.",
      "Whenever you are ready, just type how you are feeling."
    ];
    closing = "I'm right here with you.";
  } else if (userText.includes("study") || userText.includes("exam") || userText.includes("test") || userText.includes("grade") || userText.includes("homework")) {
    greeting = `I understand school can feel incredibly demanding, ${name}. Academic stress is very real.`;
    points = [
      "**The 50/10 Rule**: Work for 50 minutes, then take a full 10-minute walk or stretch away from any screens.",
      "**Task Slicing**: Break down your study list into 3 micro-goals. Focus exclusively on the first one to avoid feeling overwhelmed.",
      "**Deep Breathing**: Take 3 slow, deep belly breaths before beginning your study session to calm physical jitters.",
      "**Stay Hydrated**: Keep a bottle of cool water at your desk. Proper hydration supports focus and prevents fatigue."
    ];
    closing = "You are much more than just a grade or exam result. Be gentle with your mind today!";
  } else if (userText.includes("sleep") || userText.includes("insomnia") || userText.includes("night") || userText.includes("tired") || userText.includes("exhausted")) {
    greeting = `Rest is so vital for your mental well-being, ${name}. Being tired makes coping with everything else much harder.`;
    points = [
      "**Unplug 30 Mins Before**: Turn off dynamic scrolling on your phone 30 minutes before closing your eyes to let your melatonin rise naturally.",
      "**Dim the Lights**: Lower your room lights early to signal to your brain that it is time to transition into sleep mode.",
      "**4-7-8 Breathing**: Inhale for 4s, hold for 7s, exhale for 8s to calm physical alertness and racing thoughts.",
      "**Write it Down**: If you have a checklist running in your mind, quickly write it down on a piece of paper to clear it from your thoughts."
    ];
    closing = "I hope you can find some quiet, restorative rest tonight. Sleep well!";
  } else if (userText.includes("stress") || userText.includes("anxious") || userText.includes("worry") || userText.includes("overwhelmed") || feelingStr === "stressed") {
    greeting = `I hear you, ${name}. It sounds like there is a lot on your shoulders right now, and that can feel heavy.`;
    points = [
      "**Grounding (5-4-3-2-1)**: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This brings your focus back to the present.",
      "**Release Physical Tension**: Do a quick scan from head to toe. Drop your shoulders away from your ears, release your tongue from the roof of your mouth, and relax your fists.",
      "**Take a 5-Minute Screen Free Break**: Step away from notifications and social media feeds to let your brain decompress.",
      "**One Step at a Time**: Focus only on the single next thing you need to do, rather than the entire pile."
    ];
    closing = "We will take things one gentle step at a time. You are not alone in this.";
  } else if (userText.includes("sad") || userText.includes("down") || userText.includes("cry") || userText.includes("lonely") || feelingStr === "sad") {
    greeting = `I am so sorry you are feeling down right now, ${name}. Please know that your sadness is valid and it is okay to not be okay.`;
    points = [
      "**Give Yourself Compassion**: Do not force yourself to smile or pretend. Let yourself feel and release any heavy energy (crying is healthy!).",
      "**Connect Gently**: Send a short hello to a friend, family member, or anyone you trust. Even a brief, casual text can lift isolation.",
      "**Physically Shift Your Space**: Walk into another room, step outside for fresh air, or wrap yourself in a warm blanket.",
      "**Listen to Soothing Sounds**: Play a favorite comforting tune or low-fidelity ambient beats to support you."
    ];
    closing = "Every storm runs out of rain, and things will feel lighter eventually. I am right here.";
  } else if (userText.includes("happy") || userText.includes("excited") || userText.includes("good") || userText.includes("great") || feelingStr === "happy") {
    greeting = `It makes me so happy to hear that, ${name}! Your positive energy is wonderful.`;
    points = [
      "**Savor the Moment**: Truly pause for 10 seconds to feel this joy in your chest and remember this warmth.",
      "**Reflect on the Trigger**: What made you feel so good today? Celebrate it and try to repeat it when possible.",
      "**Share Your Smile**: Compliment someone or send a brief message to a loved one to spread this happy momentum."
    ];
    closing = "Keep shining bright! Let's hold onto this positive spirit.";
  } else {
    // Default smart conversational fallback
    points = [
      "**Stay Hydrated**: Sipping water can help you stay alert and physically balanced.",
      "**Breathe Fully**: Take 3 slow, deep breaths, filling your lungs entirely and letting go of any tight thoughts.",
      "**Break from Screens**: Stand up, stretch, and focus your eyes on something far away for 1 minute."
    ];
  }

  const bulletText = points.map(p => `• ${p}`).join("\n");
  return `${greeting}\n\n${bulletText}\n\n${closing}`;
}

// Fallback helper for local mock suggestions if API key is not present
function getLocalMockSuggestion(feeling: string, name: string, intensity?: number): string {
  const scaleText = intensity ? ` level ${intensity}/10` : "";
  const f = feeling.toLowerCase();
  
  if (f === "stressed") {
    return `• **Practice the 4-7-8 Breath**: Inhale for 4s, hold for 7s, exhale for 8s to calm your nervous system.
• **Take a 5-Minute Screen Break**: Step away from your laptop and look out a window to rest your eyes and mind.
• **De-clutter Your Work Space**: Spend 2 minutes organizing your immediate desk space to help feel more in control.`;
  } else if (f === "sad") {
    return `• **Be Gentle with Yourself, ${name}**: It is completely natural to feel down sometimes. Let yourself feel without judgment.
• **Reach Out to One Friend**: Send a simple text to someone you trust just to say hello or share a quick chat.
• **Listen to an Uplifting Song**: Play a comforting, soothing, or gentle melody to help shift your mindset.`;
  } else if (f === "happy") {
    return `• **Ride the Wave of Positivity, ${name}**: Take a moment to appreciate this good energy and let it sink in fully!
• **Log This Feeling**: Write down what made you happy today so you can look back on it on tougher days.
• **Spread the Joy**: Compliment a classmate or send a kind message to a family member to share your happy vibration.`;
  } else {
    // Normal / default
    return `• **Maintain Your Balance**: Having a calm, normal day is wonderful. Keep doing what you're doing.
• **Do a Mindful Check-in**: Spend 1 minute scanning your body for any physical tension (relax your shoulders, unclench your jaw).
• **Stay Consistent**: Keep up with stable study habits, hydration, and healthy sleep blocks tonight!`;
  }
}

// 3. Serve Vite Client (dev or static production build)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
