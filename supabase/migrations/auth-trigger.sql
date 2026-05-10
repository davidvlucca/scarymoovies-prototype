CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Username uses email prefix + 6-char UUID suffix to avoid collisions.
  -- User can update their username on first profile visit.
  INSERT INTO public.users (id, username, created_at)
  VALUES (
    NEW.id,
    split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 6),
    NOW()
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
