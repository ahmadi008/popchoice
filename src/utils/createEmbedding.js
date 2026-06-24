import { openai, EMBEDDING_MODEL } from "../lib/config.js";

/**
 * Convert a piece of text into a vector embedding using OpenRouter.
 *
 * The same model is used for both movie content (one-time, ingestion)
 * and user preference profiles (per recommendation). This consistency
 * is what makes similarity scores meaningful.
 *
 * @param {string} text - Text to embed.
 * @returns {Promise<number[]>} A 1536-dimension vector.
 */
export async function createEmbedding(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("createEmbedding: input text is empty");
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.trim()
  });

  const vector = response?.data?.[0]?.embedding;
  if (!Array.isArray(vector)) {
    throw new Error("createEmbedding: OpenRouter returned no embedding");
  }

  return vector;
}