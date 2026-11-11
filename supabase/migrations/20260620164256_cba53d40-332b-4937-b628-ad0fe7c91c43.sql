
-- 1. coordinator_role_for: fail loudly on unknown categories
CREATE OR REPLACE FUNCTION public.coordinator_role_for(_cat complaint_category)
RETURNS app_role
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
BEGIN
  IF _cat = 'welfare' THEN RETURN 'welfare_coordinator'::public.app_role;
  ELSIF _cat = 'development' THEN RETURN 'development_coordinator'::public.app_role;
  ELSIF _cat = 'regulation' THEN RETURN 'regulation_coordinator'::public.app_role;
  ELSE RAISE EXCEPTION 'coordinator_role_for: unknown complaint category %', _cat;
  END IF;
END;
$function$;

-- 2. Trigger to enforce per-role column immutability on complaint UPDATEs
CREATE OR REPLACE FUNCTION public.enforce_complaint_update_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_staff boolean;
BEGIN
  is_staff := public.has_role(auth.uid(), 'super_admin'::public.app_role)
           OR public.has_role(auth.uid(), public.coordinator_role_for(NEW.category));
  IF is_staff THEN
    RETURN NEW;
  END IF;

  -- Citizen path: must be the owner and may only modify whitelisted fields.
  IF auth.uid() IS DISTINCT FROM OLD.citizen_id THEN
    RAISE EXCEPTION 'Not allowed to modify this complaint';
  END IF;

  IF NEW.status      IS DISTINCT FROM OLD.status
  OR NEW.priority    IS DISTINCT FROM OLD.priority
  OR NEW.category    IS DISTINCT FROM OLD.category
  OR NEW.complaint_code IS DISTINCT FROM OLD.complaint_code
  OR NEW.citizen_id  IS DISTINCT FROM OLD.citizen_id
  OR NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
  OR NEW.resolved_at IS DISTINCT FROM OLD.resolved_at
  OR NEW.escalated_at IS DISTINCT FROM OLD.escalated_at
  OR NEW.created_at  IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'Citizens cannot modify protected complaint fields';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS complaints_enforce_update_rules ON public.complaints;
CREATE TRIGGER complaints_enforce_update_rules
BEFORE UPDATE ON public.complaints
FOR EACH ROW EXECUTE FUNCTION public.enforce_complaint_update_rules();

-- 3. Lock down direct API execution of SECURITY DEFINER / trigger functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.escalate_overdue(integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_complaint_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.coordinator_role_for(public.complaint_category) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_complaint_update_rules() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.escalate_overdue(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.public_stats() TO anon, authenticated;
