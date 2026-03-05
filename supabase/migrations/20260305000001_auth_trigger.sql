-- ─── Auth Trigger: Create company + user on signup ───────────
-- Fires after every INSERT on auth.users
-- Creates a companies row and a public.users row for the new user.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id uuid;
BEGIN
  -- Step 1: Create a placeholder company
  INSERT INTO public.companies (name)
  VALUES (
    COALESCE(
      NEW.raw_user_meta_data->>'company_name',
      'החברה שלי'
    )
  )
  RETURNING id INTO new_company_id;

  -- Step 2: Create the user profile linked to the company
  INSERT INTO public.users (id, company_id, email, full_name, role)
  VALUES (
    NEW.id,
    new_company_id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    'owner'
  );

  RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
