// PixelPeek Gemini Hint Generator - Simplified & Reliable Version
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("⚠️ VITE_GEMINI_API_KEY is not set!");
} else {
  console.log("✅ Gemini API key loaded successfully");
}

/**
 * generateHintFromAI - Generate progressive hints using Gemini API
 * Falls back to offline hints if API fails
 */
export async function generateHintFromAI(description, level = 0, previousHints = [], label = "") {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("API key not configured");
    }

    const desc = String(description || "image");
    const ans = String(label || "concept");

    // Simple, concise prompt to minimize API issues
    const prompt = `Generate a brief hint (max 15 words) at level ${level} to guess "${desc}". Answer: "${ans}". Only output the hint.`;

    console.log("📤 Sending hint request to Gemini...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    console.log(`📥 Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Gemini API error:", {
        status: response.status,
        error: errorData?.error?.message || errorData,
      });
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    let hint = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    console.log("✅ Hint received:", hint);

    if (!hint || hint.length < 3) {
      console.warn("Empty response, using fallback");
      hint = "Study the details carefully...";
    }

    return hint.split("\n")[0].slice(0, 200);
  } catch (err) {
    console.error("❌ Hint generation failed:", err.message);
    // Return fallback hints based on level
    const fallbackHints = [
      "Look at the colors and shapes...",
      "Think about where you'd find this...",
      "Consider what it's used for...",
      "Focus on its key features...",
      "This should be obvious now!",
    ];
    return fallbackHints[Math.min(level, fallbackHints.length - 1)];
  }
}

/**
 * generateContextualHint - Generate hints based on wrong guesses
 */
export async function generateContextualHint(guess, label, description, level) {
  try {
    if (!GEMINI_API_KEY) return null;

    const prompt = `User guessed "${guess}" but answer is "${label}". Give a brief hint at level ${level} (max 15 words) to guide them better.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      console.warn("Contextual hint API error:", response.status);
      return null;
    }

    const data = await response.json();
    const hint = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return hint || null;
  } catch (err) {
    console.warn("Contextual hint generation failed:", err.message);
    return null;
  }
}
