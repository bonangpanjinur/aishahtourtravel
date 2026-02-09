-- ============================================
-- UMROH PLUS - COMPLETE DATABASE SCHEMA
-- For Supabase Migration
-- ============================================

-- ============================================
-- 1. TABLES
-- ============================================

-- User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Airlines
CREATE TABLE IF NOT EXISTS public.airlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Airports
CREATE TABLE IF NOT EXISTS public.airports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  city text,
  created_at timestamp with time zone DEFAULT now()
);

-- Hotels
CREATE TABLE IF NOT EXISTS public.hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  star integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Muthawifs (Tour Guides)
CREATE TABLE IF NOT EXISTS public.muthawifs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  photo_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Branches
CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Agents
CREATE TABLE IF NOT EXISTS public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  branch_id uuid REFERENCES public.branches(id),
  commission_percent numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Package Categories
CREATE TABLE IF NOT EXISTS public.package_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  parent_id uuid REFERENCES public.package_categories(id),
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Packages
CREATE TABLE IF NOT EXISTS public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  package_type text,
  duration_days integer DEFAULT 9,
  category_id uuid REFERENCES public.package_categories(id),
  hotel_makkah_id uuid REFERENCES public.hotels(id),
  hotel_madinah_id uuid REFERENCES public.hotels(id),
  airline_id uuid REFERENCES public.airlines(id),
  airport_id uuid REFERENCES public.airports(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Package Departures
CREATE TABLE IF NOT EXISTS public.package_departures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES public.packages(id),
  muthawif_id uuid REFERENCES public.muthawifs(id),
  departure_date date NOT NULL,
  return_date date,
  quota integer NOT NULL,
  remaining_quota integer NOT NULL,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now()
);

-- Departure Prices
CREATE TABLE IF NOT EXISTS public.departure_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  departure_id uuid REFERENCES public.package_departures(id),
  room_type text NOT NULL,
  price numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Itineraries
CREATE TABLE IF NOT EXISTS public.itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  departure_id uuid REFERENCES public.package_departures(id),
  title text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Itinerary Days
CREATE TABLE IF NOT EXISTS public.itinerary_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid REFERENCES public.itineraries(id),
  day_number integer NOT NULL,
  title text,
  description text,
  image_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code text NOT NULL UNIQUE,
  user_id uuid,
  package_id uuid REFERENCES public.packages(id),
  departure_id uuid REFERENCES public.package_departures(id),
  total_price numeric DEFAULT 0,
  status text DEFAULT 'draft',
  notes text,
  pic_id uuid,
  pic_type text DEFAULT 'pusat',
  created_at timestamp with time zone DEFAULT now()
);

-- Booking Rooms
CREATE TABLE IF NOT EXISTS public.booking_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id),
  room_type text NOT NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  subtotal numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Booking Pilgrims
CREATE TABLE IF NOT EXISTS public.booking_pilgrims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id),
  name text NOT NULL,
  gender text,
  birth_date date,
  nik text,
  passport_number text,
  passport_expiry date,
  phone text,
  email text,
  created_at timestamp with time zone DEFAULT now()
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id),
  amount numeric NOT NULL,
  payment_method text,
  proof_url text,
  status text DEFAULT 'pending',
  paid_at timestamp with time zone,
  verified_by uuid,
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL,
  value numeric NOT NULL,
  min_purchase numeric DEFAULT 0,
  max_uses integer,
  used_count integer DEFAULT 0,
  expired_at date,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Navigation Items
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  url text NOT NULL,
  parent_id uuid REFERENCES public.navigation_items(id),
  sort_order integer DEFAULT 0,
  open_in_new_tab boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Pages (CMS)
CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  slug text NOT NULL UNIQUE,
  content text,
  seo_title text,
  seo_description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Sections (Page Builder)
CREATE TABLE IF NOT EXISTS public.sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text,
  section_type text,
  data jsonb,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  image_url text,
  category text,
  author text,
  seo_title text,
  seo_description text,
  is_published boolean DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Gallery
CREATE TABLE IF NOT EXISTS public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  image_url text NOT NULL,
  category text DEFAULT 'umroh',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  content text NOT NULL,
  photo_url text,
  location text,
  package_name text,
  rating integer DEFAULT 5,
  travel_date date,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- FAQs
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon text DEFAULT 'star',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Advantages
CREATE TABLE IF NOT EXISTS public.advantages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  icon text DEFAULT 'check-circle',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Guide Steps
CREATE TABLE IF NOT EXISTS public.guide_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number integer NOT NULL,
  title text NOT NULL,
  description text,
  icon text DEFAULT 'circle',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Floating Buttons
CREATE TABLE IF NOT EXISTS public.floating_buttons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  platform text NOT NULL,
  url text,
  icon text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Settings (Key-Value)
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamp with time zone DEFAULT now()
);

-- Site Settings (JSON Values)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  category text NOT NULL,
  value jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(key, category)
);

-- ============================================
-- 2. HELPER FUNCTIONS
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = 'admin'
  );
$$;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_role text, _user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Function to generate booking code
CREATE OR REPLACE FUNCTION public.generate_booking_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'UMR' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM bookings WHERE booking_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- 3. TRIGGERS
-- ============================================

-- Update timestamp trigger for blog_posts
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update timestamp trigger for site_settings
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muthawifs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_departures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departure_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_pilgrims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advantages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floating_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS POLICIES
-- ============================================

-- User Roles Policies
CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin(auth.uid()));

-- Airlines Policies
CREATE POLICY "Admins can manage airlines" ON public.airlines FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read airlines" ON public.airlines FOR SELECT USING (true);

-- Airports Policies
CREATE POLICY "Admins can manage airports" ON public.airports FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read airports" ON public.airports FOR SELECT USING (true);

-- Hotels Policies
CREATE POLICY "Admins can manage hotels" ON public.hotels FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read hotels" ON public.hotels FOR SELECT USING (true);

-- Muthawifs Policies
CREATE POLICY "Admins can manage muthawifs" ON public.muthawifs FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read muthawifs" ON public.muthawifs FOR SELECT USING (true);

-- Branches Policies
CREATE POLICY "Admins can manage branches" ON public.branches FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read branches" ON public.branches FOR SELECT USING (is_active = true);

-- Agents Policies
CREATE POLICY "Admins can manage agents" ON public.agents FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read agents" ON public.agents FOR SELECT USING (is_active = true);

-- Package Categories Policies
CREATE POLICY "Admins can manage categories" ON public.package_categories FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read package categories" ON public.package_categories FOR SELECT USING (true);

-- Packages Policies
CREATE POLICY "Admins can manage packages" ON public.packages FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read packages" ON public.packages FOR SELECT USING (is_active = true);

-- Package Departures Policies
CREATE POLICY "Admins can manage departures" ON public.package_departures FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read departures" ON public.package_departures FOR SELECT USING (status = 'active');

-- Departure Prices Policies
CREATE POLICY "Admins can manage prices" ON public.departure_prices FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read departure prices" ON public.departure_prices FOR SELECT USING (true);

-- Itineraries Policies
CREATE POLICY "Admins can manage itineraries" ON public.itineraries FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read itineraries" ON public.itineraries FOR SELECT USING (is_active = true);

-- Itinerary Days Policies
CREATE POLICY "Admins can manage itinerary days" ON public.itinerary_days FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read itinerary days" ON public.itinerary_days FOR SELECT USING (true);

-- Bookings Policies
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id AND status = 'draft');

-- Booking Rooms Policies
CREATE POLICY "Admins can manage booking rooms" ON public.booking_rooms FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view own booking rooms" ON public.booking_rooms FOR SELECT USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_rooms.booking_id AND bookings.user_id = auth.uid()));
CREATE POLICY "Users can create booking rooms" ON public.booking_rooms FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_rooms.booking_id AND bookings.user_id = auth.uid()));

-- Booking Pilgrims Policies
CREATE POLICY "Admins can manage pilgrims" ON public.booking_pilgrims FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view own pilgrims" ON public.booking_pilgrims FOR SELECT USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_pilgrims.booking_id AND bookings.user_id = auth.uid()));
CREATE POLICY "Users can create pilgrims" ON public.booking_pilgrims FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_pilgrims.booking_id AND bookings.user_id = auth.uid()));

-- Payments Policies
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = payments.booking_id AND bookings.user_id = auth.uid()));
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = payments.booking_id AND bookings.user_id = auth.uid()));

-- Coupons Policies
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read active coupons" ON public.coupons FOR SELECT USING (is_active = true);

-- Navigation Items Policies
CREATE POLICY "Admins can manage navigation items" ON public.navigation_items FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read active navigation items" ON public.navigation_items FOR SELECT USING (is_active = true);

-- Pages Policies
CREATE POLICY "Admins can manage pages" ON public.pages FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read pages" ON public.pages FOR SELECT USING (is_active = true);

-- Sections Policies
CREATE POLICY "Admins can manage sections" ON public.sections FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read sections" ON public.sections FOR SELECT USING (is_active = true);

-- Blog Posts Policies
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read published blog posts" ON public.blog_posts FOR SELECT USING (is_published = true);

-- Gallery Policies
CREATE POLICY "Admins can manage gallery" ON public.gallery FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read gallery" ON public.gallery FOR SELECT USING (is_active = true);

-- Testimonials Policies
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read testimonials" ON public.testimonials FOR SELECT USING (is_active = true);

-- FAQs Policies
CREATE POLICY "Admins can manage FAQs" ON public.faqs FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view active FAQs" ON public.faqs FOR SELECT USING (is_active = true);

-- Services Policies
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read active services" ON public.services FOR SELECT USING (is_active = true);

-- Advantages Policies
CREATE POLICY "Admins can manage advantages" ON public.advantages FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read advantages" ON public.advantages FOR SELECT USING (is_active = true);

-- Guide Steps Policies
CREATE POLICY "Admins can manage guide steps" ON public.guide_steps FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read guide steps" ON public.guide_steps FOR SELECT USING (is_active = true);

-- Floating Buttons Policies
CREATE POLICY "Admins can manage floating buttons" ON public.floating_buttons FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Anyone can view active floating buttons" ON public.floating_buttons FOR SELECT USING (is_active = true);

-- Settings Policies
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read settings" ON public.settings FOR SELECT USING (true);

-- Site Settings Policies
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT USING (true);

-- ============================================
-- 6. STORAGE BUCKETS
-- ============================================

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Avatars Storage Policies
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- 7. INITIAL DATA (OPTIONAL)
-- ============================================

-- Insert default site settings
INSERT INTO public.site_settings (key, category, value) VALUES
('branding', 'general', '{"company_name": "UmrohPlus", "tagline": "Travel & Tours", "display_mode": "both", "logo_url": "", "favicon_url": ""}'),
('contact', 'general', '{"phone": "", "email": "", "address": "", "whatsapp": ""}'),
('social', 'general', '{"instagram": "", "facebook": "", "youtube": "", "twitter": ""}')
ON CONFLICT (key, category) DO NOTHING;

-- ============================================
-- END OF MIGRATION
-- ============================================
