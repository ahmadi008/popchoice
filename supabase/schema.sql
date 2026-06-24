-- ============================================================================
-- PopChoice — Supabase + pgvector schema
-- ============================================================================
-- Run this ONCE in the Supabase SQL Editor (Project → SQL → New query).
-- See README step 5 for screenshots / detailed walkthrough.
--
-- This script is idempotent — it's safe to run multiple times.
-- ============================================================================

-- 1) Enable the pgvector extension. Required for vector similarity search.
create extension if not exists vector;

-- 2) Create the movies table.
--    embedding is a 1536-dimension vector (matches text-embedding-3-small).
create table if not exists public.movies (
  id           bigserial primary key,
  title        text not null unique,
  release_year text,
  content      text not null,
  embedding    vector(1536),
  created_at   timestamptz not null default now()
);

-- 3) Helpful index for fast cosine-distance lookups (optional but recommended).
create index if not exists movies_embedding_idx
  on public.movies
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 4) The RPC function called from src/utils/searchMovies.js.
--    Computes cosine similarity via pgvector's `<=>` operator
--    and returns the closest matches above the threshold.
create or replace function public.match_movies (
  query_embedding vector(1536),
  match_threshold float  default 0,
  match_count     int    default 1
)
returns table (
  id            bigint,
  title         text,
  release_year  text,
  content       text,
  similarity    float
)
language sql
stable
as $$
  select
    movies.id,
    movies.title,
    movies.release_year,
    movies.content,
    1 - (movies.embedding <=> query_embedding) as similarity
  from public.movies
  where movies.embedding is not null
    and 1 - (movies.embedding <=> query_embedding) > match_threshold
  order by movies.embedding <=> query_embedding
  limit match_count;
$$;

-- 5) Grant execute on the RPC to the anon role so the React app can call it.
--    (RLS is left OFF for this demo so the read works without extra setup.)
grant execute on function public.match_movies(vector, float, int) to anon, authenticated;

-- ============================================================================
-- Sanity check — run a SELECT after this script to confirm the table exists:
--   select count(*) from public.movies;
-- It should return 0 until you run `npm run ingest`.
-- ============================================================================