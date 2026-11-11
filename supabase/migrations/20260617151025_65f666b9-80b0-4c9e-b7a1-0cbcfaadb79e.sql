
-- 1) Rename admin role to super_admin (preserves existing grants)
ALTER TYPE public.app_role RENAME VALUE 'admin' TO 'super_admin';

-- 2) Account activation + feedback timestamps
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS feedback_at TIMESTAMPTZ;

-- 3) Replace policies that referenced 'admin' literal -> 'super_admin'
DROP POLICY IF EXISTS "complaints_select_own_or_coord_or_admin" ON public.complaints;
DROP POLICY IF EXISTS "complaints_update_owner_or_coord_or_admin" ON public.complaints;
DROP POLICY IF EXISTS "updates_select_if_can_see_complaint" ON public.complaint_updates;
DROP POLICY IF EXISTS "updates_insert_if_can_see_complaint" ON public.complaint_updates;

CREATE POLICY "complaints_select_visible" ON public.complaints FOR SELECT TO authenticated
USING (
  auth.uid() = citizen_id
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), public.coordinator_role_for(category))
);
CREATE POLICY "complaints_update_visible" ON public.complaints FOR UPDATE TO authenticated
USING (
  auth.uid() = citizen_id
  OR public.has_role(auth.uid(), 'super_admin')
  OR public.has_role(auth.uid(), public.coordinator_role_for(category))
);
CREATE POLICY "updates_select_visible" ON public.complaint_updates FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.complaints c WHERE c.id = complaint_id
  AND (c.citizen_id = auth.uid()
       OR public.has_role(auth.uid(), 'super_admin')
       OR public.has_role(auth.uid(), public.coordinator_role_for(c.category)))
));
CREATE POLICY "updates_insert_visible" ON public.complaint_updates FOR INSERT TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.complaints c WHERE c.id = complaint_id
    AND (c.citizen_id = auth.uid()
         OR public.has_role(auth.uid(), 'super_admin')
         OR public.has_role(auth.uid(), public.coordinator_role_for(c.category)))
  )
);

-- 4) Profiles: super_admin can read/update everyone (for user management)
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- 5) user_roles: super_admin full management
CREATE POLICY "user_roles_select_admin" ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "user_roles_insert_admin" ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "user_roles_delete_admin" ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- 6) Escalation RPC: marks unresolved complaints older than N days as escalated
CREATE OR REPLACE FUNCTION public.escalate_overdue(_days INT DEFAULT 7)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n INT;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  WITH updated AS (
    UPDATE public.complaints
    SET status = 'escalated', escalated_at = now()
    WHERE status NOT IN ('resolved','closed','escalated','rejected')
      AND created_at < now() - (_days || ' days')::INTERVAL
    RETURNING 1
  )
  SELECT COUNT(*) INTO n FROM updated;
  RETURN n;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.escalate_overdue(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.escalate_overdue(INT) TO authenticated;

-- 7) Public transparency RPC (no PII)
CREATE OR REPLACE FUNCTION public.public_stats()
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'total', (SELECT COUNT(*) FROM public.complaints),
    'resolved', (SELECT COUNT(*) FROM public.complaints WHERE status IN ('resolved','closed')),
    'active', (SELECT COUNT(*) FROM public.complaints WHERE status NOT IN ('resolved','closed','rejected')),
    'escalated', (SELECT COUNT(*) FROM public.complaints WHERE status = 'escalated'),
    'avg_rating', (SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0) FROM public.complaints WHERE rating IS NOT NULL),
    'by_category', (
      SELECT COALESCE(jsonb_object_agg(category, c), '{}'::jsonb)
      FROM (SELECT category, COUNT(*) c FROM public.complaints GROUP BY category) s
    ),
    'by_status', (
      SELECT COALESCE(jsonb_object_agg(status, c), '{}'::jsonb)
      FROM (SELECT status, COUNT(*) c FROM public.complaints GROUP BY status) s
    ),
    'monthly', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('month', month, 'new', new_n, 'resolved', res_n, 'escalated', esc_n) ORDER BY month), '[]'::jsonb)
      FROM (
        SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
               COUNT(*) AS new_n,
               COUNT(*) FILTER (WHERE status IN ('resolved','closed')) AS res_n,
               COUNT(*) FILTER (WHERE status = 'escalated') AS esc_n
        FROM public.complaints
        WHERE created_at > now() - INTERVAL '12 months'
        GROUP BY 1
      ) m
    )
  );
$$;
GRANT EXECUTE ON FUNCTION public.public_stats() TO anon, authenticated;
