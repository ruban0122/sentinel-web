-- USER PROVIDED EXISTING SCHEMA
-- This file serves as a reference for the existing database structure.

CREATE TABLE public.companies (
  id text NOT NULL PRIMARY KEY,
  name text,
  address text,
  created_at timestamp with time zone default now()
);

CREATE TABLE public.sites (
  id text NOT NULL PRIMARY KEY,
  name text,
  company_id text REFERENCES public.companies(id),
  status text,
  latitude double precision,
  longitude double precision,
  created_at timestamp with time zone default now()
);

CREATE TABLE public.sections (
  id text NOT NULL PRIMARY KEY,
  name text,
  site_id text REFERENCES public.sites(id),
  company_id text REFERENCES public.companies(id)
);

CREATE TABLE public.departments (
  id text NOT NULL PRIMARY KEY,
  name text,
  section_id text REFERENCES public.sections(id),
  site_id text REFERENCES public.sites(id),
  company_id text REFERENCES public.companies(id)
);

CREATE TABLE public.floors (
  id text NOT NULL PRIMARY KEY,
  floor_code text,
  name text,
  section_id text REFERENCES public.sections(id),
  created_at timestamp with time zone default now()
);

CREATE TABLE public.contractors (
  id text NOT NULL PRIMARY KEY,
  company_worker_code text,
  name text,
  floor_id text REFERENCES public.floors(id),
  created_at timestamp with time zone default now()
);

CREATE TABLE public.workers (
  id text NOT NULL PRIMARY KEY,
  worker_code text,
  name text,
  rfid_tag text,
  status text,
  company_id text REFERENCES public.companies(id),
  site_id text REFERENCES public.sites(id),
  section_id text REFERENCES public.sections(id),
  department_id text REFERENCES public.departments(id),
  created_at timestamp with time zone default now()
);

CREATE TABLE public.users (
  id text NOT NULL PRIMARY KEY,
  uid text, -- Maps to auth.users.id
  name text,
  email text,
  role text,
  phone_number text,
  profile_image_url text,
  company_id text REFERENCES public.companies(id),
  created_at timestamp with time zone default now()
);

CREATE TABLE public.attendance (
  id text NOT NULL PRIMARY KEY,
  worker_id text REFERENCES public.workers(id),
  worker_code text,
  rfid_tag text,
  status text,
  site_id text REFERENCES public.sites(id),
  company_id text REFERENCES public.companies(id),
  floor_id text REFERENCES public.floors(id),
  check_in_time timestamp with time zone,
  check_out_time timestamp with time zone,
  date timestamp with time zone
);

CREATE TABLE public.incidents (
  id text NOT NULL PRIMARY KEY,
  description text,
  image_url text,
  worker_id text REFERENCES public.workers(id),
  worker_name text,
  company_id text REFERENCES public.companies(id),
  site_id text REFERENCES public.sites(id),
  section_id text REFERENCES public.sections(id),
  department_id text REFERENCES public.departments(id),
  created_at timestamp with time zone default now(),
  date timestamp with time zone
);

CREATE TABLE public.complaints (
  id text NOT NULL PRIMARY KEY,
  description text,
  image_url text,
  worker_id text REFERENCES public.workers(id),
  worker_name text,
  company_id text REFERENCES public.companies(id),
  site_id text REFERENCES public.sites(id),
  section_id text REFERENCES public.sections(id),
  department_id text REFERENCES public.departments(id),
  created_at timestamp with time zone default now(),
  date timestamp with time zone
);

CREATE TABLE public.hardware (
  id text NOT NULL PRIMARY KEY,
  hardware_code text,
  name text,
  status text,
  site_id text REFERENCES public.sites(id),
  latitude double precision,
  longitude double precision,
  sequence_order integer,
  installed_at timestamp with time zone
);
