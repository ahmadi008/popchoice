# 🍿 PopChoice — AI Movie Recommendation App

> An AI-powered movie advisor that recommends films based on **what you mean**, not what you type.
> Built with React + OpenRouter embeddings + Supabase pgvector + a free LLM.

live demo link : https://popchoice-nu.vercel.app/

---

## ✨ What it does

1. User answers 3 quick questions about their movie taste.
2. The answers are combined and turned into a **vector embedding**.
3. That embedding is compared (via cosine similarity) against 9 pre-embedded movies stored in **Supabase pgvector**.
4. The closest matching movie is retrieved.
5. An LLM writes a **personalized explanation** for why this movie fits.
6. The result is shown on a clean recommendation screen.

That's a full **Retrieval-Augmented Generation (RAG)** workflow.

---

