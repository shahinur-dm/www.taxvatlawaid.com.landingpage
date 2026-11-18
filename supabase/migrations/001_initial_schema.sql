-- ============================================================================
-- TAXVAT LAWAID — COMPLETE SUPABASE / POSTGRESQL SCHEMA & RLS POLICIES
-- Target Region / Timezone: Bangladesh (Asia/Dhaka, BST / UTC+6)
-- Chamber Hours: Sunday – Thursday, 3:00 PM – 8:00 PM BST
-- ============================================================================

-- Enable cryptographic UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ADMIN PROFILES (Maps Supabase Auth users to authorized chamber admins)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT 'Chamber Admin',
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security-definer helper so RLS policies can verify admin status without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE id = auth.uid()
      AND is_active = true
  );
$$;

-- ----------------------------------------------------------------------------
-- 2. APPOINTMENTS & LEADS TABLE
-- Note: Appointments always start as 'pending' (never auto-confirmed).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id TEXT NOT NULL UNIQUE,

  -- Client Contact Details
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT,
  client_type TEXT NOT NULL,

  -- Legal Matter & Booking Details
  service_category TEXT NOT NULL,
  consultation_type TEXT NOT NULL CHECK (
    consultation_type IN ('Chamber Visit', 'Video Call', 'Phone Call')
  ),
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  description TEXT NOT NULL,
  privacy_consent BOOLEAN NOT NULL DEFAULT false CHECK (privacy_consent = true),

  -- Workflow & Admin Management
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('new', 'pending', 'confirmed', 'completed', 'rejected', 'cancelled')
  ),
  is_new BOOLEAN NOT NULL DEFAULT true,
  internal_notes TEXT NOT NULL DEFAULT '',
  reviewed_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,

  -- Lead Source & Ad Campaign Attribution (Meta Ads / Google Ads)
  lead_source TEXT NOT NULL DEFAULT 'direct',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  fbclid TEXT,
  gclid TEXT,
  referrer_url TEXT,
  landing_page_url TEXT,

  -- Audit Metadata
  timezone TEXT NOT NULL DEFAULT 'Asia/Dhaka',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_preferred_date ON public.appointments(preferred_date);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON public.appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_inquiry_id ON public.appointments(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_appointments_utm_source ON public.appointments(utm_source);
CREATE INDEX IF NOT EXISTS idx_appointments_lead_source ON public.appointments(lead_source);

-- Prevent duplicate confirmed bookings for the exact same date & time slot
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_confirmed_slot
  ON public.appointments (preferred_date, preferred_time)
  WHERE status = 'confirmed';

-- ----------------------------------------------------------------------------
-- 3. APPOINTMENT AVAILABILITY SLOTS (Sun=0 .. Thu=4; Closed Fri=5, Sat=6)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  slot_time TEXT NOT NULL,          -- e.g. '15:00'
  slot_label TEXT NOT NULL,         -- e.g. '3:00 PM'
  max_bookings SMALLINT NOT NULL DEFAULT 1 CHECK (max_bookings >= 1),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (day_of_week, slot_time)
);

-- Seed default chamber consultation hours: Sun–Thu, 3:00 PM – 8:00 PM BST (30-min slots)
INSERT INTO public.availability_slots (day_of_week, slot_time, slot_label, max_bookings, is_active, sort_order)
SELECT d.dow, s.slot_time, s.slot_label, 1, true, s.sort_order
FROM (VALUES (0), (1), (2), (3), (4)) AS d(dow)
CROSS JOIN (
  VALUES
    ('15:00', '3:00 PM', 1),
    ('15:30', '3:30 PM', 2),
    ('16:00', '4:00 PM', 3),
    ('16:30', '4:30 PM', 4),
    ('17:00', '5:00 PM', 5),
    ('17:30', '5:30 PM', 6),
    ('18:00', '6:00 PM', 7),
    ('18:30', '6:30 PM', 8),
    ('19:00', '7:00 PM', 9),
    ('19:30', '7:30 PM', 10)
) AS s(slot_time, slot_label, sort_order)
ON CONFLICT (day_of_week, slot_time) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. BLOCKED DATES (Public holidays, court recesses, chamber closures)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT NOT NULL DEFAULT 'Chamber Closed',
  created_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. ADMIN NOTIFICATIONS (Logged automatically for every new lead/appointment)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  inquiry_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_unread
  ON public.admin_notifications(is_read, created_at DESC);

-- ----------------------------------------------------------------------------
-- 6. TRIGGERS (Auto-update updated_at & Create Admin Notification on New Lead)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON public.appointments;
CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER trg_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.notify_admin_on_new_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (appointment_id, inquiry_id, title, message)
  VALUES (
    NEW.id,
    NEW.inquiry_id,
    'New Appointment Request: ' || NEW.inquiry_id,
    NEW.full_name || ' requested ' || NEW.service_category || ' (' || NEW.consultation_type || ') on ' || NEW.preferred_date::TEXT || ' at ' || NEW.preferred_time
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_new_appointment ON public.appointments;
CREATE TRIGGER trg_notify_admin_new_appointment
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_new_appointment();

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) — STRICT ZERO-PII EXPOSURE FOR ANONYMOUS USERS
-- ----------------------------------------------------------------------------
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- admin_profiles policies
DROP POLICY IF EXISTS "Admins can view admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view admin profiles"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- appointments policies (Only authenticated admins can read/update/delete;
-- public submissions go through Next.js API route with Zod validation & rate limits)
DROP POLICY IF EXISTS "Admins can view all appointments" ON public.appointments;
CREATE POLICY "Admins can view all appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update appointments" ON public.appointments;
CREATE POLICY "Admins can update appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete appointments" ON public.appointments;
CREATE POLICY "Admins can delete appointments"
  ON public.appointments FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- availability_slots policies (Public can view active schedule; admins manage all)
DROP POLICY IF EXISTS "Public can view active availability slots" ON public.availability_slots;
CREATE POLICY "Public can view active availability slots"
  ON public.availability_slots FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage availability slots" ON public.availability_slots;
CREATE POLICY "Admins can manage availability slots"
  ON public.availability_slots FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- blocked_dates policies (Public can view blocked dates; admins manage all)
DROP POLICY IF EXISTS "Public can view blocked dates" ON public.blocked_dates;
CREATE POLICY "Public can view blocked dates"
  ON public.blocked_dates FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage blocked dates" ON public.blocked_dates;
CREATE POLICY "Admins can manage blocked dates"
  ON public.blocked_dates FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- admin_notifications policies
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.admin_notifications;
CREATE POLICY "Admins can manage notifications"
  ON public.admin_notifications FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. SECURE PUBLIC RPCs (No PII exposed to anonymous users)
-- ----------------------------------------------------------------------------

-- Returns available slots for a given date with booked count (zero client data)
CREATE OR REPLACE FUNCTION public.get_date_availability(target_date DATE)
RETURNS TABLE (
  slot_time TEXT,
  slot_label TEXT,
  max_bookings SMALLINT,
  booked_count BIGINT,
  is_available BOOLEAN,
  blocked_reason TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dow SMALLINT := EXTRACT(DOW FROM target_date)::SMALLINT;
  v_blocked_reason TEXT;
BEGIN
  SELECT bd.reason INTO v_blocked_reason
  FROM public.blocked_dates bd
  WHERE bd.blocked_date = target_date
  LIMIT 1;

  IF v_blocked_reason IS NOT NULL THEN
    RETURN QUERY
    SELECT
      s.slot_time,
      s.slot_label,
      s.max_bookings,
      0::BIGINT,
      false,
      v_blocked_reason
    FROM public.availability_slots s
    WHERE s.day_of_week = v_dow AND s.is_active = true
    ORDER BY s.sort_order;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    s.slot_time,
    s.slot_label,
    s.max_bookings,
    COUNT(a.id)::BIGINT AS booked_count,
    (COUNT(a.id) < s.max_bookings) AS is_available,
    NULL::TEXT AS blocked_reason
  FROM public.availability_slots s
  LEFT JOIN public.appointments a
    ON a.preferred_date = target_date
    AND a.preferred_time = s.slot_label
    AND a.status IN ('confirmed', 'pending')
  WHERE s.day_of_week = v_dow
    AND s.is_active = true
  GROUP BY s.slot_time, s.slot_label, s.max_bookings, s.sort_order
  ORDER BY s.sort_order;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_date_availability(DATE) TO anon, authenticated;

-- Public inquiry status lookup requiring Inquiry ID + last 4 digits of phone
CREATE OR REPLACE FUNCTION public.check_inquiry_status(
  p_inquiry_id TEXT,
  p_phone_last4 TEXT
)
RETURNS TABLE (
  inquiry_id TEXT,
  service_category TEXT,
  consultation_type TEXT,
  preferred_date DATE,
  preferred_time TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.inquiry_id,
    a.service_category,
    a.consultation_type,
    a.preferred_date,
    a.preferred_time,
    a.status,
    a.created_at
  FROM public.appointments a
  WHERE UPPER(a.inquiry_id) = UPPER(TRIM(p_inquiry_id))
    AND RIGHT(REGEXP_REPLACE(a.phone, '\D', '', 'g'), 4) = RIGHT(REGEXP_REPLACE(p_phone_last4, '\D', '', 'g'), 4)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.check_inquiry_status(TEXT, TEXT) TO anon, authenticated;

-- ============================================================================
-- AFTER RUNNING THIS MIGRATION:
-- 1. Create an admin user in Supabase Dashboard -> Authentication -> Users
-- 2. Grant admin role by running:
--    INSERT INTO public.admin_profiles (id, email, full_name, role)
--    VALUES ('<AUTH_USER_UUID>', 'taxvatlawaid@gmail.com', 'Hossain Ahmed (Khan)', 'super_admin')
--    ON CONFLICT (id) DO NOTHING;
-- ============================================================================
