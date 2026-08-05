CREATE TABLE IF NOT EXISTS public.job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  work_mode TEXT NOT NULL CHECK (work_mode IN ('onsite', 'hybrid', 'remote')),
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  responsibilities TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'paused', 'closed')),
  application_deadline DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_offer_id UUID NOT NULL REFERENCES public.job_offers(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  experience_summary TEXT NOT NULL,
  availability TEXT NOT NULL,
  privacy_consent BOOLEAN NOT NULL DEFAULT false,
  cv_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewing', 'shortlisted', 'rejected', 'hired')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS job_offers_status_idx
  ON public.job_offers (status);
CREATE INDEX IF NOT EXISTS job_offers_created_at_idx
  ON public.job_offers (created_at DESC);
CREATE INDEX IF NOT EXISTS job_applications_status_idx
  ON public.job_applications (status);
CREATE INDEX IF NOT EXISTS job_applications_created_at_idx
  ON public.job_applications (created_at DESC);
CREATE INDEX IF NOT EXISTS job_applications_job_offer_id_idx
  ON public.job_applications (job_offer_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_job_offers_updated_at ON public.job_offers;
CREATE TRIGGER set_job_offers_updated_at
BEFORE UPDATE ON public.job_offers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_job_applications_updated_at ON public.job_applications;
CREATE TRIGGER set_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view current job offers" ON public.job_offers;
CREATE POLICY "Public can view current job offers"
ON public.job_offers
FOR SELECT
TO anon, authenticated
USING (
  status = 'published'
  AND (application_deadline IS NULL OR application_deadline >= CURRENT_DATE)
);

DROP POLICY IF EXISTS "Admins can manage job offers" ON public.job_offers;
CREATE POLICY "Admins can manage job offers"
ON public.job_offers
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public can submit job applications" ON public.job_applications;
REVOKE INSERT ON TABLE public.job_applications FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_job_application(
  p_job_offer_id UUID,
  p_full_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_city TEXT,
  p_experience_summary TEXT,
  p_availability TEXT,
  p_privacy_consent BOOLEAN,
  p_cv_path TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  application_id UUID;
BEGIN
  IF p_privacy_consent IS DISTINCT FROM true
    OR coalesce(btrim(p_full_name), '') = ''
    OR coalesce(btrim(p_phone), '') = ''
    OR coalesce(btrim(p_email), '') = ''
    OR coalesce(btrim(p_city), '') = ''
    OR coalesce(btrim(p_experience_summary), '') = ''
    OR coalesce(btrim(p_availability), '') = ''
    OR coalesce(btrim(p_cv_path), '') = '' THEN
    RAISE EXCEPTION 'Application fields and privacy consent are required'
      USING ERRCODE = 'check_violation';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.job_offers
    WHERE id = p_job_offer_id
      AND status = 'published'
      AND (application_deadline IS NULL OR application_deadline >= CURRENT_DATE)
  ) THEN
    RAISE EXCEPTION 'Job offer is not accepting applications'
      USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO public.job_applications (
    id,
    job_offer_id,
    full_name,
    phone,
    email,
    city,
    experience_summary,
    availability,
    privacy_consent,
    cv_path,
    status,
    internal_notes,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_job_offer_id,
    btrim(p_full_name),
    btrim(p_phone),
    btrim(p_email),
    btrim(p_city),
    btrim(p_experience_summary),
    btrim(p_availability),
    true,
    btrim(p_cv_path),
    'new',
    NULL,
    NOW(),
    NOW()
  )
  RETURNING id INTO application_id;

  RETURN application_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_job_application(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_job_application(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO anon, authenticated;

DROP POLICY IF EXISTS "Admins can view job applications" ON public.job_applications;
CREATE POLICY "Admins can view job applications"
ON public.job_applications
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update job applications" ON public.job_applications;
CREATE POLICY "Admins can update job applications"
ON public.job_applications
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete job applications" ON public.job_applications;
CREATE POLICY "Admins can delete job applications"
ON public.job_applications
FOR DELETE
TO authenticated
USING (public.is_admin());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('job-cvs', 'job-cvs', false, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf'];

DROP POLICY IF EXISTS "Public can upload job CVs" ON storage.objects;
CREATE POLICY "Public can upload job CVs"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'job-cvs'
  AND storage.extension(name) = 'pdf'
  AND metadata->>'mimetype' = 'application/pdf'
  AND EXISTS (
    SELECT 1
    FROM public.job_offers
    WHERE id::text = (storage.foldername(name))[1]
      AND status = 'published'
      AND (application_deadline IS NULL OR application_deadline >= CURRENT_DATE)
  )
);

DROP POLICY IF EXISTS "Admins can view job CVs" ON storage.objects;
CREATE POLICY "Admins can view job CVs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'job-cvs' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete job CVs" ON storage.objects;
CREATE POLICY "Admins can delete job CVs"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'job-cvs' AND public.is_admin());
