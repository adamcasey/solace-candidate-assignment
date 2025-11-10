CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE "advocates" ADD COLUMN IF NOT EXISTS "search_vector" tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(first_name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(last_name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(city, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(degree, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(payload::text, '')), 'C')
) STORED;

CREATE INDEX IF NOT EXISTS "advocates_search_vector_idx" ON "advocates" USING gin ("search_vector") WITH (fastupdate=off);

CREATE INDEX IF NOT EXISTS "advocates_name_trigram_idx" ON "advocates" USING gin ((first_name || ' ' || last_name || ' ' || city) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "advocates_specialties_idx" ON "advocates" USING gin ("payload") WITH (fastupdate=off);