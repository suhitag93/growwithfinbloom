-- Secure user_achievements: remove client INSERT access, route all grants
-- through a validated SECURITY DEFINER function.
--
-- Problem: two overlapping policies allowed any authenticated user to INSERT a
-- row into user_achievements with their own user_id and any arbitrary
-- achievement_id, granting themselves badges without meeting the required
-- criteria.  Backend processes that read this table to trigger XP awards or
-- unlock features could then be exploited to earn unearned rewards.
--
-- Fix:
--   1. Drop the permissive FOR ALL policy and the direct INSERT policy.
--   2. Keep the SELECT policy (users must still be able to read their badges).
--   3. Create grant_achievement(), a SECURITY DEFINER function that:
--        • Validates the achievement_id exists in the achievements catalogue.
--        • Deduplicates gracefully (UNIQUE constraint exists; we return false
--          rather than raising).
--        • Is NOT granted to the authenticated role — only the service role
--          (postgres superuser) may execute it, ensuring all grants originate
--          from trusted server-side code.
--   4. Revoke any lingering table-level INSERT grant from authenticated so the
--      column-level path is also closed.

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Drop all existing policies on user_achievements
-- ────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can manage their own user_achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can view own achievements"              ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements"            ON public.user_achievements;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Recreate the SELECT-only policy
--    Users may read their own earned achievements; they cannot write directly.
-- ────────────────────────────────────────────────────────────────────────────
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements
  FOR SELECT
  USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Revoke table-level INSERT from authenticated
--    RLS blocks writes at the row level; this closes the column/table path too.
-- ────────────────────────────────────────────────────────────────────────────
REVOKE INSERT ON public.user_achievements FROM authenticated;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Trusted server-side function: grant_achievement()
--
--    All achievement grants MUST go through this function.  It runs as the
--    function owner (postgres / superuser), which:
--      • bypasses RLS on user_achievements, so no INSERT policy is needed, and
--      • is unaffected by the REVOKE above.
--
--    The function is intentionally NOT granted to the authenticated role.
--    Only the service role (used by Edge Functions and backend workers) may
--    invoke it.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.grant_achievement(
  p_user_id      uuid,
  p_achievement_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate: the achievement must exist in the catalogue
  IF NOT EXISTS (
    SELECT 1 FROM achievements WHERE id = p_achievement_id
  ) THEN
    RAISE EXCEPTION 'Unknown achievement_id: %', p_achievement_id;
  END IF;

  -- Validate: the target user must exist
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Unknown user_id: %', p_user_id;
  END IF;

  -- Insert; silently skip if already earned (UNIQUE constraint)
  INSERT INTO user_achievements (user_id, achievement_id)
  VALUES (p_user_id, p_achievement_id)
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'achievement_id', p_achievement_id
  );
END;
$$;

-- Explicitly do NOT grant to authenticated — service role only.
-- GRANT EXECUTE ON FUNCTION public.grant_achievement TO authenticated;
