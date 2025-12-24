// --------------------------------------
// PixelPeek Gemini AI Hint Generator
// Full Game Context + Multi-Level Dynamic Hints
// --------------------------------------

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * generateHintFromAI(description, level, previousHints, label)
 * @param {string} description - Unsplash alt_description/description
 * @param {number} level - current hint level (0–4+)
 * @param {string[]} previousHints - previously given hints
 * @param {string} [label] - the AI-generated label (correct answer)
 * @returns {Promise<string>} progressive contextual hint
 */
export async function generateHintFromAI(description, level = 0, previousHints = [], label = "") {
  try {
    const safeDescription = String(description || "an image");
    const safeLabel = String(label || "unknown concept");

    // =====================================================
    // ULTRA-EXPLICIT, GAME-CONTEXTUAL PROMPT
    // =====================================================
    const prompt = `
You are an AI Game Master for a visual guessing game called **PixelPeek**.

🎯 CONTEXT:
- The player sees a heavily pixelated or blurred image.
- They must guess what it represents.
- You are responsible for generating *progressive hints* that guide them from vague impressions to almost-revealed clarity.
- Each hint corresponds to a "level" — from 0 (very vague) to 4+ (very specific).

📜 INPUT DATA
Image Description (from source): "${safeDescription}"
Correct Answer (hidden from player): "${safeLabel}"
Previous hints already given: ${
      previousHints.length
        ? previousHints.map((h, i) => `\n${i + 1}. ${h}`).join("")
        : "(none yet)"
    }
Current hint level: ${level}

---

🧠 YOUR TASK:
Generate **one new hint line only** that fits the current level, avoids repetition, and makes the image easier to guess.

Each hint must:
- Be natural, human-like, and feel like it's coming from a clever game master.
- Avoid mentioning or spelling out the exact answer.
- Use simple but vivid English.
- Connect visually or conceptually to the image (color, action, mood, purpose, symbolism).
- Stay under 25 words.
- Build upon prior hints (no resets or repeats).
- Avoid direct synonyms of the label.

---

📊 HINT LEVELS (Explainable Guidance):

**LEVEL 0 – The Atmosphere (Very Vague)**
- Set the tone or mood.
- Mention colors, shapes, vibe, or context clues.
- Example: “Cool blue tones and smooth motion.” → for “swimming”
- Example: “Towering shapes under the night sky.” → for “Eiffel Tower”
- Example: “Golden glow over rough terrain.” → for “desert”

**LEVEL 1 – The Scene or Category**
- Introduce a broad clue (category, environment, theme).
- Example: “Something you’d find in a big city.” → “building”
- Example: “Seen in competitive sports.” → “soccer”
- Example: “This belongs outdoors.” → “mountain”

**LEVEL 2 – The Visual or Action Detail**
- Add an obvious physical trait, setting, or activity.
- Example: “It involves water and movement.” → “swimming”
- Example: “This structure rises above a skyline.” → “Burj Khalifa”
- Example: “Often photographed by tourists.” → “Eiffel Tower”

**LEVEL 3 – The Human Association**
- Bring in meaning, symbolism, or related entities.
- Example: “Linked with Paris and romance.” → “Eiffel Tower”
- Example: “Connected with speed and design.” → “Ferrari”
- Example: “Played with eleven players.” → “soccer”

**LEVEL 4+ – The Reveal Stage**
- Offer a near-giveaway clue (a player should guess correctly now).
- Be *obvious but not explicit*.
- Example: “Found in Dubai, tallest in the world.” → “Burj Khalifa”
- Example: “Raced in Formula 1.” → “Ferrari”
- Example: “Held every four years, global event.” → “Olympics”
- Example: “Shines above Paris with iron lattice.” → “Eiffel Tower”

---

🏁 RULES:
- NEVER include the exact answer word.
- NEVER reuse earlier hints.
- NEVER output more than one line.
- ALWAYS maintain the game’s mystery and pacing.
- You are friendly, clever, and cinematic in your tone.
- The hint must feel like it’s intentionally guiding a player step by step.

---

Now produce your next hint **only as a single short sentence**. 
Do not prefix it with "Hint:", "Level:", or any metadata.
`;

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
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API error response:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        apiKey: GEMINI_API_KEY ? "***present***" : "***missing***"
      });
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Gemini hint response:", data);

    let aiHint =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    // Sanitize and fallback
    if (!aiHint || aiHint.length < 5) {
      aiHint = "Look closely—something familiar hides within.";
    }
    if (previousHints.includes(aiHint)) {
      aiHint += " (think deeper)";
    }

    return aiHint.split("\n")[0].slice(0, 200);
  } catch (err) {
    console.error("Gemini error:", err);
    return "Hint generation failed.";
  }
}
