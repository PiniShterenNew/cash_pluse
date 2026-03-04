---
description: Create a Supabase migration with table, RLS, indexes, and type generation.
---

Create a Supabase migration for "$ARGUMENTS".

Before writing SQL, read .claude/skills/supabase-patterns/SKILL.md.

Steps:
1. Create migration file: supabase/migrations/[timestamp]_$ARGUMENTS.sql
2. Include: CREATE TABLE with proper types
3. Include: ALTER TABLE ENABLE ROW LEVEL SECURITY
4. Include: CREATE POLICY for select/insert/update/delete (using auth.uid() = user_id)
5. Include: CREATE INDEX on frequently queried columns
6. Include: Add trigger for updated_at timestamp
7. After creating, remind to run: npx supabase gen types typescript --local
