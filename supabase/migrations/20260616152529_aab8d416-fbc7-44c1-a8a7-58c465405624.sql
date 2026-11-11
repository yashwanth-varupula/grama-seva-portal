
-- Enums
CREATE TYPE public.app_role AS ENUM ('citizen', 'welfare_coordinator', 'development_coordinator', 'regulation_coordinator', 'admin');
CREATE TYPE public.complaint_category AS ENUM ('welfare', 'development', 'regulation');
CREATE TYPE public.complaint_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.complaint_status AS ENUM ('draft', 'submitted', 'assigned', 'in_review', 'work_in_progress', 'resolved', 'closed', 'reopened', 'escalated', 'rejected');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  ward TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.coordinator_role_for(_cat public.complaint_category)
RETURNS public.app_role LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE _cat
    WHEN 'welfare' THEN 'welfare_coordinator'::public.app_role
    WHEN 'development' THEN 'development_coordinator'::public.app_role
    WHEN 'regulation' THEN 'regulation_coordinator'::public.app_role
  END
$$;

-- Auto-create profile and citizen role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'citizen');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Complaints
CREATE SEQUENCE public.complaint_seq START 1;

CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_code TEXT NOT NULL UNIQUE,
  citizen_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category public.complaint_category NOT NULL,
  priority public.complaint_priority NOT NULL DEFAULT 'medium',
  status public.complaint_status NOT NULL DEFAULT 'submitted',
  location TEXT,
  ward TEXT,
  contact_phone TEXT,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  assigned_to UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_complaint_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.complaint_code IS NULL OR NEW.complaint_code = '' THEN
    NEW.complaint_code := 'CMP-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.complaint_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_complaint_code BEFORE INSERT ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.set_complaint_code();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_complaints_updated BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "complaints_select_own_or_coord_or_admin" ON public.complaints FOR SELECT TO authenticated
USING (
  auth.uid() = citizen_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), public.coordinator_role_for(category))
);
CREATE POLICY "complaints_insert_self" ON public.complaints FOR INSERT TO authenticated
WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "complaints_update_owner_or_coord_or_admin" ON public.complaints FOR UPDATE TO authenticated
USING (
  auth.uid() = citizen_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), public.coordinator_role_for(category))
);

-- Complaint updates (timeline / chat)
CREATE TABLE public.complaint_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  kind TEXT NOT NULL CHECK (kind IN ('status_change','remark','message')),
  message TEXT,
  old_status public.complaint_status,
  new_status public.complaint_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.complaint_updates TO authenticated;
GRANT ALL ON public.complaint_updates TO service_role;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "updates_select_if_can_see_complaint" ON public.complaint_updates FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.complaints c WHERE c.id = complaint_id
  AND (
    c.citizen_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), public.coordinator_role_for(c.category))
  )
));
CREATE POLICY "updates_insert_if_can_see_complaint" ON public.complaint_updates FOR INSERT TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.complaints c WHERE c.id = complaint_id
    AND (
      c.citizen_id = auth.uid()
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), public.coordinator_role_for(c.category))
    )
  )
);

CREATE INDEX idx_complaints_citizen ON public.complaints(citizen_id);
CREATE INDEX idx_complaints_category_status ON public.complaints(category, status);
CREATE INDEX idx_updates_complaint ON public.complaint_updates(complaint_id, created_at);
