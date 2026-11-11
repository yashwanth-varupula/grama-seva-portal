
ALTER FUNCTION public.coordinator_role_for(public.complaint_category) SET search_path = public;
ALTER FUNCTION public.set_complaint_code() SET search_path = public;
ALTER FUNCTION public.touch_updated_at() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
