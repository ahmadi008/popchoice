import { openai, CHAT_MODEL } from "../lib/config.js";

/**
 * Ask the LLM to write a short, personalized explanation for why a
 * particular movie was recommended to this user.
 *
 * The prompt is intentionally grounded: the model is given the user's
 * stated preferences AND the movie's metadata. This is the "G" in RAG —
 * the retrieved context shapes the generated answer.
 *
 * @param {object} args
 * @param {string} args.userProfile - Combined preference profile text.
 * @param {string} args.movieTitle
 * @param {string} args.movieYear
 * @param {string} args.movieDescription
 * @returns {Promise<string>} A short, natural-language explanation.
 */
export async function generateExplanation({
  userProfile,
  movieTitle,
  movieYear,
  movieDescription
}) {
  const systemPrompt = `
You are PopChoice, a friendly and knowledgeable movie advisor.
Your job is to explain, in 2–3 sentences (max 60 words), why a specific
movie is a great match for a user given their stated preferences.

Rules:
- Reference the user's preferences directly (do not invent facts).
- Mention the movie's title and at least one concrete aspect of it
  (genre, theme, tone, director, or storyline) so it feels specific.
- Sound warm and conversational — like a friend recommending a movie,
  not a search result snippet.
- Do NOT include spoilers.
- Do NOT begin with "I" or with the movie title. Start with "We
  recommend ..." or another natural opener.
`.trim();

  const userPrompt = `
User preferences:
"""
${userProfile}
"""

Recommended movie:
- Title: ${movieTitle}
- Release year: ${movieYear}
- Description: ${movieDescription}

Why is this a good match? Write the explanation now.
`.trim();

  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 200
  });

  const text = response?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("generateExplanation: model returned empty content");
  }
  return text;
}