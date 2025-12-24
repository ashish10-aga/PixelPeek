import { generateHintFromAI } from "./gemini.js";

(async () => {
  const hint = await generateHintFromAI("a red sports car on the road", 0, []);
  console.log("AI Hint:", hint);
})();
