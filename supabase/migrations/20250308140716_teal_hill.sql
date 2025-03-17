/*
  # Add match_notes function for vector similarity search

  1. New Functions
    - `match_notes` - A function to search notes by vector similarity
      - Takes a query embedding (vector), match threshold (float), and match count (int)
      - Returns notes ordered by similarity score

  This function enables semantic search across notes using vector embeddings.
  It calculates the cosine similarity between the query embedding and the stored
  note embeddings, returning the most relevant matches.
*/

CREATE OR REPLACE FUNCTION match_notes(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  client_id uuid,
  project_id uuid,
  user_id uuid,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    notes.id,
    notes.content,
    notes.client_id,
    notes.project_id,
    notes.user_id,
    notes.created_at,
    1 - (notes.content_vector <=> query_embedding) as similarity
  FROM notes
  WHERE 1 - (notes.content_vector <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;