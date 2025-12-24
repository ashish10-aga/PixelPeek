/**
 * Advanced Answer Validator - Sophisticated semantic matching system
 * Handles fuzzy matching, semantic similarity, context awareness, and synonym resolution
 * Uses Google Gemini API for intelligent answer validation
 */

import { generateHintFromAI } from "./gemini.js";

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[len2][len1];
}

/**
 * Tokenize and normalize text for comparison
 */
function tokenizeAndNormalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

/**
 * Calculate Jaccard similarity (word overlap)
 */
function jaccardSimilarity(tokens1, tokens2) {
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Calculate fuzzy match score
 */
function fuzzyMatchScore(guess, answer) {
  const maxLen = Math.max(guess.length, answer.length);
  if (maxLen === 0) return 1.0;

  const distance = levenshteinDistance(guess, answer);
  return 1 - distance / maxLen;
}

/**
 * Extract key entities and descriptors from text using Gemini
 */
async function extractEntities(text) {
  try {
    const prompt = `Extract the key nouns, adjectives, and entities from this text. Return as a JSON object with "entities" array and "descriptors" array. Be concise:
Text: "${text}"

Example response format:
{"entities": ["bread", "egg"], "descriptors": ["brown", "white", "pastry"]}

Response:`;

    // Note: This is a simplified extraction - in production use Gemini with structured output
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      console.warn("Entity extraction failed, using fallback");
      return { entities: tokenizeAndNormalize(text), descriptors: [] };
    }

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    try {
      const parsed = JSON.parse(content);
      return {
        entities: parsed.entities || tokenizeAndNormalize(text),
        descriptors: parsed.descriptors || [],
      };
    } catch {
      return { entities: tokenizeAndNormalize(text), descriptors: [] };
    }
  } catch (err) {
    console.warn("Entity extraction error:", err);
    return { entities: tokenizeAndNormalize(text), descriptors: [] };
  }
}

/**
 * Validate answer using multiple strategies and Gemini consensus
 * Returns { isValid, confidence, reasoning, strategy }
 */
export async function validateAnswerAdvanced(
  userGuess,
  correctAnswer,
  imageDescription
) {
  const normalizedGuess = userGuess.toLowerCase().trim();
  const normalizedAnswer = correctAnswer.toLowerCase().trim();

  // Strategy 1: Exact match (highest confidence)
  if (normalizedGuess === normalizedAnswer) {
    return {
      isValid: true,
      confidence: 1.0,
      reasoning: "Exact match",
      strategy: "EXACT",
      score: 100,
    };
  }

  // Strategy 2: Substring matching (high confidence)
  if (
    normalizedGuess.includes(normalizedAnswer) ||
    normalizedAnswer.includes(normalizedGuess)
  ) {
    const score =
      Math.max(normalizedGuess.length, normalizedAnswer.length) /
      Math.min(normalizedGuess.length, normalizedAnswer.length) >=
      0.75
        ? 0.95
        : 0.85;
    return {
      isValid: score >= 0.8,
      confidence: score,
      reasoning: "Substring match detected",
      strategy: "SUBSTRING",
      score: Math.round(score * 100),
    };
  }

  // Strategy 3: Fuzzy matching (Levenshtein)
  const fuzzyScore = fuzzyMatchScore(normalizedGuess, normalizedAnswer);
  if (fuzzyScore >= 0.88) {
    return {
      isValid: true,
      confidence: fuzzyScore,
      reasoning: "High fuzzy match score",
      strategy: "FUZZY",
      score: Math.round(fuzzyScore * 100),
    };
  }

  // Strategy 4: Token-based Jaccard similarity
  const guessTokens = tokenizeAndNormalize(normalizedGuess);
  const answerTokens = tokenizeAndNormalize(normalizedAnswer);
  const jaccardScore = jaccardSimilarity(guessTokens, answerTokens);

  if (jaccardScore >= 0.8) {
    return {
      isValid: true,
      confidence: jaccardScore,
      reasoning: "Word overlap match",
      strategy: "JACCARD",
      score: Math.round(jaccardScore * 100),
    };
  }

  // Strategy 5: Entity-based semantic matching with Gemini
  try {
    const guessEntities = await extractEntities(normalizedGuess);
    const answerEntities = await extractEntities(normalizedAnswer);

    const entityOverlap = jaccardSimilarity(
      guessEntities.entities,
      answerEntities.entities
    );

    if (entityOverlap >= 0.75) {
      return {
        isValid: true,
        confidence: entityOverlap,
        reasoning: "Entity-based semantic match",
        strategy: "ENTITY",
        score: Math.round(entityOverlap * 100),
      };
    }
  } catch (err) {
    console.warn("Entity matching failed:", err);
  }

  // Strategy 6: Gemini semantic validation (most sophisticated)
  try {
    const validationPrompt = `You are an image guessing game validator. Determine if the user's guess is semantically correct for an image.

Image Description: "${imageDescription}"
Correct Answer: "${correctAnswer}"
User Guess: "${normalizedGuess}"

Consider:
1. Does the guess describe the same main subject?
2. Are key descriptors (color, material, shape, action) present?
3. Is it close enough to be considered correct?
4. Would a reasonable person accept this as correct?

Respond with ONLY a JSON object:
{
  "isValid": boolean,
  "confidence": 0.0-1.0,
  "reasoning": "explanation",
  "keyMatches": ["matched element 1", "matched element 2"]
}`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: validationPrompt }] }],
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      try {
        const result = JSON.parse(content);
        return {
          isValid: result.isValid,
          confidence: result.confidence || 0.5,
          reasoning: result.reasoning || "Gemini validation",
          strategy: "GEMINI_SEMANTIC",
          score: Math.round((result.confidence || 0.5) * 100),
          keyMatches: result.keyMatches || [],
        };
      } catch (parseErr) {
        console.warn("Gemini response parsing failed:", parseErr);
      }
    }
  } catch (err) {
    console.warn("Gemini validation error:", err);
  }

  // Fallback: if score is borderline, accept it
  if (fuzzyScore >= 0.75 || jaccardScore >= 0.6) {
    return {
      isValid: true,
      confidence: Math.max(fuzzyScore, jaccardScore),
      reasoning: "Borderline match accepted",
      strategy: "FALLBACK",
      score: Math.round(Math.max(fuzzyScore, jaccardScore) * 100),
    };
  }

  // No match found
  return {
    isValid: false,
    confidence: Math.max(fuzzyScore, jaccardScore),
    reasoning: "Guess does not match answer",
    strategy: "REJECTED",
    score: Math.round(Math.max(fuzzyScore, jaccardScore) * 100),
  };
}

/**
 * Generate contextual hints based on user's incorrect guess
 * Helps guide them toward the correct answer
 */
export async function generateContextualHint(
  userGuess,
  correctAnswer,
  imageDescription,
  hintLevel
) {
  const hintPrompt = `The user guessed "${userGuess}" but the correct answer is "${correctAnswer}".
Image description: "${imageDescription}"
Hint level: ${hintLevel} (1-5, where 5 is closest to answer)

Generate a helpful hint that guides them without giving away the answer. Keep it under 15 words.
Make it cryptic but directional at level ${hintLevel}.`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: hintPrompt }] }],
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const hint = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return hint.replace(/^["']|["']$/g, "").trim();
    }
  } catch (err) {
    console.warn("Contextual hint generation failed:", err);
  }

  return `Getting closer to the answer...`;
}

/**
 * Batch validate multiple possible answers
 * Useful for finding best match from ambiguous descriptions
 */
export async function validateAnswerBatch(userGuess, possibleAnswers, imageDescription) {
  const results = await Promise.all(
    possibleAnswers.map((answer) =>
      validateAnswerAdvanced(userGuess, answer, imageDescription).then(
        (result) => ({ answer, ...result })
      )
    )
  );

  // Sort by confidence
  results.sort((a, b) => b.confidence - a.confidence);

  return {
    bestMatch: results[0],
    allResults: results,
    consensus: results[0].confidence > 0.75,
  };
}

export default {
  validateAnswerAdvanced,
  generateContextualHint,
  validateAnswerBatch,
};
